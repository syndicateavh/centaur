import { PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Queue, Worker, type Job } from 'bullmq';
import { and, asc, eq, lt, or } from 'drizzle-orm';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { createDatabase, certificateAuditLogs, certificates, courseCompletions } from '@centaur/lms-database';
import { parseWorkerEnv } from '@centaur/lms-config';
import { Redis } from 'ioredis';
import type pino from 'pino';

interface CertificateJob { certificateId: string }

export function startCertificateProcessor(redis: Redis, logger: pino.Logger) {
  const environment = parseWorkerEnv(process.env);
  const database = createDatabase(environment.DATABASE_URL, environment.DATABASE_POOL_MAX);
  const storageConfigured = Boolean(environment.R2_ENDPOINT && environment.R2_BUCKET && environment.R2_ACCESS_KEY_ID && environment.R2_SECRET_ACCESS_KEY);
  const storage = storageConfigured ? new S3Client({
    endpoint: environment.R2_ENDPOINT!, region: 'auto', forcePathStyle: true,
    credentials: { accessKeyId: environment.R2_ACCESS_KEY_ID!, secretAccessKey: environment.R2_SECRET_ACCESS_KEY! },
  }) : null;
  const queueConnection = new Redis(environment.REDIS_URL, { maxRetriesPerRequest: null });
  const queue = new Queue('certificate-processing', { connection: queueConnection });
  const worker = new Worker<CertificateJob>('certificate-processing', processCertificate, { connection: redis, concurrency: 2 });
  const ready = new Promise<void>((resolve) => worker.once('ready', resolve));
  worker.on('ready', () => logger.info({ event: 'worker.certificates_ready' }, 'Certificate processing queue is ready'));
  worker.on('failed', (job, error) => logger.error({ err: error, certificateId: job?.data.certificateId, event: 'worker.certificate_job_failed' }, 'Certificate generation attempt failed'));
  worker.on('error', (error) => logger.error({ err: error, event: 'worker.certificate_error' }, 'Certificate worker error'));

  async function enqueue(certificateId: string) {
    const jobId = `certificate-${certificateId}`;
    const existing = await queue.getJob(jobId);
    if (existing && (await existing.getState()) === 'failed') await existing.remove();
    await queue.add('generate-certificate', { certificateId }, {
      jobId, attempts: 5, backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: { age: 30 * 24 * 60 * 60, count: 10_000 },
      removeOnFail: { age: 30 * 24 * 60 * 60, count: 10_000 },
    });
  }

  async function recoverPendingCertificates() {
    const cutoff = new Date(Date.now() - 60_000);
    const pending = await database.db.select({ id: certificates.id }).from(certificates)
      .where(or(eq(certificates.status, 'pending'), and(eq(certificates.status, 'processing'), lt(certificates.updatedAt, cutoff))))
      .orderBy(asc(certificates.createdAt)).limit(100);
    for (const certificate of pending) await enqueue(certificate.id);
  }

  async function processCertificate(job: Job<CertificateJob>) {
    const [certificate] = await database.db.select({
      id: certificates.id,
      status: certificates.status,
      publicCertificateId: certificates.publicCertificateId,
      objectKey: certificates.objectKey,
      learnerName: courseCompletions.learnerNameSnapshot,
      courseTitle: courseCompletions.courseTitleSnapshot,
      completedAt: courseCompletions.completedAt,
    }).from(certificates).innerJoin(courseCompletions, eq(certificates.completionId, courseCompletions.id))
      .where(eq(certificates.id, job.data.certificateId)).limit(1);
    if (!certificate || certificate.status === 'revoked' || certificate.status === 'ready') return;
    if (!storage || !environment.R2_BUCKET) throw new Error('R2 storage is not configured for certificate generation.');
    const [claimed] = await database.db.update(certificates).set({ status: 'processing', updatedAt: new Date() })
      .where(and(eq(certificates.id, certificate.id), or(eq(certificates.status, 'pending'), eq(certificates.status, 'processing')))).returning({ id: certificates.id });
    if (!claimed) return;

    try {
      const verificationUrl = `${environment.WEB_ORIGIN.replace(/\/$/, '')}/verify/${certificate.publicCertificateId}`;
      const qr = await QRCode.toBuffer(verificationUrl, { type: 'png', errorCorrectionLevel: 'M', margin: 1, width: 220 });
      const pdf = await createCertificatePdf({
        learnerName: certificate.learnerName,
        courseTitle: certificate.courseTitle,
        completedAt: certificate.completedAt,
        issuedAt: new Date(),
        certificateId: certificate.publicCertificateId,
        qr,
      });
      await storage.send(new PutObjectCommand({
        Bucket: environment.R2_BUCKET, Key: certificate.objectKey, Body: pdf, ContentType: 'application/pdf',
        Metadata: { certificateId: certificate.publicCertificateId },
      }));
      const [ready] = await database.db.update(certificates).set({ status: 'ready', generatedAt: new Date(), issuedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(certificates.id, certificate.id), eq(certificates.status, 'processing'))).returning({ id: certificates.id });
      if (!ready) await storage.send(new DeleteObjectCommand({ Bucket: environment.R2_BUCKET, Key: certificate.objectKey }));
    } catch (error) {
      const finalAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
      if (finalAttempt) {
        const [failed] = await database.db.update(certificates).set({ status: 'failed', updatedAt: new Date() })
          .where(and(eq(certificates.id, certificate.id), eq(certificates.status, 'processing'))).returning({ id: certificates.id });
        if (failed) await database.db.insert(certificateAuditLogs).values({ certificateId: certificate.id, action: 'generation_failed', reason: error instanceof Error ? error.message.slice(0, 1000) : 'Certificate generation failed.' });
      }
      throw error;
    }
  }

  const recoveryTimer = setInterval(() => {
    void recoverPendingCertificates().catch((error: unknown) => logger.warn({ err: error, event: 'certificate.recovery_failed' }, 'Could not recover pending certificate jobs'));
  }, 60_000);
  recoveryTimer.unref();
  void recoverPendingCertificates().catch((error: unknown) => logger.warn({ err: error, event: 'certificate.recovery_failed' }, 'Could not recover pending certificate jobs'));

  return {
    ready,
    async close() {
      clearInterval(recoveryTimer);
      await Promise.all([worker.close(), queue.close(), queueConnection.quit().catch(() => undefined), database.client.end(), Promise.resolve(storage?.destroy())]);
    },
  };
}

function createCertificatePdf(input: { learnerName: string; courseTitle: string; completedAt: Date; issuedAt: Date; certificateId: string; qr: Buffer }) {
  return new Promise<Buffer>((resolve, reject) => {
    const document = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 56 });
    const chunks: Buffer[] = [];
    document.on('data', (chunk: Buffer) => chunks.push(chunk));
    document.once('error', reject);
    document.once('end', () => resolve(Buffer.concat(chunks)));
    const pageWidth = document.page.width;
    document.rect(24, 24, pageWidth - 48, document.page.height - 48).lineWidth(2).strokeColor('#0e7490').stroke();
    document.fillColor('#0e7490').fontSize(13).font('Helvetica-Bold').text('CENTAUR LEARN', 0, 70, { align: 'center', characterSpacing: 2 });
    document.fillColor('#0f172a').fontSize(34).text('Certificate of Completion', 0, 112, { align: 'center' });
    document.fillColor('#475569').font('Helvetica').fontSize(15).text('This certificate is proudly presented to', 0, 170, { align: 'center' });
    document.fillColor('#0f172a').font('Helvetica-Bold').fontSize(30).text(input.learnerName, 55, 205, { align: 'center', width: pageWidth - 110, height: 38, ellipsis: true });
    document.moveTo(150, 250).lineTo(pageWidth - 150, 250).lineWidth(1).strokeColor('#cbd5e1').stroke();
    document.fillColor('#475569').font('Helvetica').fontSize(15).text('for successfully completing', 0, 274, { align: 'center' });
    document.fillColor('#0f172a').font('Helvetica-Bold').fontSize(22).text(input.courseTitle, 75, 305, { align: 'center', width: pageWidth - 150, height: 42, ellipsis: true });
    document.fillColor('#475569').font('Helvetica').fontSize(11).text(`Completed ${input.completedAt.toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' })}  •  Issued ${input.issuedAt.toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' })}`, 0, 360, { align: 'center' });
    document.image(input.qr, pageWidth - 130, document.page.height - 128, { width: 72, height: 72 });
    document.fillColor('#64748b').fontSize(8).text(`Certificate ID: ${input.certificateId}`, 55, document.page.height - 73);
    document.fontSize(8).text('Scan the QR code to verify this certificate.', pageWidth - 245, document.page.height - 50, { width: 165, align: 'right' });
    document.end();
  });
}

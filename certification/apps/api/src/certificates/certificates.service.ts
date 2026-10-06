import { BadRequestException, ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, ilike, or } from 'drizzle-orm';
import type { createDatabase } from '@centaur/lms-database';
import { certificateAuditLogs, certificates, courseCompletions, users } from '@centaur/lms-database';
import { DATABASE_CLIENT } from '../tokens.js';
import { MediaStorageService } from '../media/media-storage.service.js';
import { CertificateQueueService } from './certificate-queue.service.js';

type Database = ReturnType<typeof createDatabase>;

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: Database,
    @Inject(MediaStorageService) private readonly storage: MediaStorageService,
    @Inject(CertificateQueueService) private readonly queue: CertificateQueueService,
  ) {}

  async listLearnerCertificates(userId: string) {
    return this.database.db.select({
      id: certificates.id,
      publicCertificateId: certificates.publicCertificateId,
      status: certificates.status,
      issuedAt: certificates.issuedAt,
      generatedAt: certificates.generatedAt,
      revokedAt: certificates.revokedAt,
      learnerName: courseCompletions.learnerNameSnapshot,
      courseTitle: courseCompletions.courseTitleSnapshot,
      completedAt: courseCompletions.completedAt,
    }).from(certificates)
      .innerJoin(courseCompletions, eq(certificates.completionId, courseCompletions.id))
      .where(eq(courseCompletions.userId, userId))
      .orderBy(desc(courseCompletions.completedAt));
  }

  async getLearnerDownloadUrl(userId: string, certificateId: string) {
    const [certificate] = await this.database.db.select({
      status: certificates.status,
      objectKey: certificates.objectKey,
    }).from(certificates)
      .innerJoin(courseCompletions, eq(certificates.completionId, courseCompletions.id))
      .where(and(eq(certificates.id, certificateId), eq(courseCompletions.userId, userId))).limit(1);
    if (!certificate) throw new NotFoundException({ code: 'CERTIFICATE_NOT_FOUND', message: 'Certificate not found.' });
    if (certificate.status !== 'ready') throw new ConflictException({ code: 'CERTIFICATE_NOT_READY', message: 'This certificate is not available for download.' });
    return { url: await this.storage.signDownload(certificate.objectKey, 'application/pdf', 60) };
  }

  async verify(publicCertificateId: string) {
    const [row] = await this.database.db.select({
      publicCertificateId: certificates.publicCertificateId,
      status: certificates.status,
      issuedAt: certificates.issuedAt,
      learnerName: courseCompletions.learnerNameSnapshot,
      courseTitle: courseCompletions.courseTitleSnapshot,
      completedAt: courseCompletions.completedAt,
    }).from(certificates)
      .innerJoin(courseCompletions, eq(certificates.completionId, courseCompletions.id))
      .where(eq(certificates.publicCertificateId, publicCertificateId)).limit(1);
    if (!row) throw new NotFoundException({ code: 'CERTIFICATE_NOT_FOUND', message: 'Certificate not found.' });
    const verificationStatus = row.status === 'revoked' ? 'revoked' : row.status === 'ready' ? 'valid' : row.status === 'failed' ? 'unavailable' : 'processing';
    return {
      certificateId: row.publicCertificateId,
      status: verificationStatus,
      valid: verificationStatus === 'valid',
      learnerName: row.learnerName,
      courseTitle: row.courseTitle,
      completedAt: row.completedAt,
      issuedAt: row.issuedAt,
    };
  }

  async getAdminDetail(certificateId: string) {
    const [certificate] = await this.database.db.select({
      id: certificates.id, publicCertificateId: certificates.publicCertificateId, status: certificates.status,
      issuedAt: certificates.issuedAt, generatedAt: certificates.generatedAt, revokedAt: certificates.revokedAt,
      revocationReason: certificates.revocationReason, revokedBy: certificates.revokedBy,
      learnerName: courseCompletions.learnerNameSnapshot, learnerEmail: users.email,
      courseTitle: courseCompletions.courseTitleSnapshot, completedAt: courseCompletions.completedAt,
    }).from(certificates).innerJoin(courseCompletions, eq(certificates.completionId, courseCompletions.id))
      .innerJoin(users, eq(courseCompletions.userId, users.id)).where(eq(certificates.id, certificateId)).limit(1);
    if (!certificate) throw new NotFoundException({ code: 'CERTIFICATE_NOT_FOUND', message: 'Certificate not found.' });
    const audit = await this.database.db.select({
      id: certificateAuditLogs.id, action: certificateAuditLogs.action, reason: certificateAuditLogs.reason,
      createdAt: certificateAuditLogs.createdAt, actorEmail: users.email,
    }).from(certificateAuditLogs).leftJoin(users, eq(certificateAuditLogs.actorUserId, users.id))
      .where(eq(certificateAuditLogs.certificateId, certificateId)).orderBy(desc(certificateAuditLogs.createdAt)).limit(100);
    return { certificate, audit };
  }

  async searchAdminCertificates(input: { q?: string | undefined; status?: string | undefined; page: number; pageSize: number }) {
    const filters = [];
    if (input.status) filters.push(eq(certificates.status, input.status));
    if (input.q) {
      const term = `%${input.q.replace(/[\\%_]/g, '\\$&')}%`;
      filters.push(or(
        ilike(certificates.publicCertificateId, term),
        ilike(courseCompletions.learnerNameSnapshot, term),
        ilike(courseCompletions.courseTitleSnapshot, term),
        ilike(users.email, term),
      ));
    }
    const where = filters.length ? and(...filters) : undefined;
    const [totalRow] = await this.database.db.select({ total: count() }).from(certificates)
      .innerJoin(courseCompletions, eq(certificates.completionId, courseCompletions.id))
      .innerJoin(users, eq(courseCompletions.userId, users.id)).where(where);
    const items = await this.database.db.select({
      id: certificates.id,
      publicCertificateId: certificates.publicCertificateId,
      status: certificates.status,
      issuedAt: certificates.issuedAt,
      generatedAt: certificates.generatedAt,
      revokedAt: certificates.revokedAt,
      revokedBy: certificates.revokedBy,
      revocationReason: certificates.revocationReason,
      learnerName: courseCompletions.learnerNameSnapshot,
      email: users.email,
      courseTitle: courseCompletions.courseTitleSnapshot,
      completedAt: courseCompletions.completedAt,
    }).from(certificates)
      .innerJoin(courseCompletions, eq(certificates.completionId, courseCompletions.id))
      .innerJoin(users, eq(courseCompletions.userId, users.id))
      .where(where).orderBy(desc(certificates.issuedAt), desc(certificates.createdAt))
      .limit(input.pageSize).offset((input.page - 1) * input.pageSize);
    return { items, page: input.page, pageSize: input.pageSize, total: totalRow?.total ?? 0 };
  }

  async revoke(certificateId: string, actorUserId: string, reason: string) {
    const result = await this.database.db.transaction(async (transaction) => {
      const [current] = await transaction.select().from(certificates)
        .where(eq(certificates.id, certificateId)).for('update').limit(1);
      if (!current) throw new NotFoundException({ code: 'CERTIFICATE_NOT_FOUND', message: 'Certificate not found.' });
      if (current.status === 'revoked') throw new ConflictException({ code: 'CERTIFICATE_ALREADY_REVOKED', message: 'This certificate is already revoked.' });
      const [updated] = await transaction.update(certificates).set({
        status: 'revoked', revokedAt: new Date(), revokedBy: actorUserId, revocationReason: reason, updatedAt: new Date(),
      }).where(eq(certificates.id, certificateId)).returning();
      await transaction.insert(certificateAuditLogs).values({ certificateId, actorUserId, action: 'revoked', reason });
      return updated;
    });
    if (!result) throw new NotFoundException({ code: 'CERTIFICATE_NOT_FOUND', message: 'Certificate not found.' });
    const certificate = result;
    try {
      await this.storage.delete(certificate.objectKey);
    } catch (error) {
      this.logger.warn(`Revoked certificate file cleanup failed for ${certificateId}: ${error instanceof Error ? error.message : 'storage unavailable'}`);
    }
    return { id: certificate.id, status: certificate.status, revokedAt: certificate.revokedAt };
  }

  async retry(certificateId: string) {
    const [certificate] = await this.database.db.select().from(certificates)
      .where(eq(certificates.id, certificateId)).limit(1);
    if (!certificate) throw new NotFoundException({ code: 'CERTIFICATE_NOT_FOUND', message: 'Certificate not found.' });
    if (certificate.status !== 'failed') throw new BadRequestException({ code: 'CERTIFICATE_NOT_FAILED', message: 'Only failed certificates can be retried.' });
    const [updated] = await this.database.db.update(certificates).set({ status: 'pending', updatedAt: new Date() })
      .where(and(eq(certificates.id, certificateId), eq(certificates.status, 'failed'))).returning();
    if (!updated) throw new ConflictException({ code: 'CERTIFICATE_STATE_CHANGED', message: 'Certificate status changed. Refresh and try again.' });
    await this.queue.enqueue(certificateId, true);
    return { id: updated.id, status: updated.status };
  }
}

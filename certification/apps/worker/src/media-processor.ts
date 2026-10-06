import { createReadStream, createWriteStream } from 'node:fs';
import { mkdtemp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import {
  AbortMultipartUploadCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Queue, Worker, type Job } from 'bullmq';
import { and, asc, eq, lt } from 'drizzle-orm';
import { createDatabase, mediaAssets } from '@centaur/lms-database';
import { parseWorkerEnv } from '@centaur/lms-config';
import { Redis } from 'ioredis';
import type pino from 'pino';

interface MediaJob { mediaId: string }
interface ProbeResult {
  format?: { duration?: string };
  streams?: Array<{ codec_type?: string; width?: number; height?: number }>;
}
interface Rendition { width: number; height: number; name: string }

export function startMediaProcessor(redis: Redis, logger: pino.Logger) {
  const environment = parseWorkerEnv(process.env);
  const database = createDatabase(environment.DATABASE_URL, environment.DATABASE_POOL_MAX);
  const storageConfigured = Boolean(environment.R2_ENDPOINT && environment.R2_BUCKET && environment.R2_ACCESS_KEY_ID && environment.R2_SECRET_ACCESS_KEY);
  const storage = storageConfigured ? new S3Client({
    endpoint: environment.R2_ENDPOINT!,
    region: 'auto',
    forcePathStyle: true,
    credentials: { accessKeyId: environment.R2_ACCESS_KEY_ID!, secretAccessKey: environment.R2_SECRET_ACCESS_KEY! },
  }) : null;

  const queueConnection = new Redis(environment.REDIS_URL, { maxRetriesPerRequest: null });
  const queue = new Queue('media-processing', { connection: queueConnection });
  const worker = new Worker<MediaJob>('media-processing', (job) => processMedia(job), { connection: redis, concurrency: 2 });
  const ready = new Promise<void>((resolve) => worker.once('ready', resolve));
  worker.on('ready', () => logger.info({ event: 'worker.media_ready' }, 'Media processing queue is ready'));
  worker.on('failed', (job, error) => logger.error({ err: error, mediaId: job?.data.mediaId, event: 'worker.media_job_failed' }, 'Media processing attempt failed'));
  worker.on('error', (error) => logger.error({ err: error, event: 'worker.media_error' }, 'Media worker error'));
  const orphanCleanupTimer = setInterval(() => {
    void cleanupIncompleteUploads().catch((error: unknown) => logger.warn({ err: error, event: 'media.orphan_cleanup_failed' }, 'Could not clean stale multipart uploads'));
  }, 60 * 60 * 1000);
  orphanCleanupTimer.unref();
  void cleanupIncompleteUploads().catch((error: unknown) => logger.warn({ err: error, event: 'media.orphan_cleanup_failed' }, 'Could not clean stale multipart uploads'));
  const queueRecoveryTimer = setInterval(() => {
    void recoverUnqueuedMedia().catch((error: unknown) => logger.warn({ err: error, event: 'media.queue_recovery_failed' }, 'Could not recover pending media jobs'));
  }, 60 * 1000);
  queueRecoveryTimer.unref();
  void recoverUnqueuedMedia().catch((error: unknown) => logger.warn({ err: error, event: 'media.queue_recovery_failed' }, 'Could not recover pending media jobs'));

  async function recoverUnqueuedMedia() {
    const cutoff = new Date(Date.now() - 60 * 1000);
    const pending = await database.db.select({ id: mediaAssets.id }).from(mediaAssets)
      .where(and(eq(mediaAssets.status, 'processing'), lt(mediaAssets.updatedAt, cutoff))).orderBy(asc(mediaAssets.updatedAt)).limit(100);
    for (const media of pending) {
      const jobId = `media-${media.id}`;
      const existing = await queue.getJob(jobId);
      if (existing && (await existing.getState()) === 'failed') await existing.remove();
      await queue.add('process-media', { mediaId: media.id }, {
        jobId,
        attempts: 4,
        backoff: { type: 'exponential', delay: 5_000 },
        removeOnComplete: { age: 7 * 24 * 60 * 60, count: 5_000 },
        removeOnFail: { age: 30 * 24 * 60 * 60, count: 5_000 },
      });
    }
  }

  async function cleanupIncompleteUploads() {
    if (!storage || !environment.R2_BUCKET) return;
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stale = await database.db.select().from(mediaAssets)
      .where(and(eq(mediaAssets.status, 'uploading'), lt(mediaAssets.updatedAt, cutoff))).orderBy(asc(mediaAssets.updatedAt)).limit(100);
    for (const media of stale) {
      if (media.uploadId) await storage.send(new AbortMultipartUploadCommand({ Bucket: environment.R2_BUCKET, Key: media.sourceKey, UploadId: media.uploadId })).catch(() => undefined);
      await database.db.update(mediaAssets).set({ status: 'aborted', uploadId: null, updatedAt: new Date() })
        .where(and(eq(mediaAssets.id, media.id), eq(mediaAssets.status, 'uploading'), lt(mediaAssets.updatedAt, cutoff)));
      logger.info({ mediaId: media.id, event: 'media.stale_upload_aborted' }, 'Expired incomplete multipart upload');
    }
  }

  async function processMedia(job: Job<MediaJob>) {
    const [media] = await database.db.select().from(mediaAssets).where(eq(mediaAssets.id, job.data.mediaId)).limit(1);
    if (!media || media.status === 'ready' || media.status === 'aborted') return;
    if (!storage || !environment.R2_BUCKET) throw new Error('Media storage is not configured for the worker.');
    const outputPrefix = `media/${media.id}/hls`;
    const mediaPrefix = `media/${media.id}/`;
    const temporaryDirectory = await mkdtemp(join(tmpdir(), 'centaur-media-'));
    const sourcePath = join(temporaryDirectory, 'source');
    const outputDirectory = join(temporaryDirectory, 'output');
    try {
      await mkdir(outputDirectory, { recursive: true });
      await database.db.update(mediaAssets).set({ status: 'processing', errorCode: null, updatedAt: new Date() }).where(eq(mediaAssets.id, media.id));
      await removePrefix(storage, environment.R2_BUCKET, mediaPrefix);
      if (media.kind === 'PDF') {
        const response = await storage.send(new GetObjectCommand({ Bucket: environment.R2_BUCKET, Key: media.sourceKey, Range: 'bytes=0-4' }));
        const signature = Buffer.from(await response.Body?.transformToByteArray() ?? []);
        if (signature.toString('ascii') !== '%PDF-') throw new Error('PDF signature is invalid.');
        await database.db.update(mediaAssets).set({
          status: 'ready', outputSizeBytes: media.sourceSizeBytes, outputPrefix: null,
          processedAt: new Date(), updatedAt: new Date(), errorCode: null,
        }).where(eq(mediaAssets.id, media.id));
        return;
      }

      const object = await storage.send(new GetObjectCommand({ Bucket: environment.R2_BUCKET, Key: media.sourceKey }));
      if (!object.Body) throw new Error('Source object is empty.');
      await pipeline(object.Body as Readable, createWriteStream(sourcePath));
      const sourceFile = await stat(sourcePath);
      if (sourceFile.size !== media.sourceSizeBytes) throw new Error('Source object size mismatch.');

      const probe = await probeVideo(sourcePath);
      const video = probe.streams?.find((stream) => stream.codec_type === 'video');
      const duration = Number(probe.format?.duration);
      if (!video?.width || !video.height || !Number.isFinite(duration) || duration <= 0) throw new Error('Video metadata is incomplete.');
      if (duration > environment.MEDIA_MAX_DURATION_SECONDS) throw new Error('Video duration exceeds the configured processing limit.');
      const renditions = createRenditions(video.width, video.height);
      const posterPath = join(outputDirectory, 'poster.jpg');
      await runTool(process.env.FFMPEG_PATH || 'ffmpeg', [
        '-hide_banner', '-loglevel', 'error', '-y', '-ss', String(Math.min(1, duration / 2)), '-i', sourcePath,
        '-frames:v', '1', '-vf', 'scale=640:-2:force_original_aspect_ratio=decrease', '-q:v', '3', posterPath,
      ]);

      let renditionBytes = Number.POSITIVE_INFINITY;
      for (const crf of [29, 33, 37, 41]) {
        await rm(join(outputDirectory, 'hls'), { recursive: true, force: true });
        await mkdir(join(outputDirectory, 'hls'), { recursive: true });
        for (const rendition of renditions) await encodeRendition(sourcePath, join(outputDirectory, 'hls'), rendition, crf);
        renditionBytes = await directorySize(join(outputDirectory, 'hls'));
        if (renditionBytes <= media.sourceSizeBytes) break;
      }
      if (renditionBytes > media.sourceSizeBytes) throw new Error('Encoded HLS output exceeds the source file size.');

      const master = ['#EXTM3U', '#EXT-X-VERSION:3'];
      for (const rendition of renditions) {
        const renditionDirectory = join(outputDirectory, 'hls', rendition.name);
        const renditionBytes = await directorySize(renditionDirectory);
        const bandwidth = Math.max(96_000, Math.ceil((renditionBytes * 8) / duration * 1.15));
        master.push(`#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${rendition.width}x${rendition.height}`);
        master.push(`${rendition.name}/index.m3u8`);
      }
      master.push('');
      const masterPath = join(outputDirectory, 'hls', 'master.m3u8');
      await (await import('node:fs/promises')).writeFile(masterPath, master.join('\n'));
      renditionBytes = await directorySize(join(outputDirectory, 'hls'));
      if (renditionBytes > media.sourceSizeBytes) throw new Error('Encoded HLS output exceeds the source file size.');
      const uploadFiles = await listFiles(join(outputDirectory, 'hls'));
      for (const filePath of uploadFiles) {
        const keyPath = relative(join(outputDirectory, 'hls'), filePath).split(sep).join('/');
        const contentType = keyPath.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp2t';
        const fileSize = (await stat(filePath)).size;
        await storage.send(new PutObjectCommand({ Bucket: environment.R2_BUCKET, Key: `${outputPrefix}/${keyPath}`, Body: createReadStream(filePath), ContentLength: fileSize, ContentType: contentType }));
      }
      const posterKey = `media/${media.id}/poster.jpg`;
      await storage.send(new PutObjectCommand({ Bucket: environment.R2_BUCKET, Key: posterKey, Body: createReadStream(posterPath), ContentLength: (await stat(posterPath)).size, ContentType: 'image/jpeg' }));
      await database.db.update(mediaAssets).set({
        status: 'ready', outputPrefix, outputSizeBytes: renditionBytes,
        durationSeconds: Math.ceil(duration), width: video.width, height: video.height,
        posterKey, processedAt: new Date(), updatedAt: new Date(), errorCode: null,
      }).where(eq(mediaAssets.id, media.id));
      logger.info({ mediaId: media.id, durationSeconds: Math.ceil(duration), sourceBytes: media.sourceSizeBytes, outputBytes: renditionBytes, event: 'media.ready' }, 'Video transcoding completed');
    } catch (error) {
      await removePrefix(storage, environment.R2_BUCKET, mediaPrefix).catch((cleanupError: unknown) => logger.warn({ err: cleanupError, mediaId: media.id }, 'Unable to clean partial media outputs'));
      const finalAttempt = job.attemptsMade + 1 >= Number(job.opts.attempts ?? 1);
      if (finalAttempt) await database.db.update(mediaAssets).set({ status: 'failed', errorCode: 'MEDIA_PROCESSING_FAILED', updatedAt: new Date() }).where(eq(mediaAssets.id, media.id));
      throw error;
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  }

  return {
    ready,
    close: async () => {
      clearInterval(orphanCleanupTimer);
      clearInterval(queueRecoveryTimer);
      await worker.close();
      await queue.close();
      await queueConnection.quit();
      storage?.destroy();
      await database.client.end();
    },
  };
}

async function probeVideo(filePath: string): Promise<ProbeResult> {
  const output = await runTool(process.env.FFPROBE_PATH || 'ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height', '-of', 'json', filePath,
  ]);
  return JSON.parse(output) as ProbeResult;
}

function createRenditions(sourceWidth: number, sourceHeight: number): Rendition[] {
  const heights = sourceHeight >= 1080 ? [360, 720, 1080] : sourceHeight >= 720 ? [360, 720] : sourceHeight >= 480 ? [240, 480] : sourceHeight >= 360 ? [240, 360] : [Math.max(2, Math.floor(sourceHeight / 2) * 2)];
  return [...new Set(heights)].map((height) => {
    const outputHeight = Math.min(height, sourceHeight) - (Math.min(height, sourceHeight) % 2);
    const outputWidth = Math.max(2, Math.floor((sourceWidth * outputHeight / sourceHeight) / 2) * 2);
    return { width: outputWidth, height: outputHeight, name: `${outputHeight}p` };
  });
}

async function encodeRendition(sourcePath: string, outputDirectory: string, rendition: Rendition, crf: number) {
  const folder = join(outputDirectory, rendition.name);
  await mkdir(folder, { recursive: true });
  await runTool(process.env.FFMPEG_PATH || 'ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', sourcePath,
    '-map', '0:v:0', '-map', '0:a:0?', '-vf', `scale=${rendition.width}:${rendition.height}`,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(crf), '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '64k', '-ac', '2', '-hls_time', '6', '-hls_playlist_type', 'vod',
    '-hls_flags', 'independent_segments', '-hls_segment_filename', join(folder, 'segment_%05d.ts'), join(folder, 'index.m3u8'),
  ]);
}

function runTool(command: string, args: string[], timeoutMs = 6 * 60 * 60 * 1000) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);
    timeout.unref();
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => { stdout = (stdout + chunk).slice(-1_000_000); });
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => { stderr = (stderr + chunk).slice(-20_000); });
    child.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once('close', (code) => {
      clearTimeout(timeout);
      if (timedOut) reject(new Error(`${command} exceeded its ${Math.floor(timeoutMs / 1000)} second processing limit.`));
      else if (code === 0) resolve(stdout);
      else reject(new Error(`${command} exited with ${code}: ${stderr.slice(-2_000)}`));
    });
  });
}

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : Promise.resolve([path]);
  }));
  return nested.flat();
}

async function directorySize(directory: string) {
  const files = await listFiles(directory);
  const stats = await Promise.all(files.map((file) => stat(file)));
  return stats.reduce((sum, file) => sum + file.size, 0);
}

async function removePrefix(storage: S3Client, bucket: string, prefix: string) {
  let continuationToken: string | undefined;
  do {
    const page = await storage.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: continuationToken }));
    if (page.Contents?.length) {
      await storage.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: page.Contents.flatMap((object) => object.Key ? [{ Key: object.Key }] : []) } }));
    }
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken);
}

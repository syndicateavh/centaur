import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import type { createDatabase } from '@centaur/lms-database';
import { courseModules, courses, enrollments, lessons, mediaAssets } from '@centaur/lms-database';
import { parseApiEnv } from '@centaur/lms-config';
import { DATABASE_CLIENT } from '../tokens.js';
import { MediaQueueService } from './media-queue.service.js';
import { MediaStorageService } from './media-storage.service.js';
import type { MediaUploadInput } from './media.schemas.js';

type Database = ReturnType<typeof createDatabase>;
const MIME_EXTENSIONS: Record<MediaUploadInput['contentType'], string[]> = {
  'application/pdf': ['.pdf'],
  'video/mp4': ['.mp4', '.m4v'],
  'video/quicktime': ['.mov'],
  'video/webm': ['.webm'],
  'video/x-matroska': ['.mkv'],
  'video/x-m4v': ['.m4v'],
};

@Injectable()
export class MediaService {
  private readonly environment = parseApiEnv(process.env);

  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: Database,
    @Inject(MediaStorageService) private readonly storage: MediaStorageService,
    @Inject(MediaQueueService) private readonly queue: MediaQueueService,
  ) {}

  async listForLesson(lessonId: string) {
    const lesson = await this.requireAdminLesson(lessonId);
    const rows = await this.database.db.select().from(mediaAssets)
      .where(eq(mediaAssets.lessonId, lesson.id)).orderBy(desc(mediaAssets.createdAt));
    return rows.map((media) => this.publicAdminMedia(media));
  }

  async startUpload(userId: string, input: MediaUploadInput) {
    const extension = this.fileExtension(input.fileName);
    if (!MIME_EXTENSIONS[input.contentType].includes(extension)) throw this.invalidFile();
    if (input.sizeBytes > this.environment.MEDIA_MAX_UPLOAD_BYTES) {
      throw new BadRequestException({ code: 'MEDIA_FILE_TOO_LARGE', message: `The maximum upload size is ${this.environment.MEDIA_MAX_UPLOAD_BYTES} bytes.` });
    }
    const lesson = await this.requireAdminLesson(input.lessonId);
    if (lesson.courseStatus !== 'draft') throw new ConflictException({ code: 'MEDIA_COURSE_MUST_BE_DRAFT', message: 'Unpublish the course before changing its lesson media.' });
    if (lesson.type !== (input.contentType === 'application/pdf' ? 'PDF' : 'VIDEO')) {
      throw new BadRequestException({ code: 'MEDIA_LESSON_TYPE_MISMATCH', message: 'The selected file type does not match this lesson.' });
    }

    const [media] = await this.database.db.insert(mediaAssets).values({
      lessonId: input.lessonId,
      createdBy: userId,
      kind: input.contentType === 'application/pdf' ? 'PDF' : 'VIDEO',
      originalFileName: this.safeFileName(input.fileName),
      contentType: input.contentType,
      sourceKey: `media/${crypto.randomUUID()}/source`,
      sourceSizeBytes: input.sizeBytes,
    }).returning();
    let uploadId: string | undefined;
    try {
      const upload = await this.storage.createMultipart(media!.sourceKey, input.contentType, {
        'media-id': media!.id,
        'created-by': userId,
      });
      uploadId = upload.UploadId;
      if (!uploadId) throw new Error('Object storage did not return a multipart upload ID.');
      await this.database.db.update(mediaAssets).set({ uploadId, updatedAt: new Date() })
        .where(eq(mediaAssets.id, media!.id));
      return { media: this.publicAdminMedia(media!), partSizeBytes: this.environment.MEDIA_UPLOAD_PART_BYTES };
    } catch (error) {
      if (uploadId) await this.storage.abortMultipart(media!.sourceKey, uploadId).catch(() => undefined);
      await this.database.db.update(mediaAssets).set({ status: 'failed', errorCode: 'UPLOAD_INITIALIZATION_FAILED', updatedAt: new Date() })
        .where(eq(mediaAssets.id, media!.id));
      throw error;
    }
  }

  async createPartUrl(userId: string, mediaId: string, partNumber: number) {
    const media = await this.requireOwnedMedia(userId, mediaId);
    if (media.status !== 'uploading' || !media.uploadId) throw new ConflictException({ code: 'MEDIA_UPLOAD_NOT_ACTIVE', message: 'This upload is no longer active.' });
    const partCount = Math.ceil(media.sourceSizeBytes / this.environment.MEDIA_UPLOAD_PART_BYTES);
    if (partNumber < 1 || partNumber > partCount || partNumber > 10_000) throw new BadRequestException({ code: 'MEDIA_PART_INVALID', message: 'The upload part number is invalid.' });
    await this.database.db.update(mediaAssets).set({ updatedAt: new Date() }).where(eq(mediaAssets.id, mediaId));
    return { url: await this.storage.signUploadPart(media.sourceKey, media.uploadId, partNumber), expiresInSeconds: 900 };
  }

  async completeUpload(userId: string, mediaId: string) {
    const media = await this.requireOwnedMedia(userId, mediaId);
    if (media.status === 'ready') return { media: this.publicAdminMedia(media), enqueued: false };
    if (media.status === 'processing') {
      await this.queue.enqueue(media.id);
      return { media: this.publicAdminMedia(media), enqueued: true };
    }
    if (media.status !== 'uploading' || !media.uploadId) throw new ConflictException({ code: 'MEDIA_UPLOAD_NOT_ACTIVE', message: 'This upload cannot be completed.' });

    try {
      const response = await this.storage.listParts(media.sourceKey, media.uploadId);
      const parts = (response.Parts ?? []).filter((part) => part.PartNumber && part.ETag && part.Size !== undefined)
        .sort((left, right) => left.PartNumber! - right.PartNumber!);
      const expectedParts = Math.ceil(media.sourceSizeBytes / this.environment.MEDIA_UPLOAD_PART_BYTES);
      if (parts.length !== expectedParts || parts.some((part, index) => part.PartNumber !== index + 1)) {
        throw new BadRequestException({ code: 'MEDIA_UPLOAD_INCOMPLETE', message: 'Upload all file parts before completing this upload.' });
      }
      const totalBytes = parts.reduce((sum, part) => sum + (part.Size ?? 0), 0);
      const expectedLastPartBytes = media.sourceSizeBytes - this.environment.MEDIA_UPLOAD_PART_BYTES * (expectedParts - 1);
      const invalidPartSizes = parts.slice(0, -1).some((part) => part.Size !== this.environment.MEDIA_UPLOAD_PART_BYTES)
        || parts.at(-1)?.Size !== expectedLastPartBytes;
      if (totalBytes !== media.sourceSizeBytes || invalidPartSizes) {
        throw new BadRequestException({ code: 'MEDIA_UPLOAD_SIZE_MISMATCH', message: 'The uploaded parts do not match the declared file size.' });
      }
      await this.storage.completeMultipart(media.sourceKey, media.uploadId, parts.map((part) => ({ PartNumber: part.PartNumber!, ETag: part.ETag! })));
    } catch (error) {
      // A retry after another callback finished the same upload sees no upload ID; the stored object is the idempotency proof.
      const existing = await this.storage.head(media.sourceKey).catch(() => null);
      if (existing?.ContentLength !== media.sourceSizeBytes) throw error;
    }
    const object = await this.storage.head(media.sourceKey);
    if (object.ContentLength !== media.sourceSizeBytes) throw new BadRequestException({ code: 'MEDIA_UPLOAD_SIZE_MISMATCH', message: 'The stored file size does not match the upload request.' });
    const signature = await this.storage.readBytes(media.sourceKey, 'bytes=0-15');
    if (!this.signatureMatches(media.kind, signature)) {
      await this.storage.abortMultipart(media.sourceKey, media.uploadId).catch(() => undefined);
      await this.storage.delete(media.sourceKey).catch(() => undefined);
      await this.database.db.update(mediaAssets).set({ status: 'failed', errorCode: 'MEDIA_FILE_SIGNATURE_INVALID', updatedAt: new Date() }).where(eq(mediaAssets.id, media.id));
      throw this.invalidFile();
    }
    const [updated] = await this.database.db.update(mediaAssets).set({ status: 'processing', uploadId: null, updatedAt: new Date() })
      .where(and(eq(mediaAssets.id, media.id), eq(mediaAssets.status, 'uploading'))).returning();
    await this.queue.enqueue(media.id);
    return { media: this.publicAdminMedia(updated ?? media), enqueued: true };
  }

  async abortUpload(userId: string, mediaId: string) {
    const media = await this.requireOwnedMedia(userId, mediaId);
    if (media.status === 'aborted') return { media: this.publicAdminMedia(media) };
    if (media.status !== 'uploading') throw new ConflictException({ code: 'MEDIA_UPLOAD_NOT_ABORTABLE', message: 'Only an active upload can be aborted.' });
    if (media.uploadId) await this.storage.abortMultipart(media.sourceKey, media.uploadId);
    const [updated] = await this.database.db.update(mediaAssets).set({ status: 'aborted', uploadId: null, updatedAt: new Date() })
      .where(and(eq(mediaAssets.id, mediaId), eq(mediaAssets.status, 'uploading'))).returning();
    if (!updated) throw new ConflictException({ code: 'MEDIA_UPLOAD_NOT_ABORTABLE', message: 'The upload has already changed state.' });
    return { media: this.publicAdminMedia(updated!) };
  }

  async retryProcessing(mediaId: string) {
    const media = await this.requireMedia(mediaId);
    if (media.status !== 'failed') throw new ConflictException({ code: 'MEDIA_NOT_RETRYABLE', message: 'Only failed media can be retried.' });
    const [updated] = await this.database.db.update(mediaAssets).set({ status: 'processing', errorCode: null, updatedAt: new Date() })
      .where(and(eq(mediaAssets.id, mediaId), eq(mediaAssets.status, 'failed'))).returning();
    if (!updated) throw new ConflictException({ code: 'MEDIA_NOT_RETRYABLE', message: 'This media upload has already changed state.' });
    await this.queue.enqueue(mediaId, true);
    return this.publicAdminMedia(updated!);
  }

  async getLessonPlayback(userId: string, courseId: string, lessonId: string) {
    const media = await this.findReadyMedia(userId, courseId, lessonId);
    if (media.kind === 'PDF') return { id: media.id, kind: media.kind, url: await this.storage.signDownload(media.sourceKey, 'application/pdf'), expiresInSeconds: this.environment.MEDIA_SIGNED_URL_TTL_SECONDS };
    return {
      id: media.id,
      kind: media.kind,
      url: `/learner/media/${media.id}/manifest?key=master.m3u8`,
      durationSeconds: media.durationSeconds,
      width: media.width,
      height: media.height,
      posterUrl: media.posterKey ? await this.storage.signDownload(media.posterKey, 'image/jpeg') : null,
      expiresInSeconds: this.environment.MEDIA_SIGNED_URL_TTL_SECONDS,
    };
  }

  async getManifest(userId: string, mediaId: string, key: string) {
    const media = await this.findReadyMediaById(userId, mediaId);
    const outputPrefix = this.requireVideoOutput(media.kind, media.outputPrefix);
    return this.readAndRewriteManifest(media.id, outputPrefix, key);
  }

  async getProtectedAsset(userId: string, mediaId: string, key: string) {
    const media = await this.findReadyMediaById(userId, mediaId);
    const outputPrefix = this.requireVideoOutput(media.kind, media.outputPrefix);
    const objectKey = this.validateOutputKey(outputPrefix, key);
    if (objectKey.endsWith('.m3u8')) return { manifest: await this.readAndRewriteManifest(media.id, outputPrefix, key) };
    return { url: await this.storage.signDownload(objectKey) };
  }

  private async readAndRewriteManifest(mediaId: string, outputPrefix: string, key: string) {
    const objectKey = this.validateOutputKey(outputPrefix, key);
    if (!objectKey.endsWith('.m3u8')) throw new NotFoundException({ code: 'MEDIA_MANIFEST_NOT_FOUND', message: 'Media manifest not found.' });
    const manifest = await this.storage.readText(objectKey);
    if (!manifest.startsWith('#EXTM3U')) throw new NotFoundException({ code: 'MEDIA_MANIFEST_NOT_FOUND', message: 'Media manifest not found.' });
    const directory = objectKey.slice(0, objectKey.lastIndexOf('/') + 1);
    const [media] = await this.database.db.select({ durationSeconds: mediaAssets.durationSeconds }).from(mediaAssets)
      .where(eq(mediaAssets.id, mediaId)).limit(1);
    const signedUrlLifetime = Math.min(604_800, Math.max(this.environment.MEDIA_SIGNED_URL_TTL_SECONDS, (media?.durationSeconds ?? 0) + 300));
    const rewrite = async (path: string) => {
      const relativeKey = `${directory}${path}`.replace(`${outputPrefix}/`, '');
      if (relativeKey.endsWith('.m3u8')) return `${this.environment.API_PUBLIC_URL}/api/v1/learner/media/${mediaId}/asset?key=${encodeURIComponent(relativeKey)}`;
      return this.storage.signDownload(this.validateOutputKey(outputPrefix, relativeKey), undefined, signedUrlLifetime);
    };
    const lines = await Promise.all(manifest.split(/\r?\n/).map(async (line) => {
      if (!line.trim()) return line;
      if (line.startsWith('#')) {
        const uriMatches = [...line.matchAll(/URI="([^"]+)"/g)];
        let rewritten = line;
        for (const match of uriMatches) rewritten = rewritten.replace(`URI="${match[1]}"`, `URI="${await rewrite(match[1]!)}"`);
        return rewritten;
      }
      return rewrite(line.trim());
    }));
    return lines.join('\n');
  }

  private async findReadyMedia(userId: string, courseId: string, lessonId: string) {
    const [media] = await this.database.db.select({
      id: mediaAssets.id,
      kind: mediaAssets.kind,
      sourceKey: mediaAssets.sourceKey,
      outputPrefix: mediaAssets.outputPrefix,
      durationSeconds: mediaAssets.durationSeconds,
      width: mediaAssets.width,
      height: mediaAssets.height,
      posterKey: mediaAssets.posterKey,
    }).from(mediaAssets)
      .innerJoin(lessons, eq(mediaAssets.lessonId, lessons.id))
      .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
      .innerJoin(courses, eq(courseModules.courseId, courses.id))
      .innerJoin(enrollments, and(eq(enrollments.courseId, courses.id), eq(enrollments.userId, userId)))
      .where(and(eq(mediaAssets.lessonId, lessonId), eq(lessons.type, mediaAssets.kind), eq(courseModules.courseId, courseId), eq(mediaAssets.status, 'ready'), eq(courses.status, 'published')))
      .orderBy(desc(mediaAssets.createdAt)).limit(1);
    if (!media) throw new ForbiddenException({ code: 'MEDIA_ACCESS_DENIED', message: 'A ready media asset for this enrolled lesson was not found.' });
    return media;
  }

  private async findReadyMediaById(userId: string, mediaId: string) {
    const [media] = await this.database.db.select({
      id: mediaAssets.id,
      kind: mediaAssets.kind,
      sourceKey: mediaAssets.sourceKey,
      outputPrefix: mediaAssets.outputPrefix,
      durationSeconds: mediaAssets.durationSeconds,
      width: mediaAssets.width,
      height: mediaAssets.height,
      posterKey: mediaAssets.posterKey,
    }).from(mediaAssets)
      .innerJoin(lessons, eq(mediaAssets.lessonId, lessons.id))
      .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
      .innerJoin(courses, eq(courseModules.courseId, courses.id))
      .innerJoin(enrollments, and(eq(enrollments.courseId, courses.id), eq(enrollments.userId, userId)))
      .where(and(eq(mediaAssets.id, mediaId), eq(lessons.type, mediaAssets.kind), eq(mediaAssets.status, 'ready'), eq(courses.status, 'published')))
      .limit(1);
    if (!media) throw new ForbiddenException({ code: 'MEDIA_ACCESS_DENIED', message: 'You are not enrolled in this published course.' });
    return media;
  }

  private async requireOwnedMedia(userId: string, mediaId: string) {
    const [media] = await this.database.db.select().from(mediaAssets)
      .where(and(eq(mediaAssets.id, mediaId), eq(mediaAssets.createdBy, userId))).limit(1);
    if (!media) throw new NotFoundException({ code: 'MEDIA_NOT_FOUND', message: 'Media upload not found.' });
    return media;
  }

  private async requireMedia(mediaId: string) {
    const [media] = await this.database.db.select().from(mediaAssets).where(eq(mediaAssets.id, mediaId)).limit(1);
    if (!media) throw new NotFoundException({ code: 'MEDIA_NOT_FOUND', message: 'Media upload not found.' });
    return media;
  }

  private async requireAdminLesson(lessonId: string) {
    const [lesson] = await this.database.db.select({ id: lessons.id, type: lessons.type, courseStatus: courses.status })
      .from(lessons).innerJoin(courseModules, eq(lessons.moduleId, courseModules.id)).innerJoin(courses, eq(courseModules.courseId, courses.id))
      .where(eq(lessons.id, lessonId)).limit(1);
    if (!lesson) throw new NotFoundException({ code: 'LESSON_NOT_FOUND', message: 'Lesson not found.' });
    return lesson;
  }

  private publicAdminMedia(media: typeof mediaAssets.$inferSelect) {
    return {
      id: media.id,
      lessonId: media.lessonId,
      kind: media.kind,
      status: media.status,
      originalFileName: media.originalFileName,
      contentType: media.contentType,
      sourceSizeBytes: media.sourceSizeBytes,
      outputSizeBytes: media.outputSizeBytes,
      durationSeconds: media.durationSeconds,
      width: media.width,
      height: media.height,
      errorCode: media.errorCode,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
      processedAt: media.processedAt,
    };
  }

  private safeFileName(fileName: string) {
    return fileName.replace(/[\\/]/g, '_').split('').filter((character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127).join('').slice(-255);
  }

  private fileExtension(fileName: string) {
    const safe = this.safeFileName(fileName).toLowerCase();
    const index = safe.lastIndexOf('.');
    return index >= 0 ? safe.slice(index) : '';
  }

  private signatureMatches(kind: string, bytes: Uint8Array) {
    if (kind === 'PDF') return Buffer.from(bytes.subarray(0, 5)).toString('ascii') === '%PDF-';
    if (bytes.length < 12) return false;
    const ascii = Buffer.from(bytes).toString('ascii');
    return ascii.includes('ftyp') || bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  }

  private validateOutputKey(prefix: string, key: string) {
    if (!key || key.includes('\\') || key.startsWith('/') || key.split('/').some((segment) => !segment || segment === '.' || segment === '..')) {
      throw new NotFoundException({ code: 'MEDIA_ASSET_NOT_FOUND', message: 'Media file not found.' });
    }
    const objectKey = `${prefix}/${key}`;
    if (!objectKey.startsWith(`${prefix}/`)) throw new NotFoundException({ code: 'MEDIA_ASSET_NOT_FOUND', message: 'Media file not found.' });
    return objectKey;
  }

  private requireVideoOutput(kind: string, outputPrefix: string | null) {
    if (kind !== 'VIDEO' || !outputPrefix) throw new NotFoundException({ code: 'MEDIA_ASSET_NOT_FOUND', message: 'Media file not found.' });
    return outputPrefix;
  }

  private invalidFile() {
    return new BadRequestException({ code: 'MEDIA_FILE_INVALID', message: 'The file name, content type, or file signature is not supported.' });
  }
}

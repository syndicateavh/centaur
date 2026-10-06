import { z } from 'zod';

export const mediaUploadInputSchema = z.object({
  lessonId: z.string().uuid(),
  fileName: z.string().trim().min(1).max(255),
  contentType: z.enum(['application/pdf', 'video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska', 'video/x-m4v']),
  sizeBytes: z.number().int().positive(),
});

export type MediaUploadInput = z.infer<typeof mediaUploadInputSchema>;

export const mediaLibraryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  q: z.string().trim().max(160).optional(),
  kind: z.enum(['VIDEO', 'PDF']).optional(),
  status: z.enum(['uploading', 'processing', 'ready', 'failed', 'aborted']).optional(),
});

export type MediaLibraryQuery = z.infer<typeof mediaLibraryQuerySchema>;

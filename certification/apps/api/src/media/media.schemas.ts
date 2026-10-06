import { z } from 'zod';

export const mediaUploadInputSchema = z.object({
  lessonId: z.string().uuid(),
  fileName: z.string().trim().min(1).max(255),
  contentType: z.enum(['application/pdf', 'video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska', 'video/x-m4v']),
  sizeBytes: z.number().int().positive(),
});

export type MediaUploadInput = z.infer<typeof mediaUploadInputSchema>;

import { z } from 'zod';

export const courseSlugSchema = z.string().trim().toLowerCase().min(2).max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens.');

const courseFields = {
  title: z.string().trim().min(3).max(160),
  slug: courseSlugSchema,
  description: z.string().trim().max(10_000).nullable().optional(),
  certificateEnabled: z.boolean().default(false),
  quizEnabled: z.boolean().default(false),
  quizRequired: z.boolean().default(false),
  quizPassPercent: z.number().int().min(1).max(100).default(70),
  videoCompletionPercent: z.number().int().min(50).max(100).default(90),
  textCompletionMode: z.enum(['manual', 'on_open']).default('manual'),
};

export const createCourseSchema = z.object(courseFields).refine(
  (course) => !course.quizRequired || course.quizEnabled,
  { message: 'A required quiz must be enabled.', path: ['quizRequired'] },
);

export const updateCourseSchema = z.object({
  title: courseFields.title,
  slug: courseFields.slug,
  description: courseFields.description,
  certificateEnabled: z.boolean(),
  quizEnabled: z.boolean(),
  quizRequired: z.boolean(),
  quizPassPercent: z.number().int().min(1).max(100),
  videoCompletionPercent: z.number().int().min(50).max(100),
  textCompletionMode: z.enum(['manual', 'on_open']),
}).refine((course) => !course.quizRequired || course.quizEnabled, {
  message: 'A required quiz must be enabled.', path: ['quizRequired'],
});

export const courseStatusSchema = z.object({ status: z.enum(['draft', 'published', 'archived']) });

export const moduleInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(5000).nullable().optional(),
});

export const lessonInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(5000).nullable().optional(),
  type: z.enum(['VIDEO', 'PDF', 'TEXT']),
  content: z.string().max(100_000).nullable().optional(),
  required: z.boolean().default(true),
});

export const reorderSchema = z.object({ ids: z.array(z.uuid()).max(200) });

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseStatusInput = z.infer<typeof courseStatusSchema>;
export type ModuleInput = z.infer<typeof moduleInputSchema>;
export type LessonInput = z.infer<typeof lessonInputSchema>;

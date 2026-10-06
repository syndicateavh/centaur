import { z } from 'zod';

const optionSchema = z.object({ label: z.string().trim().min(1).max(500), isCorrect: z.boolean() });
const questionSchema = z.object({
  prompt: z.string().trim().min(2).max(5000),
  type: z.enum(['single_choice', 'multiple_choice', 'true_false']),
  points: z.number().int().min(1).max(100).default(1),
  options: z.array(optionSchema).min(2).max(8),
});

export const saveQuizSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(5000).nullable().optional(),
  questions: z.array(questionSchema).min(1).max(100),
});

export const submitQuizSchema = z.object({
  answers: z.array(z.object({ questionId: z.uuid(), optionIds: z.array(z.uuid()).min(1).max(8) })).min(1).max(100),
});

export type SaveQuizInput = z.infer<typeof saveQuizSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;

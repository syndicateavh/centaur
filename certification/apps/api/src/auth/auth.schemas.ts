import { loginSchema, registerSchema } from '@centaur/lms-shared';
import { z } from 'zod';

export { loginSchema, registerSchema };
export type LoginBody = z.infer<typeof loginSchema>;
export type RegisterBody = z.infer<typeof registerSchema>;

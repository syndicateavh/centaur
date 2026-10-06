import { z } from 'zod';

export const API_PREFIX = '/api/v1';

export const emailSchema = z.email().max(254);
export const passwordSchema = z.string().min(8).max(128);
export const roleCodeSchema = z.string().min(1).max(40);
export const permissionCodeSchema = z.string().min(1).max(100);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().max(100).optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const sessionUserSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  displayName: z.string().nullable(),
  createdAt: z.string().datetime(),
  roles: z.array(roleCodeSchema),
  permissions: z.array(permissionCodeSchema),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
export type RoleCode = z.infer<typeof roleCodeSchema>;
export type PermissionCode = z.infer<typeof permissionCodeSchema>;

export interface ApiError {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}

export interface HealthStatus {
  status: 'ok' | 'error';
  requestId: string;
  checks: {
    database: 'ok' | 'error';
    redis: 'ok' | 'error';
    worker: 'ok' | 'error';
  };
}

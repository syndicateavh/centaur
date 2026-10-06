import type { Request } from 'express';

export const SESSION_COOKIE_NAME = 'lms_session';
export const CSRF_COOKIE_NAME = 'lms_csrf';

export interface AuthenticatedRequest extends Request {
  authUserId?: string;
}

export interface SessionRecord {
  userId: string;
  createdAt: string;
}

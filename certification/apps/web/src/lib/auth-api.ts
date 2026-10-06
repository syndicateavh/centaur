import { webEnvSchema } from '@centaur/lms-config';
import type { LoginInput, RegisterInput, SessionUser } from '@centaur/lms-shared';

const { VITE_API_BASE_URL: API_BASE_URL } = webEnvSchema.parse(import.meta.env);
export const getApiBaseUrl = () => API_BASE_URL;

interface ApiErrorBody {
  error?: { code?: string; message?: string; requestId?: string };
}

export class ApiRequestError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

async function getCsrfToken() {
  const response = await fetch(`${API_BASE_URL}/auth/csrf`, { credentials: 'include' });
  if (!response.ok) throw new ApiRequestError('Unable to start a secure session. Please retry.', response.status);
  const body = await response.json() as { csrfToken: string };
  return body.csrfToken;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const method = (options.method ?? 'GET').toUpperCase();
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    headers.set('x-csrf-token', await getCsrfToken());
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
  });
  const body = response.status === 204 ? null : await response.json() as T | ApiErrorBody | null;
  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;
    throw new ApiRequestError(
      errorBody?.error?.message ?? 'The request could not be completed.',
      response.status,
      errorBody?.error?.code,
    );
  }
  return body as T;
}

export async function register(input: RegisterInput) {
  return apiRequest<{ user: SessionUser }>('/auth/register', { method: 'POST', body: JSON.stringify(input) });
}

export async function login(input: LoginInput) {
  return apiRequest<{ user: SessionUser }>('/auth/login', { method: 'POST', body: JSON.stringify(input) });
}

export async function logout() {
  return apiRequest<{ ok: boolean }>('/auth/logout', { method: 'POST' });
}

export async function loadCurrentUser() {
  try {
    const response = await apiRequest<{ user: SessionUser }>('/me');
    return response.user;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) return null;
    throw error;
  }
}

export function loadLearnerDashboard() {
  return apiRequest<{ access: 'learner'; userId: string }>('/learner/dashboard');
}

export function loadAdminDashboard() {
  return apiRequest<{ access: 'admin'; user: SessionUser }>('/admin/dashboard');
}

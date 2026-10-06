import { z } from 'zod';

const originSchema = z.string().url().refine((value) => {
  const url = new URL(value);
  return !url.username && !url.password && !url.search && !url.hash && (url.pathname === '/' || url.pathname === '');
}, 'Must be an origin URL without a path, query, or fragment.');
const databaseUrlSchema = z.string().url().refine((value) => ['postgres:', 'postgresql:'].includes(new URL(value).protocol), 'Must be a PostgreSQL connection URL.');
const redisUrlSchema = z.string().url().refine((value) => ['redis:', 'rediss:'].includes(new URL(value).protocol), 'Must be a Redis connection URL.');
const r2EndpointSchema = z.union([z.string().url(), z.literal('')]).default('');
const secureOrigin = (value: string) => new URL(value).protocol === 'https:';

const commonSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export const apiEnvSchema = commonSchema.extend({
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  API_PUBLIC_URL: originSchema.default('http://localhost:4000'),
  WEB_ORIGIN: originSchema.default('http://localhost:5173'),
  SESSION_TTL_SECONDS: z.coerce.number().int().min(60).max(7776000).default(2592000),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(10).default(0),
  DATABASE_URL: databaseUrlSchema,
  REDIS_URL: redisUrlSchema,
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  MEDIA_MAX_DURATION_SECONDS: z.coerce.number().int().min(60).max(86400).default(14400),
  R2_ENDPOINT: r2EndpointSchema,
  R2_BUCKET: z.string().default(''),
  R2_ACCESS_KEY_ID: z.string().default(''),
  R2_SECRET_ACCESS_KEY: z.string().default(''),
  MEDIA_MAX_UPLOAD_BYTES: z.coerce.number().int().min(5 * 1024 * 1024).max(5 * 1024 * 1024 * 1024).default(5 * 1024 * 1024 * 1024),
  MEDIA_UPLOAD_PART_BYTES: z.coerce.number().int().min(5 * 1024 * 1024).max(128 * 1024 * 1024).default(16 * 1024 * 1024),
  MEDIA_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().min(60).max(604800).default(3600),
}).superRefine((environment, context) => {
  if (environment.R2_ENDPOINT && new URL(environment.R2_ENDPOINT).protocol !== 'https:') {
    context.addIssue({ code: 'custom', path: ['R2_ENDPOINT'], message: 'R2 endpoints must use HTTPS.' });
  }
  if (environment.NODE_ENV === 'production') {
    if (!secureOrigin(environment.WEB_ORIGIN)) context.addIssue({ code: 'custom', path: ['WEB_ORIGIN'], message: 'Production web origins must use HTTPS.' });
    if (!secureOrigin(environment.API_PUBLIC_URL)) context.addIssue({ code: 'custom', path: ['API_PUBLIC_URL'], message: 'Production API origins must use HTTPS.' });
    if (!environment.R2_ENDPOINT || !environment.R2_BUCKET || !environment.R2_ACCESS_KEY_ID || !environment.R2_SECRET_ACCESS_KEY) {
      context.addIssue({ code: 'custom', path: ['R2_ENDPOINT'], message: 'Production requires a private R2 bucket and credentials.' });
    }
  }
});

export const workerEnvSchema = commonSchema.extend({
  WEB_ORIGIN: originSchema.default('http://localhost:5173'),
  REDIS_URL: redisUrlSchema,
  DATABASE_URL: databaseUrlSchema,
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  MEDIA_MAX_DURATION_SECONDS: z.coerce.number().int().min(60).max(86400).default(14400),
  R2_ENDPOINT: r2EndpointSchema,
  R2_BUCKET: z.string().default(''),
  R2_ACCESS_KEY_ID: z.string().default(''),
  R2_SECRET_ACCESS_KEY: z.string().default(''),
  FFMPEG_PATH: z.string().default('ffmpeg'),
  FFPROBE_PATH: z.string().default('ffprobe'),
}).superRefine((environment, context) => {
  if (environment.R2_ENDPOINT && new URL(environment.R2_ENDPOINT).protocol !== 'https:') {
    context.addIssue({ code: 'custom', path: ['R2_ENDPOINT'], message: 'R2 endpoints must use HTTPS.' });
  }
  if (environment.NODE_ENV === 'production') {
    if (!secureOrigin(environment.WEB_ORIGIN)) context.addIssue({ code: 'custom', path: ['WEB_ORIGIN'], message: 'Production web origins must use HTTPS.' });
    if (!environment.R2_ENDPOINT || !environment.R2_BUCKET || !environment.R2_ACCESS_KEY_ID || !environment.R2_SECRET_ACCESS_KEY) {
      context.addIssue({ code: 'custom', path: ['R2_ENDPOINT'], message: 'Production requires a private R2 bucket and credentials.' });
    }
  }
});

export const webEnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('http://localhost:4000/api/v1'),
});

export function parseApiEnv(environment: NodeJS.ProcessEnv) {
  return apiEnvSchema.parse(environment);
}

export function parseWorkerEnv(environment: NodeJS.ProcessEnv) {
  return workerEnvSchema.parse(environment);
}

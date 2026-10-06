import dotenv from 'dotenv';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { parseApiEnv } from '@centaur/lms-config';

async function bootstrap() {
  dotenv.config({ path: '../../.env' });
  const environment = parseApiEnv(process.env);
  const { AppModule } = await import('./app.module.js');
  const app = await NestFactory.create(AppModule, { bufferLogs: true, bodyParser: false });
  app.useLogger(app.get(Logger));
  const r2Origin = environment.R2_ENDPOINT ? new URL(environment.R2_ENDPOINT).origin : null;
  const r2Sources = r2Origin ? [r2Origin] : [];
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        connectSrc: ["'self'", ...r2Sources],
        imgSrc: ["'self'", 'data:', ...r2Sources],
        mediaSrc: ["'self'", 'blob:', ...r2Sources],
        workerSrc: ["'self'", 'blob:'],
      },
    },
  }));
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: false, limit: '1mb' }));
  app.use(cookieParser());
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.disable('x-powered-by');
  expressApp.set('trust proxy', environment.TRUST_PROXY_HOPS);
  app.use((_request: unknown, response: { setHeader(name: string, value: string): void }, next: () => void) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.enableCors({
    origin: environment.WEB_ORIGIN,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 600,
  });
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  await app.listen(environment.API_PORT, '0.0.0.0');
}

void bootstrap();

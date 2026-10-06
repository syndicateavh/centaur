import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { parseApiEnv } from '@centaur/lms-config';
import { InfrastructureModule } from './infrastructure.module.js';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';
import { AuthModule } from './auth/auth.module.js';
import { ApiExceptionFilter } from './auth/api-exception.filter.js';
import { CsrfGuard } from './auth/csrf.guard.js';
import { CoursesModule } from './courses/courses.module.js';
import { LearnerModule } from './learner/learner.module.js';
import { MediaModule } from './media/media.module.js';
import { QuizzesModule } from './quizzes/quizzes.module.js';
import { CertificatesModule } from './certificates/certificates.module.js';
import { AdminModule } from './admin/admin.module.js';

const environment = parseApiEnv(process.env);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: (config) => parseApiEnv(config) }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: environment.LOG_LEVEL,
        serializers: {
          req: (request) => ({
            id: request.id,
            method: request.method,
            url: typeof request.url === 'string' ? request.url.split('?')[0] : undefined,
            remoteAddress: request.remoteAddress,
          }),
          res: (response) => ({ statusCode: response.statusCode }),
        },
        redact: {
          paths: ['req.headers.cookie', 'req.headers.authorization', 'req.headers.x-csrf-token'],
          censor: '[REDACTED]',
        },
        genReqId: (request, response) => {
          const providedId = request.headers['x-request-id'];
          const requestId = typeof providedId === 'string' && /^[a-zA-Z0-9-]{8,64}$/.test(providedId)
            ? providedId
            : crypto.randomUUID();
          response.setHeader('x-request-id', requestId);
          return requestId;
        },
      },
    }),
    InfrastructureModule,
    AuthModule,
    CoursesModule,
    LearnerModule,
    MediaModule,
    QuizzesModule,
    CertificatesModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [
    HealthService,
    { provide: APP_GUARD, useFactory: () => new CsrfGuard(environment.WEB_ORIGIN) },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule {}

import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { RequirePermissions, PermissionsGuard } from '../auth/authorization.js';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { ZodValidationPipe } from '../auth/zod-validation.pipe.js';
import { AdminAnalyticsService } from './admin-analytics.service.js';

const pageSchema = z.object({ page: z.coerce.number().int().min(1).max(100_000).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(25) });
const studentQuerySchema = pageSchema.extend({ q: z.string().trim().max(160).optional(), activity: z.enum(['active', 'inactive']).optional() });
const enrollmentQuerySchema = pageSchema.extend({ q: z.string().trim().max(160).optional(), courseId: z.string().uuid().optional(), status: z.enum(['active', 'completed']).optional(), sort: z.enum(['enrolled', 'activity']).optional() });
const createEnrollmentSchema = z.object({ email: z.string().trim().email().max(254), courseId: z.string().uuid() });
const courseQuerySchema = pageSchema.extend({ q: z.string().trim().max(160).optional(), status: z.enum(['draft', 'published', 'archived']).optional() });
const auditQuerySchema = pageSchema.extend({ q: z.string().trim().max(160).optional(), action: z.enum(['issued', 'revoked', 'generation_failed']).optional() });

@Controller('admin')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@RequirePermissions('admin:dashboard:view')
export class AdminAnalyticsController {
  constructor(@Inject(AdminAnalyticsService) private readonly analytics: AdminAnalyticsService) {}

  @Get('analytics/overview')
  overview() { return this.analytics.overview(); }

  @Get('analytics/activity')
  activity() { return this.analytics.recentActivity(); }

  @Get('analytics/students')
  @RequirePermissions('admin:courses:manage')
  students(@Query(new ZodValidationPipe(studentQuerySchema)) query: z.infer<typeof studentQuerySchema>) {
    return this.analytics.listStudents(query);
  }

  @Get('analytics/students/:userId')
  @RequirePermissions('admin:courses:manage')
  studentDetail(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query(new ZodValidationPipe(pageSchema)) query: z.infer<typeof pageSchema>,
  ) { return this.analytics.studentDetail(userId, query); }

  @Get('enrollments')
  @RequirePermissions('admin:courses:manage')
  enrollments(@Query(new ZodValidationPipe(enrollmentQuerySchema)) query: z.infer<typeof enrollmentQuerySchema>) {
    return this.analytics.listEnrollments(query);
  }

  @Post('enrollments')
  @RequirePermissions('admin:courses:manage')
  createEnrollment(@Body(new ZodValidationPipe(createEnrollmentSchema)) body: z.infer<typeof createEnrollmentSchema>) {
    return this.analytics.createEnrollment(body);
  }

  @Get('analytics/courses')
  @RequirePermissions('admin:courses:manage')
  courses(@Query(new ZodValidationPipe(courseQuerySchema)) query: z.infer<typeof courseQuerySchema>) {
    return this.analytics.listCourses(query);
  }

  @Get('analytics/courses/:courseId')
  @RequirePermissions('admin:courses:manage')
  courseDetail(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Query(new ZodValidationPipe(pageSchema)) query: z.infer<typeof pageSchema>,
  ) { return this.analytics.courseDetail(courseId, query); }

  @Get('audit/certificates')
  @RequirePermissions('admin:courses:manage')
  audit(@Query(new ZodValidationPipe(auditQuerySchema)) query: z.infer<typeof auditQuerySchema>) {
    return this.analytics.listCertificateAudit(query);
  }
}

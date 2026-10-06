import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { PermissionsGuard, RequirePermissions } from '../auth/authorization.js';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { LearnerCoursesService } from './learner-courses.service.js';
import { LearnerProgressService } from './learner-progress.service.js';
import { ZodValidationPipe } from '../auth/zod-validation.pipe.js';

const videoProgressSchema = z.object({
  fromPositionSeconds: z.number().finite().min(0).max(86_400),
  positionSeconds: z.number().finite().min(0).max(86_400),
});

@Controller('learner/courses')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@RequirePermissions('learner:dashboard:view')
export class LearnerCoursesController {
  constructor(
    @Inject(LearnerCoursesService) private readonly courses: LearnerCoursesService,
    @Inject(LearnerProgressService) private readonly progress: LearnerProgressService,
  ) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.courses.listMyCourses(request.authUserId!);
  }

  @Post(':courseId/enrollment')
  enroll(@Req() request: AuthenticatedRequest, @Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.courses.enroll(request.authUserId!, courseId);
  }

  @Get(':courseId')
  getCourse(@Req() request: AuthenticatedRequest, @Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.courses.getEnrolledCourse(request.authUserId!, courseId);
  }

  @Get(':courseId/lessons/:lessonId')
  openLesson(
    @Req() request: AuthenticatedRequest,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
  ) {
    return this.courses.openLesson(request.authUserId!, courseId, lessonId);
  }

  @Get(':courseId/progress')
  getCourseProgress(@Req() request: AuthenticatedRequest, @Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.progress.listCourseProgress(request.authUserId!, courseId);
  }

  @Get(':courseId/lessons/:lessonId/progress')
  getLessonProgress(
    @Req() request: AuthenticatedRequest,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
  ) {
    return this.progress.getProgress(request.authUserId!, courseId, lessonId);
  }

  @Post(':courseId/lessons/:lessonId/progress/video')
  recordVideoPosition(
    @Req() request: AuthenticatedRequest,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body(new ZodValidationPipe(videoProgressSchema)) body: z.infer<typeof videoProgressSchema>,
  ) {
    return this.progress.recordVideoPosition(request.authUserId!, courseId, lessonId, body.fromPositionSeconds, body.positionSeconds);
  }

  @Post(':courseId/lessons/:lessonId/progress/complete')
  markLessonComplete(
    @Req() request: AuthenticatedRequest,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
  ) {
    return this.progress.markManualComplete(request.authUserId!, courseId, lessonId);
  }
}

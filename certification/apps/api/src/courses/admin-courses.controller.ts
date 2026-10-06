import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { RequirePermissions, PermissionsGuard } from '../auth/authorization.js';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { ZodValidationPipe } from '../auth/zod-validation.pipe.js';
import {
  courseStatusSchema,
  createCourseSchema,
  lessonInputSchema,
  moduleInputSchema,
  reorderSchema,
  updateCourseSchema,
  type CourseStatusInput,
  type CreateCourseInput,
  type LessonInput,
  type ModuleInput,
  type UpdateCourseInput,
} from './course.schemas.js';
import { CoursesService } from './courses.service.js';

const courseListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  q: z.string().trim().max(160).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

@Controller('admin/courses')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@RequirePermissions('admin:courses:manage')
export class AdminCoursesController {
  constructor(@Inject(CoursesService) private readonly courses: CoursesService) {}

  @Get()
  list(@Query(new ZodValidationPipe(courseListQuerySchema)) query: z.infer<typeof courseListQuerySchema>) {
    return this.courses.listAdminCourses(query);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createCourseSchema)) input: CreateCourseInput, @Req() request: AuthenticatedRequest) {
    return this.courses.createCourse(input, request.authUserId!);
  }

  @Get(':courseId')
  get(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.courses.getAdminCourse(courseId);
  }

  @Patch(':courseId')
  update(@Param('courseId', ParseUUIDPipe) courseId: string, @Body(new ZodValidationPipe(updateCourseSchema)) input: UpdateCourseInput) {
    return this.courses.updateCourse(courseId, input);
  }

  @Patch(':courseId/status')
  changeStatus(@Param('courseId', ParseUUIDPipe) courseId: string, @Body(new ZodValidationPipe(courseStatusSchema)) input: CourseStatusInput) {
    return this.courses.changeStatus(courseId, input.status);
  }

  @Delete(':courseId')
  delete(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.courses.deleteDraftCourse(courseId);
  }

  @Post(':courseId/modules')
  createModule(@Param('courseId', ParseUUIDPipe) courseId: string, @Body(new ZodValidationPipe(moduleInputSchema)) input: ModuleInput) {
    return this.courses.createModule(courseId, input);
  }

  @Put(':courseId/modules/order')
  reorderModules(@Param('courseId', ParseUUIDPipe) courseId: string, @Body(new ZodValidationPipe(reorderSchema)) input: { ids: string[] }) {
    return this.courses.reorderModules(courseId, input.ids);
  }

  @Patch(':courseId/modules/:moduleId')
  updateModule(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Body(new ZodValidationPipe(moduleInputSchema)) input: ModuleInput,
  ) {
    return this.courses.updateModule(courseId, moduleId, input);
  }

  @Delete(':courseId/modules/:moduleId')
  deleteModule(@Param('courseId', ParseUUIDPipe) courseId: string, @Param('moduleId', ParseUUIDPipe) moduleId: string) {
    return this.courses.deleteModule(courseId, moduleId);
  }

  @Post(':courseId/modules/:moduleId/lessons')
  createLesson(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Body(new ZodValidationPipe(lessonInputSchema)) input: LessonInput,
  ) {
    return this.courses.createLesson(courseId, moduleId, input);
  }

  @Put(':courseId/modules/:moduleId/lessons/order')
  reorderLessons(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Body(new ZodValidationPipe(reorderSchema)) input: { ids: string[] },
  ) {
    return this.courses.reorderLessons(courseId, moduleId, input.ids);
  }

  @Patch(':courseId/modules/:moduleId/lessons/:lessonId')
  updateLesson(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body(new ZodValidationPipe(lessonInputSchema)) input: LessonInput,
  ) {
    return this.courses.updateLesson(courseId, moduleId, lessonId, input);
  }

  @Delete(':courseId/modules/:moduleId/lessons/:lessonId')
  deleteLesson(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
  ) {
    return this.courses.deleteLesson(courseId, moduleId, lessonId);
  }
}

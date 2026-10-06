import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ZodValidationPipe } from '../auth/zod-validation.pipe.js';
import { courseSlugSchema } from './course.schemas.js';
import { CoursesService } from './courses.service.js';

@Controller('courses')
export class PublicCoursesController {
  constructor(@Inject(CoursesService) private readonly courses: CoursesService) {}

  @Get()
  list() {
    return this.courses.listPublishedCourses();
  }

  @Get(':slug')
  get(@Param('slug', new ZodValidationPipe(courseSlugSchema)) slug: string) {
    return this.courses.getPublishedCourse(slug);
  }
}

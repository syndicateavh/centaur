import { Module } from '@nestjs/common';
import { AdminCoursesController } from './admin-courses.controller.js';
import { PublicCoursesController } from './public-courses.controller.js';
import { CoursesService } from './courses.service.js';

@Module({
  controllers: [AdminCoursesController, PublicCoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AdminCoursesController } from './admin-courses.controller.js';
import { PublicCoursesController } from './public-courses.controller.js';
import { CoursesService } from './courses.service.js';

@Module({
  imports: [AuthModule],
  controllers: [AdminCoursesController, PublicCoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}

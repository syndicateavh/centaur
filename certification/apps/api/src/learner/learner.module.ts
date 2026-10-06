import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { LearnerCoursesController } from './learner-courses.controller.js';
import { LearnerProfileController } from './learner-profile.controller.js';
import { LearnerCoursesService } from './learner-courses.service.js';
import { LearnerProgressService } from './learner-progress.service.js';
import { CourseCompletionService } from './course-completion.service.js';
import { CertificateQueueService } from '../certificates/certificate-queue.service.js';

@Module({
  imports: [AuthModule],
  controllers: [LearnerCoursesController, LearnerProfileController],
  providers: [LearnerCoursesService, LearnerProgressService, CourseCompletionService, CertificateQueueService],
  exports: [LearnerProgressService, CourseCompletionService, CertificateQueueService],
})
export class LearnerModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { LearnerModule } from '../learner/learner.module.js';
import { AdminQuizController } from './quiz.controller.js';
import { LearnerQuizController } from './learner-quiz.controller.js';
import { QuizService } from './quiz.service.js';

@Module({
  imports: [AuthModule, LearnerModule],
  controllers: [AdminQuizController, LearnerQuizController],
  providers: [QuizService],
})
export class QuizzesModule {}

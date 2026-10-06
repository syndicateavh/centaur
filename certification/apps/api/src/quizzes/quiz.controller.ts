import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Put, UseGuards } from '@nestjs/common';
import { RequirePermissions, PermissionsGuard } from '../auth/authorization.js';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { ZodValidationPipe } from '../auth/zod-validation.pipe.js';
import { saveQuizSchema, type SaveQuizInput } from './quiz.schemas.js';
import { QuizService } from './quiz.service.js';

@Controller('admin/courses/:courseId/quiz')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@RequirePermissions('admin:courses:manage')
export class AdminQuizController {
  constructor(@Inject(QuizService) private readonly quizzes: QuizService) {}

  @Get()
  get(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.quizzes.getAdminQuiz(courseId);
  }

  @Put()
  save(@Param('courseId', ParseUUIDPipe) courseId: string, @Body(new ZodValidationPipe(saveQuizSchema)) input: SaveQuizInput) {
    return this.quizzes.saveAdminQuiz(courseId, input);
  }
}

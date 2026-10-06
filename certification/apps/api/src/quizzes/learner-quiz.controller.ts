import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { RequirePermissions, PermissionsGuard } from '../auth/authorization.js';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { ZodValidationPipe } from '../auth/zod-validation.pipe.js';
import { submitQuizSchema, type SubmitQuizInput } from './quiz.schemas.js';
import { QuizService } from './quiz.service.js';

@Controller('learner/courses/:courseId/quiz')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@RequirePermissions('learner:dashboard:view')
export class LearnerQuizController {
  constructor(@Inject(QuizService) private readonly quizzes: QuizService) {}

  @Get()
  get(@Req() request: AuthenticatedRequest, @Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.quizzes.getLearnerQuiz(request.authUserId!, courseId);
  }

  @Post('attempts')
  submit(
    @Req() request: AuthenticatedRequest,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body(new ZodValidationPipe(submitQuizSchema)) input: SubmitQuizInput,
  ) {
    return this.quizzes.submitLearnerQuiz(request.authUserId!, courseId, input);
  }
}

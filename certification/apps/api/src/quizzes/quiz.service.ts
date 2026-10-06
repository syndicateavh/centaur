import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import type { createDatabase } from '@centaur/lms-database';
import { courses, enrollments, quizAttemptAnswers, quizAttempts, quizOptions, quizQuestions, quizzes } from '@centaur/lms-database';
import { DATABASE_CLIENT } from '../tokens.js';
import { LearnerProgressService } from '../learner/learner-progress.service.js';
import type { SaveQuizInput, SubmitQuizInput } from './quiz.schemas.js';

type Database = ReturnType<typeof createDatabase>;
type QuizExecutor = Database['db'];
type QuizTransaction = Parameters<Parameters<QuizExecutor['transaction']>[0]>[0];

@Injectable()
export class QuizService {
  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: Database,
    @Inject(LearnerProgressService) private readonly progress: LearnerProgressService,
  ) {}

  async getAdminQuiz(courseId: string) {
    const [course] = await this.database.db.select({ id: courses.id, quizEnabled: courses.quizEnabled })
      .from(courses).where(eq(courses.id, courseId)).limit(1);
    if (!course) throw this.courseNotFound();
    const [quiz] = await this.database.db.select().from(quizzes).where(eq(quizzes.courseId, courseId)).limit(1);
    if (!quiz) return { enabled: course.quizEnabled, quiz: null, editingLocked: false };
    const [attempt] = await this.database.db.select({ id: quizAttempts.id }).from(quizAttempts)
      .where(eq(quizAttempts.quizId, quiz.id)).limit(1);
    const questionRows = await this.database.db.select().from(quizQuestions)
      .where(eq(quizQuestions.quizId, quiz.id)).orderBy(asc(quizQuestions.sortOrder));
    const questions = await Promise.all(questionRows.map(async (question) => ({
      ...question,
      options: await this.database.db.select().from(quizOptions)
        .where(eq(quizOptions.questionId, question.id)).orderBy(asc(quizOptions.sortOrder)),
    })));
    return { enabled: course.quizEnabled, quiz: { ...quiz, questions }, editingLocked: Boolean(attempt) };
  }

  async saveAdminQuiz(courseId: string, input: SaveQuizInput) {
    this.validateQuiz(input);
    await this.database.db.transaction(async (transaction) => {
      const course = await this.lockDraftCourse(transaction, courseId);
      if (!course.quizEnabled) {
        throw new BadRequestException({ code: 'QUIZ_DISABLED', message: 'Enable the quiz in course settings before creating it.' });
      }
      const [existing] = await transaction.select().from(quizzes).where(eq(quizzes.courseId, courseId)).limit(1);
      if (existing) {
        const [attempt] = await transaction.select({ id: quizAttempts.id }).from(quizAttempts)
          .where(eq(quizAttempts.quizId, existing.id)).limit(1);
        if (attempt) {
          throw new ConflictException({ code: 'QUIZ_LOCKED_AFTER_ATTEMPTS', message: 'Quiz questions are locked after the first learner attempt to preserve score history.' });
        }
        await transaction.delete(quizzes).where(eq(quizzes.id, existing.id));
      }
      const [quiz] = await transaction.insert(quizzes).values({
        courseId,
        title: input.title,
        description: input.description?.trim() || null,
      }).returning({ id: quizzes.id });
      if (!quiz) throw new Error('Quiz could not be created.');
      for (const [sortOrder, questionInput] of input.questions.entries()) {
        const [question] = await transaction.insert(quizQuestions).values({
          quizId: quiz.id,
          prompt: questionInput.prompt,
          type: questionInput.type,
          points: questionInput.points,
          sortOrder,
        }).returning({ id: quizQuestions.id });
        if (!question) throw new Error('Quiz question could not be created.');
        await transaction.insert(quizOptions).values(questionInput.options.map((option, optionOrder) => ({
          questionId: question.id,
          label: option.label,
          isCorrect: option.isCorrect,
          sortOrder: optionOrder,
        })));
      }
    });
    return this.getAdminQuiz(courseId);
  }

  async getLearnerQuiz(userId: string, courseId: string) {
    const { quiz, passPercent } = await this.requireLearnerQuiz(userId, courseId);
    const questionRows = await this.database.db.select({
      id: quizQuestions.id,
      prompt: quizQuestions.prompt,
      type: quizQuestions.type,
      points: quizQuestions.points,
      sortOrder: quizQuestions.sortOrder,
    }).from(quizQuestions).where(eq(quizQuestions.quizId, quiz.id)).orderBy(asc(quizQuestions.sortOrder));
    if (questionRows.length === 0) {
      throw new NotFoundException({ code: 'QUIZ_NOT_READY', message: 'The course quiz has not been configured yet.' });
    }
    const questions = await Promise.all(questionRows.map(async (question) => ({
      ...question,
      // The answer key is deliberately excluded from this learner query.
      options: await this.database.db.select({ id: quizOptions.id, label: quizOptions.label, sortOrder: quizOptions.sortOrder })
        .from(quizOptions).where(eq(quizOptions.questionId, question.id)).orderBy(asc(quizOptions.sortOrder)),
    })));
    const attempts = await this.database.db.select({
      id: quizAttempts.id,
      scorePercent: quizAttempts.scorePercent,
      passed: quizAttempts.passed,
      submittedAt: quizAttempts.submittedAt,
    }).from(quizAttempts).where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.courseId, courseId)))
      .orderBy(desc(quizAttempts.submittedAt)).limit(20);
    const [passedAttempt] = await this.database.db.select({ id: quizAttempts.id }).from(quizAttempts)
      .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.courseId, courseId), eq(quizAttempts.passed, true))).limit(1);
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      passPercent,
      questions,
      attempts,
      hasPassed: Boolean(passedAttempt),
      attemptPolicy: 'unlimited',
    };
  }

  async submitLearnerQuiz(userId: string, courseId: string, input: SubmitQuizInput) {
    const result = await this.database.db.transaction(async (transaction) => {
      const [course] = await transaction.select({
        id: courses.id,
        status: courses.status,
        quizEnabled: courses.quizEnabled,
        quizPassPercent: courses.quizPassPercent,
      }).from(courses).where(eq(courses.id, courseId)).for('update').limit(1);
      if (!course || course.status !== 'published') throw this.courseNotFound();
      const [enrollment] = await transaction.select({ id: enrollments.id }).from(enrollments)
        .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))).limit(1);
      if (!enrollment) throw new ForbiddenException({ code: 'COURSE_ENROLLMENT_REQUIRED', message: 'Enroll in this course before attempting its quiz.' });
      if (!course.quizEnabled) throw new NotFoundException({ code: 'QUIZ_NOT_FOUND', message: 'This course has no available quiz.' });
      const [quiz] = await transaction.select().from(quizzes).where(eq(quizzes.courseId, courseId)).limit(1);
      if (!quiz) throw new NotFoundException({ code: 'QUIZ_NOT_READY', message: 'The course quiz has not been configured yet.' });

      const questions = await transaction.select().from(quizQuestions).where(eq(quizQuestions.quizId, quiz.id))
        .orderBy(asc(quizQuestions.sortOrder));
      if (questions.length === 0) throw new NotFoundException({ code: 'QUIZ_NOT_READY', message: 'The course quiz has no questions yet.' });
      const questionIds = questions.map((question) => question.id);
      const options = await transaction.select().from(quizOptions).where(inArray(quizOptions.questionId, questionIds))
        .orderBy(asc(quizOptions.sortOrder));
      const submittedQuestionIds = input.answers.map((answer) => answer.questionId);
      if (new Set(submittedQuestionIds).size !== submittedQuestionIds.length || submittedQuestionIds.length !== questions.length
        || questions.some((question) => !submittedQuestionIds.includes(question.id))) {
        throw new BadRequestException({ code: 'QUIZ_ANSWERS_INVALID', message: 'Submit exactly one answer for every quiz question.' });
      }

      const answers = input.answers.map((answer) => {
        const question = questions.find((item) => item.id === answer.questionId)!;
        const questionOptions = options.filter((option) => option.questionId === question.id);
        const selected = [...new Set(answer.optionIds)];
        if (selected.length !== answer.optionIds.length || selected.some((optionId) => !questionOptions.some((option) => option.id === optionId))) {
          throw new BadRequestException({ code: 'QUIZ_OPTIONS_INVALID', message: 'One or more selected answers do not belong to their question.' });
        }
        if (selected.length !== 1 && question.type !== 'multiple_choice') {
          throw new BadRequestException({ code: 'QUIZ_SELECTION_INVALID', message: 'Select exactly one answer for this question.' });
        }
        const correctIds = questionOptions.filter((option) => option.isCorrect).map((option) => option.id).sort();
        const selectedIds = selected.sort();
        const isCorrect = correctIds.length > 0 && correctIds.length === selectedIds.length
          && correctIds.every((optionId, index) => optionId === selectedIds[index]);
        return { question, selectedIds, correctIds, isCorrect };
      });
      const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);
      const earnedPoints = answers.reduce((sum, answer) => sum + (answer.isCorrect ? answer.question.points : 0), 0);
      const scorePercent = Math.round(earnedPoints * 100 / totalPoints);
      const passed = earnedPoints * 100 >= totalPoints * course.quizPassPercent;
      const [attempt] = await transaction.insert(quizAttempts).values({
        userId, courseId, quizId: quiz.id, earnedPoints, totalPoints, scorePercent, passed,
      }).returning({ id: quizAttempts.id, submittedAt: quizAttempts.submittedAt });
      if (!attempt) throw new Error('Quiz attempt could not be saved.');
      await transaction.insert(quizAttemptAnswers).values(answers.flatMap((answer) => answer.selectedIds.map((optionId) => ({
        attemptId: attempt.id,
        questionId: answer.question.id,
        optionId,
      }))));
      return {
        attempt: { ...attempt, earnedPoints, totalPoints, scorePercent, passed, passPercent: course.quizPassPercent },
        answers: answers.map((answer) => ({ questionId: answer.question.id, isCorrect: answer.isCorrect, selectedOptionIds: answer.selectedIds, correctOptionIds: answer.correctIds })),
      };
    });
    if (result.attempt.passed) await this.progress.refreshCourseCompletion(userId, courseId);
    return result;
  }

  private async requireLearnerQuiz(userId: string, courseId: string) {
    const [course] = await this.database.db.select({
      id: courses.id,
      status: courses.status,
      quizEnabled: courses.quizEnabled,
      passPercent: courses.quizPassPercent,
    }).from(courses).where(eq(courses.id, courseId)).limit(1);
    if (!course || course.status !== 'published' || !course.quizEnabled) {
      throw new NotFoundException({ code: 'QUIZ_UNAVAILABLE', message: 'This course has no available quiz.' });
    }
    const [enrollment] = await this.database.db.select({ id: enrollments.id }).from(enrollments)
      .where(and(eq(enrollments.courseId, courseId), eq(enrollments.userId, userId))).limit(1);
    if (!enrollment) throw new ForbiddenException({ code: 'COURSE_ENROLLMENT_REQUIRED', message: 'Enroll in this course before accessing its quiz.' });
    const [quiz] = await this.database.db.select({ id: quizzes.id, title: quizzes.title, description: quizzes.description })
      .from(quizzes).where(eq(quizzes.courseId, courseId)).limit(1);
    if (!quiz) throw new NotFoundException({ code: 'QUIZ_NOT_READY', message: 'The course quiz has not been configured yet.' });
    return { quiz, passPercent: course.passPercent };
  }

  private validateQuiz(input: SaveQuizInput) {
    for (const question of input.questions) {
      const labels = question.options.map((option) => option.label.trim().toLocaleLowerCase());
      if (new Set(labels).size !== labels.length) {
        throw new BadRequestException({ code: 'QUIZ_OPTION_LABELS_DUPLICATE', message: 'Question options must have unique labels.' });
      }
      const correctCount = question.options.filter((option) => option.isCorrect).length;
      if (question.type === 'single_choice' && correctCount !== 1) {
        throw new BadRequestException({ code: 'QUIZ_CORRECT_ANSWER_INVALID', message: 'Single choice questions need exactly one correct option.' });
      }
      if (question.type === 'multiple_choice' && correctCount < 1) {
        throw new BadRequestException({ code: 'QUIZ_CORRECT_ANSWER_INVALID', message: 'Multiple choice questions need at least one correct option.' });
      }
      if (question.type === 'true_false' && (question.options.length !== 2 || correctCount !== 1
        || new Set(labels).size !== 2 || !labels.includes('true') || !labels.includes('false'))) {
        throw new BadRequestException({ code: 'QUIZ_TRUE_FALSE_INVALID', message: 'True/false questions must have True and False options with exactly one correct answer.' });
      }
    }
  }

  private async lockDraftCourse(transaction: QuizTransaction, courseId: string) {
    const [course] = await transaction.select({ id: courses.id, status: courses.status, quizEnabled: courses.quizEnabled })
      .from(courses).where(eq(courses.id, courseId)).for('update').limit(1);
    if (!course) throw this.courseNotFound();
    if (course.status !== 'draft') {
      throw new BadRequestException({ code: 'COURSE_MUST_BE_DRAFT', message: 'Unpublish the course before editing its quiz.' });
    }
    return course;
  }

  private courseNotFound() {
    return new NotFoundException({ code: 'COURSE_NOT_FOUND', message: 'Course not found.' });
  }
}

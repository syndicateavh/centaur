import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import type { createDatabase } from '@centaur/lms-database';
import { courseModules, courses, enrollments, lessonProgress, lessons } from '@centaur/lms-database';
import { DATABASE_CLIENT } from '../tokens.js';
import { LearnerProgressService } from './learner-progress.service.js';

type Database = ReturnType<typeof createDatabase>;

@Injectable()
export class LearnerCoursesService {
  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: Database,
    @Inject(LearnerProgressService) private readonly progress: LearnerProgressService,
  ) {}

  async enroll(userId: string, courseId: string) {
    const [course] = await this.database.db.select({ id: courses.id }).from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.status, 'published')))
      .limit(1);
    if (!course) throw this.courseUnavailable();

    await this.database.db.insert(enrollments).values({ userId, courseId })
      .onConflictDoNothing({ target: [enrollments.userId, enrollments.courseId] });
    const [enrollment] = await this.database.db.select().from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
      .limit(1);
    if (!enrollment) throw new Error('Enrollment could not be created.');
    const progress = await this.progress.listCourseProgress(userId, courseId);
    if (progress.isCompleted || enrollment.completedAt) await this.progress.refreshCourseCompletion(userId, courseId);
    const [updatedEnrollment] = await this.database.db.select().from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))).limit(1);
    return { enrollment: updatedEnrollment ?? enrollment };
  }

  async listMyCourses(userId: string) {
    const rows = await this.database.db.select({
      enrollmentId: enrollments.id,
      enrolledAt: enrollments.enrolledAt,
      lastAccessedLessonId: enrollments.lastAccessedLessonId,
      lastAccessedAt: enrollments.lastAccessedAt,
      completedAt: enrollments.completedAt,
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      description: courses.description,
      certificateEnabled: courses.certificateEnabled,
      quizEnabled: courses.quizEnabled,
      quizRequired: courses.quizRequired,
    }).from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(and(eq(enrollments.userId, userId), eq(courses.status, 'published')))
      .orderBy(asc(enrollments.enrolledAt));

    return Promise.all(rows.map(async (row) => {
      const progress = await this.progress.listCourseProgress(userId, row.id);
      if (progress.isCompleted || row.completedAt) await this.progress.refreshCourseCompletion(userId, row.id);
      return {
        ...row,
        completedAt: progress.isCompleted ? row.completedAt ?? new Date() : null,
        continueLessonId: await this.continueLessonId(row.id, row.lastAccessedLessonId),
        lessonCount: progress.lessonCount,
        requiredLessonCount: progress.requiredLessonCount,
        completedRequiredLessonCount: progress.completedRequiredLessonCount,
        progressPercent: progress.progressPercent,
        isCompleted: progress.isCompleted,
        completionBlockedByQuiz: progress.completionBlockedByQuiz,
      };
    }));
  }

  async getEnrolledCourse(userId: string, courseId: string) {
    const course = await this.requireEnrolledCourse(userId, courseId);
    const modules = await this.database.db.select({
      id: courseModules.id,
      title: courseModules.title,
      description: courseModules.description,
      sortOrder: courseModules.sortOrder,
    }).from(courseModules).where(eq(courseModules.courseId, courseId)).orderBy(asc(courseModules.sortOrder));
    const outline = await Promise.all(modules.map(async (module) => ({
      ...module,
      lessons: await this.database.db.select({
        id: lessons.id,
        title: lessons.title,
        description: lessons.description,
        type: lessons.type,
        required: lessons.required,
        sortOrder: lessons.sortOrder,
        progressStatus: lessonProgress.status,
        lastPositionSeconds: lessonProgress.lastPositionSeconds,
        completedAt: lessonProgress.completedAt,
      }).from(lessons)
        .leftJoin(lessonProgress, and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.userId, userId)))
        .where(eq(lessons.moduleId, module.id)).orderBy(asc(lessons.sortOrder)),
    })));
    const firstLessonId = outline.flatMap((module) => module.lessons)[0]?.id ?? null;
    const continueLessonId = await this.continueLessonId(courseId, course.lastAccessedLessonId) ?? firstLessonId;

    const progressSummary = await this.progress.listCourseProgress(userId, courseId);
    if (progressSummary.isCompleted || course.completedAt) await this.progress.refreshCourseCompletion(userId, courseId);
    const [completionState] = await this.database.db.select({ completedAt: enrollments.completedAt }).from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))).limit(1);
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      certificateEnabled: course.certificateEnabled,
      quizEnabled: course.quizEnabled,
      quizRequired: course.quizRequired,
      enrolledAt: course.enrolledAt,
      ...progressSummary,
      completedAt: progressSummary.isCompleted ? completionState?.completedAt ?? course.completedAt ?? new Date() : null,
      lastAccessedAt: course.lastAccessedAt,
      currentLessonId: continueLessonId,
      modules: outline,
    };
  }

  async openLesson(userId: string, courseId: string, lessonId: string) {
    await this.requireEnrolledCourse(userId, courseId);
    const [lesson] = await this.database.db.select({
      id: lessons.id,
      moduleId: lessons.moduleId,
      title: lessons.title,
      description: lessons.description,
      type: lessons.type,
      content: lessons.content,
      required: lessons.required,
      sortOrder: lessons.sortOrder,
      moduleTitle: courseModules.title,
      courseId: courseModules.courseId,
      courseTitle: courses.title,
      courseSlug: courses.slug,
    }).from(lessons)
      .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
      .innerJoin(courses, eq(courseModules.courseId, courses.id))
      .where(and(
        eq(lessons.id, lessonId),
        eq(courses.id, courseId),
        eq(courses.status, 'published'),
      )).limit(1);
    if (!lesson) throw new NotFoundException({ code: 'LESSON_NOT_FOUND', message: 'Lesson not found in this course.' });

    const accessedAt = new Date();
    await this.database.db.update(enrollments).set({
      lastAccessedLessonId: lessonId,
      lastAccessedAt: accessedAt,
    }).where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));

    await this.progress.recordOpened(userId, courseId, lessonId);
    const progress = await this.progress.completeTextOnOpen(userId, courseId, lessonId);

    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      type: lesson.type,
      content: lesson.type === 'TEXT' ? lesson.content : null,
      required: lesson.required,
      sortOrder: lesson.sortOrder,
      moduleId: lesson.moduleId,
      moduleTitle: lesson.moduleTitle,
      courseId: lesson.courseId,
      courseTitle: lesson.courseTitle,
      courseSlug: lesson.courseSlug,
      accessedAt,
      progress,
    };
  }

  private async requireEnrolledCourse(userId: string, courseId: string) {
    const [row] = await this.database.db.select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      description: courses.description,
      certificateEnabled: courses.certificateEnabled,
      quizEnabled: courses.quizEnabled,
      quizRequired: courses.quizRequired,
      videoCompletionPercent: courses.videoCompletionPercent,
      textCompletionMode: courses.textCompletionMode,
      enrolledAt: enrollments.enrolledAt,
      completedAt: enrollments.completedAt,
      lastAccessedLessonId: enrollments.lastAccessedLessonId,
      lastAccessedAt: enrollments.lastAccessedAt,
    }).from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId),
        eq(courses.status, 'published'),
      )).limit(1);
    if (!row) throw this.enrollmentRequired();
    return row;
  }

  private async continueLessonId(courseId: string, lastAccessedLessonId: string | null) {
    if (lastAccessedLessonId) {
      const [lastLesson] = await this.database.db.select({ id: lessons.id }).from(lessons)
        .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
        .where(and(
          eq(lessons.id, lastAccessedLessonId),
          eq(courseModules.courseId, courseId),
        )).limit(1);
      if (lastLesson) return lastLesson.id;
    }
    const [firstLesson] = await this.database.db.select({ id: lessons.id }).from(lessons)
      .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
      .where(eq(courseModules.courseId, courseId))
      .orderBy(asc(courseModules.sortOrder), asc(lessons.sortOrder))
      .limit(1);
    return firstLesson?.id ?? null;
  }

  private async lessonCount(courseId: string) {
    const rows = await this.database.db.select({ id: lessons.id }).from(lessons)
      .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
      .where(eq(courseModules.courseId, courseId));
    return rows.length;
  }

  private enrollmentRequired() {
    return new ForbiddenException({ code: 'COURSE_ENROLLMENT_REQUIRED', message: 'Enroll in this published course to access its lessons.' });
  }

  private courseUnavailable() {
    return new NotFoundException({ code: 'COURSE_NOT_FOUND', message: 'Published course not found.' });
  }
}

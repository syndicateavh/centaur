import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import type { createDatabase } from '@centaur/lms-database';
import { courseModules, courses, enrollments, lessonProgress, lessons, mediaAssets, quizAttempts } from '@centaur/lms-database';
import { DATABASE_CLIENT } from '../tokens.js';
import { CourseCompletionService } from './course-completion.service.js';

type Database = ReturnType<typeof createDatabase>;
type WatchedRange = [number, number];

@Injectable()
export class LearnerProgressService {
  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: Database,
    @Inject(CourseCompletionService) private readonly completion: CourseCompletionService,
  ) {}

  async getProgress(userId: string, courseId: string, lessonId: string) {
    const context = await this.requireLesson(userId, courseId, lessonId);
    const [progress] = await this.database.db.select().from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId))).limit(1);
    return this.toView(progress, context.durationSeconds, context.videoCompletionPercent);
  }

  async recordVideoPosition(userId: string, courseId: string, lessonId: string, fromPosition: number, position: number) {
    const context = await this.requireLesson(userId, courseId, lessonId);
    if (context.type !== 'VIDEO' || !context.durationSeconds) {
      throw new BadRequestException({ code: 'VIDEO_PROGRESS_UNAVAILABLE', message: 'Video progress is unavailable for this lesson.' });
    }
    const duration = context.durationSeconds;
    const nextPosition = Math.min(duration, Math.max(0, Math.floor(position)));
    const priorPosition = Math.max(0, Math.floor(fromPosition));
    const now = new Date();
    const result = await this.database.db.transaction(async (transaction) => {
      await transaction.insert(lessonProgress).values({ userId, lessonId })
        .onConflictDoNothing({ target: [lessonProgress.userId, lessonProgress.lessonId] });
      const [current] = await transaction.select().from(lessonProgress)
        .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)))
        .for('update').limit(1);
      if (!current) throw new Error('Lesson progress could not be initialized.');

      // Require the client segment to continue from the last saved position. This makes
      // retries/out-of-order writes harmless and prevents seeking over unseen sections.
      const matchesCursor = Math.abs(current.lastPositionSeconds - priorPosition) <= 2;
      const elapsedSeconds = current.lastHeartbeatAt ? Math.max(0, (now.getTime() - current.lastHeartbeatAt.getTime()) / 1000) : 0;
      const segmentSeconds = nextPosition - priorPosition;
      const plausiblePlayback = matchesCursor && elapsedSeconds >= 3 && segmentSeconds > 0 && segmentSeconds <= elapsedSeconds * 1.5 + 2;
      const ranges = Array.isArray(current.watchedRanges) ? current.watchedRanges : [];
      const watchedRanges = plausiblePlayback
        ? this.mergeRange(ranges, [priorPosition, nextPosition], duration)
        : ranges;
      const watchedSeconds = this.watchedSeconds(watchedRanges);
      const completed = watchedSeconds >= duration * context.videoCompletionPercent / 100;
      const updateCursor = matchesCursor || current.lastHeartbeatAt === null;
      const [updated] = await transaction.update(lessonProgress).set({
        ...(updateCursor ? { lastPositionSeconds: nextPosition, lastHeartbeatAt: now } : {}),
        watchedRanges,
        status: completed ? 'completed' : (watchedSeconds > 0 || nextPosition > 0 ? 'in_progress' : current.status),
        completedAt: completed ? (current.completedAt ?? now) : current.completedAt,
        updatedAt: now,
      }).where(eq(lessonProgress.id, current.id)).returning();
      return updated;
    });
    if (result?.status === 'completed') await this.refreshCourseCompletion(userId, courseId);
    return this.toView(result, duration, context.videoCompletionPercent);
  }

  async markManualComplete(userId: string, courseId: string, lessonId: string) {
    const context = await this.requireLesson(userId, courseId, lessonId);
    if (context.type === 'VIDEO') {
      throw new BadRequestException({ code: 'VIDEO_COMPLETION_REQUIRES_WATCHING', message: 'Watch the required portion of the video to complete this lesson.' });
    }
    if (context.type === 'TEXT' && context.textCompletionMode === 'on_open') {
      throw new BadRequestException({ code: 'LESSON_COMPLETES_ON_OPEN', message: 'This text lesson completes when opened.' });
    }
    const [existing] = await this.database.db.select({ openedAt: lessonProgress.openedAt }).from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId))).limit(1);
    if (!existing?.openedAt) {
      throw new BadRequestException({ code: 'LESSON_NOT_OPENED', message: 'Open this lesson before marking it complete.' });
    }
    const now = new Date();
    const [progress] = await this.database.db.insert(lessonProgress).values({
      userId, lessonId, status: 'completed', completedAt: now, updatedAt: now,
    }).onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: { status: 'completed', completedAt: sql`COALESCE(${lessonProgress.completedAt}, ${now})`, updatedAt: now },
    }).returning();
    await this.refreshCourseCompletion(userId, courseId);
    return this.toView(progress, null, context.videoCompletionPercent);
  }

  async completeTextOnOpen(userId: string, courseId: string, lessonId: string) {
    const context = await this.requireLesson(userId, courseId, lessonId);
    if (context.type !== 'TEXT' || context.textCompletionMode !== 'on_open') return null;
    const now = new Date();
    const [progress] = await this.database.db.insert(lessonProgress).values({
      userId, lessonId, status: 'completed', completedAt: now, updatedAt: now,
    }).onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: { status: 'completed', completedAt: sql`COALESCE(${lessonProgress.completedAt}, ${now})`, updatedAt: now },
    }).returning();
    await this.refreshCourseCompletion(userId, courseId);
    return this.toView(progress, null, context.videoCompletionPercent);
  }

  async recordOpened(userId: string, courseId: string, lessonId: string) {
    await this.requireLesson(userId, courseId, lessonId);
    const now = new Date();
    await this.database.db.insert(lessonProgress).values({ userId, lessonId, status: 'in_progress', openedAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: { openedAt: sql`COALESCE(${lessonProgress.openedAt}, ${now})`, status: sql`CASE WHEN ${lessonProgress.status} = 'completed' THEN 'completed' ELSE 'in_progress' END`, updatedAt: now },
      });
  }

  async listCourseProgress(userId: string, courseId: string) {
    const [course] = await this.database.db.select({ quizRequired: courses.quizRequired }).from(courses)
      .innerJoin(enrollments, and(eq(enrollments.courseId, courses.id), eq(enrollments.userId, userId)))
      .where(and(eq(courses.id, courseId), eq(courses.status, 'published'))).limit(1);
    if (!course) throw new ForbiddenException({ code: 'COURSE_ENROLLMENT_REQUIRED', message: 'Enroll in this published course to view progress.' });
    const rows = await this.database.db.select({
      id: lessons.id, required: lessons.required, status: lessonProgress.status,
      lastPositionSeconds: lessonProgress.lastPositionSeconds, completedAt: lessonProgress.completedAt,
    }).from(lessons)
      .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
      .leftJoin(lessonProgress, and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.userId, userId)))
      .where(eq(courseModules.courseId, courseId));
    const [passedAttempt] = course?.quizRequired
      ? await this.database.db.select({ id: quizAttempts.id }).from(quizAttempts)
        .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.courseId, courseId), eq(quizAttempts.passed, true))).limit(1)
      : [];
    return this.courseSummary(rows, course?.quizRequired ?? false, Boolean(passedAttempt));
  }

  async refreshCourseCompletion(userId: string, courseId: string) {
    return this.completion.refresh(userId, courseId);
  }

  private async requireLesson(userId: string, courseId: string, lessonId: string) {
    const [row] = await this.database.db.select({
      type: lessons.type,
      videoCompletionPercent: courses.videoCompletionPercent,
      textCompletionMode: courses.textCompletionMode,
      durationSeconds: mediaAssets.durationSeconds,
    }).from(lessons)
      .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
      .innerJoin(courses, eq(courseModules.courseId, courses.id))
      .innerJoin(enrollments, and(eq(enrollments.courseId, courses.id), eq(enrollments.userId, userId)))
      .leftJoin(mediaAssets, and(eq(mediaAssets.lessonId, lessons.id), eq(mediaAssets.status, 'ready')))
      .where(and(eq(lessons.id, lessonId), eq(courses.id, courseId), eq(courses.status, 'published')))
      .orderBy(desc(mediaAssets.createdAt)).limit(1);
    if (!row) throw new ForbiddenException({ code: 'COURSE_ENROLLMENT_REQUIRED', message: 'Enroll in this published course to access lesson progress.' });
    return row;
  }

  private courseSummary(rows: Array<{ id: string; required: boolean; status: string | null; lastPositionSeconds: number | null; completedAt: Date | null }>, quizRequired: boolean, quizPassed: boolean) {
    const required = rows.filter((row) => row.required);
    const completed = required.filter((row) => row.status === 'completed').length;
    const percent = required.length === 0 ? 100 : Math.floor(completed * 100 / required.length);
    return {
      lessonCount: rows.length,
      requiredLessonCount: required.length,
      completedRequiredLessonCount: completed,
      progressPercent: percent,
      isCompleted: completed === required.length && (!quizRequired || quizPassed),
      completionBlockedByQuiz: completed === required.length && quizRequired && !quizPassed,
    };
  }

  private toView(progress: typeof lessonProgress.$inferSelect | undefined, duration: number | null, thresholdPercent: number) {
    const ranges = progress?.watchedRanges ?? [];
    const watchedSeconds = this.watchedSeconds(ranges);
    return {
      status: progress?.status ?? 'not_started',
      lastPositionSeconds: progress?.lastPositionSeconds ?? 0,
      durationSeconds: duration,
      watchedSeconds,
      progressPercent: progress?.status === 'completed' ? 100 : duration ? Math.min(100, Math.floor(watchedSeconds * 100 / duration)) : 0,
      completionThresholdPercent: thresholdPercent,
      completedAt: progress?.completedAt ?? null,
    };
  }

  private mergeRange(ranges: WatchedRange[], added: WatchedRange, duration: number): WatchedRange[] {
    const sorted = [...ranges, [Math.max(0, added[0]), Math.min(duration, added[1])] as WatchedRange]
      .filter(([start, end]) => end > start).sort((a, b) => a[0] - b[0]);
    const merged: WatchedRange[] = [];
    for (const range of sorted) {
      const previous = merged.at(-1);
      if (previous && range[0] <= previous[1] + 0.5) previous[1] = Math.max(previous[1], range[1]);
      else merged.push([range[0], range[1]]);
    }
    return merged;
  }

  private watchedSeconds(ranges: WatchedRange[]) {
    return ranges.reduce((total, [start, end]) => total + Math.max(0, end - start), 0);
  }
}

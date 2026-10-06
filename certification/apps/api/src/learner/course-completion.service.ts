import { Injectable, Logger, Inject } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import type { createDatabase } from '@centaur/lms-database';
import { certificateAuditLogs, certificates, courseCompletions, courseModules, courses, enrollments, lessonProgress, lessons, quizAttempts, users } from '@centaur/lms-database';
import { DATABASE_CLIENT } from '../tokens.js';
import { CertificateQueueService } from '../certificates/certificate-queue.service.js';

type Database = ReturnType<typeof createDatabase>;
@Injectable()
export class CourseCompletionService {
  private readonly logger = new Logger(CourseCompletionService.name);

  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: Database,
    @Inject(CertificateQueueService) private readonly certificateQueue: CertificateQueueService,
  ) {}

  async refresh(userId: string, courseId: string) {
    const certificate = await this.database.db.transaction(async (transaction) => {
      const [enrollment] = await transaction.select({ id: enrollments.id }).from(enrollments)
        .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))).for('update').limit(1);
      if (!enrollment) return null;
      const [course] = await transaction.select({
        id: courses.id,
        title: courses.title,
        certificateEnabled: courses.certificateEnabled,
        quizRequired: courses.quizRequired,
      }).from(courses).where(eq(courses.id, courseId)).limit(1);
      const [user] = await transaction.select({ displayName: users.displayName, email: users.email }).from(users)
        .where(eq(users.id, userId)).limit(1);
      if (!course || !user) return null;

      let [completion] = await transaction.select().from(courseCompletions)
        .where(and(eq(courseCompletions.userId, userId), eq(courseCompletions.courseId, courseId))).limit(1);
      if (!completion) {
        const [summary] = await transaction.select({
          required: sql<number>`count(*) filter (where ${lessons.required})::int`,
          completed: sql<number>`count(*) filter (where ${lessons.required} and ${lessonProgress.status} = 'completed')::int`,
        }).from(lessons)
          .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
          .leftJoin(lessonProgress, and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.userId, userId)))
          .where(eq(courseModules.courseId, courseId));
        const lessonsComplete = (summary?.required ?? 0) === (summary?.completed ?? 0);
        const [passingAttempt] = course.quizRequired
          ? await transaction.select({ id: quizAttempts.id }).from(quizAttempts)
            .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.courseId, courseId), eq(quizAttempts.passed, true))).limit(1)
          : [];
        if (!lessonsComplete || (course.quizRequired && !passingAttempt)) {
          await transaction.update(enrollments).set({ completedAt: null }).where(eq(enrollments.id, enrollment.id));
          return null;
        }
        const completedAt = new Date();
        const learnerName = user.displayName?.trim() || user.email.split('@')[0] || 'Learner';
        [completion] = await transaction.insert(courseCompletions).values({
          userId,
          courseId,
          enrollmentId: enrollment.id,
          learnerNameSnapshot: learnerName.slice(0, 120),
          courseTitleSnapshot: course.title,
          completedAt,
        }).onConflictDoNothing({ target: [courseCompletions.enrollmentId] }).returning();
        if (!completion) {
          [completion] = await transaction.select().from(courseCompletions)
            .where(and(eq(courseCompletions.userId, userId), eq(courseCompletions.courseId, courseId))).limit(1);
        }
      }
      if (!completion) return null;
      await transaction.update(enrollments).set({ completedAt: completion.completedAt }).where(eq(enrollments.id, enrollment.id));
      if (!course.certificateEnabled) return null;

      let certificateWasCreated = false;
      let [certificate] = await transaction.select().from(certificates)
        .where(eq(certificates.completionId, completion.id)).limit(1);
      if (!certificate) {
        for (let attempt = 0; attempt < 3 && !certificate; attempt += 1) {
          const publicCertificateId = `CERT-${randomBytes(24).toString('hex').toUpperCase()}`;
          const [created] = await transaction.insert(certificates).values({
            completionId: completion.id,
            publicCertificateId,
            objectKey: `certificates/${completion.id}/${publicCertificateId}.pdf`,
          }).onConflictDoNothing().returning();
          certificate = created;
          certificateWasCreated = Boolean(created);
        }
      }
      if (!certificate) throw new Error('Unable to allocate a unique certificate ID.');
      if (certificateWasCreated) {
        await transaction.insert(certificateAuditLogs).values({ certificateId: certificate.id, action: 'issued' });
      }
      return { id: certificate.id, status: certificate.status };
    });

    if (certificate && certificate.status !== 'ready' && certificate.status !== 'revoked') {
      try {
        await this.certificateQueue.enqueue(certificate.id, certificate.status === 'failed');
      } catch (error) {
        this.logger.warn(`Certificate ${certificate.id} is saved and will be recovered by the worker queue: ${error instanceof Error ? error.message : 'queue unavailable'}`);
      }
    }
    return certificate;
  }
}

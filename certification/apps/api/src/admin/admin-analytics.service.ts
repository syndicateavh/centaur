import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, count, countDistinct, desc, eq, ilike, inArray, isNotNull, isNull, max, or, sql } from 'drizzle-orm';
import type { createDatabase } from '@centaur/lms-database';
import {
  certificateAuditLogs, certificates, courseCompletions, courseModules, courses, enrollments,
  lessonProgress, lessons, permissions, quizAttempts, rolePermissions, userRoles, users,
} from '@centaur/lms-database';
import { DATABASE_CLIENT } from '../tokens.js';

type Database = ReturnType<typeof createDatabase>;
type PageInput = { page: number; pageSize: number };

@Injectable()
export class AdminAnalyticsService {
  constructor(@Inject(DATABASE_CLIENT) private readonly database: Database) {}

  async overview() {
    const activeSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [userCount, learnerCount, enrollmentCount, activeCount, publishedCount, completionCount, certificateCount, validCertificateCount] = await Promise.all([
      this.database.db.select({ value: count() }).from(users),
      this.database.db.select({ value: countDistinct(users.id) }).from(users)
        .innerJoin(userRoles, eq(userRoles.userId, users.id)).innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
        .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId)).where(eq(permissions.code, 'learner:dashboard:view')),
      this.database.db.select({ value: count() }).from(enrollments),
      this.database.db.select({ value: countDistinct(enrollments.userId) }).from(enrollments).where(sql`${enrollments.lastAccessedAt} >= ${activeSince}`),
      this.database.db.select({ value: count() }).from(courses).where(eq(courses.status, 'published')),
      this.database.db.select({ value: count() }).from(courseCompletions),
      this.database.db.select({ value: count() }).from(certificates),
      this.database.db.select({ value: count() }).from(certificates).where(eq(certificates.status, 'ready')),
    ]);
    return {
      generatedAt: new Date(),
      activeLearnerWindowDays: 30,
      users: userCount[0]?.value ?? 0,
      students: learnerCount[0]?.value ?? 0,
      enrollments: enrollmentCount[0]?.value ?? 0,
      activeLearners: activeCount[0]?.value ?? 0,
      publishedCourses: publishedCount[0]?.value ?? 0,
      completions: completionCount[0]?.value ?? 0,
      certificates: certificateCount[0]?.value ?? 0,
      validCertificates: validCertificateCount[0]?.value ?? 0,
    };
  }

  async recentActivity(limit = 20) {
    const boundedLimit = Math.max(1, Math.min(50, limit));
    const [accountEvents, enrollmentEvents, completionEvents, quizEvents, certificateEvents] = await Promise.all([
      this.database.db.select({ id: users.id, label: users.displayName, email: users.email, occurredAt: users.createdAt })
        .from(users).orderBy(desc(users.createdAt)).limit(boundedLimit),
      this.database.db.select({ id: enrollments.id, userId: users.id, learner: users.displayName, email: users.email, course: courses.title, occurredAt: enrollments.enrolledAt })
        .from(enrollments).innerJoin(users, eq(enrollments.userId, users.id)).innerJoin(courses, eq(enrollments.courseId, courses.id))
        .orderBy(desc(enrollments.enrolledAt)).limit(boundedLimit),
      this.database.db.select({ id: courseCompletions.id, learner: courseCompletions.learnerNameSnapshot, course: courseCompletions.courseTitleSnapshot, occurredAt: courseCompletions.completedAt })
        .from(courseCompletions).orderBy(desc(courseCompletions.completedAt)).limit(boundedLimit),
      this.database.db.select({ id: quizAttempts.id, learner: users.displayName, email: users.email, course: courses.title, passed: quizAttempts.passed, scorePercent: quizAttempts.scorePercent, occurredAt: quizAttempts.submittedAt })
        .from(quizAttempts).innerJoin(users, eq(quizAttempts.userId, users.id)).innerJoin(courses, eq(quizAttempts.courseId, courses.id))
        .orderBy(desc(quizAttempts.submittedAt)).limit(boundedLimit),
      this.database.db.select({
        id: certificateAuditLogs.id, action: certificateAuditLogs.action, reason: certificateAuditLogs.reason,
        learner: courseCompletions.learnerNameSnapshot, course: courseCompletions.courseTitleSnapshot,
        publicCertificateId: certificates.publicCertificateId, actorEmail: users.email, occurredAt: certificateAuditLogs.createdAt,
      }).from(certificateAuditLogs).innerJoin(certificates, eq(certificateAuditLogs.certificateId, certificates.id))
        .innerJoin(courseCompletions, eq(certificates.completionId, courseCompletions.id))
        .leftJoin(users, eq(certificateAuditLogs.actorUserId, users.id))
        .orderBy(desc(certificateAuditLogs.createdAt)).limit(boundedLimit),
    ]);
    const events = [
      ...accountEvents.map((event) => ({ id: event.id, type: 'account_created', title: 'New learner account', subject: event.label || event.email, occurredAt: event.occurredAt })),
      ...enrollmentEvents.map((event) => ({ id: event.id, type: 'enrollment', title: 'Course enrollment', subject: `${event.learner || event.email} enrolled in ${event.course}`, occurredAt: event.occurredAt })),
      ...completionEvents.map((event) => ({ id: event.id, type: 'completion', title: 'Course completed', subject: `${event.learner} completed ${event.course}`, occurredAt: event.occurredAt })),
      ...quizEvents.map((event) => ({ id: event.id, type: 'quiz_attempt', title: event.passed ? 'Quiz passed' : 'Quiz attempt', subject: `${event.learner || event.email} · ${event.course} · ${event.scorePercent}%`, occurredAt: event.occurredAt })),
      ...certificateEvents.map((event) => ({ id: event.id, type: `certificate_${event.action}`, title: `Certificate ${event.action.replace('_', ' ')}`, subject: `${event.learner} · ${event.course} · ${event.publicCertificateId}${event.actorEmail ? ` · by ${event.actorEmail}` : ''}`, occurredAt: event.occurredAt })),
    ];
    return events.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()).slice(0, boundedLimit);
  }

  async listStudents(input: PageInput & { q?: string | undefined; activity?: string | undefined }) {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const filters = [];
    if (input.q) {
      const query = `%${input.q.replace(/[\\%_]/g, '\\$&')}%`;
      filters.push(or(ilike(users.email, query), ilike(users.displayName, query)));
    }
    if (input.activity === 'active') filters.push(sql`EXISTS (SELECT 1 FROM enrollments e WHERE e.user_id = ${users.id} AND e.last_accessed_at >= ${cutoff})`);
    if (input.activity === 'inactive') filters.push(sql`NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.user_id = ${users.id} AND e.last_accessed_at >= ${cutoff})`);
    const where = filters.length ? and(...filters) : undefined;
    const [total] = await this.database.db.select({ value: count() }).from(users).where(where);
    const pageRows = await this.database.db.select({ id: users.id, displayName: users.displayName, email: users.email, createdAt: users.createdAt })
      .from(users).where(where).orderBy(desc(users.createdAt), desc(users.id)).limit(input.pageSize).offset((input.page - 1) * input.pageSize);
    const ids = pageRows.map((row) => row.id);
    if (ids.length === 0) return { items: [], page: input.page, pageSize: input.pageSize, total: total?.value ?? 0 };
    const [enrollmentCounts, completionCounts, lastAccessRows] = await Promise.all([
      this.database.db.select({ userId: enrollments.userId, value: count() }).from(enrollments).where(inArray(enrollments.userId, ids)).groupBy(enrollments.userId),
      this.database.db.select({ userId: courseCompletions.userId, value: count() }).from(courseCompletions).where(inArray(courseCompletions.userId, ids)).groupBy(courseCompletions.userId),
      this.database.db.select({ userId: enrollments.userId, value: max(enrollments.lastAccessedAt) }).from(enrollments).where(inArray(enrollments.userId, ids)).groupBy(enrollments.userId),
    ]);
    const byUser = <T extends { userId: string; value: number | Date | null }>(rows: T[]) => new Map(rows.map((row) => [row.userId, row.value]));
    const enrollmentsByUser = byUser(enrollmentCounts);
    const completionsByUser = byUser(completionCounts);
    const lastAccessByUser = byUser(lastAccessRows);
    return {
      items: pageRows.map((row) => ({
        ...row,
        enrollmentCount: enrollmentsByUser.get(row.id) ?? 0,
        completionCount: completionsByUser.get(row.id) ?? 0,
        lastActiveAt: lastAccessByUser.get(row.id) ?? null,
      })),
      page: input.page, pageSize: input.pageSize, total: total?.value ?? 0,
    };
  }

  async studentDetail(userId: string, input: PageInput) {
    const [student] = await this.database.db.select({ id: users.id, displayName: users.displayName, email: users.email, createdAt: users.createdAt })
      .from(users).where(eq(users.id, userId)).limit(1);
    if (!student) throw new NotFoundException({ code: 'STUDENT_NOT_FOUND', message: 'Learner not found.' });
    const [totalCourses] = await this.database.db.select({ value: count() }).from(enrollments).where(eq(enrollments.userId, userId));
    const courseRows = await this.database.db.select({
      enrollmentId: enrollments.id, courseId: courses.id, title: courses.title, slug: courses.slug, status: courses.status,
      enrolledAt: enrollments.enrolledAt, lastAccessedAt: enrollments.lastAccessedAt, completedAt: enrollments.completedAt,
      quizRequired: courses.quizRequired,
    }).from(enrollments).innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId)).orderBy(desc(enrollments.enrolledAt))
      .limit(input.pageSize).offset((input.page - 1) * input.pageSize);
    const courseIds = courseRows.map((row) => row.courseId);
    const [requiredRows, completeRows, passedRows, completionRows] = courseIds.length ? await Promise.all([
      this.database.db.select({ courseId: courseModules.courseId, value: count() }).from(lessons)
        .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id)).where(and(inArray(courseModules.courseId, courseIds), eq(lessons.required, true))).groupBy(courseModules.courseId),
      this.database.db.select({ courseId: courseModules.courseId, value: count() }).from(lessonProgress)
        .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id)).innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
        .where(and(eq(lessonProgress.userId, userId), inArray(courseModules.courseId, courseIds), eq(lessons.required, true), eq(lessonProgress.status, 'completed'))).groupBy(courseModules.courseId),
      this.database.db.select({ courseId: quizAttempts.courseId }).from(quizAttempts)
        .where(and(eq(quizAttempts.userId, userId), inArray(quizAttempts.courseId, courseIds), eq(quizAttempts.passed, true))).groupBy(quizAttempts.courseId),
      this.database.db.select({ id: certificates.id, completionId: courseCompletions.id, courseId: courseCompletions.courseId, publicCertificateId: certificates.publicCertificateId, status: certificates.status, issuedAt: certificates.issuedAt, revokedAt: certificates.revokedAt })
        .from(courseCompletions).innerJoin(certificates, eq(certificates.completionId, courseCompletions.id))
        .where(and(eq(courseCompletions.userId, userId), inArray(courseCompletions.courseId, courseIds))),
    ]) : [[], [], [], []];
    const requiredByCourse = new Map(requiredRows.map((row) => [row.courseId, row.value]));
    const completeByCourse = new Map(completeRows.map((row) => [row.courseId, row.value]));
    const passedCourseIds = new Set(passedRows.map((row) => row.courseId));
    const certificatesByCourse = new Map(completionRows.map((row) => [row.courseId, row]));
    const coursesWithProgress = courseRows.map((row) => {
      const required = requiredByCourse.get(row.courseId) ?? 0;
      const completed = completeByCourse.get(row.courseId) ?? 0;
      return {
        ...row,
        requiredLessonCount: required,
        completedRequiredLessonCount: completed,
        progressPercent: required === 0 ? 100 : Math.floor(completed * 100 / required),
        quizPassed: passedCourseIds.has(row.courseId),
        certificate: certificatesByCourse.get(row.courseId) ?? null,
      };
    });
    return { student, courses: { items: coursesWithProgress, page: input.page, pageSize: input.pageSize, total: totalCourses?.value ?? 0 } };
  }

  async listEnrollments(input: PageInput & { q?: string | undefined; courseId?: string | undefined; status?: string | undefined; sort?: string | undefined }) {
    const filters = [];
    if (input.courseId) filters.push(eq(enrollments.courseId, input.courseId));
    if (input.status === 'active') filters.push(isNull(enrollments.completedAt));
    if (input.status === 'completed') filters.push(isNotNull(enrollments.completedAt));
    if (input.q) {
      const query = `%${input.q.replace(/[\\%_]/g, '\\$&')}%`;
      filters.push(or(ilike(users.email, query), ilike(users.displayName, query), ilike(courses.title, query), ilike(courses.slug, query)));
    }
    const where = filters.length ? and(...filters) : undefined;
    const [total] = await this.database.db.select({ value: count() }).from(enrollments)
      .innerJoin(users, eq(enrollments.userId, users.id)).innerJoin(courses, eq(enrollments.courseId, courses.id)).where(where);
    const rows = await this.database.db.select({
      id: enrollments.id, userId: users.id, displayName: users.displayName, email: users.email,
      courseId: courses.id, courseTitle: courses.title, courseSlug: courses.slug, courseStatus: courses.status,
      enrolledAt: enrollments.enrolledAt, lastAccessedAt: enrollments.lastAccessedAt,
      completedAt: enrollments.completedAt, quizRequired: courses.quizRequired,
    }).from(enrollments).innerJoin(users, eq(enrollments.userId, users.id)).innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(where).orderBy(input.sort === 'activity'
        ? desc(sql`COALESCE(${enrollments.lastAccessedAt}, ${enrollments.enrolledAt})`)
        : desc(enrollments.enrolledAt), desc(enrollments.id))
      .limit(input.pageSize).offset((input.page - 1) * input.pageSize);
    if (!rows.length) return { items: [], page: input.page, pageSize: input.pageSize, total: total?.value ?? 0 };

    const userIds = [...new Set(rows.map((row) => row.userId))];
    const courseIds = [...new Set(rows.map((row) => row.courseId))];
    const [requiredRows, completeRows, passedRows, certificateRows] = await Promise.all([
      this.database.db.select({ courseId: courseModules.courseId, value: count() }).from(lessons)
        .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
        .where(and(inArray(courseModules.courseId, courseIds), eq(lessons.required, true))).groupBy(courseModules.courseId),
      this.database.db.select({ userId: lessonProgress.userId, courseId: courseModules.courseId, value: count() }).from(lessonProgress)
        .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id)).innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
        .where(and(inArray(lessonProgress.userId, userIds), inArray(courseModules.courseId, courseIds), eq(lessons.required, true), eq(lessonProgress.status, 'completed')))
        .groupBy(lessonProgress.userId, courseModules.courseId),
      this.database.db.select({ userId: quizAttempts.userId, courseId: quizAttempts.courseId }).from(quizAttempts)
        .where(and(inArray(quizAttempts.userId, userIds), inArray(quizAttempts.courseId, courseIds), eq(quizAttempts.passed, true)))
        .groupBy(quizAttempts.userId, quizAttempts.courseId),
      this.database.db.select({ userId: courseCompletions.userId, courseId: courseCompletions.courseId, id: certificates.id, status: certificates.status, publicCertificateId: certificates.publicCertificateId, issuedAt: certificates.issuedAt })
        .from(courseCompletions).innerJoin(certificates, eq(certificates.completionId, courseCompletions.id))
        .where(and(inArray(courseCompletions.userId, userIds), inArray(courseCompletions.courseId, courseIds))),
    ]);
    const requiredByCourse = new Map(requiredRows.map((row) => [row.courseId, row.value]));
    const completedByPair = new Map(completeRows.map((row) => [`${row.userId}:${row.courseId}`, row.value]));
    const passedPairs = new Set(passedRows.map((row) => `${row.userId}:${row.courseId}`));
    const certificatesByPair = new Map(certificateRows.map((row) => [`${row.userId}:${row.courseId}`, row]));
    return {
      items: rows.map((row) => {
        const pair = `${row.userId}:${row.courseId}`;
        const requiredLessonCount = requiredByCourse.get(row.courseId) ?? 0;
        const completedRequiredLessonCount = completedByPair.get(pair) ?? 0;
        return {
          ...row, requiredLessonCount, completedRequiredLessonCount,
          progressPercent: requiredLessonCount === 0 ? 100 : Math.floor(completedRequiredLessonCount * 100 / requiredLessonCount),
          quizPassed: passedPairs.has(pair), certificate: certificatesByPair.get(pair) ?? null,
        };
      }),
      page: input.page, pageSize: input.pageSize, total: total?.value ?? 0,
    };
  }

  async createEnrollment(input: { email: string; courseId: string }) {
    const email = input.email.trim().toLowerCase();
    const [learner] = await this.database.db.select({ id: users.id, email: users.email }).from(users)
      .innerJoin(userRoles, eq(userRoles.userId, users.id)).innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(and(eq(users.email, email), eq(permissions.code, 'learner:dashboard:view'))).limit(1);
    if (!learner) throw new NotFoundException({ code: 'LEARNER_ACCOUNT_NOT_FOUND', message: 'No learner account was found for that email address.' });
    const [course] = await this.database.db.select({ id: courses.id, status: courses.status }).from(courses)
      .where(eq(courses.id, input.courseId)).limit(1);
    if (!course) throw new NotFoundException({ code: 'COURSE_NOT_FOUND', message: 'Course not found.' });
    if (course.status !== 'published') throw new BadRequestException({ code: 'COURSE_NOT_ENROLLABLE', message: 'Learners can only be enrolled in published courses.' });
    const [existing] = await this.database.db.select({ id: enrollments.id }).from(enrollments)
      .where(and(eq(enrollments.userId, learner.id), eq(enrollments.courseId, course.id))).limit(1);
    if (existing) throw new ConflictException({ code: 'ALREADY_ENROLLED', message: 'This learner is already enrolled in the selected course.' });
    const [enrollment] = await this.database.db.insert(enrollments).values({ userId: learner.id, courseId: course.id })
      .onConflictDoNothing({ target: [enrollments.userId, enrollments.courseId] }).returning();
    if (!enrollment) throw new ConflictException({ code: 'ALREADY_ENROLLED', message: 'This learner is already enrolled in the selected course.' });
    return { enrollment, learner };
  }

  async listCourses(input: PageInput & { q?: string | undefined; status?: string | undefined }) {
    const filters = [];
    if (input.q) {
      const query = `%${input.q.replace(/[\\%_]/g, '\\$&')}%`;
      filters.push(or(ilike(courses.title, query), ilike(courses.slug, query)));
    }
    if (input.status) filters.push(eq(courses.status, input.status));
    const where = filters.length ? and(...filters) : undefined;
    const [total] = await this.database.db.select({ value: count() }).from(courses).where(where);
    const pageRows = await this.database.db.select({ id: courses.id, title: courses.title, slug: courses.slug, status: courses.status, certificateEnabled: courses.certificateEnabled, quizRequired: courses.quizRequired, createdAt: courses.createdAt, updatedAt: courses.updatedAt })
      .from(courses).where(where).orderBy(desc(courses.updatedAt), desc(courses.id)).limit(input.pageSize).offset((input.page - 1) * input.pageSize);
    const ids = pageRows.map((row) => row.id);
    if (!ids.length) return { items: [], page: input.page, pageSize: input.pageSize, total: total?.value ?? 0 };
    const [enrollmentCounts, startedCounts, completionCounts, lessonCounts] = await Promise.all([
      this.database.db.select({ courseId: enrollments.courseId, value: count() }).from(enrollments).where(inArray(enrollments.courseId, ids)).groupBy(enrollments.courseId),
      this.database.db.select({ courseId: enrollments.courseId, value: count() }).from(enrollments)
        .where(and(inArray(enrollments.courseId, ids), isNotNull(enrollments.lastAccessedAt))).groupBy(enrollments.courseId),
      this.database.db.select({ courseId: courseCompletions.courseId, value: count() }).from(courseCompletions).where(inArray(courseCompletions.courseId, ids)).groupBy(courseCompletions.courseId),
      this.database.db.select({ courseId: courseModules.courseId, value: count() }).from(lessons).innerJoin(courseModules, eq(lessons.moduleId, courseModules.id)).where(inArray(courseModules.courseId, ids)).groupBy(courseModules.courseId),
    ]);
    const enrollmentMap = new Map(enrollmentCounts.map((row) => [row.courseId, row.value]));
    const startedMap = new Map(startedCounts.map((row) => [row.courseId, row.value]));
    const completionMap = new Map(completionCounts.map((row) => [row.courseId, row.value]));
    const lessonMap = new Map(lessonCounts.map((row) => [row.courseId, row.value]));
    return {
      items: pageRows.map((row) => ({ ...row, enrollmentCount: enrollmentMap.get(row.id) ?? 0, startedCount: startedMap.get(row.id) ?? 0, completionCount: completionMap.get(row.id) ?? 0, lessonCount: lessonMap.get(row.id) ?? 0 })),
      page: input.page, pageSize: input.pageSize, total: total?.value ?? 0,
    };
  }

  async courseDetail(courseId: string, input: PageInput) {
    const [course] = await this.database.db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
    if (!course) throw new NotFoundException({ code: 'COURSE_NOT_FOUND', message: 'Course not found.' });
    const [total] = await this.database.db.select({ value: count() }).from(enrollments).where(eq(enrollments.courseId, courseId));
    const enrollmentRows = await this.database.db.select({
      userId: users.id, displayName: users.displayName, email: users.email, enrollmentId: enrollments.id,
      enrolledAt: enrollments.enrolledAt, lastAccessedAt: enrollments.lastAccessedAt, completedAt: enrollments.completedAt,
    }).from(enrollments).innerJoin(users, eq(enrollments.userId, users.id))
      .where(eq(enrollments.courseId, courseId)).orderBy(desc(enrollments.lastAccessedAt), desc(enrollments.enrolledAt))
      .limit(input.pageSize).offset((input.page - 1) * input.pageSize);
    const learnerIds = enrollmentRows.map((row) => row.userId);
    const [requiredRows, completeRows, passedRows, certificateRows] = learnerIds.length ? await Promise.all([
      this.database.db.select({ value: count() }).from(lessons).innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
        .where(and(eq(courseModules.courseId, courseId), eq(lessons.required, true))),
      this.database.db.select({ userId: lessonProgress.userId, value: count() }).from(lessonProgress)
        .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id)).innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
        .where(and(eq(courseModules.courseId, courseId), inArray(lessonProgress.userId, learnerIds), eq(lessons.required, true), eq(lessonProgress.status, 'completed'))).groupBy(lessonProgress.userId),
      this.database.db.select({ userId: quizAttempts.userId }).from(quizAttempts)
        .where(and(eq(quizAttempts.courseId, courseId), inArray(quizAttempts.userId, learnerIds), eq(quizAttempts.passed, true))).groupBy(quizAttempts.userId),
      this.database.db.select({ id: certificates.id, userId: courseCompletions.userId, publicCertificateId: certificates.publicCertificateId, status: certificates.status, issuedAt: certificates.issuedAt, revokedAt: certificates.revokedAt })
        .from(courseCompletions).innerJoin(certificates, eq(certificates.completionId, courseCompletions.id))
        .where(and(eq(courseCompletions.courseId, courseId), inArray(courseCompletions.userId, learnerIds))),
    ]) : [[], [], [], []];
    const requiredCount = requiredRows[0]?.value ?? 0;
    const completeMap = new Map(completeRows.map((row) => [row.userId, row.value]));
    const passedIds = new Set(passedRows.map((row) => row.userId));
    const certMap = new Map(certificateRows.map((row) => [row.userId, row]));
    return {
      course,
      learners: {
        items: enrollmentRows.map((row) => {
          const completedLessons = completeMap.get(row.userId) ?? 0;
          return {
            ...row, requiredLessonCount: requiredCount, completedRequiredLessonCount: completedLessons,
            progressPercent: requiredCount === 0 ? 100 : Math.floor(completedLessons * 100 / requiredCount),
            quizPassed: passedIds.has(row.userId), certificate: certMap.get(row.userId) ?? null,
          };
        }),
        page: input.page, pageSize: input.pageSize, total: total?.value ?? 0,
      },
    };
  }

  async listCertificateAudit(input: PageInput & { action?: string | undefined; q?: string | undefined }) {
    const filters = [];
    if (input.action) filters.push(eq(certificateAuditLogs.action, input.action));
    if (input.q) {
      const query = `%${input.q.replace(/[\\%_]/g, '\\$&')}%`;
      filters.push(or(ilike(certificates.publicCertificateId, query), ilike(courseCompletions.learnerNameSnapshot, query), ilike(courseCompletions.courseTitleSnapshot, query), ilike(users.email, query)));
    }
    const where = filters.length ? and(...filters) : undefined;
    const [total] = await this.database.db.select({ value: count() }).from(certificateAuditLogs)
      .innerJoin(certificates, eq(certificateAuditLogs.certificateId, certificates.id))
      .innerJoin(courseCompletions, eq(certificates.completionId, courseCompletions.id))
      .leftJoin(users, eq(certificateAuditLogs.actorUserId, users.id)).where(where);
    const items = await this.database.db.select({
      id: certificateAuditLogs.id, certificateId: certificates.id, action: certificateAuditLogs.action, reason: certificateAuditLogs.reason,
      createdAt: certificateAuditLogs.createdAt, actorEmail: users.email,
      publicCertificateId: certificates.publicCertificateId, certificateStatus: certificates.status,
      learnerName: courseCompletions.learnerNameSnapshot, courseTitle: courseCompletions.courseTitleSnapshot,
    }).from(certificateAuditLogs).innerJoin(certificates, eq(certificateAuditLogs.certificateId, certificates.id))
      .innerJoin(courseCompletions, eq(certificates.completionId, courseCompletions.id))
      .leftJoin(users, eq(certificateAuditLogs.actorUserId, users.id)).where(where)
      .orderBy(desc(certificateAuditLogs.createdAt)).limit(input.pageSize).offset((input.page - 1) * input.pageSize);
    return { items, page: input.page, pageSize: input.pageSize, total: total?.value ?? 0 };
  }
}

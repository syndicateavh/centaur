import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, inArray, max, or, sql } from 'drizzle-orm';
import type { createDatabase } from '@centaur/lms-database';
import { courseModules, courses, lessons, quizOptions, quizQuestions, quizzes } from '@centaur/lms-database';
import { DATABASE_CLIENT } from '../tokens.js';
import type { CreateCourseInput, LessonInput, ModuleInput, UpdateCourseInput } from './course.schemas.js';

type Database = ReturnType<typeof createDatabase>;
type CourseExecutor = Database['db'];
type CourseTransaction = Parameters<Parameters<CourseExecutor['transaction']>[0]>[0];

@Injectable()
export class CoursesService {
  constructor(@Inject(DATABASE_CLIENT) private readonly database: Database) {}

  async listAdminCourses(input: { page: number; pageSize: number; q?: string | undefined; status?: string | undefined }) {
    const filters = [];
    if (input.q) {
      const query = `%${input.q.replace(/[\\%_]/g, '\\$&')}%`;
      filters.push(or(ilike(courses.title, query), ilike(courses.slug, query)));
    }
    if (input.status) filters.push(eq(courses.status, input.status));
    const where = filters.length ? and(...filters) : undefined;
    const [total] = await this.database.db.select({ value: count() }).from(courses).where(where);
    const items = await this.database.db.select().from(courses).where(where)
      .orderBy(desc(courses.updatedAt), desc(courses.id)).limit(input.pageSize).offset((input.page - 1) * input.pageSize);
    return { items, page: input.page, pageSize: input.pageSize, total: total?.value ?? 0 };
  }

  async getAdminCourse(courseId: string) {
    const course = await this.findCourse(courseId);
    const modules = await this.database.db.select().from(courseModules)
      .where(eq(courseModules.courseId, courseId))
      .orderBy(asc(courseModules.sortOrder));
    const outline = await Promise.all(modules.map(async (module) => ({
      ...module,
      lessons: await this.database.db.select().from(lessons)
        .where(eq(lessons.moduleId, module.id))
        .orderBy(asc(lessons.sortOrder)),
    })));
    return { ...course, modules: outline };
  }

  async createCourse(input: CreateCourseInput, userId: string) {
    try {
      const [course] = await this.database.db.insert(courses).values({
        ...input,
        slug: this.normalizeSlug(input.slug),
        description: input.description?.trim() || null,
        createdBy: userId,
      }).returning({ id: courses.id });
      return this.getAdminCourse(course!.id);
    } catch (error) {
      if (this.isUniqueViolation(error)) throw this.slugConflict();
      throw error;
    }
  }

  async updateCourse(courseId: string, input: UpdateCourseInput) {
    try {
      await this.database.db.transaction(async (transaction) => {
        await this.requireDraftCourse(transaction, courseId);
        await transaction.update(courses).set({
          ...input,
          slug: this.normalizeSlug(input.slug),
          description: input.description?.trim() || null,
          updatedAt: new Date(),
        }).where(eq(courses.id, courseId));
      });
      return this.getAdminCourse(courseId);
    } catch (error) {
      if (this.isUniqueViolation(error)) throw this.slugConflict();
      throw error;
    }
  }

  async changeStatus(courseId: string, nextStatus: 'draft' | 'published' | 'archived') {
    await this.database.db.transaction(async (transaction) => {
      const course = await this.lockCourse(transaction, courseId);
      const transitions: Record<string, string[]> = {
        draft: ['published', 'archived'],
        published: ['draft', 'archived'],
        archived: ['draft'],
      };
      if (!transitions[course.status]?.includes(nextStatus)) {
        throw new BadRequestException({ code: 'COURSE_INVALID_STATUS_TRANSITION', message: `Cannot change a ${course.status} course to ${nextStatus}.` });
      }

      if (nextStatus === 'published') {
        const [outline] = await transaction.select({
          moduleCount: sql<number>`count(DISTINCT ${courseModules.id})::int`,
          lessonCount: sql<number>`count(${lessons.id})::int`,
        }).from(courseModules).leftJoin(lessons, eq(lessons.moduleId, courseModules.id))
          .where(eq(courseModules.courseId, courseId));
        if (!outline?.moduleCount || !outline.lessonCount) {
          throw new BadRequestException({ code: 'COURSE_CONTENT_REQUIRED', message: 'Add at least one module and one lesson before publishing.' });
        }
        if (course.quizRequired) {
          const [quiz] = await transaction.select({ id: quizzes.id }).from(quizzes)
            .where(eq(quizzes.courseId, courseId)).limit(1);
          const questions = quiz ? await transaction.select({ id: quizQuestions.id }).from(quizQuestions)
            .where(eq(quizQuestions.quizId, quiz.id)) : [];
          if (!quiz || questions.length === 0) {
            throw new BadRequestException({ code: 'REQUIRED_QUIZ_CONTENT_REQUIRED', message: 'Configure at least one question before publishing a course with a required quiz.' });
          }
          const options = await transaction.select({ questionId: quizOptions.questionId, isCorrect: quizOptions.isCorrect })
            .from(quizOptions).where(inArray(quizOptions.questionId, questions.map((question) => question.id)));
          if (questions.some((question) => !options.some((option) => option.questionId === question.id && option.isCorrect))) {
            throw new BadRequestException({ code: 'REQUIRED_QUIZ_ANSWER_KEY_REQUIRED', message: 'Every required quiz question must have a correct answer.' });
          }
        }
      }

      await transaction.update(courses).set({
        status: nextStatus,
        publishedAt: nextStatus === 'published' ? new Date() : null,
        archivedAt: nextStatus === 'archived' ? new Date() : null,
        updatedAt: new Date(),
      }).where(eq(courses.id, courseId));
    });
    return this.getAdminCourse(courseId);
  }

  async deleteDraftCourse(courseId: string) {
    await this.database.db.transaction(async (transaction) => {
      await this.requireDraftCourse(transaction, courseId);
      await transaction.delete(courses).where(eq(courses.id, courseId));
    });
    return { ok: true };
  }

  async createModule(courseId: string, input: ModuleInput) {
    await this.database.db.transaction(async (transaction) => {
      await this.requireDraftCourse(transaction, courseId);
      const [order] = await transaction.select({ last: max(courseModules.sortOrder) })
        .from(courseModules).where(eq(courseModules.courseId, courseId));
      await transaction.insert(courseModules).values({
        courseId,
        title: input.title,
        description: input.description?.trim() || null,
        sortOrder: (order?.last ?? -1) + 1,
      });
    });
    return this.getAdminCourse(courseId);
  }

  async updateModule(courseId: string, moduleId: string, input: ModuleInput) {
    await this.database.db.transaction(async (transaction) => {
      await this.requireDraftCourse(transaction, courseId);
      await this.requireModule(transaction, courseId, moduleId);
      await transaction.update(courseModules).set({
        title: input.title,
        description: input.description?.trim() || null,
        updatedAt: new Date(),
      }).where(and(eq(courseModules.id, moduleId), eq(courseModules.courseId, courseId)));
    });
    return this.getAdminCourse(courseId);
  }

  async deleteModule(courseId: string, moduleId: string) {
    await this.database.db.transaction(async (transaction) => {
      await this.requireDraftCourse(transaction, courseId);
      await this.requireModule(transaction, courseId, moduleId);
      await transaction.delete(courseModules)
        .where(and(eq(courseModules.id, moduleId), eq(courseModules.courseId, courseId)));
    });
    return this.getAdminCourse(courseId);
  }

  async reorderModules(courseId: string, ids: string[]) {
    await this.database.db.transaction(async (transaction) => {
      await this.requireDraftCourse(transaction, courseId);
      const rows = await transaction.select({ id: courseModules.id, sortOrder: courseModules.sortOrder })
        .from(courseModules).where(eq(courseModules.courseId, courseId));
      this.assertExactOrder(rows.map((row) => row.id), ids, 'module');
      await this.applyOrder(transaction, courseModules, eq(courseModules.courseId, courseId), rows, ids);
    });
    return this.getAdminCourse(courseId);
  }

  async createLesson(courseId: string, moduleId: string, input: LessonInput) {
    await this.database.db.transaction(async (transaction) => {
      await this.requireDraftCourse(transaction, courseId);
      await this.requireModule(transaction, courseId, moduleId);
      const [order] = await transaction.select({ last: max(lessons.sortOrder) })
        .from(lessons).where(eq(lessons.moduleId, moduleId));
      await transaction.insert(lessons).values({
        moduleId,
        title: input.title,
        description: input.description?.trim() || null,
        type: input.type,
        content: input.content?.trim() || null,
        required: input.required,
        sortOrder: (order?.last ?? -1) + 1,
      });
    });
    return this.getAdminCourse(courseId);
  }

  async updateLesson(courseId: string, moduleId: string, lessonId: string, input: LessonInput) {
    await this.database.db.transaction(async (transaction) => {
      await this.requireDraftCourse(transaction, courseId);
      await this.requireModule(transaction, courseId, moduleId);
      const [lesson] = await transaction.select({ id: lessons.id }).from(lessons)
        .where(and(eq(lessons.id, lessonId), eq(lessons.moduleId, moduleId))).limit(1);
      if (!lesson) throw this.lessonNotFound();
      await transaction.update(lessons).set({
        title: input.title,
        description: input.description?.trim() || null,
        type: input.type,
        content: input.content?.trim() || null,
        required: input.required,
        updatedAt: new Date(),
      }).where(eq(lessons.id, lessonId));
    });
    return this.getAdminCourse(courseId);
  }

  async deleteLesson(courseId: string, moduleId: string, lessonId: string) {
    await this.database.db.transaction(async (transaction) => {
      await this.requireDraftCourse(transaction, courseId);
      await this.requireModule(transaction, courseId, moduleId);
      const result = await transaction.delete(lessons)
        .where(and(eq(lessons.id, lessonId), eq(lessons.moduleId, moduleId)))
        .returning({ id: lessons.id });
      if (result.length === 0) throw this.lessonNotFound();
    });
    return this.getAdminCourse(courseId);
  }

  async reorderLessons(courseId: string, moduleId: string, ids: string[]) {
    await this.database.db.transaction(async (transaction) => {
      await this.requireDraftCourse(transaction, courseId);
      await this.requireModule(transaction, courseId, moduleId);
      const rows = await transaction.select({ id: lessons.id, sortOrder: lessons.sortOrder })
        .from(lessons).where(eq(lessons.moduleId, moduleId));
      this.assertExactOrder(rows.map((row) => row.id), ids, 'lesson');
      await this.applyOrder(transaction, lessons, eq(lessons.moduleId, moduleId), rows, ids);
    });
    return this.getAdminCourse(courseId);
  }

  async listPublishedCourses() {
    return this.database.db.select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      description: courses.description,
      certificateEnabled: courses.certificateEnabled,
      publishedAt: courses.publishedAt,
    }).from(courses).where(eq(courses.status, 'published')).orderBy(desc(courses.publishedAt));
  }

  async getPublishedCourse(slug: string) {
    const [course] = await this.database.db.select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      description: courses.description,
      certificateEnabled: courses.certificateEnabled,
      quizEnabled: courses.quizEnabled,
      quizRequired: courses.quizRequired,
      publishedAt: courses.publishedAt,
    }).from(courses).where(and(eq(courses.slug, this.normalizeSlug(slug)), eq(courses.status, 'published'))).limit(1);
    if (!course) throw new NotFoundException({ code: 'COURSE_NOT_FOUND', message: 'Course not found.' });

    const modules = await this.database.db.select({
      id: courseModules.id,
      title: courseModules.title,
      description: courseModules.description,
      sortOrder: courseModules.sortOrder,
    }).from(courseModules).where(eq(courseModules.courseId, course.id)).orderBy(asc(courseModules.sortOrder));
    const outline = await Promise.all(modules.map(async (module) => ({
      ...module,
      lessons: await this.database.db.select({
        id: lessons.id,
        title: lessons.title,
        description: lessons.description,
        type: lessons.type,
        required: lessons.required,
        sortOrder: lessons.sortOrder,
      }).from(lessons).where(eq(lessons.moduleId, module.id)).orderBy(asc(lessons.sortOrder)),
    })));
    return { ...course, modules: outline };
  }

  private async applyOrder(
    transaction: CourseTransaction,
    table: typeof courseModules | typeof lessons,
    predicate: ReturnType<typeof eq>,
    rows: Array<{ id: string; sortOrder: number }>,
    ids: string[],
  ) {
    if (rows.length === 0) return;
    const offset = Math.max(...rows.map((row) => row.sortOrder)) + rows.length + 1;
    await transaction.update(table).set({
      sortOrder: sql`${table.sortOrder} + ${offset}`,
      updatedAt: new Date(),
    }).where(predicate);
    for (const [sortOrder, id] of ids.entries()) {
      await transaction.update(table).set({ sortOrder, updatedAt: new Date() }).where(eq(table.id, id));
    }
  }

  private assertExactOrder(currentIds: string[], requestedIds: string[], label: string) {
    const requested = new Set(requestedIds);
    if (requested.size !== requestedIds.length || requested.size !== currentIds.length || currentIds.some((id) => !requested.has(id))) {
      throw new BadRequestException({ code: 'COURSE_ORDER_INVALID', message: `Provide every existing ${label} ID exactly once.` });
    }
  }

  private async findCourse(courseId: string) {
    const [course] = await this.database.db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
    if (!course) throw new NotFoundException({ code: 'COURSE_NOT_FOUND', message: 'Course not found.' });
    return course;
  }

  private async lockCourse(transaction: CourseTransaction, courseId: string) {
    const [course] = await transaction.select().from(courses).where(eq(courses.id, courseId)).for('update').limit(1);
    if (!course) throw new NotFoundException({ code: 'COURSE_NOT_FOUND', message: 'Course not found.' });
    return course;
  }

  private async requireDraftCourse(transaction: CourseTransaction, courseId: string) {
    const course = await this.lockCourse(transaction, courseId);
    if (course.status !== 'draft') {
      throw new BadRequestException({ code: 'COURSE_MUST_BE_DRAFT', message: 'Unpublish the course before editing its content.' });
    }
    return course;
  }

  private async requireModule(transaction: CourseTransaction, courseId: string, moduleId: string) {
    const [module] = await transaction.select({ id: courseModules.id }).from(courseModules)
      .where(and(eq(courseModules.id, moduleId), eq(courseModules.courseId, courseId))).limit(1);
    if (!module) throw new NotFoundException({ code: 'COURSE_MODULE_NOT_FOUND', message: 'Course module not found.' });
    return module;
  }

  private normalizeSlug(slug: string) {
    return slug.trim().toLowerCase();
  }

  private slugConflict() {
    return new ConflictException({ code: 'COURSE_SLUG_TAKEN', message: 'A course already uses this slug.' });
  }

  private lessonNotFound() {
    return new NotFoundException({ code: 'LESSON_NOT_FOUND', message: 'Lesson not found.' });
  }

  private isUniqueViolation(error: unknown) {
    let current: unknown = error;
    for (let depth = 0; depth < 4 && typeof current === 'object' && current !== null; depth += 1) {
      if ('code' in current && current.code === '23505') return true;
      current = 'cause' in current ? current.cause : undefined;
    }
    return false;
  }
}

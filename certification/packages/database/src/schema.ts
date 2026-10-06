import { bigint, boolean, check, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 254 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('users_email_unique').on(table.email),
  index('users_created_at_idx').on(table.createdAt),
]);

export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 40 }).notNull(),
  name: varchar('name', { length: 80 }).notNull(),
}, (table) => [uniqueIndex('roles_code_unique').on(table.code)]);

export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 100 }).notNull(),
  description: varchar('description', { length: 180 }).notNull(),
}, (table) => [uniqueIndex('permissions_code_unique').on(table.code)]);

export const rolePermissions = pgTable('role_permissions', {
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })]);

export const userRoles = pgTable('user_roles', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  assignedBy: uuid('assigned_by').references(() => users.id, { onDelete: 'set null' }),
}, (table) => [primaryKey({ columns: [table.userId, table.roleId] })]);

export const bootstrapEvents = pgTable('bootstrap_events', {
  key: varchar('key', { length: 80 }).primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 180 }).notNull(),
  title: varchar('title', { length: 160 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 16 }).default('draft').notNull(),
  certificateEnabled: boolean('certificate_enabled').default(false).notNull(),
  quizEnabled: boolean('quiz_enabled').default(false).notNull(),
  quizRequired: boolean('quiz_required').default(false).notNull(),
  quizPassPercent: integer('quiz_pass_percent').default(70).notNull(),
  videoCompletionPercent: integer('video_completion_percent').default(90).notNull(),
  textCompletionMode: varchar('text_completion_mode', { length: 16 }).default('manual').notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
  archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('courses_slug_unique').on(table.slug),
  index('courses_status_idx').on(table.status),
  index('courses_updated_at_idx').on(table.updatedAt),
  check('courses_status_valid', sql`${table.status} IN ('draft', 'published', 'archived')`),
  check('courses_quiz_config_valid', sql`NOT ${table.quizRequired} OR ${table.quizEnabled}`),
  check('courses_quiz_pass_percent_valid', sql`${table.quizPassPercent} BETWEEN 1 AND 100`),
  check('courses_video_completion_percent_valid', sql`${table.videoCompletionPercent} BETWEEN 50 AND 100`),
  check('courses_text_completion_mode_valid', sql`${table.textCompletionMode} IN ('manual', 'on_open')`),
]);

export const courseModules = pgTable('course_modules', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 160 }).notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('course_modules_course_order_unique').on(table.courseId, table.sortOrder),
  index('course_modules_course_idx').on(table.courseId),
]);

export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  moduleId: uuid('module_id').notNull().references(() => courseModules.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 160 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 16 }).notNull(),
  content: text('content'),
  required: boolean('required').default(true).notNull(),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('lessons_module_order_unique').on(table.moduleId, table.sortOrder),
  index('lessons_module_idx').on(table.moduleId),
  check('lessons_type_valid', sql`${table.type} IN ('VIDEO', 'PDF', 'TEXT')`),
]);

export const enrollments = pgTable('enrollments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  enrolledAt: timestamp('enrolled_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  lastAccessedLessonId: uuid('last_accessed_lesson_id').references(() => lessons.id, { onDelete: 'set null' }),
  lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true, mode: 'date' }),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
}, (table) => [
  uniqueIndex('enrollments_user_course_unique').on(table.userId, table.courseId),
  index('enrollments_user_enrolled_at_idx').on(table.userId, table.enrolledAt),
  index('enrollments_course_idx').on(table.courseId),
  index('enrollments_last_accessed_at_idx').on(table.lastAccessedAt),
  index('enrollments_enrolled_at_idx').on(table.enrolledAt),
]);

export const lessonProgress = pgTable('lesson_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 16 }).default('not_started').notNull(),
  lastPositionSeconds: integer('last_position_seconds').default(0).notNull(),
  watchedRanges: jsonb('watched_ranges').$type<Array<[number, number]>>().default([]).notNull(),
  lastHeartbeatAt: timestamp('last_heartbeat_at', { withTimezone: true, mode: 'date' }),
  openedAt: timestamp('opened_at', { withTimezone: true, mode: 'date' }),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('lesson_progress_user_lesson_unique').on(table.userId, table.lessonId),
  index('lesson_progress_lesson_idx').on(table.lessonId),
  check('lesson_progress_status_valid', sql`${table.status} IN ('not_started', 'in_progress', 'completed')`),
  check('lesson_progress_position_valid', sql`${table.lastPositionSeconds} >= 0`),
]);

export const quizzes = pgTable('quizzes', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 160 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('quizzes_course_unique').on(table.courseId),
]);

export const quizQuestions = pgTable('quiz_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  quizId: uuid('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  type: varchar('type', { length: 24 }).notNull(),
  points: integer('points').default(1).notNull(),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('quiz_questions_quiz_order_unique').on(table.quizId, table.sortOrder),
  index('quiz_questions_quiz_idx').on(table.quizId),
  check('quiz_questions_type_valid', sql`${table.type} IN ('single_choice', 'multiple_choice', 'true_false')`),
  check('quiz_questions_points_valid', sql`${table.points} BETWEEN 1 AND 100`),
]);

export const quizOptions = pgTable('quiz_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').notNull().references(() => quizQuestions.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 500 }).notNull(),
  isCorrect: boolean('is_correct').default(false).notNull(),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('quiz_options_question_order_unique').on(table.questionId, table.sortOrder),
  index('quiz_options_question_idx').on(table.questionId),
]);

export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  quizId: uuid('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  earnedPoints: integer('earned_points').notNull(),
  totalPoints: integer('total_points').notNull(),
  scorePercent: integer('score_percent').notNull(),
  passed: boolean('passed').notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  index('quiz_attempts_user_course_submitted_idx').on(table.userId, table.courseId, table.submittedAt),
  index('quiz_attempts_course_passed_idx').on(table.courseId, table.passed),
  index('quiz_attempts_submitted_at_idx').on(table.submittedAt),
  check('quiz_attempts_score_valid', sql`${table.scorePercent} BETWEEN 0 AND 100`),
  check('quiz_attempts_points_valid', sql`${table.totalPoints} > 0 AND ${table.earnedPoints} BETWEEN 0 AND ${table.totalPoints}`),
]);

export const quizAttemptAnswers = pgTable('quiz_attempt_answers', {
  attemptId: uuid('attempt_id').notNull().references(() => quizAttempts.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => quizQuestions.id, { onDelete: 'cascade' }),
  optionId: uuid('option_id').notNull().references(() => quizOptions.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.attemptId, table.questionId, table.optionId] }),
  index('quiz_attempt_answers_attempt_idx').on(table.attemptId),
]);

export const courseCompletions = pgTable('course_completions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'restrict' }),
  enrollmentId: uuid('enrollment_id').notNull().references(() => enrollments.id, { onDelete: 'restrict' }),
  learnerNameSnapshot: varchar('learner_name_snapshot', { length: 120 }).notNull(),
  courseTitleSnapshot: varchar('course_title_snapshot', { length: 160 }).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('course_completions_enrollment_unique').on(table.enrollmentId),
  uniqueIndex('course_completions_user_course_unique').on(table.userId, table.courseId),
  index('course_completions_completed_idx').on(table.completedAt),
]);

export const certificates = pgTable('certificates', {
  id: uuid('id').defaultRandom().primaryKey(),
  completionId: uuid('completion_id').notNull().references(() => courseCompletions.id, { onDelete: 'restrict' }),
  publicCertificateId: varchar('public_certificate_id', { length: 64 }).notNull(),
  status: varchar('status', { length: 16 }).default('pending').notNull(),
  objectKey: varchar('object_key', { length: 512 }).notNull(),
  issuedAt: timestamp('issued_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  generatedAt: timestamp('generated_at', { withTimezone: true, mode: 'date' }),
  revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'date' }),
  revokedBy: uuid('revoked_by').references(() => users.id, { onDelete: 'set null' }),
  revocationReason: text('revocation_reason'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('certificates_completion_unique').on(table.completionId),
  uniqueIndex('certificates_public_id_unique').on(table.publicCertificateId),
  index('certificates_status_issued_idx').on(table.status, table.issuedAt),
  check('certificates_status_valid', sql`${table.status} IN ('pending', 'processing', 'ready', 'failed', 'revoked')`),
  check('certificates_revocation_valid', sql`(${table.status} <> 'revoked') OR (${table.revokedAt} IS NOT NULL AND ${table.revocationReason} IS NOT NULL)`),
]);

export const certificateAuditLogs = pgTable('certificate_audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  certificateId: uuid('certificate_id').notNull().references(() => certificates.id, { onDelete: 'restrict' }),
  actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 24 }).notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  index('certificate_audit_certificate_created_idx').on(table.certificateId, table.createdAt),
  index('certificate_audit_created_idx').on(table.createdAt),
  check('certificate_audit_action_valid', sql`${table.action} IN ('issued', 'revoked', 'generation_failed')`),
]);

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  kind: varchar('kind', { length: 16 }).notNull(),
  status: varchar('status', { length: 16 }).default('uploading').notNull(),
  originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
  contentType: varchar('content_type', { length: 100 }).notNull(),
  sourceKey: varchar('source_key', { length: 512 }).notNull(),
  uploadId: varchar('upload_id', { length: 512 }),
  sourceSizeBytes: bigint('source_size_bytes', { mode: 'number' }).notNull(),
  outputPrefix: varchar('output_prefix', { length: 512 }),
  outputSizeBytes: bigint('output_size_bytes', { mode: 'number' }),
  durationSeconds: integer('duration_seconds'),
  width: integer('width'),
  height: integer('height'),
  posterKey: varchar('poster_key', { length: 512 }),
  errorCode: varchar('error_code', { length: 80 }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true, mode: 'date' }),
}, (table) => [
  index('media_assets_lesson_created_idx').on(table.lessonId, table.createdAt),
  index('media_assets_status_updated_idx').on(table.status, table.updatedAt),
  uniqueIndex('media_assets_source_key_unique').on(table.sourceKey),
  check('media_assets_kind_valid', sql`${table.kind} IN ('VIDEO', 'PDF')`),
  check('media_assets_status_valid', sql`${table.status} IN ('uploading', 'processing', 'ready', 'failed', 'aborted')`),
  check('media_assets_size_valid', sql`${table.sourceSizeBytes} > 0`),
]);

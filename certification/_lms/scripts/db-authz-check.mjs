import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import pg from 'pg';

if (process.env.LMS_AUTHZ_TESTS !== 'true') {
  console.error('Set LMS_AUTHZ_TESTS=true only for an isolated local/CI database.');
  process.exit(1);
}
if ((!process.env.DATABASE_URL || !process.env.MIGRATION_DATABASE_URL) && existsSync('.env')) {
  process.loadEnvFile('.env');
}
if (!process.env.MIGRATION_DATABASE_URL && existsSync('.env.migration')) {
  process.loadEnvFile('.env.migration');
}
if (!process.env.DATABASE_URL || !process.env.MIGRATION_DATABASE_URL) {
  console.error('DATABASE_URL (runtime role) and MIGRATION_DATABASE_URL (database owner) are required.');
  process.exit(1);
}

const admin = new pg.Client({ connectionString: process.env.MIGRATION_DATABASE_URL });
const app = new pg.Client({ connectionString: process.env.DATABASE_URL, options: '-c search_path=lms,public' });
const learnerA = randomUUID();
const learnerB = randomUUID();
const courseId = randomUUID();
const versionId = randomUUID();
const moduleId = randomUUID();
const lessonId = randomUUID();
const assessmentId = randomUUID();

try {
  await admin.connect();
  await app.connect();
  const database = await admin.query('SELECT current_database() AS name');
  const dbRole = await app.query(`SELECT current_user AS role, r.rolsuper, r.rolbypassrls
    FROM pg_roles r WHERE r.rolname = current_user`);
  if (database.rows[0]?.name !== 'centaur_lms') throw new Error('Refusing authorization checks outside centaur_lms.');
  if (dbRole.rows[0]?.rolsuper || dbRole.rows[0]?.rolbypassrls) throw new Error('Runtime database role must not be superuser or BYPASSRLS.');

  await admin.query('BEGIN');
  await admin.query(`INSERT INTO lms."user" (id, name, email, "emailVerified", "privacyAccepted", "termsAccepted", "privacyNoticeVersion", "termsVersion")
    VALUES ($1, 'Synthetic Learner A', $2, true, true, true, 'authz-test', 'authz-test'), ($3, 'Synthetic Learner B', $4, true, true, true, 'authz-test', 'authz-test')`, [learnerA, `${learnerA}@example.invalid`, learnerB, `${learnerB}@example.invalid`]);
  await admin.query('INSERT INTO lms.profiles (user_id, display_name) VALUES ($1, $2), ($3, $4)', [learnerA, 'Synthetic Learner A', learnerB, 'Synthetic Learner B']);
  await admin.query('INSERT INTO lms.user_roles (user_id, role) VALUES ($1, \'learner\'), ($2, \'learner\')', [learnerA, learnerB]);
  await admin.query(`INSERT INTO lms.courses (id, slug, title, status, is_sandbox) VALUES ($1, $2, 'Authz test course', 'draft', TRUE)`, [courseId, `authz-${courseId}`]);
  await admin.query(`INSERT INTO lms.course_versions (id, course_id, version_number, status) VALUES ($1, $2, 1, 'draft')`, [versionId, courseId]);
  await admin.query('UPDATE lms.courses SET current_version_id = $2 WHERE id = $1', [courseId, versionId]);
  await admin.query('INSERT INTO lms.modules (id, course_version_id, slug, title, position) VALUES ($1, $2, \'test\', \'Test module\', 1)', [moduleId, versionId]);
  await admin.query('INSERT INTO lms.lessons (id, module_id, slug, title, position) VALUES ($1, $2, \'test\', \'Test lesson\', 1)', [lessonId, moduleId]);
  await admin.query('INSERT INTO lms.assessments (id, course_version_id, slug, title) VALUES ($1, $2, \'test\', \'Test assessment\')', [assessmentId, versionId]);
  await admin.query('INSERT INTO lms.enrollments (user_id, course_id, course_version_id) VALUES ($1, $2, $3)', [learnerB, courseId, versionId]);
  await admin.query('INSERT INTO lms.lesson_progress (user_id, lesson_id) VALUES ($1, $2)', [learnerB, lessonId]);
  await admin.query(`INSERT INTO lms.assessment_attempts
    (user_id, assessment_id, attempt_number, course_version_id, assessment_version_number)
    VALUES ($1, $2, 1, $3, 1)`, [learnerB, assessmentId, versionId]);
  await admin.query(`INSERT INTO lms.certificates
    (public_id, user_id, course_id, course_version_id, course_title_snapshot, recipient_name_snapshot)
    VALUES ($1, $2, $3, $4, 'Authz test course', 'Synthetic Learner B')`, [`CTC-${randomUUID().replaceAll('-', '').toUpperCase()}`, learnerB, courseId, versionId]);
  await admin.query('INSERT INTO lms.account_deletion_requests (user_id) VALUES ($1)', [learnerB]);
  await admin.query(`INSERT INTO lms.audit_events (actor_user_id, action, target_type) VALUES ($1, 'authz.synthetic', 'test')`, [learnerB]);
  await admin.query('COMMIT');

  // A pooled connection without a verified learner context must reveal no
  // learner-owned rows, even when the SQL names a real synthetic user.
  for (const table of ['profiles', 'user_roles', 'enrollments', 'lesson_progress', 'assessment_attempts', 'certificates', 'account_deletion_requests', 'audit_events']) {
    const ownerColumn = table === 'audit_events' ? 'actor_user_id' : 'user_id';
    const anonymousRead = await app.query(`SELECT 1 FROM lms.${table} WHERE ${ownerColumn} = $1`, [learnerB]);
    if (anonymousRead.rowCount !== 0) throw new Error(`Unauthenticated database context can read ${table}.`);
  }

  await app.query('BEGIN');
  await app.query("SELECT set_config('lms.current_learner_id', $1, true)", [learnerA]);
  const own = await app.query('SELECT user_id FROM lms.profiles WHERE user_id = $1', [learnerA]);
  if (own.rowCount !== 1) throw new Error('Learner A cannot read their own profile.');
  const tables = ['profiles', 'user_roles', 'enrollments', 'lesson_progress', 'assessment_attempts', 'certificates', 'account_deletion_requests', 'audit_events'];
  for (const table of tables) {
    const ownerColumn = table === 'audit_events' ? 'actor_user_id' : 'user_id';
    const read = await app.query(`SELECT 1 FROM lms.${table} WHERE ${ownerColumn} = $1`, [learnerB]);
    if (read.rowCount !== 0) throw new Error(`Learner A can read Learner B data in ${table}.`);
    if (['profiles', 'enrollments', 'lesson_progress', 'assessment_attempts', 'account_deletion_requests'].includes(table)) {
      const column = table === 'profiles' ? 'display_name' : 'status';
      await app.query('SAVEPOINT update_test');
      let rowsUpdated = 0;
      try {
        const update = await app.query(`UPDATE lms.${table} SET ${column} = ${column} WHERE user_id = $1`, [learnerB]);
        rowsUpdated = update.rowCount;
      } catch (error) {
        if (error.code !== '42501') throw error;
      }
      await app.query('ROLLBACK TO SAVEPOINT update_test');
      if (rowsUpdated !== 0) throw new Error(`Learner A can update Learner B data in ${table}.`);
    }
  }
  await app.query('ROLLBACK');

  let rejectedCrossInsert = false;
  await app.query('BEGIN');
  await app.query("SELECT set_config('lms.current_learner_id', $1, true)", [learnerA]);
  try { await app.query('INSERT INTO lms.profiles (user_id, display_name) VALUES ($1, $2)', [learnerB, 'Not allowed']); }
  catch (error) { rejectedCrossInsert = error.code === '42501'; }
  await app.query('ROLLBACK');
  if (!rejectedCrossInsert) throw new Error('Learner A could insert/update a profile for Learner B.');

  let rejectedRoleEscalation = false;
  await app.query('BEGIN');
  await app.query("SELECT set_config('lms.current_learner_id', $1, true)", [learnerA]);
  try { await app.query("INSERT INTO lms.user_roles (user_id, role) VALUES ($1, 'admin')", [learnerA]); }
  catch (error) { rejectedRoleEscalation = error.code === '42501'; }
  await app.query('ROLLBACK');
  if (!rejectedRoleEscalation) throw new Error('Learner A could grant themselves an admin role.');

  const crossLearnerInserts = [
    ['user_roles', 'INSERT INTO lms.user_roles (user_id, role) VALUES ($1, \'learner\')', [learnerB]],
    ['enrollments', 'INSERT INTO lms.enrollments (user_id, course_id, course_version_id) VALUES ($1, $2, $3)', [learnerB, courseId, versionId]],
    ['lesson_progress', 'INSERT INTO lms.lesson_progress (user_id, lesson_id) VALUES ($1, $2)', [learnerB, lessonId]],
    ['assessment_attempts', `INSERT INTO lms.assessment_attempts
      (user_id, assessment_id, attempt_number, course_version_id, assessment_version_number)
      VALUES ($1, $2, 2, $3, 1)`, [learnerB, assessmentId, versionId]],
    ['account_deletion_requests', 'INSERT INTO lms.account_deletion_requests (user_id) VALUES ($1)', [learnerB]],
    ['audit_events', "INSERT INTO lms.audit_events (actor_user_id, action, target_type) VALUES ($1, 'authz.cross_insert', 'test')", [learnerB]],
  ];
  for (const [table, statement, values] of crossLearnerInserts) {
    let rejected = false;
    await app.query('BEGIN');
    await app.query("SELECT set_config('lms.current_learner_id', $1, true)", [learnerA]);
    try { await app.query(statement, values); }
    catch (error) { rejected = error.code === '42501'; }
    await app.query('ROLLBACK');
    if (!rejected) throw new Error(`Learner A could insert a Learner B row in ${table}.`);
  }

  await app.query('BEGIN');
  await app.query("SELECT set_config('lms.current_learner_id', $1, true)", [learnerA]);
  const insertEnrollment = () => app.query(`INSERT INTO lms.enrollments (user_id, course_id, course_version_id)
    SELECT $1, id, current_version_id FROM lms.courses WHERE id = $2
    ON CONFLICT (user_id, course_id) DO NOTHING RETURNING id`, [learnerA, courseId]);
  const firstEnrollment = await insertEnrollment();
  const duplicateEnrollment = await insertEnrollment();
  await app.query('ROLLBACK');
  if (firstEnrollment.rowCount !== 1 || duplicateEnrollment.rowCount !== 0) throw new Error('Duplicate free enrollment was not safely ignored.');
  console.log(`Authorization checks passed for ${tables.join(', ')} using non-privileged runtime role ${dbRole.rows[0].role}.`);
} catch (error) {
  await admin.query('ROLLBACK').catch(() => {});
  console.error(error instanceof Error ? error.message : 'Authorization check failed.');
  process.exitCode = 1;
} finally {
  await admin.query('DELETE FROM lms."user" WHERE id = ANY($1::uuid[])', [[learnerA, learnerB]]).catch(() => {});
  await admin.query('DELETE FROM lms.courses WHERE id = $1', [courseId]).catch(() => {});
  await app.end().catch(() => {});
  await admin.end().catch(() => {});
}

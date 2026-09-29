import { existsSync } from 'node:fs';
import pg from 'pg';

if (!process.env.DATABASE_URL && !process.env.MIGRATION_DATABASE_URL && existsSync('.env')) {
  process.loadEnvFile('.env');
}
if (!process.env.MIGRATION_DATABASE_URL && existsSync('.env.migration')) {
  process.loadEnvFile('.env.migration');
}

if (process.env.NODE_ENV !== 'development') {
  console.error('The LMS sandbox seed can only run when NODE_ENV=development.');
  process.exit(1);
}

const connectionString = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('MIGRATION_DATABASE_URL or DATABASE_URL is missing.');
  process.exit(1);
}

const client = new pg.Client({ connectionString, connectionTimeoutMillis: 4000 });
try {
  await client.connect();
  const { rows } = await client.query('SELECT current_database() AS name');
  if (rows[0]?.name !== 'centaur_lms') throw new Error('Refusing to seed a database other than centaur_lms.');
  await client.query('BEGIN');
  const course = await client.query(`
    INSERT INTO lms.courses (slug, title, summary, status, is_sandbox)
    VALUES ('local-enrollment-sandbox', 'Internal enrollment sandbox', 'Fictional local-only record for checking account consent, learner sessions, and duplicate-safe free enrollment. Not a public course.', 'published', TRUE)
    ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, status = 'published', is_sandbox = TRUE, updated_at = now()
    RETURNING id
  `);
  const version = await client.query(`
    INSERT INTO lms.course_versions (course_id, version_number, status, overview)
    VALUES ($1, 1, 'published', 'Local enrollment workflow sandbox. It has no lessons, assessment, or certificate.')
    ON CONFLICT (course_id, version_number) DO UPDATE SET status = 'published', overview = EXCLUDED.overview, updated_at = now()
    RETURNING id
  `, [course.rows[0].id]);
  await client.query('UPDATE lms.courses SET current_version_id = $2 WHERE id = $1', [course.rows[0].id, version.rows[0].id]);
  await client.query('COMMIT');
  console.log('Local enrollment sandbox is ready. It is excluded from public course discovery and production enrollment.');
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error(error instanceof Error ? error.message : 'Local seed failed.');
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}

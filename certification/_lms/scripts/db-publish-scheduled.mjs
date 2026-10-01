import { existsSync } from 'node:fs';
import pg from 'pg';

if (!process.env.DATABASE_URL && existsSync('.env')) {
  try { process.loadEnvFile('.env'); } catch {}
}

const actorId = process.env.LMS_SCHEDULER_ACTOR_USER_ID;
if (!process.env.DATABASE_URL || !actorId || !/^[0-9a-f-]{36}$/i.test(actorId)) {
  console.error('Set DATABASE_URL and LMS_SCHEDULER_ACTOR_USER_ID to run the internal publication scheduler.');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 4000 });
let published = 0;
try {
  await client.connect();
  const database = await client.query('SELECT current_database() AS name');
  if (!database.rows[0]?.name?.startsWith('centaur_lms')) throw new Error('Refusing to run the scheduler against an unrecognized LMS database.');
  const due = await client.query(`SELECT id FROM lms.course_versions
    WHERE status='draft' AND scheduled_publish_at IS NOT NULL AND scheduled_publish_at<=now()
    ORDER BY scheduled_publish_at,id LIMIT 50`);
  for (const row of due.rows) {
    await client.query('BEGIN');
    try {
      const locked = await client.query(`SELECT id FROM lms.course_versions WHERE id=$1
        AND status='draft' AND scheduled_publish_at<=now() FOR UPDATE SKIP LOCKED`,[row.id]);
      if (!locked.rowCount) { await client.query('ROLLBACK'); continue; }
      await client.query("SELECT set_config('lms.current_learner_id',$1,true)",[actorId]);
      await client.query('SELECT lms.publish_course_version($1,$2,FALSE)',[row.id,actorId]);
      await client.query('COMMIT');
      published++;
    } catch (error) {
      await client.query('ROLLBACK');
      const code = error && typeof error === 'object' && 'code' in error && /^[A-Z0-9_]+$/.test(String(error.code)) ? String(error.code) : 'publication_failed';
      console.error(`Scheduled course version ${row.id} was not published (${code}).`);
    }
  }
  console.log(`Scheduled publication run complete. Published ${published} course version(s).`);
} catch (error) {
  const code = error && typeof error === 'object' && 'code' in error && /^[A-Z0-9_]+$/.test(String(error.code)) ? String(error.code) : 'publication_job_failed';
  console.error(`Scheduled publication job failed (${code}).`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}

import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

if (!process.env.DATABASE_URL && !process.env.MIGRATION_DATABASE_URL && existsSync('.env')) {
  process.loadEnvFile('.env');
}
if (!process.env.MIGRATION_DATABASE_URL && existsSync('.env.migration')) {
  process.loadEnvFile('.env.migration');
}

const { Client } = pg;
const root = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(root, '..', 'db', 'migrations');
const isCheckOnly = process.argv.includes('--check');

const migrationConnectionString = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
if (!migrationConnectionString) {
  console.error('MIGRATION_DATABASE_URL or DATABASE_URL is missing. Copy .env.example to .env and use the local development values.');
  process.exit(1);
}

const client = new Client({ connectionString: migrationConnectionString, connectionTimeoutMillis: 4000 });
const lockId = 784_219_006;
let isConnected = false;
let isLocked = false;

try {
  await client.connect();
  isConnected = true;
  await client.query('SELECT pg_advisory_lock($1)', [lockId]);
  isLocked = true;
  if (process.env.LMS_APP_USER && process.env.LMS_APP_PASSWORD) {
    if (!/^[a-z_][a-z0-9_]{0,62}$/i.test(process.env.LMS_APP_USER)) {
      throw new Error('LMS_APP_USER must be a valid PostgreSQL role name.');
    }
    const roleExists = await client.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [process.env.LMS_APP_USER]);
    const roleStatement = roleExists.rowCount
      ? await client.query("SELECT format('ALTER ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD %L', $1::text, $2::text) AS statement", [process.env.LMS_APP_USER, process.env.LMS_APP_PASSWORD])
      : await client.query("SELECT format('CREATE ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD %L', $1::text, $2::text) AS statement", [process.env.LMS_APP_USER, process.env.LMS_APP_PASSWORD]);
    await client.query(roleStatement.rows[0].statement);
  }
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS lms_system;
    CREATE TABLE IF NOT EXISTS lms_system.schema_migrations (
      migration_name TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const files = (await readdir(migrationsDir))
    .filter((name) => /^\d+_[a-z0-9_-]+\.sql$/i.test(name))
    .sort();
  const appliedResult = await client.query('SELECT migration_name, checksum FROM lms_system.schema_migrations');
  const applied = new Map(appliedResult.rows.map((row) => [row.migration_name, row.checksum]));
  const pending = [];

  for (const name of files) {
    const sql = await readFile(path.join(migrationsDir, name), 'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');
    const existingChecksum = applied.get(name);
    if (existingChecksum && existingChecksum !== checksum) {
      throw new Error(`Applied migration ${name} has changed. Add a new migration instead.`);
    }
    if (!existingChecksum) pending.push({ name, sql, checksum });
  }

  if (isCheckOnly) {
    if (pending.length) {
      console.error(`Pending migrations: ${pending.map(({ name }) => name).join(', ')}`);
      process.exitCode = 1;
    } else {
      console.log(`Database schema is current (${applied.size} migration(s)).`);
    }
  } else {
    for (const migration of pending) {
      await client.query('BEGIN');
      try {
        await client.query(migration.sql);
        await client.query(
          'INSERT INTO lms_system.schema_migrations (migration_name, checksum) VALUES ($1, $2)',
          [migration.name, migration.checksum],
        );
        await client.query('COMMIT');
        console.log(`Applied ${migration.name}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
    console.log(pending.length ? 'Database migrations are current.' : 'No pending migrations.');
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Database migration failed.');
  process.exitCode = 1;
} finally {
  if (isConnected && isLocked) {
    try {
      await client.query('SELECT pg_advisory_unlock($1)', [lockId]);
    } catch {
      // Connection shutdown releases the advisory lock if the migration failed.
    }
  }
  if (isConnected) await client.end().catch(() => {});
}

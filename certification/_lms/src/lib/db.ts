import "server-only";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import { fileURLToPath } from "node:url";
import { logServerError } from "@/lib/logger";

const globalForDatabase = globalThis as typeof globalThis & { lmsPool?: Pool };
const migrationsDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../db/migrations");

export type LocalAdminHealth = {
  checkedAt: string;
  app: { status: string; nodeVersion: string };
  database: { status: string; name?: string; message?: string };
  migrations: { status: string; applied: number | null; pending: number | null };
  courses: { total: number | null; draft: number | null; published: number | null; archived: number | null };
  setup: { databaseUrl: boolean; localEnvironment: boolean };
};

export function getDatabasePool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  globalForDatabase.lmsPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 4,
    connectionTimeoutMillis: 2500,
    idleTimeoutMillis: 10000,
  });

  return globalForDatabase.lmsPool;
}

export async function readLocalAdminHealth(): Promise<LocalAdminHealth> {
  const checkedAt = new Date().toISOString();
  if (!process.env.DATABASE_URL) {
    return {
      checkedAt,
      app: { status: "ready", nodeVersion: process.version },
      database: { status: "not-configured" },
      migrations: { status: "unknown", applied: null, pending: null },
      courses: { total: null, draft: null, published: null, archived: null },
      setup: { databaseUrl: false, localEnvironment: process.env.NODE_ENV === "development" },
    };
  }

  try {
    const pool = getDatabasePool();
    const connected = await pool.query<{ database_name: string }>("SELECT current_database() AS database_name");
    const objects = await pool.query<{ migration_table: string | null; course_table: string | null }>(
      "SELECT to_regclass('lms_system.schema_migrations') AS migration_table, to_regclass('lms.courses') AS course_table",
    );
    const hasMigrationTable = objects.rows[0]?.migration_table !== null;
    const hasCourseTable = objects.rows[0]?.course_table !== null;
    const migrations = hasMigrationTable
      ? await pool.query<{ migration_name: string; checksum: string }>("SELECT migration_name, checksum FROM lms_system.schema_migrations")
      : null;
    const migrationFiles = (await readdir(migrationsDirectory))
      .filter((name) => /^\d+_[a-z0-9_-]+\.sql$/i.test(name))
      .sort();
    const appliedByName = new Map((migrations?.rows ?? []).map((row) => [row.migration_name, row.checksum]));
    let changed = false;
    for (const name of migrationFiles) {
      const sql = await readFile(path.join(migrationsDirectory, name), "utf8");
      const appliedChecksum = appliedByName.get(name);
      if (appliedChecksum && appliedChecksum !== createHash("sha256").update(sql).digest("hex")) changed = true;
    }
    const pendingMigrations = migrationFiles.filter((name) => !appliedByName.has(name)).length;
    const courseCounts = hasCourseTable
      ? await pool.query<{ total: string; draft: string; published: string; archived: string }>(`
          SELECT count(*)::text AS total,
            count(*) FILTER (WHERE status = 'draft')::text AS draft,
            count(*) FILTER (WHERE status = 'published')::text AS published,
            count(*) FILTER (WHERE status = 'archived')::text AS archived
          FROM lms.courses
        `)
      : null;
    const applied = migrations?.rows.length ?? 0;
    const courseCountsRow = courseCounts?.rows[0];

    return {
      checkedAt,
      app: { status: "ready", nodeVersion: process.version },
      database: { status: "connected", name: connected.rows[0]?.database_name ?? "local" },
      migrations: {
        status: changed ? "changed-applied-file" : pendingMigrations ? "pending" : hasMigrationTable && hasCourseTable ? "ready" : "pending",
        applied,
        pending: pendingMigrations,
      },
      courses: {
        total: Number(courseCountsRow?.total ?? 0),
        draft: Number(courseCountsRow?.draft ?? 0),
        published: Number(courseCountsRow?.published ?? 0),
        archived: Number(courseCountsRow?.archived ?? 0),
      },
      setup: { databaseUrl: true, localEnvironment: process.env.NODE_ENV === "development" },
    };
  } catch (error) {
    logServerError("admin.health.check_failed", error);
    return {
      checkedAt,
      app: { status: "ready", nodeVersion: process.version },
      database: { status: "unavailable", message: "Check that the local PostgreSQL container is running and DATABASE_URL is correct." },
      migrations: { status: "unknown", applied: null, pending: null },
      courses: { total: null, draft: null, published: null, archived: null },
      setup: { databaseUrl: true, localEnvironment: process.env.NODE_ENV === "development" },
    };
  }
}

# Internal operations notes

These procedures cover the internal development environment. Do not use local volumes or local credentials for real learner data or production operations.

## Development data and seeds

- Migrations in `db/migrations` define schema only and are applied in filename order by `npm run db:migrate`.
- Keep future sample records synthetic. Add opt-in development seed files under `db/seeds`; never put learner records, credentials, or real bank/customer data in seeds.
- Compose runs migrations and the fictional enrollment sandbox seed in a one-shot `migrate` service before starting the app. CI migrates an empty database and does not seed sample content.
- Keep database-owner credentials in `.env.migration` for host-side migration commands or in the one-shot Compose migration service. Do not pass them to the long-running Next.js app; its only database connection is the least-privilege `lms_app` role.
- CI migrates a fresh empty PostgreSQL service, which checks that the schema can be created without relying on a developer's database volume.

## Application error logs

- Next.js and Node write process diagnostics to the app container's standard output and standard error. View local output with `docker compose logs --follow app`.
- Use `src/lib/logger.ts` for structured application errors. It records a fixed event name, time, error type, and safe database error code; it intentionally omits raw error messages, request bodies, credentials, and connection strings.
- Keep log retention and access under Centaur control when selecting an internal host. Do not add a hosted logging API during internal development.

## Local PostgreSQL backup and restore

The database contains only local development data at this phase. Backups are a convenience for local work and are not a production backup policy.

1. Create a local-only backup directory: `New-Item -ItemType Directory -Force .backups`.
2. Create a compressed dump inside the database container: `docker compose exec -T database sh -c 'pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB" -f /tmp/centaur-lms.dump'`.
3. Copy it to the host: `docker compose cp database:/tmp/centaur-lms.dump .backups/centaur-lms.dump`.
4. For a restore, first preserve the current local database if it matters. Copy the dump back with `docker compose cp .backups/centaur-lms.dump database:/tmp/centaur-lms.dump`, then run `docker compose exec -T database sh -c 'pg_restore --clean --if-exists --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB" /tmp/centaur-lms.dump'`.

The restore command replaces objects in the selected local database. Confirm the Compose project and database before running it. `.backups` is ignored by Git and must never contain exported production data.

Before any internal staging deployment, assign an owner for encrypted off-host backups, retention, access, restore testing, recovery objectives, and database credentials. Do not treat a local Docker volume as a backup.

## Release and migration rollback

- Build and tag each internal app image with its source revision. Keep the last known-good image available so the app can be rolled back independently.
- Take and verify a database backup before applying a production/staging migration. Review each SQL file and the app version that needs it.
- Prefer additive, backward-compatible schema changes. Deploy code that supports the old and new schema, migrate data if needed, and remove obsolete schema only in a later release after rollback is no longer required.
- If a release fails, restore the last known-good app image first when the schema remains compatible. Do not automatically reverse a migration or drop data. Restore a database backup only under the environment owner's incident procedure after identifying the recovery point.
- Local migrations are checksum-tracked and forward-only. Fix an applied schema with a new migration; never edit an applied migration file.

## Admin diagnostics

Use `/admin` locally to inspect app readiness, internal PostgreSQL connectivity, migration status, course counts, and whether local configuration is present. The panel does not expose credential values, and both it and `/api/admin/health` return 404 outside `NODE_ENV=development`.

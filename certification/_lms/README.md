# Centaur Learning LMS

Standalone Next.js application for Centaur's proposed free banking learning tracks. Development is internal-first: Next.js provides the application and internal API routes; PostgreSQL runs in the local Docker Compose environment. The LMS does not call Supabase, PocketBase, or third-party learner-data APIs.

## Requirements

- Node.js 22 or newer (Next.js currently requires Node.js 20.9 or newer).
- Docker Desktop with Docker Compose for the local PostgreSQL service.
- npm.

## Local development

```powershell
Copy-Item .env.example .env
Copy-Item .env.migration.example .env.migration
docker compose up
```

Open `http://localhost:3000`. A one-shot `migrate` service applies pending SQL migrations and seeds a fictional local-only enrollment sandbox before the app starts. The Next.js app service receives only the `lms_app` runtime database URL; database-owner credentials stay in the migration service or the separate ignored `.env.migration` used for host-side commands. The PostgreSQL port is bound to `127.0.0.1:54322`; do not expose the local database to the network. Open `/admin` for development-only service and schema checks and `/admin/mail` for local verification/reset messages. These admin routes return 404 outside `NODE_ENV=development`.

To run Next.js on the host instead of inside Compose, start PostgreSQL and the one-shot migration service with `docker compose up -d database migrate`, then run `npm ci` and `npm run dev`. The host app reads `.env` only; migration scripts separately load `.env.migration` when needed.

## Database migrations

- Add forward-only SQL files to `db/migrations` using the numeric naming pattern, for example `0002_add_modules.sql`.
- Apply with `npm run db:migrate` and verify there are no unapplied migrations with `npm run db:migrate:check`.
- Never edit an applied migration. Add a new migration and use fictional local data only.
- Local Compose uses a named volume. To intentionally reset local data, stop the database and remove the `lms_postgres_data` volume through Docker Desktop.

See [docs/operations.md](docs/operations.md) for the synthetic seed-data policy, internal error logging, local backup/restore commands, and migration/release rollback guidance.

## Internal deployment image

`Dockerfile` builds the standalone Next.js server for deployment on Centaur-controlled infrastructure. When a public origin is approved, pass it as the `LMS_PUBLIC_URL` Docker build argument and provide the same value at runtime for robots and sitemap output. Build and run it with the approved internal PostgreSQL URL and internal network configuration. Do not deploy it by copying files into the marketing site's static Hostinger document root. A real staging host, DNS, TLS, backup owner, and access boundary must be approved before connecting learner data.

The internal release process must apply `npm run db:migrate` against the approved target database before starting a version that depends on the new schema. Keep the database on a private internal network; do not publish port 5432.

## Current scope

Phase 1 foundation includes the Next.js scaffold, internal Postgres migration workflow, localhost-only Compose setup, container build, CI checks, liveness endpoint, and local-only admin health panel. Phase 2 adds course discovery pages, FAQs, help/status, and a non-functional certificate verification preview. Phase 3 adds internal learner accounts, verification/reset flow, profile and deletion requests, and free enrollment against fictional local data. Phase 4 adds a local-only, versioned KYC/AML pilot draft with ten text lessons, a learner player, account-bound progress, glossary, fictional case packet, downloadable workbook, official-source register, and reviewer preview. Phase 5 adds five formative knowledge checks, a 15-question final assessment, private answer keys, resumable attempts, server grading, and a version-bound completion gate. Subject-matter approval remains pending; the pilot and assessments are seeded only in development and are not approved public courses. Phase 6 certificate issuance/lookup remains future work.

See [docs/phase-2-route-map.md](docs/phase-2-route-map.md) for the public route map and content model. Set `LMS_PUBLIC_URL` to the approved HTTPS origin in an approved public build; production robots disallows crawling if the value is missing. Do not treat robots directives as access control for staging.

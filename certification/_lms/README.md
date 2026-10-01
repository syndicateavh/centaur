# Centaur Learning LMS

Standalone Next.js application for Centaur's proposed free banking learning tracks. Development is internal-first: Next.js provides the application and internal API routes; PostgreSQL runs in the local Docker Compose environment. The LMS does not call Supabase, PocketBase, or third-party learner-data APIs.

## Requirements

- Node.js 22 or newer (Next.js currently requires Node.js 20.9 or newer).
- Docker Desktop with Docker Compose for the local PostgreSQL service.
- npm.

## Local development

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
if (-not (Test-Path .env.migration)) { Copy-Item .env.migration.example .env.migration }
docker info
docker compose config --quiet
docker compose up
```

The guarded copy commands preserve existing local configuration. `docker info` confirms the Docker Desktop engine is running; start Docker Desktop and wait for it to become ready if this command fails. `docker compose config --quiet` validates Compose without printing environment values.

Compose applies pending SQL migrations and seeds the fictional enrollment sandbox plus the draft KYC/AML pilot before the app starts. Confirm all three services with `docker compose ps -a`; the one-shot `migrate` service should show `Exited (0)`. If it fails, inspect `docker compose logs migrate` and fix the first reported error before using the app. The Next.js app receives only the `lms_app` runtime database URL; database-owner credentials stay in the migration service or ignored `.env.migration`. PostgreSQL is bound to `127.0.0.1:54322`; do not expose it to the network.

Open `http://localhost:3000/api/health` and confirm the response contains `"status":"ok"`. Open `/admin` for development-only service/schema checks and `/admin/mail` for local verification/reset messages; these routes return 404 outside `NODE_ENV=development`. Run the migration and learner-access checks from the host:

```powershell
npm run db:migrate:check
$env:LMS_AUTHZ_TESTS = 'true'
npm run db:authz:check
Remove-Item Env:LMS_AUTHZ_TESTS
```

To access a protected admin page locally, create a synthetic account at `/sign-up` and open its verification link from `/admin/mail`. Grant the local admin role only after verification:

```powershell
npm run db:bootstrap:local-admin -- local-admin@example.invalid
```

The bootstrap command is restricted to development and the `centaur_lms` database on localhost port `54322`. It requires a verified matching account, grants the role once, and records an audit event. Sign in as that account and open `/admin/operations`. Do not run local bootstrap against staging or production.

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

Phase 1 foundation includes the Next.js scaffold, internal Postgres migration workflow, localhost-only Compose setup, container build, CI checks, liveness endpoint, and local-only admin health panel. On 2026-10-01, a clean temporary PostgreSQL instance applied all nine migrations, passed migration and authorization checks, and accepted both fictional seeds. The persistent local Compose database and protected admin route were also exercised. Phase 2 adds course discovery pages, FAQs, and help/status. Phase 3 adds internal learner accounts, verification/reset flow, profile and deletion requests, and free enrollment against fictional local data. Phase 4 adds a local-only, versioned KYC/AML pilot draft with ten text lessons, a learner player, account-bound progress, glossary, fictional case packet, downloadable workbook, official-source register, and reviewer preview. Phase 5 adds five formative knowledge checks, a 15-question final assessment, private answer keys, resumable attempts, server grading, and a version-bound completion gate. Phase 6 adds completion-gated certificate issuance, private PDF/QR downloads, minimal public verification, and audited admin revocation/reissue. Phase 7 adds protected course authoring/versioning/release, internal scheduled publishing, learner support, SMTP delivery diagnostics, and admin operations/audit views. Phase 8 adds controlled course invitations, optional learner feedback, privacy-limited pilot reporting, and staging/reporting runbooks. The course remains sandboxed until qualified review and publication; no pilot has run yet.

Certificate wording, eligibility checks, privacy fields, admin status changes, and the local verification checklist are documented in [docs/phase-6-certificates.md](docs/phase-6-certificates.md). Phase 7 workflows, retention proposals, and launch checks are documented in [docs/phase-7-operations.md](docs/phase-7-operations.md). Phase 8 cohort operation and report template are documented in [docs/phase-8-controlled-pilot.md](docs/phase-8-controlled-pilot.md) and [docs/pilot-report-template.md](docs/pilot-report-template.md). Migrations `0008_admin_operations.sql` and `0009_controlled_pilot.sql` now apply on both a clean temporary database and the persistent local database. Staging deployment and a pilot cohort have not been executed.

See [docs/phase-2-route-map.md](docs/phase-2-route-map.md) for the public route map and content model. Set `LMS_PUBLIC_URL` to the approved HTTPS origin in an approved public build; production robots disallows crawling if the value is missing. Do not treat robots directives as access control for staging.

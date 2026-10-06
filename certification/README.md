# Centaur Free Certification LMS

This workspace contains the implementation of the LMS phases. It is separate from the existing public marketing app in `../web/`.

## Requirements

- Node.js 24 or newer
- npm 10 or newer
- Docker Desktop with Docker Compose

## Local setup

From this directory:

```powershell
Copy-Item .env.example .env
docker compose up -d postgres redis
npm ci
npm run db:migrate
npm run build
```

Run each app in a separate terminal:

```powershell
npm run dev:api
npm run dev:web
npm run dev:worker
```

The web app is at `http://localhost:5173`. The API health endpoint is `http://localhost:4000/api/v1/health` and reports PostgreSQL, Redis, and worker readiness. For production, use the separate [production deployment and recovery runbook](docs/PRODUCTION_RUNBOOK.md); the local Compose file is development-only. The worker processes PDF validation, video transcoding, and certificate PDF/QR generation through BullMQ. Configure R2 and install FFmpeg/FFprobe by following [`docs/MEDIA_STORAGE_SETUP.md`](docs/MEDIA_STORAGE_SETUP.md) before uploading media or issuing downloadable certificates.

Set `DATABASE_URL`, `REDIS_URL`, `API_PORT`, `API_PUBLIC_URL`, `WEB_ORIGIN`, `VITE_API_BASE_URL`, `SESSION_TTL_SECONDS`, `TRUST_PROXY_HOPS`, `LOG_LEVEL`, and the R2/media values through `.env`. Media upload and playback require a private R2 bucket, bucket-scoped credentials, and a browser CORS policy. The checked-in example credentials are for local development only and must not be used in deployed environments.

## Database commands

```powershell
npm run db:generate
npm run db:migrate
npm run db:check
```

The first migration creates the LMS users table. Later phases add their Drizzle schema and migrations with the feature that owns them.

## Workspace map

- `apps/web`: React, TypeScript, Vite, Tailwind, TanStack Query, React Hook Form, and Zod.
- `apps/api`: NestJS modular monolith with email/password auth, server sessions, request IDs, structured logging, security headers, and readiness endpoint.
- `apps/worker`: long-running worker process shell with Redis connection and structured logs.
- `packages/shared`: authentication validation schemas and API/health response types.
- `packages/config`: Zod environment schemas.
- `packages/database`: Drizzle client, schema, and migration configuration.

## Authentication behavior

Authentication uses email and password with scrypt password hashes, Redis-backed opaque server sessions, CSRF checks, and IP/email rate limits. OTP and second-factor flows are intentionally excluded. Password reset is deferred until an email provider and recovery policy are selected. The existing `backend/` starter remains untouched because it is a separate uncommitted Git repository.

## Roles and initial administrator

Database roles and permissions are assigned through `user_roles` and `role_permissions`. New accounts receive only the `LEARNER` role. To set up the first administrator, register the intended account through the web app, then run this command once from the `certification/` directory:

```powershell
npm run bootstrap:super-admin -- --email admin@example.com
```

The command can only assign `SUPER_ADMIN` to an existing account, records the one-time bootstrap in the database, and refuses to run after an administrator has been assigned. No public promotion endpoint exists. Refresh the account session to load its new permissions.

## Course management

Administrators with `admin:courses:manage` can create and edit draft courses, modules, VIDEO/PDF/TEXT lessons, and a course quiz in the web course builder. Course outline reorder requests must include every existing child ID exactly once and are applied in a transaction. Publishing requires at least one module and one lesson; a required quiz must also have valid questions and answer keys. Published courses are read-only until unpublished; archived courses can be restored as drafts. Public catalogue and course-outline endpoints return published courses only. Learners can enroll idempotently in a published course, see it on their dashboard and My Courses, open its outline, and resume at the last lesson they opened. Admins upload source media directly to R2; workers validate PDFs and transcode videos to private HLS renditions. The learner API grants temporary media URLs only for enrolled learners in published courses.

Lesson progress is saved per learner. Video completion counts unique watched ranges and resumes from the last acknowledged position; admins configure each course's completion threshold (default 90%). Text lessons default to manual completion, with an option to complete on open. PDF lessons track that they were opened and use manual completion. Course percentage uses required lessons only; required quiz pass state also gates course completion. Native browser PDF page changes are not exposed to this app, so the LMS does not report a PDF page percentage.

Course quizzes support single choice, multiple choice, and true/false questions. The API scores weighted answers, keeps attempt history, allows unlimited retries, and retains any passing result. Learner quiz reads do not include correct answers; submitted results include answer feedback. Quiz content locks after a first attempt to preserve score history. Required quizzes gate course completion using the configured pass percentage.

Media upload configuration, R2 bucket CORS, and worker FFmpeg requirements are in [`docs/MEDIA_STORAGE_SETUP.md`](docs/MEDIA_STORAGE_SETUP.md). Media processing uses an additive schema migration. Certificate issuance uses the private R2 bucket and `WEB_ORIGIN` for QR verification links. Automated media/certificate acceptance suites were not run.

Certificate generation, public verification, private downloads, retry, and revocation operations are documented in [`docs/CERTIFICATES.md`](docs/CERTIFICATES.md).

Admin metrics, active learner definition, paginated learner/course/certificate views, progress details, and certificate audit views are documented in [`docs/ADMIN_ANALYTICS.md`](docs/ADMIN_ANALYTICS.md).

Production container deployment, secrets, health checks, backups, and the isolated restore procedure are documented in [`docs/PRODUCTION_RUNBOOK.md`](docs/PRODUCTION_RUNBOOK.md).

Phase 11 implementation evidence and remaining operator launch gates are tracked in [`docs/PHASE11_HANDOFF.md`](docs/PHASE11_HANDOFF.md).

See [`docs/PHASED_IMPLEMENTATION_PLAN.md`](docs/PHASED_IMPLEMENTATION_PLAN.md) for phase scope and current implementation evidence.

# Free Certification LMS: Repository Architecture Audit

**Audit date:** 6 October 2026  
**Scope:** Read-only inspection for planning; no LMS implementation was started.

## Summary

The repository currently contains a substantial public marketing website, but no implemented learning management system. The LMS prompt describes a new product architecture, so the recommended approach is to add an isolated LMS workspace while preserving the existing site and its deployment path.

## Current repository state

| Area | Observed state | Consequence for the LMS |
| --- | --- | --- |
| `web/` | React, React Router, Vite, JavaScript/JSX, Tailwind, shadcn-style component configuration, and a static marketing-site build/deployment process. | Reuse visual conventions selectively. Do not convert or replace this app as part of LMS foundation work. |
| Authentication | `web/src/contexts/AuthContext.jsx` uses PocketBase email/password authentication; `web/src/lib/pocketbaseClient.js` configures the PocketBase client. | The LMS should have a simple server-owned email/password flow so authorization and sessions are enforced by its API, without depending on the marketing site's PocketBase client. |
| `backend/` | A newly present, uncommitted NestJS starter project with TypeScript, a basic app controller/service, and dependencies for Drizzle, PostgreSQL, Redis sessions, BullMQ, S3-compatible storage, throttling, Helmet, and Pino. It contains no LMS domain modules or schema yet. It also has its own `.git` directory and is currently untracked by the parent repository. | This is a strong API foundation candidate. Before implementation, decide whether this starter becomes part of the LMS workspace or remains a separately versioned service. Preserve its nested repository state; do not move or absorb it blindly. |
| `admin_panel/`, `varsity/` | No tracked implementation files were found in these directories. | No existing admin LMS or structured course runtime was found there. |
| Root tooling | No root package/workspace configuration was found. The web app has its own `package.json` and lockfile. | Establish the LMS workspace independently, with its own dependency lock and commands. |
| CI | `.github/workflows/lms-ci.yml` runs from `certification/_lms/`, which was not present during this audit. | Align the workflow path with the actual LMS workspace before relying on it. |
| Course-related content | The marketing site has public course pages and course-related content, but no structured course/module/lesson database was found. | Treat public copy as editorial reference, not as ready-to-import LMS curriculum. |

The working tree already contained a modified homepage component and three untracked image assets when inspected. Keep those user changes intact during future LMS work.

## Architecture recommendation

Create a separate `certification/` workspace at the repository root. Keep the current `web/` app as the public marketing site. The LMS workspace contains one React/TypeScript frontend for student and admin routes, a NestJS modular-monolith API, and a worker process for asynchronous media and certificate tasks. The existing `backend/` NestJS starter appears reusable, but its separate uncommitted Git repository means its ownership and integration path must be settled before files are moved or copied. The default recommendation is to establish `certification/` as the LMS workspace and reuse `backend/` as a reviewed source for configuration and bootstrap patterns, not as an automatic filesystem move.

```text
certification/
  apps/
    web/                 # React + TypeScript + Vite, student and admin routes
    api/                 # NestJS REST API
    worker/              # BullMQ media and certificate workers
  packages/
    shared/              # shared API schemas and types
    config/              # shared TypeScript, lint, and build configuration
  drizzle/               # schema and migrations
  docs/
  docker-compose.yml
  .env.example
  package.json
  package-lock.json
```

This keeps LMS dependencies and production configuration away from the marketing site's existing toolchain. The current `backend/` starter has several matching dependencies, so compare its versions/configuration and adopt only what fits. Update the LMS CI workflow to run from `certification/` after this structure is accepted and created.

## Main design decisions

1. **One LMS frontend, two protected areas.** Student and admin pages share an application; backend guards enforce access. The marketing site remains a separate frontend.
2. **Modular monolith.** Keep auth, courses, learning, media, quizzes, certificates, and administration in domain modules in one NestJS API. Do not introduce microservices.
3. **PostgreSQL is the permanent record.** Store people, courses, lessons, enrollments, progress, completions, certificates, and audit records in PostgreSQL through Drizzle migrations.
4. **Redis is for short-lived and queued work.** Use Redis for rate-limit state, server sessions if using a Redis session store, BullMQ, and optional short-lived caches. Do not use it as the permanent course-data store.
5. **Object storage holds media and generated files.** Use private R2 objects and CDN delivery for source media, HLS output, PDFs, thumbnails, and certificate PDFs. PostgreSQL stores object keys and metadata, not file contents.
6. **Completion rules live in backend services.** Required lesson state and required quiz results determine completion. Certificate issuance is idempotent and tied to an immutable completion record.
7. **Preserve public content and claims.** Public marketing course descriptions are not permission to create new course credentials, promises, or course content in the LMS.

## Initial data model map

| Domain | Tables | Important rules |
| --- | --- | --- |
| Identity and access | `users`, `sessions` (if session metadata is needed), `roles`, `permissions`, `user_roles`, `role_permissions` | Store a password hash, never a password. Enforce roles and permissions in NestJS. Keep active server sessions in the selected session store. |
| Courses | `courses`, `course_modules`, `lessons` | Keep explicit module and lesson ordering, publication state, lesson type, and required status. |
| Media | `media` | Store provider/object keys, status, metadata, duration, and processing errors; never store video bytes in PostgreSQL. |
| Enrollment and learning | `enrollments`, `lesson_progress` | Unique `(user_id, course_id)` enrollment and `(user_id, lesson_id)` progress; watched video ranges, resume positions, opened state, and completion are persisted per learner. |
| Quizzes | `quizzes`, `questions`, `question_options`, `quiz_attempts`, `quiz_answers` | Keep question types and scoring rules explicit; avoid returning correct answers before submission. |
| Completion and certificates | `course_completions`, `certificates` | Enforce one completion/certificate issuance per eligible completion; use a secure internal UUID in addition to a public certificate ID. |
| Audit | `audit_logs` | Record actor, action, target, metadata, and time; exclude secrets and authentication codes. |

Use foreign keys, uniqueness constraints, timestamps, and indexes based on actual read paths. Generate schema changes as Drizzle migrations. Password hashes should use a current, slow password hashing algorithm and be replaceable if the selected algorithm changes later.

## Initial API map

All endpoints use `/api/v1`.

| Area | Initial routes |
| --- | --- |
| Authentication | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /me` |
| Catalogue and student learning | `GET /courses`, `GET /courses/:slug`, `POST /courses/:id/enroll`, `GET /me/courses`, `GET /courses/:id/learning`, `PUT /lessons/:id/progress` |
| Quizzes | `POST /quizzes/:id/attempts`, `POST /quiz-attempts/:id/submit` |
| Certificates | `GET /me/certificates`, `GET /verify/:certificateId` |
| Administration | Dashboard, course/module/lesson CRUD and publishing, upload authorization/completion, student search, certificate search, and revocation endpoints under `/admin/*` |

Return a standard error envelope with a stable code, readable message, and request ID. Apply pagination and query limits to administration endpoints.

## Environment configuration to plan for

Exact names should be finalized with implementation, but `.env.example` should cover:

- App runtime, web origin, API port/base URL, cookie domain, and log level.
- PostgreSQL application and migration connections; Redis connection.
- Session and CSRF secrets, plus password-hashing configuration if it is not fixed by the application.
- R2 account, bucket, endpoint, credentials, and CDN/public hostname.
- Worker queue configuration and FFmpeg runtime configuration where it is not fixed by the container.
- Certificate issuer, public verification base URL, and generated-file storage settings.
- Optional Sentry DSN.

Never commit actual values. CI should use dedicated disposable credentials and production secrets should be injected by the deployment environment.

## Main risks and open decisions

- Choose the session store and password hashing library before Phase 2. Add password recovery later only when an email delivery provider and recovery policy are selected.
- Decide the LMS deployment topology and cookie domain before finalizing CORS, CSRF, and session-cookie settings.
- Protect HLS manifests and every referenced segment with a coherent temporary authorization method; protecting only the playlist is insufficient.
- Define video watched-range rules before the progress UI is built so seeking cannot satisfy completion.
- Certificate naming, issuer wording, and learner-name source need product decisions before PDF templates are finalized.
- Establish backup and restore procedures for PostgreSQL and private object storage before production launch.
- The existing LMS CI workflow points to a missing directory; leaving it as-is will make the foundation pipeline misleading or unusable.
- The NestJS starter in `backend/` configures observability with placeholder app-key and app-secret values. Make telemetry configuration environment-driven or disable it until valid credentials are supplied; do not treat the starter placeholders as production configuration.


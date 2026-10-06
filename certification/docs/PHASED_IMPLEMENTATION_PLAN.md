# Free Certification LMS: Phased Implementation Plan

This plan applies the product requirements in the supplied master prompt to the repository audited in [`ARCHITECTURE_AUDIT.md`](./ARCHITECTURE_AUDIT.md). It adds the LMS as a new workspace and preserves the existing public marketing site. The repository now also contains an uncommitted NestJS starter in `backend/` with its own `.git` directory. Phase 1 must settle how its code and Git ownership relate to the LMS workspace before moving or copying any files.

## How to use the phases

Each phase should produce a usable, reviewable slice of the product. Work begins by checking the current branch and worktree, identifying existing files that the phase touches, and stating the intended changes. At the end, run the relevant typecheck, lint, build, migration checks, and critical-flow checks for that phase; fix failures before moving on. Do not start a dependent phase while its exit gate is failing.

Phase estimates are intentionally omitted until deployment choices and curriculum scope are known. The order describes dependencies, not calendar duration.

## Phase map

| Phase | Product outcome | Depends on |
| --- | --- | --- |
| 1. Foundation | A bootable, validated development workspace and database/API skeleton | None |
| 2. Authentication | Learners can register and sign in with email/password and a basic server session | Phase 1 |
| 3. Authorization | Backend roles protect admin capabilities | Phase 2 |
| 4. Course management | Admins can create and publish structured courses | Phases 1 and 3 |
| 5. Enrollment and learner experience | Learners can enroll and navigate lessons | Phases 2 and 4 |
| 6. Media pipeline | Admin video uploads become playable protected HLS media | Phases 1, 3, and 4 |
| 7. Progress and completion | Progress resumes reliably and completion follows defined rules | Phases 5 and 6 |
| 8. Quizzes | Optional or required quizzes contribute to course completion | Phases 4 and 7 |
| 9. Certificates | Eligible learners receive verifiable, revocable certificates | Phases 7 and 8 |
| 10. Admin and analytics | Admins can search records and see core operating counts | Phases 3–9 as needed |
| 11. Production hardening | The system is ready for controlled production operation | All launch-critical phases |

## Phase details

### Phase 1 — Foundation

**Purpose:** Establish the isolated LMS workspace without changing the existing marketing site's build or deploy behavior.

**Work:** First inspect and record the ownership/integration decision for the existing `backend/` NestJS starter; do not relocate it automatically because it has a separate uncommitted Git repository. Then create or adapt the LMS workspace with `certification/apps/web`, `apps/api`, `apps/worker`, shared packages, Drizzle configuration, Docker development services for PostgreSQL and Redis, strict TypeScript settings, lint/build commands, environment validation, structured logging, request IDs, and a health endpoint. Reuse suitable NestJS bootstrap/config patterns and dependencies after review. Make observability credentials environment-driven or disable that integration until real credentials are configured. Align `.github/workflows/lms-ci.yml` with the chosen workspace. Add a safe example environment file.

**Deliverable:** Developers can start the API, frontend, worker shell, PostgreSQL, and Redis locally with documented commands. The API health route reports service readiness without leaking configuration.

**Exit gate:** Clean dependency installation, database connectivity, migration command availability, typecheck, lint, frontend build, API build, worker build, and CI all pass. No marketing-site files or behavior were changed by the foundation work.

### Phase 2 — Authentication

**Purpose:** Provide straightforward email/password sign-in backed by the LMS API.

**Work:** Implement email registration, email/password login, password hashing, login rate limits, secure HttpOnly cookie sessions, logout, `/me`, and authentication guards. Use CSRF protection that matches the deployment's cookie and origin design. Keep the initial flow small: no OTP, second factor, or refresh-token system. Password reset can be added when an email delivery provider and recovery policy are chosen.

**Deliverable:** A user can register, log in, access `/me`, and log out. Raw passwords and session secrets never appear in logs; only a password hash is stored.

**Exit gate:** Verify registration, duplicate email, valid/invalid password, login rate limiting, session creation and revocation, cookie attributes, CSRF behavior, and that unauthenticated requests are rejected. Pick a slow password hashing algorithm and session store before beginning this phase.

### Phase 3 — Authorization

**Purpose:** Establish enforceable user roles and permissions before building admin features.

**Work:** Add roles, permissions, role assignments, NestJS authorization guards/decorators, admin route policies, student route policies, and frontend route handling. Provide a one-time controlled bootstrap for the initial `SUPER_ADMIN`; never create a public endpoint that can promote an arbitrary user.

**Deliverable:** A minimal admin screen shell and API routes demonstrate that student and admin permissions are enforced server-side.

**Exit gate:** Requests without a session, with student role, and with permitted admin roles receive the expected allow/deny behavior. Changing frontend route visibility alone cannot grant access.

### Phase 4 — Course management

**Purpose:** Let authorized content staff prepare and publish courses.

**Work:** Add `courses`, `course_modules`, `lessons`, explicit ordering, statuses, required lesson flags, certificate/quiz configuration fields, course CRUD, module and lesson CRUD, draft/publish/archive transitions, and an admin course builder for VIDEO, PDF, and TEXT lesson records. Validate order updates transactionally.

**Deliverable:** An authorized admin can save a draft course with modules and lessons, reorder them, and publish/unpublish it. Public catalogue queries show only published courses.

**Exit gate:** Validate permission boundaries, slug uniqueness, ordering, invalid state transitions, and migration rollback strategy. Course text should be entered from approved curriculum; public marketing copy alone is not an approved credential or lesson specification.

### Phase 5 — Enrollment and learner experience

**Purpose:** Let a learner discover, enroll in, and navigate a course.

**Work:** Build course catalogue/detail pages, idempotent free enrollment with a database uniqueness constraint, dashboard, My Courses, course player layout, lesson list, locked/current/completed states, profile shell, and continue-learning destination. Use TanStack Query for API state and responsive layouts for mobile.

**Deliverable:** An authenticated learner can enroll once, see the course on their dashboard, and open the correct next or last-accessed lesson.

**Exit gate:** Check duplicate enrollment requests, unpublished courses, unauthorized lessons, empty states, loading/error feedback, mobile navigation, and keyboard/focus behavior.

### Phase 6 — Media pipeline

**Purpose:** Process and serve large learning files without sending them through the API server.

**Work:** Create media records and statuses; issue scoped multipart/resumable R2 upload authorization; validate file size/type and upload ownership; enqueue completion jobs in BullMQ; process source videos with FFmpeg; create practical HLS renditions no larger than the source; create poster/duration metadata; store results privately; expose authorized playback information to eligible learners.

**Deliverable:** An admin can upload directly to R2 and observe processing state; an enrolled learner can play ready HLS media through temporary authorization.

**Exit gate:** Exercise upload interruption/retry, duplicate completion callbacks, invalid type/size, worker retries, failed processing, duplicate job delivery, CDN behavior, and authorization of both manifests and segments.

### Phase 7 — Progress and completion

**Purpose:** Resume lessons and derive accurate course progress from lesson records.

**Work:** Implement throttled video progress writes, resume position, watched-range accumulation or equivalent anti-seeking checks, configurable video completion threshold, PDF opened/page progress/manual completion, text sanitization and configured completion behavior, lesson state, and course progress derived from required lessons.

**Deliverable:** Learners see current progress and resume near their last position. Course completion is decided by backend business rules, not client claims.

**Exit gate:** Check seeking to the end, replayed ranges, pause/seek behavior, duplicate/out-of-order writes, optional lessons, zero-required-lesson handling, PDF completion, unsafe HTML, and concurrent progress updates.

**Implemented policy:** Video completion defaults to 90% of unique, server-recorded watched ranges; an admin can set the course threshold from 50% to 100%. The browser sends position checkpoints, while the API uses processed media duration, server elapsed time, the last acknowledged cursor, and merged non-duplicating intervals. A seek can update resume position but cannot credit the skipped interval. Text lessons default to manual completion, with an admin option to complete when opened. PDF lessons record that they were opened and require manual completion. The browser's native PDF viewer does not expose a reliable page-change API to the LMS, so page count is not represented. Lesson text is rendered as plain React text and is never interpreted as HTML.

Course progress is the percentage of required lessons complete; optional lessons do not affect it. A course with zero required lessons has 100% lesson progress. If the course requires a quiz, lesson progress may reach 100% while course completion remains pending for Phase 8. Completion and resume state are stored per learner and lesson; browser requests cannot directly set video completion.

### Phase 8 — Quizzes

**Purpose:** Add lightweight checks that can be optional or required by course configuration.

**Work:** Add quiz/question/options/attempt/answer tables and APIs for single choice, multiple choice, and true/false questions. Keep answer keys private until submission. Score attempts and persist pass/fail state using the configured threshold.

**Deliverable:** Authorized content staff can configure quizzes; learners can submit attempts and see results appropriate to the product policy.

**Exit gate:** Verify scoring, multiple selections, invalid option IDs, repeated submissions, attempt policy, passing thresholds, and the link between required quiz pass and course completion.

**Implemented policy:** One quiz is configured per course. Questions support single choice, multiple choice, and true/false, with weighted integer points. Learners must answer every question; a multiple-choice response is correct only when its selected set exactly matches the answer key, so there is no partial credit per question. Attempts are unlimited and retained; any passing attempt remains valid even if a later attempt fails. Quiz editing locks after the first attempt to preserve the original score key. The configured course pass percentage gates completion only when the quiz is required. Learner quiz reads omit correct-answer flags; the result endpoint reveals correct options only after that attempt has been submitted.

### Phase 9 — Certificates

**Purpose:** Issue certificates once per eligible completion and make them publicly verifiable.

**Work:** Add immutable completion records; generate a unique public certificate ID plus secure internal ID; enqueue idempotent PDF and QR generation; save certificate files to private object storage; implement student certificate list/view/download/share-ready metadata; add `/verify/:certificateId`; add admin search and revocation with reason, actor, and audit record.

**Deliverable:** A completed learner can download a certificate; anyone can verify its public fields; an administrator can revoke it and the public page then displays revoked status.

**Exit gate:** Verify exactly-once behavior under duplicate jobs/requests, ID collision handling, QR destination, privacy of verification response, PDF integrity, revocation audit, and reissue policy. Reissue should not be added until explicitly defined.

### Phase 10 — Admin and analytics

**Purpose:** Give administrators enough operational visibility to run the initial LMS.

**Work:** Add dashboard counts for users, enrollments, active learners, published courses, completions, and certificates. Add recent activity, paginated student/course/certificate tables, filters/search, progress and certificate details, and audit views.

**Deliverable:** Admins can locate a learner or certificate and inspect the relevant enrollment/completion state without loading full datasets into the browser.

**Exit gate:** Verify pagination, filtering, authorization, query limits, indexes for real search patterns, and consistency of dashboard definitions. Document what “active learner” means.

### Phase 11 — Production hardening

**Purpose:** Prepare the complete launch path and operational controls.

**Work:** Review production security headers, CORS, CSRF, cookie configuration, rate limits, upload validation, RBAC, input validation, API errors, Redis TTLs, PostgreSQL indexes, structured logs, request IDs, worker retry/backoff and failure visibility, database/object backups and restore drills, container builds, deployment/CI, and load-sensitive endpoints. Add monitoring integrations only where selected and configured.

**Deliverable:** A deployment runbook, documented secrets/configuration, recovery procedure, and release candidate with phase acceptance evidence.

**Exit gate:** Production build and migrations are reproducible; restore procedure is exercised; critical flows pass in the target-like environment; no secrets are in artifacts; and operators can identify API, database, Redis, and worker health.

## Cross-phase rules

- Keep database changes in Drizzle migrations. Stop and review before any destructive migration; never automate production data deletion.
- Keep API controllers thin and business rules in testable services.
- Use server-side permission checks for every protected operation.
- Keep video, PDF, and certificate file bytes out of PostgreSQL.
- Use retries and idempotency for background work, enrollment, completion, and certificate generation.
- Add only the minimum product surface in the prompt. Defer unrelated LMS features.
- At each phase boundary, report changed areas, checks run, results, open risks, and the next phase's dependencies.

## Implementation status

| Phase | Status | Evidence |
| --- | --- | --- |
| 1. Foundation | Complete locally on 6 October 2026 | Clean `npm ci`; lint, typecheck, and production build pass; Drizzle migration check passes; Compose Postgres and Redis became healthy; compiled API health endpoint returned both dependency checks as `ok`; worker connected to Redis; Vite returned HTTP 200. The GitHub Actions workflow was updated to run the same foundation gates from `certification/`. |
| 2. Authentication | Complete locally on 6 October 2026 | Added users migration, scrypt password hashes, Redis-backed opaque server sessions, CSRF protection, IP/email rate limits, register/login/logout/`/me` API, and learner auth screens. Local smoke flow confirmed registration, duplicate-email conflict, invalid CSRF rejection, bad and good login, `/me`, session revocation, and cookie attributes. Typecheck, lint, migration apply/check, and production builds pass. Auth cookies, authorization, and CSRF headers are redacted from logs. OTP, second factor, and password reset are outside this phase. |
| 3. Authorization | Implemented locally on 6 October 2026 | Added and applied roles/permissions/assignments migration, assigned existing accounts the LEARNER role, enforced permission checks on learner/admin API dashboards, included roles/permissions in `/me`, and added learner/admin frontend route handling plus an admin shell. Typecheck, lint, migration check/apply, and production builds pass. Initial SUPER_ADMIN assignment is a documented one-time operator command; no user was promoted automatically. Automated authorization suites were not run. |
| 4. Course management | Implemented locally on 6 October 2026 | Added courses/modules/lessons schema and migration, course settings and lifecycle, transactional outline reordering, permission-protected admin CRUD, published-only public catalogue/detail routes, and admin course builder/catalogue pages. Typecheck, lint, migration check/apply, and production builds pass. Automated course acceptance suites were not run. |
| 5. Enrollment and learner experience | Implemented locally on 6 October 2026 | Added unique idempotent learner enrollment and last-access persistence, authenticated learner APIs, dashboard enrollment cards, My Courses, course outline/player navigation, TEXT lesson rendering, VIDEO/PDF player slots, and profile shell. Migration check/apply, typecheck, lint, and production build pass. Enrollment and lesson access require a valid session and learner permission. Completion states remain in Phase 7; automated acceptance suites were not run. |
| 6. Media pipeline | Implemented locally on 6 October 2026; R2 configuration required for external upload/playback | Added media asset/status migration, authenticated multipart upload authorization and finalization, ownership/type/size/signature checks, idempotent BullMQ jobs with recovery and retries, PDF validation, FFmpeg probing/posters/adaptive HLS output size enforcement, private signed learner delivery, and admin upload status/retry UI. Typecheck, lint, migration check/apply, and production build pass. R2 credentials/CORS and FFmpeg installation are deployment configuration documented in `docs/MEDIA_STORAGE_SETUP.md`; live R2/FFmpeg end-to-end processing was not run. Automated media acceptance suites were not run. |
| 7. Progress and completion | Implemented locally on 6 October 2026 | Added watched-range lesson progress, cursor-checked server writes, resume position, course video threshold and text completion settings, manual PDF/TEXT completion, opened state, required-lesson course summaries and persisted enrollment completion. Learner screens now show lesson/course progress and resume playback. Phase 8 required quizzes continue to gate course completion. Migrations are applied; Drizzle consistency check, typecheck, lint, and production build pass. Browser/media playback acceptance and automated suites were not run. |
| 8. Quizzes | Implemented locally on 6 October 2026 | Added quiz/question/option/attempt/answer tables, protected admin authoring, required-quiz publish validation, safe learner quiz reads, server-side weighted scoring, unlimited retained attempts, pass history, learner quiz UI, and required-quiz course completion updates. Migration, Drizzle consistency check, typecheck, lint, and production build are checked for this implementation; browser acceptance and automated suites were not run. |
| 9. Certificates | Implemented locally on 6 October 2026 | Added immutable per-learner course completion snapshots and one certificate per completion, collision-resistant public IDs, audited issue/revocation/failure events, a recoverable BullMQ PDF/QR worker, private R2 storage, learner listing/download authorization, public verification, and admin search/revoke/retry screens. R2 must be configured for generated PDFs and downloadable files. Migration, Drizzle consistency check, typecheck, lint, and production build are checked for this implementation; live R2/worker generation and browser acceptance were not run. |
| 10. Admin and analytics | Implemented locally on 6 October 2026 | Added bounded metrics and recent activity APIs, searchable and paginated student/course/certificate tables, learner/course progress details, certificate details and audit views, plus recency indexes. Active learner is defined as an enrolled user with course access in the prior 30 days. Migration apply/check, typecheck, lint, and production build pass for this implementation; browser acceptance and automated suites were not run. |
| 11. Production hardening | Implemented locally on 7 October 2026 | Added production API/worker/web container builds, a private-network Compose deployment with Redis auth and health checks, explicit migration job, runtime config validation, bounded database pools and media processing, privacy-safe request logging, worker readiness, PostgreSQL backup/restore scripts, and deployment/recovery runbook. CI now targets Node 24 and builds all release images. Lint, typecheck, migration journal, compose config, all three image builds, and an isolated synthetic PostgreSQL backup/restore drill passed. Real R2 object recovery and staging launch-flow evidence require operator-configured infrastructure; see `docs/PHASE11_HANDOFF.md`. |

The Phase 2 migration creates the users table, Phase 3 adds authorization data, Phase 4 adds course content tables, Phase 5 adds enrollments, Phase 6 adds media records, Phase 7 adds lesson progress and completion settings, Phase 8 adds quiz content and learner attempts, Phase 9 adds completion snapshots and certificate/audit records, and Phase 10 adds recency and event-order indexes. These migrations are additive. Any rollback that would remove authored course, learner, media, or certificate metadata requires an operator-reviewed backup/restore or explicit data migration; no automatic destructive rollback is provided. The full npm audit reported four moderate development-tool dependency advisories during Phase 1; the production dependency audit reported zero vulnerabilities. Automated test suites were not run.


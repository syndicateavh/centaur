# Phase 3 — identity and enrollment operations

## Internal architecture

- Better Auth runs inside the Next.js app and stores users, password hashes, sessions, verification tokens, and database-backed rate limits in the LMS PostgreSQL database. No hosted identity, learner-data API, or email API is used.
- The browser receives Better Auth's secure, HTTP-only session cookie. Learner pages call the server session validator; server actions derive the learner ID from that session and ignore client-supplied learner IDs. Sign-up and sign-in pages render at request time so the deployment auth gate is not frozen into a production build. After login, only the allowlisted `/dashboard` or `/account` return path is accepted.
- The app uses the `lms_app` PostgreSQL login. Migrations use the separate database-owner login. The runtime role is created as `NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT` and has only application table grants.
- Learner-owned queries run in a transaction with `lms.current_learner_id` set from the verified server session. PostgreSQL row-level security blocks accidental cross-learner reads and writes. The app role cannot bypass RLS.
- `lms.user_roles` is the permission source of truth. `requireRole()` and `requireAdmin()` first validate the Better Auth session and verified email, then check the role row under the caller's row-level-security context. Admin roles cannot be self-assigned by sign-up; role changes and privileged course operations require later, audited admin tooling (Phase 7).

## Local development

1. Copy `.env.example` to `.env` and `.env.migration.example` to `.env.migration`; keep both files out of source control. `.env` contains only runtime settings. Docker Compose binds PostgreSQL and the app only to localhost.
2. Start with `docker compose up`. The one-shot `migrate` service receives the owner connection, applies migrations, and seeds one fictional `is_sandbox` course before the app starts. The long-running app receives only the runtime `lms_app` database URL. The seed command refuses a non-development environment or database name other than `centaur_lms`.
3. Create an account at `/sign-up` with an email address reserved for local testing. The app writes verification/reset messages to `.dev-mail/` instead of contacting an email system.
4. Open `/admin` → “Open local auth mail previews” to follow a one-time verification or reset link. These links can control the matching local test account; never expose this dev-only page on a shared or public server.
5. Verify sign-in, password reset, account settings, deletion request, dashboard, and duplicate-safe sandbox enrollment. The sandbox is explicitly not a real course and has no learning content, assessment, or certificate.

## Database and authorization checks

- `npm run db:migrate` applies immutable, checksummed SQL migrations with `MIGRATION_DATABASE_URL`; host-side scripts read that from ignored `.env.migration`. `npm run db:migrate:check` verifies no migration is pending or edited.
- Set `LMS_AUTHZ_TESTS=true` and run `npm run db:authz:check` only for the isolated local/CI database. The script reads the ignored local `.env` when connection variables are absent, creates and cleans up synthetic users, confirms the runtime role is not privileged, tests that an anonymous database context sees no learner rows, checks cross-learner reads, updates and inserts, and rejects self-assigned admin roles.
- Run `npm run auth:routes:check` against a successful production build. It verifies anonymous learner-page redirects and that the registration API returns not found when production identity is disabled.
- CI uses separate migration-owner and runtime PostgreSQL connections and runs the access-control check before lint/typecheck/build.
- RLS is defense in depth. Server authorization still must validate sessions and roles, use parameterized SQL, and scope each request to the identity obtained from the server-side session.

## Mail and deployment gate

- Local development mail uses ignored files under `.dev-mail/`; previews include one-time links and must remain reachable only through the localhost-bound development service.
- Outside local development, identity routes are disabled unless `LMS_AUTH_ENABLED=true`, `BETTER_AUTH_SECRET` is at least 32 characters, `BETTER_AUTH_URL` is HTTPS, and the approved internal SMTP relay is configured. No public registration should be enabled until product/privacy decisions and a controlled HTTPS staging host have been approved.
- SMTP is configured with `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, and `SMTP_FROM`; optional authentication uses `SMTP_USER` and `SMTP_PASSWORD`. These deployment secrets are not committed.
- Account deletion currently records a request for an operator. It does not automatically delete accounts, certificates, or audit records; retention/deletion rules and the restricted admin workflow remain Phase 7 decisions.

## Scope boundary

The live financial-operations masterclass remains separate. Proposed tracks are not enrollment-ready courses. Phase 3 adds the internal identity/data/enrollment substrate and a fictional sandbox only; approved curriculum, progress player, grading, completion rules, certificate issuance, and public verification remain later phases.

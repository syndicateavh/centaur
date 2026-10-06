# Production deployment and recovery runbook

This is the reference single-host Compose deployment for the LMS. It is designed to sit behind an independently managed TLS reverse proxy. It is not a high-availability topology: the host, Docker volumes, and operator-managed backups remain availability dependencies. For a multi-host launch, use managed PostgreSQL/Redis and a separately operated container registry and proxy.

## Network layout

- Only the `web` container publishes a host port, bound to `127.0.0.1` (default `8080`). Put a TLS proxy such as the organization’s ingress proxy in front of it.
- Nginx serves the SPA and forwards `/api/` to the private API container. The browser uses the same HTTPS origin for both, so session cookies remain first-party.
- API, worker, PostgreSQL, and Redis have no published host ports. Redis requires a password; Postgres is reachable only on the Compose network.
- The API health check includes PostgreSQL, Redis, and a recent worker heartbeat. A missing or stale worker therefore makes API readiness fail.
- Configure the outer proxy to set `X-Forwarded-Proto: https`, preserve the host, forward the client address, and enforce HTTPS. Set `TRUST_PROXY_HOPS` to the exact number of trusted proxy hops (two for outer TLS proxy → Nginx → API). Recalculate if the topology differs.

## Secrets and production configuration

1. Install Docker Engine with the Compose plugin and the PostgreSQL client utilities (`pg_dump`, `pg_restore`, `psql`) on the operations host. Provide encrypted off-host storage for backups.
2. Copy `.env.production.example` to `.env.production`. Generate distinct random secrets, for example `openssl rand -hex 32`, for Postgres and Redis. Use those same values in their URL credentials. Hex avoids reserved URI characters; URL-encode any other characters placed in a connection URL.
3. Set real public HTTPS origins and `VITE_API_BASE_URL=https://academy.example.com/api/v1`. Vite embeds this URL at image build time. Changing it requires rebuilding the web image.
4. Configure a private R2 bucket, bucket-scoped credentials, and the browser CORS policy in [`MEDIA_STORAGE_SETUP.md`](MEDIA_STORAGE_SETUP.md). Do not use public bucket access. Production config parsing rejects HTTP origins, non-TLS R2 endpoints, and missing storage credentials.
5. For managed Postgres, use its TLS connection URL and verify the provider certificate (for example `sslmode=verify-full`). The bundled Postgres reference service is on a private Compose network; `sslmode=disable` in the example is only for that container network. For managed Redis, use `rediss://` and remove the bundled service dependency when adapting Compose.
6. Restrict `.env.production` to the deployment account (`chmod 600` on Linux). Keep it out of source control, image build contexts, logs, and CI artifacts. Rotate credentials through the provider and deployment secret store, then restart affected services.

## First deployment and routine release

Run from this directory on the production host. Review the git revision and `.env.production` before each release. CI builds all three runtime images; deploy the same reviewed commit that passed CI.

```sh
docker compose --env-file .env.production -f docker-compose.production.yml config --quiet
docker compose --env-file .env.production -f docker-compose.production.yml build --pull
docker compose --env-file .env.production -f docker-compose.production.yml up -d postgres redis
docker compose --env-file .env.production -f docker-compose.production.yml --profile ops run --rm migrate
docker compose --env-file .env.production -f docker-compose.production.yml up -d api worker web
docker compose --env-file .env.production -f docker-compose.production.yml ps
```

Migrations are an explicit release step and are never run automatically when the API boots. Review generated migrations before release; the repository migrations are additive. Keep the previous application images available until health and critical flows are checked. Restart into the prior image revision if an application release fails; use a database restore only for actual data loss or an operator-reviewed recovery.

Verify:

- `https://academy.example.com/api/v1/health` returns `status: "ok"`, including database, Redis, and worker checks.
- Registration/sign-in, session persistence, sign-out, CSRF rejection, learner course access, and one admin permission-gated operation work through the public HTTPS origin.
- A media upload and worker processing attempt succeed against the production R2 bucket before enabling course publishing. Confirm private playback is authorized for an enrolled learner and denied to an ineligible user.
- `docker compose ... logs --since=15m api worker` shows readiness and job outcomes without cookies, auth headers, request bodies, or query strings.
- HTTPS redirect, cookie `Secure`/`HttpOnly` attributes, browser CORS, CSP, and static asset loading work from the public hostname.

Use `docker compose ... ps`, the health endpoint, and `docker compose ... logs api worker` to diagnose service health. Worker failures have BullMQ retries/backoff and structured error events; final media failures are stored on the media record and surfaced in admin media status. Check `worker.media_job_failed`, `media.queue_recovery_failed`, `worker.heartbeat_failed`, `worker.redis_error`, and certificate job failure events. Avoid logging signed media URLs or full environment output.

## PostgreSQL backups

Set a protected `DATABASE_URL` in the operator environment and run `scripts/backup-postgres.sh` on a host with matching PostgreSQL client tools. The script writes a permission-restricted custom-format dump, validates its archive listing, and publishes the file atomically only after validation:

```sh
umask 077
export DATABASE_URL='postgresql://...'
BACKUP_DIR=/var/backups/centaur-lms scripts/backup-postgres.sh
```

Copy verified files off the application host to encrypted storage with retention and access controls. Keep backup credentials separate from the app's DB user where possible. Set and monitor a backup schedule appropriate to the accepted recovery point objective; at minimum take a pre-migration backup and a daily backup. Alert on missed backups and insufficient destination capacity. The local Compose volume is not a backup.

## R2 object backups

Database metadata alone does not recover video sources, HLS renditions, posters, or certificate PDFs. Configure a separate encrypted object-store copy/replication policy for the private R2 bucket, covering the whole bucket and preserving object keys. Use a destination with independent credentials, access controls, and retention. Monitor last successful replication and test retrieval of a sample source, HLS segment, and certificate. Do not make the source bucket public during recovery. Coordinate object and database backup timestamps and document the accepted recovery point gap; writes after the selected database snapshot may need object reconciliation.

## Restore drill and recovery

Perform drills at launch and quarterly, using an isolated, newly created recovery database and a non-production recovery environment. Never point the script at the live application database. The restore script requires an explicit confirmation string and refuses a target that contains application tables, views, sequences, or foreign tables.

```sh
export RESTORE_DATABASE_URL='postgresql://...@recovery-postgres:5432/centaur_lms_restore'
export RESTORE_CONFIRM=I_CONFIRM_EMPTY_TARGET
scripts/restore-postgres.sh /var/backups/centaur-lms/centaur-lms-YYYYMMDDTHHMMSSZ.dump
```

After restore, verify the reported core table counts, run `npm run db:check` to check the checked-in migration journal, query the restored `drizzle.__drizzle_migrations` table to confirm the applied migration set, inspect a learner enrollment and certificate audit record, and start a recovery API/worker against that database with a separate Redis namespace. Retrieve representative R2 objects from the replica and verify certificate download and private media authorization. Record backup timestamp, restore duration, counts, object checks, recovery point gap, and follow-up actions. Do not route users or workers to the isolated drill stack.

For an incident, stop writes or isolate the affected app, preserve logs and the current database snapshot, determine the last consistent database/object recovery point, and notify the incident owner. Restore into a new empty database; validate it before changing the application connection URL. Keep the damaged database and original backup unchanged for investigation. Restore object keys from the replica only into a controlled recovery bucket/prefix, validate them, then switch credentials/configuration as a separately reviewed operation. Rotate credentials if exposure is suspected. Record all changed endpoints and recovery actions.

## Capacity, visibility, and known launch choices

- `DATABASE_POOL_MAX` configures each database client (default 10). The worker currently creates separate media and certificate database clients. Set it based on the full client count across API replicas and worker replicas, plus migration/operator clients.
- `MEDIA_MAX_UPLOAD_BYTES` defaults to 1 GiB in the production Compose stack (local development defaults to 5 GiB); `MEDIA_UPLOAD_PART_BYTES` and `MEDIA_MAX_DURATION_SECONDS` bound multipart size and video duration. The worker has an 8 GiB memory cap and a 6 GiB temporary filesystem, sized for its two-job concurrency at the default upload cap. FFmpeg/FFprobe child processes also have a six-hour hard timeout. If increasing the upload limit, raise worker temporary storage and memory based on `2 × concurrency × max upload size`, plus FFmpeg overhead, and profile representative media first.
- API JSON/urlencoded bodies are limited to 1 MiB because media bytes go directly to R2. Nginx repeats that request body limit. Session/CSRF cookies are first-party, HttpOnly for the session, Secure in production, and protected by same-site policy and the global CSRF guard on state-changing requests.
- Authentication rate limits use Redis-backed IP and normalized-email counters. There is no general global API request limiter; add one only with endpoint-aware limits so HLS segment and signed object traffic is not accidentally blocked.
- Logs are structured JSON with request IDs. Query strings and request/response payloads are omitted from request logs; cookie, authorization, and CSRF headers are redacted. Retain logs according to the organization’s privacy policy and forward them to its selected log platform.
- Health checks are readiness signals, not a monitoring service. Connect them and container restarts to the chosen host monitor and alert on unhealthy status, backup/replication lag, disk use, repeated queue failures, and certificate/media failures. No third-party monitoring credentials are assumed by this repository.
- Search filters using substring matching and the analytics recency indexes are documented in [`ADMIN_ANALYTICS.md`](ADMIN_ANALYTICS.md). Recheck query plans and connection use with production-like data before increasing traffic.

## Release evidence to retain

For each release, retain commit ID, CI run, image IDs/digests, migration output, health/critical-flow verification, backup reference, and any rollback decision. For each restore drill, retain its completion record described above. CI runs dependency installation, schema check, migrations, lint, typecheck, production builds, and builds all three production container images. It does not publish images, run browser acceptance suites, or deploy to production.

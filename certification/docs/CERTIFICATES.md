# Certificate issuance and operations

Certificates are issued when the server confirms all required lessons are complete and, when configured, the learner has a passing quiz attempt. A unique course completion snapshot is retained per learner/course. It records the learner and course names as they stood at completion, so later profile or course edits do not rewrite an awarded credential.

## Generation and storage

Certificate PDF generation runs in the LMS worker through BullMQ. The worker creates a landscape PDF with the learner, course, completion and issue dates, public certificate ID, and a QR code to the public verification page. PDFs are written to the configured private R2 bucket; object keys are never returned to learners. Jobs retry with exponential backoff, and a periodic worker scan re-enqueues pending or stale processing records after restarts. A failed job is visible to administrators and can be retried from Admin → Certificates.

Set `WEB_ORIGIN` to the public web application origin so QR codes point to the deployed verification page. Configure the same private `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY` values for the API and worker. No public bucket access is needed. The API gives the certificate owner a 60-second signed download URL after checking ownership and ready status.

## Verification and revocation

Public verification routes use `/verify/:publicCertificateId`. They return only the public certificate ID, learner name snapshot, course title snapshot, completion/issue dates, and a validity status; email, internal database IDs, and revocation reasons remain private. QR codes resolve to `WEB_ORIGIN/verify/:publicCertificateId`.

Administrators with `admin:courses:manage` can search by public ID, learner, email, or course; retry failed PDF generation; and revoke a certificate with a recorded reason. Revocation records the acting administrator and timestamp, changes public verification immediately, blocks new downloads, and attempts to delete the private PDF. Existing signed URLs expire within 60 seconds. Revocation is terminal; this phase does not implement reissue. A new course completion is not created by retrying generation.

## Database rollout

Apply the additive Drizzle migration with `npm run db:migrate`. Confirm migration consistency with `npm run db:check`. The new completion, certificate, and audit records use restrictive foreign keys to preserve audit history; take normal database backups before production rollout. Configure R2 and `WEB_ORIGIN` before expecting learner downloads or QR verification links to work.

Live R2 upload/generation and browser acceptance were not exercised during local implementation. Typecheck, lint, production build, local migration apply, and Drizzle checks provide the local validation evidence.

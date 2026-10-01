# Phase 7: admin operations, support, and launch readiness

## Protected staff workflows

- `/admin/courses` requires the `admin` or `course_editor` role. Course editors can create a draft course, add modules and text lessons, edit learning metadata and HTTPS source references, create a draft assessment from validated JSON, and append course/assessment review decisions.
- A published or retired non-sandbox course can be copied into a new draft version. Lessons, questions, and answer keys are copied server-side; publication and review states reset to draft/pending. Learner progress and old certificate snapshots stay attached to the original version.
- Publication requires a course approval and approval for every assessment, with a different reviewer and publisher. The database checks course objectives, sources, lesson content, assessment version hashes, question counts, answer choices, objective references, and lesson references. It publishes the version, lessons, and assessments in one transaction and writes an audit event.
- Publication may run now or at a future time. Future publication is handled by an internal scheduled command, not a public HTTP endpoint: `npm run ops:publish-scheduled`. Set `LMS_SCHEDULER_ACTOR_USER_ID` to an authorized administrator identity. The Compose one-shot service can run with `docker compose --profile operations run --rm scheduled-publisher`; an internal Windows Task Scheduler or Centaur-controlled host scheduler may invoke this command on a defined interval.
- `/admin/courses` retirement is administrator-only and reason-required. It retires the version and its assessments together. Existing learners retain access to their enrolled version; new enrollment stops. Historical attempts and certificates remain tied to that version.
- `/admin/operations` shows enrollment/completion totals, upcoming scheduled releases, open support requests, failed mail counts, certificate totals, and recent audit events. `/admin/certificates` retains the Phase 6 revoke/reissue controls.

Course and assessment content can still be authored through source-controlled imports when that is more appropriate than the text-first editor. A draft is never made learner-visible by the editor alone; publication must pass the database release function.

## Learner support and email delivery

Learners submit a support request from account settings. Requests are private to the learner and authorized `support`/`admin` roles. Staff can update status and a private note at `/admin/support`; all state changes are audited. The learner form warns against sending passwords, payment details, or bank/customer records.

The internal Nodemailer transport continues to use Centaur-approved SMTP only. Production records delivery state, message type, safe transport code, time, and an HMAC recipient fingerprint. It never records the address or one-time action URL. Administrators review failures at `/admin/mail-delivery`. Local development mail remains in the ignored `.dev-mail` directory.

Before production, configure and verify `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_FROM`, and, if required, `SMTP_USER`/`SMTP_PASSWORD` using the Centaur-owned relay. Keep values in the deployment secret store, never in Git or logs. Confirm relay authentication, TLS, allowed sender, and bounce handling with the mail owner.

## Privacy and retention proposal

The following are proposed starting limits for the data owner and privacy/legal reviewer to approve before real learners are accepted:

- Delete resolved support requests and their message text 12 months after resolution, unless a documented hold applies.
- Delete mail-delivery metadata after 90 days. Do not use fingerprints for marketing or identity matching.
- Retain security/admin audit events for 3 years, with access limited to administrators and a documented exception process.
- Keep earned certificate verification records while active and for the period the data owner approves after revocation. Never delete a certificate merely to conceal a revocation.
- Let learners request account deletion; review legal/operational holds, remove profile and learning data where allowed, and retain only approved certificate/audit evidence.

These values are policy proposals, not a legal determination. Before production, the data owner must approve purposes, periods, legal holds, access, deletion automation, and the certificate verification period. Until then, use synthetic data only.

## Security, accessibility, and release checks

Before inviting learners, the release owner should record evidence for each item:

1. Apply migrations from a clean database and confirm the `lms_app` role has only runtime permissions. Provision `admin`, `course_editor`, and `support` roles through the controlled database-owner procedure; learner self-service cannot grant staff roles.
2. Review authentication, consent versioning, email delivery, RLS, admin actions, assessment-key boundaries, certificate PDF ownership, public verification output, and rate limits. Run the repository authorization and anonymous-route checks against a disposable local database.
3. Complete keyboard, screen-reader, zoom, contrast, form error, and mobile review for learner and staff flows. Check published content PDFs and QR codes on common print sizes.
4. Run performance checks with representative course content and a small expected pilot load. Review server logs for accidental emails, URLs, tokens, learner messages, or assessment keys; logs must not contain them.
5. Configure HTTPS, internal network boundaries, production secrets, approved SMTP, encrypted backups, monitoring, support ownership, and an incident contact before enabling auth. The current repository does not select a production host or public subdomain.
6. Take a database backup before schema changes. Perform a restore drill in an isolated database, verify enrollments, progress, audit rows, active/revoked certificates, and public verification, and document measured recovery time.
7. For an incident, restrict staff sessions and affected routes, protect database/SMTP credentials, preserve relevant logs, involve the named security/privacy owner, assess learner impact, and restore only under the approved recovery procedure. Record decisions and follow the organization's notification process.

## Current completion gate

The protected code paths and runbooks are implemented. Migrations `0001`–`0009` applied on a clean temporary local PostgreSQL database, the authorization check passed using the restricted runtime role, and a verified synthetic local admin opened `/admin/operations`. Individual course publishing, support, certificate, SMTP-failure, and restore scenarios have not all been exercised. Production launch readiness is not asserted: the internal SMTP relay, retention approver, support owner, production host, backup owner, security reviewer, and accessibility reviewer have not been selected. The KYC/AML pilot remains sandbox and pending subject-matter review; it cannot be published through this workflow.

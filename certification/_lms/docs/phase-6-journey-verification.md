# Phase 6 journey verification

**Run date:** 2026-10-01  
**Environment:** local Windows development app and local PostgreSQL database  
**Data:** synthetic `example.invalid` accounts and a retired synthetic course. No staging service or real learner data was used.

This report records what was exercised locally. It does not approve a staging pilot or satisfy the Workstream F exit gate.

## Local journeys exercised

| Scenario | Result | Evidence |
| --- | --- | --- |
| Learner sign-up, email verification, sign-in, password reset, sign-in with the new password, sign-out, and anonymous dashboard redirect | Passed | Local development mail preview and HTTP route flow |
| Learner enrolls in a published course and starts then completes a lesson | Passed | Enrollment and progress persisted for the synthetic learner |
| Formative assessment failure and retake | Passed | Two submitted attempts persisted; the second records 100% and feedback. The formative assessment has no pass threshold, so its `passed` field remains false by design. |
| Final assessment failure, retake, and completion | Passed | First attempt 0%; second attempt 100% and passed; enrollment completion persisted |
| Certificate issuance, learner PDF download, and public verification | Passed | Download returned `application/pdf` (`%PDF` header); public verification returned active status without the learner email |
| Certificate revoke and eligible reissue | Passed | Original certificate is revoked; its replacement is active; audit events were written; public verification distinguishes both IDs |
| Learner support request and staff resolution | Passed | Synthetic request was submitted and changed from open to resolved with a staff note |
| Account deletion request | Passed after a fix | Initial action failed because an audit insert reused a UUID parameter for a text column; the action now binds the audit target separately and writes one audit record per newly created request. Retest redirected to the confirmation state. |
| Course creation, separate editor review, administrator publication, and retirement | Passed | Course version and assessments were approved by the synthetic editor, published by the synthetic administrator, and later retired; the existing enrollment remains complete |
| Admin route and role boundaries | Passed | Protected admin routes rendered for the administrator; the course editor could access course review and was denied operations; anonymous learner routes redirected |
| Migrations, assessment content, app build, lint, and TypeScript | Passed | Nine migrations current; six assessments / 25 questions structurally valid; build, lint, and typecheck succeeded |

All synthetic users in the local database use `example.invalid`. The `phase6-*` accounts, retired course, enrollment, support request, certificates, and audit entries are retained locally for inspection.

## Not verified locally / still required

- Pilot invitation redemption was not exercised. Controlled-pilot configuration and an approved cohort are not available in this local run.
- Scheduled publication, course-version replacement with an existing enrollment pinned to the old version, and denial of a new enrollment after retirement need a separate scenario.
- Assessment-attempt expiry is not represented in the current attempt flow/data model; define the intended expiry rule before testing it.
- SMTP delivery-failure ingestion and mail retry/alert behavior remain unverified.
- The local run did not perform a database backup restore drill. No staging upgrade copy or controlled restore target was available.
- Manual phone/tablet/desktop, keyboard, screen-reader, zoom/reflow, and print review remains necessary; automated build checks do not prove these outcomes.
- No Centaur-controlled staging host, HTTPS/SMTP configuration, monitoring owner, qualified content reviewer, approved learner cohort, or product-owner go/no-go record was available. Do not invite real learners or declare the Phase 6 exit gate passed until those items are completed and recorded.

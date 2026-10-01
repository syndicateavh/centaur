# Phase 8: controlled pilot launch

## What is implemented

- `LMS_CONTROLLED_PILOT=true` makes each new published-course enrollment require a live invitation for the signed-in learner's verified email. Existing enrollments remain accessible. Invitations are created at `/admin/pilot` and are course-specific with a maximum 90-day lifetime.
- The invite form immediately converts the normalized address to an HMAC fingerprint using `BETTER_AUTH_SECRET`. The address is not written to the LMS database, audit log, or invitation list. Reinviting refreshes an unredeemed invitation; a redeemed invitation cannot be reused.
- `/admin/pilot` reports invitations, enrollments, active and completed learners, lesson completions, submitted and passed assessment attempts, certificate issuance, optional feedback ratings, and open support requests. It does not display names or addresses or record public verification visits.
- Enrolled learners can submit one optional survey per course from the dashboard. It asks for overall experience, instruction clarity, confidence, issue categories, and optional comments. The survey warns learners not to include credentials, financial details, or customer information. Feedback is visible only to its author and LMS administrators.
- Metrics are derived from operational course records; there is no advertising, analytics, or third-party learner tracking integration.
- Feedback is account-bound to prevent duplicate surveys and permit the learner to see that it was submitted. Set and approve a retention period before real participation; the proposed starting point is deletion within 12 months after the pilot ends, subject to the data owner's policy and any required hold.

## Staging release steps

Complete these steps only on an approved Centaur-controlled staging environment with named service owners:

1. Create a private staging database and app deployment. Configure HTTPS, allowed origins, a unique 32+ character `BETTER_AUTH_SECRET`, the approved SMTP relay, private database networking, monitoring, backup retention, and a named incident/support owner. Keep staging behind the approved access boundary.
2. Deploy the LMS application and run `npm run db:migrate`, including `0009_controlled_pilot.sql`, with the database-owner migration credentials. Verify `npm run db:migrate:check` and the authorization/anonymous-route checks in the repository CI workflow.
3. Set `LMS_AUTH_ENABLED=true` and `LMS_CONTROLLED_PILOT=true` in the staging app environment. Restart the app and confirm `/api/health`, registration, verification email, sign-in, password reset, and staff authorization work through the staging URL.
4. Publish only a non-sandbox course after qualified content and assessment review, independent release approval, certificate wording approval, accessibility review, and the Phase 7 publication gates. The current KYC/AML seed remains a sandbox draft and is not eligible.
5. Create a small cohort in `/admin/pilot`. Share the staging URL and course instructions through a Centaur-approved channel. Learners register and verify the same email address that received the invitation; an invitation is redeemed when that learner enrolls.
6. Confirm the expected cohort counts, course access, support workflow, assessment completion, certificate PDF and verification response, failed-mail handling, and backup/restore evidence. A learner may submit one optional course feedback survey.
7. During each check-in, review the LMS's structured error logs and the staging gateway's request totals. Record aggregate error count/rate and safe error categories in the report; do not add learner identifiers, request bodies, emails, or tokens to log queries. Interview learners and reviewers only with appropriate consent; do not store interview recordings or notes in LMS fields. Track issue IDs and decisions in Centaur's approved internal project system.
8. At the agreed pilot end date, stop creating invitations, allow outstanding invitations to expire or remove them through the controlled database-owner procedure, resolve support requests, review retention, and write the pilot report and go/no-go recommendation before any broader release.

If `LMS_CONTROLLED_PILOT` is false, normal published-course enrollment remains open. Never deploy an invited-cohort staging environment with the flag unset. The flag controls enrollment access; it does not replace network access controls, authentication, or role checks.

## What the report should include

Use `pilot-report-template.md` after a real cohort has completed its review period. Record the reporting window, invited/redeemed/enrolled/completed totals, lesson completion, assessment pass outcomes, feedback response and rating averages, support volume, aggregate application error count/rate, certificate issuance/verification spot-check results, top content and accessibility issues, severity/owner/status for each fix, and the product owner's decision. Do not invent results before the pilot runs.

## Current readiness

The controlled enrollment, feedback, and reporting code is implemented. Migrations `0001`–`0009` and fictional local seeds have been applied on clean and persistent local databases, but invitation, feedback, and cohort-reporting scenarios have not been run with a real pilot cohort. No staging host, approved relay, named pilot cohort, or owner has been supplied. Do not treat this document or code as evidence that learners have been invited or that the pilot has run.

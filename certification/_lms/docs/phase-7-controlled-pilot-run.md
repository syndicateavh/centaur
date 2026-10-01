# Controlled pilot run status

**Checked:** 2026-10-01  
**Pilot status:** Not started; no learners were invited or contacted.  
**Environment checked:** local development app and local PostgreSQL only.

The repository labels the controlled-pilot implementation Phase 8. This execution record follows the user's sequence, where running the controlled pilot is Phase 7 after complete-journey verification.

## Local readiness evidence

- `LMS_CONTROLLED_PILOT` is false in local configuration; no environment setting was changed.
- The local app has no configured SMTP relay.
- There are zero published, approved, non-sandbox courses eligible for pilot invitations. The protected `/admin/pilot` page renders its expected no-eligible-course state.
- The pilot invitation and feedback tables contain zero persistent records.
- Rollback-only database checks passed for invitation redemption, replay rejection, expiry rejection, identity mismatch rejection, one feedback submission per enrolled learner, and administrator feedback visibility. All temporary course, enrollment, invitation, and feedback rows were rolled back.
- The learner-facing invitation, enrollment gate, mail delivery, and feedback workflow has not been run against a staging deployment.

## Pilot launch inputs still required

- Approved Centaur-controlled staging URL and named deployment, database, SMTP, monitoring, backup/restore, incident, and learner-support owners.
- Staging HTTPS/access boundary, approved SMTP relay, verified email/reset flow, backups, restore evidence, and `LMS_CONTROLLED_PILOT=true` confirmation.
- A non-sandbox course version with qualified content and assessment approval, accessibility review, independent publication approval, and approved certificate wording.
- Named product owner and pilot reviewer(s), cohort size and dates, approved learner contact channel, participant consent/privacy language, and data-retention decision.
- A support/check-in schedule and issue tracking location in Centaur's approved system.

When these inputs are supplied, deploy and verify the staging prerequisites first, publish the approved course, create course-specific invitations in the protected pilot page, and run the cohort using [the controlled-pilot runbook](phase-8-controlled-pilot.md). Complete [the pilot report](pilot-report-template.md) only after the agreed pilot window. Do not substitute local synthetic checks for participant outcomes or a product-owner go/no-go decision.

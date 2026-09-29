# Phase 5 — KYC/AML assessment blueprint v1

**State:** internal local draft; assessment and course subject-matter approval are pending. The seed refuses to run outside `NODE_ENV=development` against the local `centaur_lms` database.

## Learning objectives and final-assessment coverage

The final assessment contains 15 single-choice items, with three items mapped to each course objective. Every item has four options, a server-held answer key, an explanation for review use, an objective ID, and a related lesson slug.

| Objective | Coverage | Items |
| --- | --- | ---: |
| O1 | KYC/AML purpose, role boundaries, evidence discipline | 3 |
| O2 | Identity, authority, legal entities, beneficial ownership | 3 |
| O3 | Risk-based due diligence and ongoing review | 3 |
| O4 | Screening, alerts, monitoring, case notes | 3 |
| O5 | Confidentiality, data handling, escalation | 3 |

## Rules

- Final pass score: 80% (12 of 15 correct).
- Maximum final attempts: 3. There is no timer and no wait period.
- An unfinished attempt can be resumed. Learners may save partial answers and leave; all answers are required on submission.
- Formative checks: one two-question check after each of the five modules. They do not affect completion, allow up to 20 attempts, and show answer explanations after submission.
- Final feedback reports counts by objective and links back to course lessons. It does not reveal correct options. Formative check explanations do reveal correct options because those checks are practice, not high-stakes assessment.
- Course completion is recorded only after every lesson in the learner's pinned course version is complete and a server-graded final attempt passes. The completion timestamp is saved on the enrollment. Phase 5 does not issue certificates.
- Published assessment content and submitted attempt rows are immutable. An enrollment and attempt preserve both course-version ID and assessment-version number.

## Review and versioning

The source is [kyc-aml-assessment-v1.json](../content/kyc-aml-assessment-v1.json). The local reviewer page displays the blueprint, prompts, options, answer keys, explanations, and recorded assessment review notes at `/admin/curriculum`.

After a qualified reviewer completes the review, record each assessment decision from the `_lms` directory, for example:

```powershell
$env:NODE_ENV = 'development'
npm run db:record:assessment-review -- --reviewer 'Reviewer Name' --assessment 'final-assessment' --decision approved --notes 'Reviewed v1 against the current approved source set; no corrections required.'
```

Use `changes_requested` when changes are required. Review records are append-only. Recording approval does not publish the assessment or the course. Any content change after attempts exist requires a new assessment version; any course-content release requires a new course version and the separate course review/publication workflow.

# Phase 3 — Pre-enrolment content consolidation

**Status:** local implementation complete; deployment and ranking impact are unverified.  
**Scope:** existing course, fee, syllabus, placement, and enrolment-decision pages. The free-teaching pilot is outside this phase.

## Page ownership

| Learner decision | Page that owns Centaur Careers’ answer | Supporting pages |
| --- | --- | --- |
| Course scope and application path | `/courses/` | Course-selection checklist pages |
| Published fees and course entry | `/courses/finance-course-fees-eligibility/` | `/finance-course-fees-in-india/`, `/finance-course-eligibility/` |
| Syllabus and program duration | `/courses/finance-operations-syllabus/` | `/finance-course-duration/` |
| Placement and Job Guarantee Program summary | `/placements/` | `/finance-course-with-placement/`, `/finance-course-with-job-guarantee/`, related course-placement checklists |
| General questions before enrolling | `/blog/questions-to-ask-finance-institute-before-enrolling/` | Course, fee, syllabus, placement, and refund source pages |

These are editorial owners based on page intent. They do not claim that Google selected these canonicals or that the pages rank for every mapped query.

## Implemented

- The fee owner now uses the shared `LEARNING_MODES` values for current and reference fees, states the graduation entry rule, and links to the cost, eligibility, refund, syllabus, placement, and pre-enrolment resources.
- The syllabus owner names the published six-week duration and links to the workload checklist and pre-enrolment guide.
- Fee, duration, and eligibility support pages now act as comparison checklists and route Centaur-specific facts back to their owners instead of repeating those facts as competing answers.
- Placement checklists point to the placement owner. Generic examples of possible guarantee conditions are explicitly not presented as Centaur-specific terms; the approved public promise remains consistent with the claims policy.
- Each root-level decision page now renders a small set of relevant source-page links in its page footer rather than the same generic course/placement links.
- The `/courses/` decision section provides direct paths to the fee and entry page, syllabus, placement terms, pre-enrolment checklist, and cohort contact.
- The pre-enrolment article now distinguishes general comparison questions from Centaur’s published facts and links to their source pages.

## Indexing and evidence boundary

No URL was redirected, removed from the sitemap, or marked `noindex`. The repository does not contain page-level Search Console query, indexing, backlink, or qualified-enquiry evidence sufficient to retire a supporting URL. Keep each checklist indexable while its distinct comparison intent remains useful; review competing page pairs after deployment using Search Console and qualified enquiries before considering a merge.

No build or test command was run for this implementation. The changes are local and have not been deployed. They do not establish indexing, ranking, traffic, or lead growth.

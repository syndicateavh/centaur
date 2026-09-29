# Phase 2 — Decisions and interviews implementation

Date: 26 September 2026

## Status

**Eight planned URLs are implemented and pass local release QA. Publication of the full package is on hold until a qualified accounting reviewer approves the new worked case and answer key.** Production deployment and Search Console verification have not happened in this workspace.

| URL | Implemented reader value |
| --- | --- |
| `/career-guides/finance-careers-after-graduation/` | Compares six BFSI role families, gives a vacancy-based shortlist method, links from task preference to investment operations, KYC/AML and retail banking guides, then to the course decision checklist. |
| `/career-guides/choosing-finance-career-course/` | Uses a role-first checklist for syllabus, practice, mode, fees, credential and written support terms; links to the neutral, source-backed provider comparison at the comparison point. |
| `/compare/investment-banking-operations-courses/` | Dated 26 September 2026, with six provider snapshots, a neutral comparison framework, current official programme links and a historical Proschool brochure clearly labelled as such. No provider ranking or outcome comparison is asserted. |
| `/resources/investment-banking-interview-questions/` | Adds a fictional settlement quantity mismatch and five-point self-check after the sample answer. It separates operations interviews from front-office interview preparation. |
| `/blog/career-options-in-commerce-decision-map/` | Keeps the broad commerce-career map, adds an example of matching vacancy tasks to syllabus practice and sends course shoppers to the course-selection guide. |
| `/blog/investment-banking-operations-vs-cfa-financial-modelling/` | Keeps distinct operations, CFA and financial-modelling paths; cites the current CFA Institute curriculum and sends provider-specific questions to `/courses/` beside the enrolment checklist. |
| `/blog/finance-interview-questions-freshers/` | Keeps broad fresher and behavioural prompts with an answer rubric, then identifies when to use the technical accounting case. |
| `/resources/accounting-interview-questions/` | Contains original technical answers and a fictional journal, trial balance, profit, assets and bank-reconciliation exercise with an answer key and self-check. Reciprocal links come from accounting basics, reconciliation and the broad interview blog. **Expert approval is pending.** |

The accounting resource's author field names Centaur Careers as publisher. No individual accountant or accounting-operations expert has been represented as a reviewer, because no signed review record has been supplied. The case is educational and simplified. Before publication, record the reviewer's name, relevant role, approval date and any corrections in this document, then rerun release QA and package a new archive without the review-hold label. The reviewer should confirm the event assumptions, entries, trial-balance totals, statement explanation, reconciliation treatment and the distinction between general interview prompts and technical accounting questions.

## Evidence and verification

- Official provider programme pages were checked on 26 September 2026: [Imarticus CIBOP](https://imarticus.org/certified-investment-banking-operations-program-cibop/), [IMS Proschool SMIBO](https://proschoolonline.com/investment-banking-course), [upGrad Pune programme](https://www.upgrad.com/offline-centres/certificate-global-investment-banking-operations-course-in-pune-city/), [TimesPro](https://timespro.com/early-career/investment-banking-operations-program), [MentorMeCareers](https://mentormecareers.com/%E2%80%A0investment-banking-operations-analyst-program/) and [SmartSteps](https://www.smartsteps.in/). The [2025 Proschool brochure](https://proschoolonline.com/wp-content/uploads/2025/07/IBO-Brochure.pdf) is retained only as a historical reference. Recheck mutable fees, dates, credentials and support terms for a specific cohort before asserting them.
- [CFA Institute's curriculum](https://www.cfainstitute.org/programs/cfa-program/curriculum) is the primary source for the CFA learning-path description. The accounting exercise links to [ICAI study material](https://www.icai.org/post/17894) as a formal learning reference; it still needs the human review above.
- `npm run release:qa` passed on 26 September 2026. See `release/phase2-decisions-interviews-qa.log` and `RELEASE_QA_REPORT.md`. The eight prerendered URLs each have one H1, self canonical and `index,follow` in the candidate build. The generated sitemap and internal-link checks passed.
- The candidate archive is `release/centaur-phase2-decisions-interviews-2026-09-26-REVIEW-HOLD.zip` (35,411,066 bytes, 363 entries, valid ZIP CRC). SHA-256: `5ed82962754c07cd77acdfe81f3084077f20eed514fc350828fb767b6431328e`. It is a review artifact, not an approved production upload.

## Release and measurement after approval

After the accounting review is recorded, rerun `npm run release:qa`, create a fresh portable archive from `build/client`, and deploy its contents to the production document root with `.htaccess`. Recheck the eight live URLs for HTTP 200, title, H1, answer, canonical, robots, structured data, source links and mobile presentation. Submit the sitemap through the authorised Search Console property. Use Search Console page/query impressions, clicks, average position and confirmed enquiries as the baseline; do not infer rank improvements from the local build or the earlier 1.11% third-party visibility estimate.

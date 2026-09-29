# Topic pages and the Job Guarantee Program

Implemented locally on 29 September 2026. Six existing curriculum-module pages now give a topic-specific practice task, model reasoning, a relevant worked article, a career-guide path, the full Masterclass offer, the published guarantee summary, and an enquiry path:

| Module page | Distinct practice decision |
| --- | --- |
| `/courses/investment-banking-operations/` | Pre-settlement trade quantity break. |
| `/courses/retail-banking/` | Customer-service request with conflicting details. |
| `/courses/finance-operations/` | Loan sanction versus booking and unsigned request. |
| `/courses/kyc-aml/` | Missing ownership, signatory and screening evidence. |
| `/courses/digital-payments/` | Payment fee hypothesis and separate ledger posting break. |
| `/courses/fintech/` | Submitted onboarding request with unfinished verification. |

The nine role guides upgraded in Phase 3 also now link directly to the full program's guarantee terms. These additions use the approved `JOB_GUARANTEE` source copy so the offer remains consistent. They say that the guarantee applies to graduates and job switchers who complete the six-week Financial Operations Masterclass. A module or a career guide does not promise a particular role, employer, salary, city, external credential or vacancy. The placement page remains the single owner of the guarantee's detailed terms.

The phrase **“No. 1 assured placement”** was not added. The current evidence register does not contain a comparative placement ranking, methodology or current cohort outcomes that would substantiate a No. 1 claim. The approved public offer is **100% Job Guarantee Program**, with its full-program qualifier and written-terms path. This approach also avoids creating near-duplicate landing pages for each topic and guarantee phrase; each existing module page keeps its topic intent.

Verification: `npm run build`, `npm run seo:topic-program:check`, `npm run seo:job-intent:check`, `npm run seo:phase1:offer:check`, and `npm run lint` pass. The topic-program check inspects all six prerendered pages for distinct exercises, approved guarantee wording, terms and enquiry links, indexable role/case destinations, and the absence of `JobPosting` markup or an unsupported No. 1 claim. It is wired into `npm run seo:check`.

The homepage related-links block was aligned to its 17 registered destinations, preserving the smaller hub-led navigation and resolving three existing homepage link checks. `npm run seo:check` now passes. Deployment, live indexation and lead changes remain unverified until the release and matching Search Console/CRM evidence are available.

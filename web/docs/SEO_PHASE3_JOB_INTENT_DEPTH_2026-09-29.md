# Phase 3: banking and finance job-intent depth

Implemented locally on 29 September 2026. This phase improves existing search-intent owners and practice articles; it creates no new indexable URL or vacancy page.

## Site-page changes in this build

Nine existing career guides now include a role-specific vacancy-reading section, tools and responsibilities to demonstrate, a fictional work sample with model reasoning, an interview prompt, a related worked article, and the relevant course-module path:

| Owner | Work sample / decision |
| --- | --- |
| `/career-guides/investment-banking-operations/` | Quantity and gross-amount confirmation break before settlement. |
| `/career-guides/kyc-aml-analyst/` | Incomplete ownership, signatory and screening evidence. |
| `/career-guides/finance-operations/` | Gateway success with an absent ledger line. |
| `/career-guides/retail-banking-operations/` | Service request with conflicting contact details and missing authority. |
| `/career-guides/digital-payments-operations/` | Net-settlement difference and separate missing posting. |
| `/career-guides/reconciliation-analyst/` | Amount mismatch that cannot be labelled a timing break without evidence. |
| `/career-guides/credit-operations-analyst/` | Sanction/booking amount mismatch and unsigned disbursement request. |
| `/career-guides/back-office-banking-jobs/` | Sorting broad titles by actual workflow and eligibility. |
| `/career-guides/trade-lifecycle/` | Confirmation break versus completed settlement failure. |

The existing fund-accounting article now includes a dated employer example that distinguishes its experienced role from fresher preparation. Role-intent links connect the guides to the relevant cases and module pages. The five practical cases on existing article URLs are KYC onboarding, a pre-settlement trade break, payment reconciliation, a card dispute, and a loan-file check. Each has downloadable fictional source records and a model answer or case note. The latter three packets were added in this phase.

## Claim and source boundaries

- [Citi KYC Operations Analyst 1, Mumbai, posted 24 September 2026](https://jobs.citi.com/job/mumbai/kyc-operations-analyst/287/101076905504): specific KYC record duties, bachelor-or-equivalent and 1–3 years requirement. The listing's title alone does not establish fresher eligibility.
- [Citi Credit Maintenance Analyst, Warsaw, posted 15 September 2026](https://jobs.citi.com/job/warsaw/credit-maintenance-analyst/287/100661695904): an overseas credit-system role with degree fields, Excel and approved-change duties. It does not establish Indian eligibility.
- [Citi Fund Accounting Analyst 1, Haryana, posted 4 September 2026](https://jobs.citi.com/job/haryana/fund-accounting-analyst-1/287/99795551184): a specific fund-reporting role asking for 3–4 years of experience. It is an adjacent, experienced example for investment operations.
- [Citi Reconciliation and Proofing Representative, Chennai, posted 18 September 2026](https://jobs.citi.com/job/chennai/rec-and-proofing-rep-c04-chennai/287/100801470336): a settled-trade and cash/stock break example. It lists 1–3 years of relevant experience while welcoming fresh graduates, and states a NAM shift.
- [Citi Ops Support Specialist, Chennai, posted 9 September 2026](https://jobs.citi.com/job/chennai/ops-support-specialist/287/100386520176): one card/payment operations support example, with settlement, reversals, spreadsheet work and 0–3 years of relevant experience.
- [RBI KYC Master Direction](https://www.rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=11566), [SEBI investor material](https://investor.sebi.gov.in/securities-dos_and_donts.html), [NPCI UPI FAQs](https://www.npci.org.in/what-we-do/upi/faqs), and [Visa merchant dispute guidance](https://usa.visa.com/support/merchant/library.html) provide context for regulated workflows. The training packets remain simplified and institution procedures control real cases.

Employer pages may change or close. These articles are career education, not live vacancy listings; they carry no `JobPosting` schema. No named industry reviewer has been represented. The author and editorial source notes are shown where supported, and regulated examples should receive a named subject reviewer when Centaur can verify that review. The exercises contain no learner, customer or employer data.

## Verification and measurement

Run `npm run build`, `npm run seo:job-intent:check`, `npm run seo:role-intent:check`, and `npm run seo:career-guides:check`. The job-intent check verifies rendered guide sections, case-to-guide/course links, downloaded files, role ownership, source links and absence of `JobPosting` schema. It is included in `npm run seo:check`.

Local verification on 29 September: the production build, all three focused SEO checks, blog structure check, lint and `git diff --check` passed. A subsequent topic-program update aligned the homepage related-links block with its 17 registered destinations; the wider `npm run seo:check` now passes too.

After deployment, compare complete GSC 28-day windows for each guide and case: non-brand impressions, clicks, actual query/page pairs, CTR and position. Compare GA4 organic landing sessions and contact clicks, then connected and qualified calls from CRM. Record index status through Search Console URL Inspection. Do not infer ranking, indexing or call lift from the local build or sitemap count. Refresh dated employer examples if their requirements change; add new pages only when query evidence shows a distinct unanswered intent.

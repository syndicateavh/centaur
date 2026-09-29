# Semrush keyword gap: Phase 4 current-page refresh

Completed: 2026-09-24  
Scope: refresh relevant, already-published routes from the Phase 3 map. No new URL or course was created.

## Pages refreshed

| Current route | Phase 3 assigned keywords | Refresh |
| --- | ---: | --- |
| `/resources/accounting-basics/` | 173 | Added introductory distinctions for accounting principles vs. formal standards, journal-to-ledger-to-trial-balance flow, and traditional carriage inward/outward treatment, with ICAI and NCERT references. |
| `/career-guides/finance-operations/` | 30 | Added bounded credit-risk, assessment, and underwriting context, plus an RBI reference and role-scope FAQs. |
| `/career-guides/finance-careers-after-graduation/` | 26 | Made the graduate-pathways heading directly answer finance-jobs-after-graduation searches while retaining its existing factual scope. |
| `/career-guides/retail-banking-operations/` | 21 | Added a general bank relationship-manager role explanation and FAQs distinguishing bank roles from other relationship-manager jobs. |
| `/resources/reconciliation-in-finance/` | 18 | Added direct answers for reconciliation in accounting and common finance reconciliation types. |
| `/career-guides/trade-lifecycle/` | 16 | Clarified the trade life cycle/lifecycle wording; did not add time-sensitive settlement-cycle claims. |
| `/resources/investment-banking-interview-questions/` | 12 | Added finance interview preparation for freshers, with evidence-based guidance for technical and scenario questions. |
| `/career-guides/kyc-aml-analyst/` | 6 | Added a clear boundary that this guide is not a third-party AML certification or exam-preparation offer. |
| `/courses/` | 4 | Clarified that Investment Banking Operations is a module inside the single six-week Financial Operations Masterclass, not a separate course with its own duration or syllabus. |
| `/career-guides/investment-banking-operations/` | 1 | Improved the direct-answer heading for investment banking operations meaning and work. |

Only the routes above have refreshed dates. Existing primary keyword ownership and the approved 728-keyword strategy were not changed.

## Keyword scope and safeguards

The updated Phase 3 map assigns 307 keyword rows across these 10 current routes: 300 informational mappings and 7 exact matches already present in the approved strategy. The mapper now holds out mismatched specialist roles, location-specific or employer-specific job searches, non-English queries, unsupported downloadable/PDF expectations, credit-risk modeling and taxonomy terms, international accounting comparisons, and other queries that the current page does not substantively answer.

The other mapped terms remain governed by their previous decisions: 5,137 are proposed informational clusters without an approved URL, 4,502 retain human-review flags, 1,645 are excluded, and 6,596 are held for audience, source, or navigation review. An assignment is a research recommendation, not proof of ranking potential or a request to repeat every phrase in copy. Semrush database, language, and device context remain unverified; no new Google SERP review was performed in this phase.

No salary figures, hiring guarantees, employer vacancies, new credentials, or additional Centaur course offerings were introduced. Salary-, credential-, local-market-, and ambiguous-intent searches remain gated until evidence and SERP review support a specific decision.

## Reference notes added to page content

- [ICAI Accounting Standards Board](https://asb.icai.org/)
- [ICAI accounting and bank-reconciliation study material](https://www.icai.org/post/17894)
- [ICAI introductory accounting-process material](https://kb.icai.org/pdfs/PDFFile5b27976545f667.12985834.pdf)
- [NCERT final-accounts learning material](https://www.ncert.nic.in/textbook/pdf/leac204.pdf)
- [RBI Master Circular on credit risk management](https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=12822)

The accounting and credit-risk explanations are introductory only. Accounting treatment depends on the entity and reporting framework; lending controls and authority depend on the regulated entity, facility, and current requirements.

## Verification

- Production build and static prerender completed.
- `seo:keywords:check`, `seo:commercial:check`, `seo:career-guides:check`, `seo:resources-faq:check`, `test:seo`, and ESLint on changed source files passed.
- `content:check` still reports that `src/content/businessData.js` does not match its protected hash in `docs/content-protection-manifest.json`. That file was not changed for Phase 4; the manifest requires its own approval workflow and was left untouched.

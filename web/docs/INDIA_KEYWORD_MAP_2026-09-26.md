# Phase 2: India keyword map — 26 September 2026

## What is ready

The [approved-query map](../data/seo/india-keyword-map-2026-09-26.csv) assigns all **728 approved phrases** to **24 existing indexable URL owners**. The [page-priority sheet](../data/seo/india-keyword-page-priorities-2026-09-26.csv) gives each owner one role, a work order, and a claim guardrail. The [review-decision sheet](../data/seo/india-keyword-review-decisions-2026-09-26.csv) records ten selected queries from the 13,685-keyword Semrush competitor inventory. The technical accounting interview query pair now has one separate resource owner; the approved 728-keyword map remains a historical Phase 2 inventory and has not been expanded with unverified demand estimates. The [full mapped competitor inventory](../data/seo/keyword-gap/semrush-keyword-gap-keyword-map-2026-09-23.csv) retains all 13,685 source phrases and their original dispositions. The curated decisions live in `data/seo/india-keyword-priorities-2026-09-26.json`; `npm run seo:india-keywords:generate` rebuilds the CSVs, and `npm run seo:india-keywords:check` detects drift.

The approved phrases came from the existing 728-keyword workbook, not from the limited Search Console workbook. Only **7 phrases** exactly overlap the Semrush competitor inventory. A blank Semrush metric in the map means no exact match in that inventory, not zero demand. The Semrush source does **not** record database/country, language, or device, so its volume and difficulty are **unverified source estimates**, not validated India monthly search volumes. The supplied Search Console workbook is filtered to a branded query and former www homepage; it cannot establish regional demand, page losses, or an India-wide ranking baseline. See [Phase 1 audit](./PHASE1_SEARCH_MEASUREMENT_AUDIT_2026-09-26.md).

## Work order and page roles

| Band | URL owners | Decision |
| --- | --- | --- |
| P0 | `/courses/`; finance-careers-after-graduation, investment-banking-operations, trade-lifecycle and kyc-aml-analyst career guides | Start with the single programme page and high-fit graduate, role and skills answers. Validate actual page and query losses in Search Console before changing copy. |
| P1 | `/india/`, `/locations/lucknow/`, interview resource, finance-operations guide, course-choice guide, operations FAQ and factual comparison page | Clarify national online access, verified Lucknow access, interview intent and course evaluation. Keep commercial and informational answers distinct. |
| P2 | Five existing regional guides and retail-banking, digital-payments and fintech career guides | Review actual page-level impressions, clicks, CTR, position and enquiries before prioritising a regional rewrite. Preserve distinct local information with checked sources. |
| P3 | KYC/AML, retail banking, digital payments and fintech subject pages under `/courses/` | Audit course-like terms as **modules of one Financial Operations Masterclass**. These URLs do not establish separately sold courses. |

The [page-priority CSV](../data/seo/india-keyword-page-priorities-2026-09-26.csv) names all 24 URLs and their exact next action. P0–P3 is an **editorial work order**, not a ranking or traffic forecast. The role boundary is especially important for `/courses/` versus `/india/`: `/courses/` owns the programme and enquiry answer; `/india/` explains where and how learners outside Lucknow can study live online.

## Selected query decisions

| Query | Source estimate: volume / KD | Decision |
| --- | ---: | --- |
| `investment banking operations course` | 170 / 21 | Approved `/courses/` owner; answer the operations programme intent. |
| `investment banking operations courses` | 210 / 26 | Same `/courses/` owner; plural wording does not justify another page. |
| `banking operations course` | 140 / 21 | Existing `/courses/` owner. |
| `finance careers` | 3,600 / 43 | Existing graduation career guide; keep the answer focused on relevant finance paths. |
| `jobs after bcom` | 2,900 / 26 | Same career guide; no claim to cover every BCom occupation. |
| `investment banking operations` | 210 / 22 | Existing role guide, separate from programme enrolment. |
| `trade lifecycle` | 210 / 24 | Existing trade-lifecycle guide. |
| `kyc analyst job description` | 170 / 17 | Existing KYC analyst career guide. |
| `investment banking interview questions` | 390 / 26 | Existing investment banking **operations** interview resource. |
| `accounting interview questions and answers`; `basic accounting interview questions` | 1,600 / 23; 1,300 / 28 | **One separate resource** `/resources/accounting-interview-questions/` with original journal-entry and bank-reconciliation practice. These figures remain unverified Semrush estimates; page-level Search Console demand is still unavailable. |
| `career options in commerce` | 14,800 / 24 | Existing [commerce decision-map article](https://centaurcareers.in/blog/career-options-in-commerce-decision-map/). **Hold further expansion** until qualified demand is measured. |

All numbers in this table are from the unverified-market Semrush export. Do not add them together: keyword-tool estimates and close variants can overlap. The table records opportunity hypotheses, not observed site performance.

## Competitor and search-intent reading

The current [Imarticus CIBOP page](https://imarticus.org/certified-investment-banking-operations-program/) combines a programme answer with audience, syllabus, delivery and enquiry paths. The current [Proschool investment-banking page](https://proschoolonline.com/investment-banking-course) also targets course consideration. This supports a clear primary programme owner at `/courses/`; it does not justify copying competitor wording or unverified outcome claims. City course queries can mix online study, classroom expectations and front-office investment banking. Centaur's five regional guides should clearly say **live online outside Lucknow** and should not imply a local centre, local cohort, or different course without evidence.

Google's [AI Search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) ties AI visibility to ordinary crawlable, useful pages and says special AI files or markup are not required. Google's [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) identify similar city doorway pages and scaled, low-value pages as abuse. Clear answers and verified facts are the route to search and AI citation eligibility; no keyword list guarantees top placement in Google, Claude, Gemini, or ChatGPT.

## Rules for Phase 3 publication

1. Obtain unfiltered Search Console **Queries** and **Pages** data for two equal completed 28-day periods; isolate India, device and page where possible. Pair landing pages with GA4 organic sessions and **confirmed enquiries**. Reorder the map when those observations outweigh the provisional P0–P3 judgement.
2. For each proposed page, record the user question, one primary owner, existing-page overlap, search-result intent, first-party expertise, sources, internal links and conversion path. Publish only when a distinct answer is possible. A phrase variant alone is not a page brief.
3. Review every city, facility, placement and course-delivery statement before publication. Learning outside Lucknow is live online; Centaur sells one Financial Operations Masterclass. Do not change review dates for keyword-only edits.
4. After a substantive edit, verify rendered HTML, canonical, indexing rules, internal links and qualified enquiry tracking. Compare the next completed 28-day period with the baseline and keep or reverse changes from evidence.

The former `/financial-operations-masterclass` URL appeared in the supplied GA4 screenshot but returned 404 live during this review. The local release package now includes a one-hop 301 to `/courses/` for both slash forms, retaining query parameters. It requires deployment before the live URL is repaired.

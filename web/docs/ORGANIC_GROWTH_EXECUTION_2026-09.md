# India organic growth implementation — 17 September 2026

## What is in place

- The new finance/BFSI learning hub is `/resources/finance-gk/`. It is routed, indexable, included in the technical-route inventory, linked from the resource, course, India, and related learning pages, and included in generated sitemap output.
- Added two focused, indexable learning pages under the resource hub: `/resources/accounting-basics/` targets accounting rules and beginner foundations; `/resources/reconciliation-in-finance/` explains reconciliation meaning and finance-operations workflows. They link to ICAI/RBI learning material and related career/interview guides rather than making course or placement claims.
- `industry-updates` is registered as a blog category and linked from the blog index. Its category URL is reachable; while no article has completed editorial review, the archive stays `noindex` and explicitly says so. The RBI draft explainer remains `review`, not public. Publication requires checking the primary source, dates, and finance-workflow relevance.
- Course pages now explain learning as concepts, practical scenarios, activities, feedback, and career preparation. Exact legacy salary ranges, interview counts, employer logos, and outcome claims are not presented as verified current offers. Course and placement pages direct prospective learners to ask about current fees and program terms.
- Existing Delhi-NCR, Bengaluru, and Mumbai guides retain distinct dated regional context and evidence sources. Lucknow remains the only published in-person learning location; national online access is not represented as a branch or local-placement promise.
- `OAI-SearchBot` is already allowed by `public/robots.txt`. No special AI schema or `llms.txt` was added.
- Contact/form/WhatsApp/phone/email clicks push a privacy-minimized `lead_cta_click` event to `dataLayer`. It is an intent/click event only; no form-success event or qualified-lead event is fabricated. See `docs/ANALYTICS_CONFIGURATION.md` for GTM mapping and validation.

## Keyword and measurement decisions

The supplied position-tracking CSVs have no populated current positions or landing-page URLs, so they cannot establish a ranking baseline. The generic Ubersuggest warnings about seven long titles and one low-word-count page did not include affected URLs, so no speculative bulk edits were made.

Ubersuggest candidates were treated as intent hypotheses, not proof of demand:

| Candidate | Decision |
| --- | --- |
| `entry level investment jobs` | Consider only in the existing investment-banking-operations career guide if live SERP review confirms informational intent. |
| `private bank jobs for freshers` | Consider a short relevant section on the existing retail-banking-operations guide only if SERP review supports it. |
| `investment analyst entry level` | Defer; investment research is not the current course focus. |
| `investment banker jobs entry level` | Do not target as a vacancy query; clarify operations vs front-office only if search results support that intent. |
| `bank jobs for freshers` | Defer; do not imply that Centaur Careers is a jobs board. |

There is still no production Google Search Console export in the workspace; the live baseline is unavailable, not zero. Phase 7 now imports Query and Page exports separately with their selected date ranges, archives prior periods locally, and creates an evidence-only comparison report. Follow `docs/SEO_MEASUREMENT_AND_MAINTENANCE.md`; review authorized Search Console data and verified qualified enquiries by landing page as separate monthly signals.

The supplied keyword-gap workbook dated 2026-09-16 contains 8,178 terms with volume/difficulty estimates and competitor URL/rank columns. Its visible `Imarticus` column contains a numeric position for almost every row, while the `Centaur Careers` column contains a non-zero value for only one row; these are competitor-gap candidates, not proof that Centaur already ranks. The export does not retain an explicit country/database field, so its volumes must be checked in the India database before being described as India-specific. The broadest high-volume terms also include unrelated subjects; do not create pages for volume alone.

Initial learning-page candidates used from that workbook:

| Query cluster | Export volume / difficulty | Competitor signal | Page owner / decision |
| --- | ---: | --- | --- |
| `golden rules of accounting`, accounting rules, accounting principles | 49,500 / 19 for the lead term | Imarticus position 13 for lead term | New `/resources/accounting-basics/`; verify India database and observe Search Console before expanding into more accounting pages. |
| `reconciliation meaning`, reconciliation, reconciliation meaning in accounting | 33,100 / 46 for the lead term; `reconciliation` 49,500 / 57 | Imarticus positions 7 and 12 respectively | New `/resources/reconciliation-in-finance/`; keep distinct from existing trade-lifecycle and interview pages through a definition-and-process intent. |
| `investment banking courses`, course fees, duration, syllabus, placement | 9,900 / 51 for `investment banking courses`; lower-volume specific terms also appear | Imarticus positions 3–10 on several course-intent terms | Keep ownership on `/courses/`; do not create a duplicate landing page. Add fee, duration, syllabus, or guarantee detail only after current program details are confirmed by the owner. |

## Editorial cadence and release gates

Target two pieces per month: one primary-source-led, dated industry explainer and one evergreen learner/career resource. Before assigning a brief, check existing routes and articles for intent overlap. Each update should identify what changed, its source and effective date, who it affects, and the practical connection to finance operations; obtain expert/editor review before setting `status` to `published`. Keep legal, salary, employer, placement, and certificate claims out unless the current evidence and permissions are recorded.

Review the baseline, indexing, event wiring, and lead quality after 90 days. Ranking for every suggested keyword and AI citation visibility are not guaranteed outcomes.

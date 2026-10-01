# High-intent SEO cluster audit

Reviewed 30 September 2026 before creating or changing routes. This is an on-site
ownership map, not evidence that Google has indexed or selected these URLs.
Approved repository keyword ownership and verified program terms take
precedence over creating another URL for the same intent.

The attached-prompt checklist and the exact mapping for every supplied
secondary query are documented in
[`SEO_HIGH_INTENT_PROMPT_COVERAGE_2026-09-30.md`](./SEO_HIGH_INTENT_PROMPT_COVERAGE_2026-09-30.md).

| Cluster | Existing owner / useful supporting pages | Quality and intent fit | Decision |
| --- | --- | --- | --- |
| Finance course with job guarantee | `/placements/`; national access at `/india/` | Placement page owns eligibility, completion, terms and application route; salary note states that no numeric range is published as a guarantee. | Keep the placement owner and link online, fee, module, and regional decisions. No new URL. |
| Investment banking operations course | `/courses/investment-banking-operations/`; full program at `/courses/` | Specific module page owns operations-course queries and distinguishes the subject from separate credentials and front-office tracks. | Use the existing module as canonical topical owner; link to full Masterclass, fees, syllabus and role guidance. |
| Investment banking course with placement | `/courses/investment-banking-operations/`; terms at `/placements/` | Copy distinguishes post-trade operations from modelling, valuation, M&A and front-office paths; the guarantee terms remain on the placement owner. | Cross-link the topical page to the terms owner. No duplicate course URL. |
| Investment banking course fees | `/courses/`; fee detail at `/courses/finance-course-fees-eligibility/` | One Masterclass has published live-online and Lucknow fees; the IB Operations module is not a separate priced course. | Keep current price source; link both course and fee owners from the IB Operations module. |
| Investment banking course duration | `/courses/finance-operations-syllabus/`; checklist at `/finance-course-duration/` | Six-week duration is published. Cohort timetable and weekly hours are not stated as fixed public facts. | Add an explicitly illustrative self-study outline; direct readers to confirm actual schedule and effort. |
| Investment banking course eligibility | `/courses/finance-course-fees-eligibility/`, `/courses/finance-course-for-graduates/` | Graduation is the program entry requirement; prior finance background is not required. Employer criteria vary. | Keep existing eligibility owners and links. |
| Finance course after graduation | `/career-guides/finance-careers-after-graduation/`; decision support at `/courses/finance-course-for-graduates/` | Existing guide covers role choice after graduation and BCom; course page covers graduate fit. | Upgrade and interlink existing owners. No duplicate. |
| Finance course after BTech | `/best-finance-course-after-graduation/`; supporting graduate guide | Existing page owns BTech/non-commerce course choice but previously gave limited BTech-specific role preparation. | Expand this page with transferable skills, skill gaps, role research, a transition roadmap and interview preparation. No new BTech URL. |
| Finance course for non-commerce graduates | `/best-finance-course-after-graduation/`, `/courses/finance-course-for-graduates/` | All-graduate eligibility and employer-specific hiring criteria are stated. | Keep one graduate decision cluster; add no separate non-commerce page. |
| KYC AML course | `/courses/kyc-aml/`; role guide `/career-guides/kyc-aml-analyst/` | Module page states KYC/AML is within the broader Masterclass; role guide serves career research. | Keep both distinct owners and link them. No fake standalone program. |
| Finance operations course | `/courses/`; `/courses/finance-operations/`; `/courses/finance-operations-training/` | Full program hub, module page and training-topic guide have different scopes. | Preserve hub ownership and connect the topic pages. No new umbrella URL. |
| Reconciliation analyst | `/career-guides/reconciliation-analyst/`; `/resources/reconciliation-in-finance/`; `/resources/bank-reconciliation-process/` | Role, general process, and bank-specific procedure are separated across existing guides/resources. | Improve cross-links and keep task-specific intent distinct. No duplicate explainer. |
| Settlement analyst | `/career-guides/settlement-analyst/`; `/career-guides/trade-lifecycle/`; `/blog/settlement-trade-break-worked-example/` | Role, lifecycle, and worked exception example each serve a distinct question. | Connect to IB Operations and preserve these scopes. |
| Fund accounting course | `/blog/fund-accounting-nav-workflow-career-skills/`; IB Operations module | Existing article covers NAV workflow and career skills; the Masterclass lists fund accounting within IB Operations. | Keep educational article and module links; do not claim a standalone course or unsupported depth. |
| Corporate actions course | `/resources/corporate-actions-workflow/`; `/blog/corporate-actions-analyst-career-path/`; IB Operations module | Workflow and role pages exist; course coverage is a module topic. | Link the learning resource and role article to IB Operations. No standalone program. |
| Banking operations course | `/courses/retail-banking/`; `/career-guides/retail-banking-operations/`; `/career-guides/operations-analyst-banking/` | Course module and job guides are available; entry requirements remain employer-specific. | Keep existing owners and cross-link. |
| Credit operations course | `/courses/finance-operations/`; `/career-guides/credit-operations-analyst/`; `/career-guides/credit-analyst/` | Existing content distinguishes credit analysis from credit operations; no separate credit credential is claimed. | Keep the existing module and role guides; avoid a new course page. |
| Digital payments course | `/courses/digital-payments/`; `/career-guides/digital-payments-operations/`; payment resources and articles | Module, role and workflow pages exist for payments, reconciliation and payment rails. | Maintain a hub-and-spoke path; do not duplicate payment explainers. |
| Finance course in a city with placement | `/india/`, `/india/delhi-ncr/`, `/india/bengaluru/`, `/india/mumbai/`, `/india/pune/`, `/india/hyderabad/`, `/locations/lucknow/` | Regional pages state live-online access and the single in-person Lucknow location; no city classroom or city-specific job is represented. | Keep selective existing pages. Do not mass-create thin city pages. |

## Implementation and indexing state

- Existing routes cover the complete clusters supplied in the brief; the brief
  itself ends immediately after the primary query for cluster 19 and contains
  no cluster 20 or final technical checklist.
- The explicit owner register now covers 40 query decisions and 206 normalized
  primary/variant queries; 20 lead criteria map to 17 canonical owners.
- BTech-specific guidance is expanded in the existing graduate decision page.
- The investment-banking module now links directly to the existing fee and
  syllabus owners.
- The six-week guide includes a clearly labelled optional self-study outline;
  its timetable and hours are not represented as Centaur's cohort schedule.
- The previously generated local sitemap and indexing manifest contain 191
  canonical URLs. Latest source-only copy and link changes still need packaging
  in a fresh build; sitemap membership does not establish Google indexing.
- Live production currently serves a sitemap with 185 URLs and returns 404 for
  `/blog/open-banking-apis-consent-operations/`; deploy the current package and
  recheck before treating the local URL set as live.
- Search Console access token and hosting upload credentials are not available
  in the current environment. No live sitemap submission or URL Inspection is
  claimed.

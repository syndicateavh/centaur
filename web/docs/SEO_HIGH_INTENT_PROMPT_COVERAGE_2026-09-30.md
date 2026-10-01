# High-intent prompt implementation coverage

Reviewed 30 September 2026 against the attached SEO implementation brief,
`SEO_TOP_20_GROWTH_BLOG_PLAN_2026-09-30.md`, the public route registry, source
content, search-intent ownership, and internal-link architecture.

This is a source-level implementation review. The user requested continuation of
implementation without a build, so the latest copy and internal-link edits are
not yet reflected in prerendered `build/client/` output. The source sitemap and
indexing manifest already contain the 191 canonical routes, including the
mapped pages; the latest edits add no URLs. Sitemap membership does not prove
deployment or search-engine indexation.

## Query-cluster coverage

| # | Prompt family | Canonical owner and support | Coverage and boundaries |
| ---: | --- | --- | --- |
| 1 | Finance course with a job guarantee or placement; India, online, training, terms, roles, eligibility, locations, application, fees, duration, salary | `/placements/`; access at `/india/`; program at `/courses/`; fees at `/courses/finance-course-fees-eligibility/`; online decision at `/online-finance-course-with-placement/` | The brief prefers `/india/`, but that page is the national access hub; `/placements/` is the better canonical because it presents the actual guarantee, completion condition, eligibility, terms, and application CTA. The page states six-week completion, support process, online/Lucknow access, and written-term CTA. Home and placement copy present ₹3–12 LPA as an indicative opportunity range, separate from the job guarantee; the published guarantee summary itself does not promise a salary. Confirm role-specific details and cohort terms in writing. The phrase “finance course with guaranteed placement” is mapped to this owner as a search query, not asserted as a separate Centaur promise. |
| 2 | Investment Banking Operations course, training, India/online, freshers, certification, placement | `/courses/investment-banking-operations/`; full program at `/courses/`; role guide at `/career-guides/investment-banking-operations/` | The module page is the specific topical owner and links to the full Masterclass, fees, syllabus, role guide, and relevant workflows. Copy identifies this as a subject within one program, not a separately sold certification. |
| 3 | Investment banking course with placement, job guarantee, after graduation | `/courses/investment-banking-operations/`; full guarantee at `/placements/`; role distinction at `/career-guides/investment-banking-operations/` | Copy distinguishes post-trade operations from M&A, private equity, valuation, modelling, advisory, sales, and trading paths. The program promise is not expanded to a particular IB title, employer, salary, or city. |
| 4 | Investment banking course fees and cost | `/courses/finance-course-fees-eligibility/`; program pricing at `/courses/`; online/offline comparison at `/compare/online-vs-offline-finance-training/` | Current source of truth is unchanged: live online ₹35,000 (reference ₹50,000); Lucknow in person ₹50,000 (reference ₹70,000). The IB Operations module has no separate fee. Cohort totals and terms should be confirmed in writing. |
| 5 | Investment banking course duration, short course, six-week program, study effort, projects, interview prep | `/courses/finance-operations-syllabus/`; duration checklist at `/finance-course-duration/` | Six weeks is the published program duration. The optional week-by-week sequence is labelled as a self-study illustration, not a cohort timetable. The site does not invent weekly hours or fixed cohort session order; readers are directed to confirm schedule and effort. |
| 6 | Investment banking eligibility after graduation, BTech, BCom, BBA, MBA, non-commerce | `/courses/finance-course-fees-eligibility/`; `/courses/finance-course-for-graduates/`; `/best-finance-course-after-graduation/` | Graduation is the entry requirement and prior finance study/work is not required. Employer requirements remain vacancy-specific. Degree-specific routes are not multiplied into doorway pages. |
| 7 | Finance course/career after graduation | `/career-guides/finance-careers-after-graduation/`; course fit at `/courses/finance-course-for-graduates/` | Existing graduate guide was upgraded and is cross-linked to the course decision page. It owns broad career-after-graduation research; course fit stays on the course page. |
| 8 | Finance after BTech/engineering: transferable skills, gaps, roles, roadmap, modules, interviews | `/best-finance-course-after-graduation/`; supporting `/career-guides/finance-careers-after-graduation/` | Existing graduate decision page now includes engineering skill transfer, finance-specific gaps, role selection, fictional workflow practice, interview explanation, module links, and employer-specific limits. No duplicate BTech URL was created. |
| 9 | Finance for non-commerce graduates and finance jobs without a commerce degree | `/best-finance-course-after-graduation/`; `/courses/finance-course-for-graduates/` | All-graduate positioning and the limits of course-to-job claims are explicit. The page covers finance, banking, KYC/AML, payments, credit, and FinTech role families without promising universal eligibility at employers. |
| 10 | KYC/AML course, analyst course/training, online, certification, placement | `/courses/kyc-aml/`; role guide `/career-guides/kyc-aml-analyst/` | Module page covers due diligence, screening, monitoring, evidence, and escalation. It explicitly says this is a Masterclass module, not a separate KYC/AML credential; job support attaches to the full program terms. |
| 11 | Finance/financial operations course and training, graduates, India, placement | `/courses/` as program hub; module `/courses/finance-operations/`; topic guide `/courses/finance-operations-training/` | The umbrella connects investment operations, KYC/AML, banking, credit, payments, NBFC, and FinTech topics to their module and role pages. Source content does not represent every topic as a separate course. |
| 12 | Reconciliation analyst/course/jobs, banking reconciliation, salary | `/career-guides/reconciliation-analyst/`; process resources `/resources/reconciliation-in-finance/` and `/resources/bank-reconciliation-process/` | The role guide, general process, and bank-specific process retain distinct purposes and are connected in the link graph. No unsupported salary figure is added; actual pay depends on current role and employer evidence. |
| 13 | Settlement analyst, trade settlement, settlement operations, lifecycle | `/career-guides/settlement-analyst/`; lifecycle `/career-guides/trade-lifecycle/`; worked example `/blog/settlement-trade-break-worked-example/` | The role, process, and fictional break example are distinct and connected; the worked example now links directly to the role guide. |
| 14 | Fund accounting course, fresher roles, analyst career, investment-fund operations | `/courses/investment-banking-operations/`; supporting workflow `/blog/fund-accounting-nav-workflow-career-skills/` | Fund accounting is described only to the depth of the published IB Operations module. No separate fund-accounting course or credential is claimed. |
| 15 | Corporate-actions course, analyst/jobs, investment-banking workflow | Course topic `/courses/investment-banking-operations/`; workflow `/resources/corporate-actions-workflow/`; role article `/blog/corporate-actions-analyst-career-path/` | Course, workflow, and role intents have distinct owners and link paths. Module-level coverage is not overstated as a standalone program. |
| 16 | Banking operations course/training, retail operations, jobs/freshers | `/courses/banking-courses/`; combined course `/courses/banking-and-finance/`; retail module `/courses/retail-banking/`; jobs at `/career-guides/back-office-banking-jobs/` | Course-selection intent stays on course pages; job-seeking intent stays on career guides. Retail banking retains its existing primary owner. |
| 17 | Credit operations, analyst, loan operations/processing, NBFC roles | Course module `/courses/finance-operations/`; role guides `/career-guides/credit-operations-analyst/` and `/career-guides/credit-analyst/` | Source explains the difference between credit operations and credit analysis and avoids promising underwriting authority or a separate credential. Job queries route to role pages. |
| 18 | Digital payments, SWIFT, RTGS, UPI, reconciliation, payment operations | Module `/courses/digital-payments/`; role `/career-guides/digital-payments-operations/`; reconciliation `/blog/payment-reconciliation-process-breaks-controls/`; payment-rail resources | Module copy names published SWIFT, RTGS, UPI/IMPS, disputes, and wallet-reconciliation topics. Payment reconciliation is assigned to its worked article; job intent is assigned to the career guide. |
| 19 | Finance course in a city with placement | `/india/`; selective `/india/delhi-ncr/`, `/india/bengaluru/`, `/india/mumbai/`, `/india/pune/`, `/india/hyderabad/`; physical option `/locations/lucknow/` | Regional pages explain live-online access and the single published in-person Lucknow option. They do not claim other classrooms or city-specific jobs. No mass-generated city pages are created. |

The supplied attachment requests 20 query families, but its contents end after
the primary query for cluster 19. It contains no secondary queries for cluster
19, no cluster 20, and no final implementation checklist. The separate Top 20
Growth Blog Plan contains 20 editorial topics; that is a different plan and
does not supply the missing query family or checklist.

## Architecture, links, and indexing coverage

- All supplied families now have explicit owner decisions in
  `src/content/seo/searchIntentOwnership.js`: 40 decisions and 206 normalized
  primary/variant queries at the latest source check.
- Twenty India lead criteria map to 17 unique canonical owners. The BCom,
  BTech, module, city, fees, duration, and placement pages link into their
  canonical owner routes.
- Regional, course-module, resource, role-guide, and article edges are declared
  in `src/seo/internalLinks.js` or the article block link records.
- The source sitemap and indexing manifest contain 191 canonical URLs,
  including the implemented lead pages. The latest source-only changes do not
  introduce new URLs. A fresh build is still needed to prerender the latest
  copy and internal links.
- Package inclusion is not an indexed-status claim. Search Console access and
  hosting credentials are unavailable here; live submission, URL Inspection,
  and deployment are not recorded as complete.

## Source-level checks

Completed without a production build:

- `npm run seo:intent:check` — passed: 40 owner decisions, 206 exact queries,
  191 current public paths, and 20 lead criteria. The checker reports 19
  legacy workbook target differences for reconciliation; these are warnings
  because the explicit, newer owner register is the current route-level source.
  It also reports eight secondary blog tag/keyword mentions that point toward
  a different page's primary topic; these are advisory metadata overlaps, not
  duplicate primary ownership.
- `npm run seo:india:lead:check` — passed: 20 criteria, 17 canonical owners,
  supporting links, sitemap membership, and indexing-priority records.
- `npm run test:source` — passed for route schema and approved-copy controls
  after the latest cluster-owner additions.
- Content-governance baseline was updated through its explicit approval
  workflow after the requested protected copy changes.

The rendered regional, full SEO, and deployment gates remain unverified against
the latest source because no build was requested. Production deployment and
search-engine indexing also remain external actions.

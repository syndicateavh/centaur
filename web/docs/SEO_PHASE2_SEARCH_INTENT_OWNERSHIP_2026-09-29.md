# Phase 2 — one owner per search intent

**Decision date:** 29 September 2026. **Scope:** the 20 India lead criteria, the main course and job-intent queries, and duplicate primary keywords across all published routes and articles.

## Owner decisions

The preferred answer is an editorial target, not a claim that Google has indexed or selected it. The complete query and supporting-page register is `src/content/seo/searchIntentOwnership.js`. Each of the 20 criteria in `src/content/seo/indexingPriority.js` has exactly one owner.

| Search intent | Preferred owner | Role of newer page |
| --- | --- | --- |
| Best finance institute in India | `/compare/best-finance-institutes-india/` | Owner; provider evaluation framework. |
| Best finance course in India with placement | `/compare/best-finance-institutes-india/` | `/best-finance-course-in-india-with-placement/` is a placement comparison checklist. |
| Best investment banking course in India | `/best-investment-banking-course-india/` | Owner; distinguish investment banking operations from other paths. |
| Best finance course after graduation | `/courses/finance-course-for-graduates/` | `/best-finance-course-after-graduation/` is a graduate shortlist checklist. |
| Best finance course after BCom | `/career-guides/finance-careers-after-graduation/` | `/best-finance-course-after-bcom/` is a BCom comparison checklist. The established guide also owns this exact query in the 728-keyword strategy. |
| Finance course with placement | `/placements/` | `/finance-course-with-placement/` explains questions to ask about support. |
| Finance course with job guarantee | `/placements/` | `/finance-course-with-job-guarantee/` explains how to read conditions. |
| Finance course fees in India | `/courses/finance-course-fees-eligibility/` | `/finance-course-fees-in-india/` is a total-cost checklist; the owner states Centaur's actual prices and entry rule. |
| Finance course duration | `/courses/finance-operations-syllabus/` | `/finance-course-duration/` explains how to assess workload; the owner covers the Masterclass sequence. |
| Finance course eligibility | `/courses/finance-course-fees-eligibility/` | `/finance-course-eligibility/` distinguishes course entry from employer hiring criteria. |
| Online finance course with placement in India | `/online-finance-course-with-placement/` | Owner for the combined online teaching and remote placement-process question. |
| Job-oriented finance course in India | `/courses/` | `/job-oriented-finance-course-india/` is a role-fit checklist. |
| Banking and finance course with placement | `/courses/banking-and-finance/` | `/banking-finance-course-with-placement/` is a support-term checklist. |
| Investment banking operations course with placement | `/courses/` | `/investment-banking-operations-course-with-placement/` is an operations-specific checklist. |
| Finance institute reviews | `/blog/how-to-evaluate-finance-institute-reviews/` | Owner for review verification. |
| Questions to ask before joining a finance course | `/blog/questions-to-ask-finance-institute-before-enrolling/` | Owner for pre-enrolment due diligence. |
| Finance institute in Lucknow with placement | `/locations/lucknow/` | `/finance-institute-lucknow-with-placement/` is a location-and-terms checklist. |
| Finance course access in Delhi, Bangalore, Mumbai, Pune and Hyderabad | `/india/` | `/finance-course-cities-india/` explains national online access; individual `/india/{city}/` pages answer each city's separate access question. |
| Finance course vs MBA, CFA and financial modelling | `/compare/finance-operations-vs-financial-modelling-cfa/` | `/finance-course-vs-mba-cfa-financial-modelling/` is a broad decision checklist. |
| Which finance course is right for me | `/career-guides/choosing-finance-career-course/` | `/which-finance-course-is-right-for-me/` leads to the role-first guide and quiz. |

The main course page owns `finance courses`, while `/courses/banking-courses/` owns `banking courses` and `/courses/banking-and-finance/` owns `banking and finance course`. The career guides own job-research intents such as `banking operations jobs for freshers`, `investment banking operations jobs`, `KYC analyst jobs`, and `finance operations analyst jobs`. These guides must not imply current vacancies.

## Changes made in the repository

- The 15 supporting root pages have narrower title, H1 and primary-keyword targets. Their body and related links direct readers to the preferred owner. The two distinct root owners retain their own targets.
- Home, courses, India and placements no longer promote all 17 root pages as equal choices. Relevant owners link to supporting checklists so the URLs remain discoverable.
- Three older route/article primary-keyword conflicts were resolved: the accounting resource owns broad accounting basics while its blog article owns the golden-rules query; the securities and trade-support career guides own the role terms while their articles own workflow and duties questions.
- `npm run seo:intent:check` checks exact query uniqueness across indexable site routes and published blog pages, the 20 decisions, self canonicals, sitemap and manifest inclusion, and supporting-page links. It runs inside the Phase 2 check and the release SEO gate.

## Evidence boundary and review trigger

The available Search Console workbook covers only a branded query on the former `www` homepage, not these page/query pairs. There is no current per-page Google-selected canonical, non-brand clicks, or connected/qualified call baseline here. These owner choices are based on page intent and current content. Keeping the supporting pages indexable with self canonicals is provisional because their narrowed checklists answer distinct questions. A sitemap URL or local gate pass does not prove indexing, ranking, or lead gain.

After deployment, export unfiltered Search Console Web Search **Pages** and **Queries** with dates and filters, inspect the affected URLs in Page Indexing/URL Inspection, and compare organic landing pages with connected and qualified call records. Review one competing page pair at a time. If the same query and answer still appear on two pages, enrich the preferred owner and use a relevant permanent redirect only after verifying whether the other URL earns useful traffic or enquiries. Update inbound links, sitemap, and canonicals together when a URL is retired. Google treats redirects and `rel="canonical"` as strong canonical signals but may choose the most useful page itself: [Google's canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [canonicalization explanation](https://developers.google.com/search/docs/crawling-indexing/canonicalization).

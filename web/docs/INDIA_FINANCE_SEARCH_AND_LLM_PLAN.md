# India finance search and LLM visibility plan

## Objective

Increase qualified organic discovery for Centaur Careers across India for finance-course, banking-operations, finance-career, interview-preparation, and regional-access questions.

This plan improves eligibility, discovery, relevance, and measurement. It does not promise a top ranking, a Google indexing decision, an AI citation, or a job outcome.

## Current page and keyword contract

The repository now maintains one primary search owner for every published public page:

- 75 indexable site routes;
- 5 published blog category archives;
- 44 published blog articles;
- 124 public pages in `docs/seo-page-keyword-map.json`.

The source of truth is:

- site-route keyword: `primaryKeyword` in `src/seo/seoRoutes.js`;
- governed commercial keyword groups: `src/content/seo/keywordStrategyData.js`;
- regional keyword owners: `src/content/regionalPages.js`;
- blog keyword fallback owners: `src/content/seo/blogKeywordOwnership.js`;
- generated page inventory: `docs/seo-page-keyword-map.json`;
- answer-system discovery file: `public/llms.txt`.

Each page has one primary query. Related queries support the same intent; they do not create additional pages or repeated headings.

## Priority query ownership

| Page | Primary query | Search purpose |
| --- | --- | --- |
| `/` | Centaur Careers finance training | Brand and provider discovery |
| `/courses/` | investment banking operations course | Main commercial course intent |
| `/india/` | investment banking operations course India | National online-access intent |
| `/locations/lucknow/` | investment banking course in Lucknow | Verified physical-location intent |
| `/india/delhi-ncr/` | investment banking course in Delhi | Delhi-NCR market and access guide |
| `/india/bengaluru/` | investment banking course in Bangalore | Bengaluru/Bangalore market and access guide |
| `/india/mumbai/` | investment banking course in Mumbai | Mumbai market and access guide |
| `/india/pune/` | investment banking course in Pune | Pune market and access guide |
| `/india/hyderabad/` | investment banking course in Hyderabad | Hyderabad market and access guide |
| `/placements/` | finance course with job guarantee | Published support and terms |
| `/career-guides/finance-careers-after-graduation/` | best finance course after BCom | Graduate decision support |
| `/career-guides/kyc-aml-analyst/` | what is KYC in banking | Role and concept education |
| `/career-guides/finance-operations/` | finance operations career | Career discovery |
| `/resources/investment-banking-interview-questions/` | investment banking operations interview questions for freshers | Interview preparation |
| `/quiz/` | banking and finance quiz | Self-assessment discovery |

The generated map contains the equivalent primary and related terms for every other route and article. Do not add HTML `meta keywords`; Google does not use them as a ranking control.

## Search questions to cover next

These are query-intent groups to validate against Search Console and a fixed India rank-tracking setup. They are opportunities, not guaranteed future rankings.

### Commercial questions

- Which investment banking operations course is best in India?
- What is the best finance course after BCom?
- Is there an online finance course for graduates?
- What does an investment banking operations course teach?
- What are finance course fees, eligibility, syllabus, and duration?
- What is the difference between investment banking operations and financial modelling?

### City and access questions

- Is there an investment banking course in Pune, Bangalore, Mumbai, Hyderabad, or Delhi?
- Can I join a finance course online from my city?
- Is there a finance training classroom in Lucknow?
- Is Bangalore or Bengaluru used on the course page?
- Does an online course provide the same live learning access outside Lucknow?

Regional pages must explain actual online access and must not imply an office, local classroom, local vacancy, local salary, or city-specific placement result without evidence.

### Career questions

- What does an investment banking operations analyst do?
- What is the trade lifecycle in investment banking?
- What does a KYC or AML analyst do?
- What is a reconciliation analyst?
- What is a trade support analyst?
- What is the difference between middle office and back office banking?
- What does a finance process associate do?
- What skills are needed for loan operations, payments, credit, or fintech operations?

### Learning and interview questions

- What are investment banking interview questions for freshers?
- What are finance interview questions with answers?
- How does bank reconciliation work?
- What are the golden rules of accounting?
- What is a trial balance and how are errors checked?
- What is KYC onboarding and customer due diligence?
- What is a settlement break and how is it investigated?

### LLM answer questions

LLM-facing pages should answer the question in the first paragraph, define the scope, link to the canonical source page, and state what is current or requires confirmation. Important claims should be visible in HTML and supported by the relevant page or public evidence.

## Regional expansion rule

Keep the five current regional guides as the first evidence-backed wave. Consider Chennai, Kolkata, Ahmedabad, Jaipur, and Kochi or Chandigarh only after:

1. Search Console or approved keyword evidence shows meaningful demand;
2. distinct public regional evidence is available;
3. the page has genuinely unique role and market context;
4. the learner-access explanation is accurate;
5. the page has a related course, career, and resource path;
6. the team can maintain dated sources.

Warn at 30 regional pages and stop at 50 without a documented business reason. Do not publish a city page solely by replacing a city name in a template.

## Google and answer-system release sequence

1. Run the production build and upload the complete `build/client/` output.
2. Confirm HTTPS, canonical host, trailing slash redirects, real 404s, robots, sitemap, and prerendered HTML.
3. Confirm the sitemap contains only canonical indexable URLs.
4. Submit the sitemap in the verified Google Search Console property.
5. Inspect the India hub, course hub, Lucknow page, and the five regional pages.
6. Use fixed city locations for rank tracking; compare the same device, language, country, and date window.
7. Review Search Console pages and queries after a complete 28-day window.
8. Improve pages ranking in positions 4–20 before creating another URL.
9. Refresh pages with impressions but weak CTR after checking query intent and snippet fit.
10. Consolidate or noindex pages that remain thin, overlapping, or unsupported.

`public/llms.txt` is an additional discovery aid, not an indexing or ranking guarantee. It now lists canonical page URLs, primary keywords, related queries, program boundaries, and answer-intent routing.

## Measurement

Track the full funnel separately:

`impression → click → landing session → CTA click → enquiry → qualified enquiry → enrolment`

Review by canonical page, primary query, city/state, device, and source. Treat `lead_cta_click` as intent, not as a completed lead. Use Search Console for search visibility, GA4/CRM for outcomes, and URL Inspection for observed indexing evidence.

## Required checks

```text
npm run build
npm run seo:page-keywords:check
npm run seo:llms:check
npm run seo:check
npm run deployment:check
```

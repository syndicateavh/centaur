# SEO Phase 8 — Selective regional pages

Phase 8 publishes a small regional layer only where the page can provide genuinely useful market research, job-search context, public evidence, and a clear learner-access explanation. It does not turn India-wide availability into a claim of physical Centaur Careers branches.

## Published regional wave

The following canonical routes are now indexable and prerendered:

- `/india/delhi-ncr/` — Delhi, Gurugram, and Noida employment context, GCC research, finance-operations role directions, and learner-access guidance.
- `/india/bengaluru/` — Karnataka fintech and GCC context, technology-enabled finance workflows, role directions, and learner-access guidance.
- `/india/mumbai/` — Mumbai market infrastructure, Maharashtra fintech context, post-trade and control-oriented role directions, and learner-access guidance.
- `/india/pune/` — Pune technology-services and finance-process context, workflow research, and learner-access guidance.
- `/india/hyderabad/` — Hyderabad IT/ITeS, GCC, finance-process context, workflow research, and learner-access guidance.

Each page contains:

- a regional direct answer in the first content block;
- original market context rather than a city-name substitution;
- practical job-posting research guidance;
- finance operations, BFSI, fintech, or GCC role directions relevant to that region;
- a visible boundary between regional employment context and Centaur Careers delivery;
- live-online access guidance for learners outside Lucknow;
- the published Lucknow in-person boundary;
- three regional workflow links to existing canonical career guides or resources;
- regional FAQs and dated public source links;
- canonical metadata, a visible breadcrumb, WebPage/BreadcrumbList schema, and contextual internal links.

The pages deliberately do not reproduce salary ranges, employer endorsements, job outcomes, or stronger placement language. Current job descriptions and provider terms remain the source of truth.

## Evidence register

Regional research is maintained in `src/content/regionalPages.js` and currently links to:

- Dun & Bradstreet’s 2025 NCR GCC landscape and Invest India/NITI Aayog services-market background for Delhi-NCR;
- Karnataka Digital Economy Mission fintech and GCC material plus a dated Karnataka government communication for Bengaluru;
- the Government of Maharashtra Mumbai FinTech initiative and SEBI’s public exchange/contact directories for Mumbai.
- STPI-Pune and official Pune district-industry material for Pune;
- Telangana government IT/ITeS and ICT policy material for Hyderabad.

The source review date is stored with each page. Dynamic market figures are described as dated source statements rather than permanent facts.

## Selective publication gate

The five published destinations remain the maximum selective wave. Additional state, city, district, or alternate-slug pages remain gated until they have distinct public evidence, useful local job-search context, and a verified learner-access explanation. A keyword alone never creates a regional route.

`tools/verify-regional-pages.js` fails when a published regional page has missing or weak evidence, fewer than 400 meaningful article words, missing regional signals, over 40% five-word-shingle overlap with another regional page, incorrect metadata, missing internal links, unsupported schema, or a positive local-office/branch or employment-promise claim.

## Technical implementation

- Added the shared regional content model and renderer in `src/content/regionalPages.js` and `src/pages/RegionalPage.jsx`.
- Registered the five routes under `/india/` in `src/seo/seoRoutes.js` and `src/routes.js`.
- Added a regional guide discovery section to the India-wide page and registered contextual internal links for every published regional route.
- Added three region-specific workflow hand-offs per page so local queries can reach canonical operations guides and resources.
- Added the five URLs to `public/llms.txt`; the production build regenerates the sitemap and crawler controls.
- Added governance inventory/readiness entries and kept any future regional expansion evidence-gated.
- Added `npm run seo:regional:check` and connected it to `npm run seo:check` and `npm run seo:gate`.
- Updated the keyword report to distinguish local/regional pages from the three dedicated regional pages.

## Validation

The complete production gate passes:

```text
npm run seo:gate
```

Current validation covers five dedicated regional pages, one national India page, canonical sitemap/prerender coverage, unique regional content, dated evidence, workflow hand-offs, and no regional/online keyword ownership collision.

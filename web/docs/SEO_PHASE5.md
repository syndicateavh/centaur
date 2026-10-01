# SEO Phase 5 — Build the career-guide information cluster

Phase 5 adds a first-party finance-career information cluster without rewriting the existing website copy, changing the meaning of approved program content, or creating one doorway page per keyword.

## Cluster published

The information hub is:

```text
/career-guides/
```

It links to 26 distinct, authored guides. The original core wave includes:

- `/career-guides/investment-banking-operations/`
- `/career-guides/kyc-aml-analyst/`
- `/career-guides/finance-operations/`
- `/career-guides/trade-lifecycle/`
- `/career-guides/finance-careers-after-graduation/`
- `/career-guides/retail-banking-operations/`
- `/career-guides/digital-payments-operations/`
- `/career-guides/financial-operations-faq/`

The hub also exposes a governed operations-topic map for banking operations, KYC/AML, trade operations, settlements, reconciliations, corporate actions, securities operations, reference data management, fund accounting, and client onboarding. Each topic points to a primary authoritative guide/resource and a supporting contextual route that already exists in the site architecture; no thin doorway page is created for a region or keyword variant.

Each guide has a distinct primary topic from the 728-keyword strategy and includes:

- a direct answer in normal server-rendered HTML
- useful H2/H3 sections and process lists
- existing-author identity and visible updated date
- related career-guide links
- contextual links to the Financial Operations Masterclass and relevant module pages
- provider-specific statements tied to existing `PROGRAM` and `CAREER_TRACKS` source data
- Article, WebPage, and BreadcrumbList structured data
- no new salary, employer, testimonial, placement-guarantee, or outcome claims

## Architecture

- `src/content/careerGuides.js` is the single content registry for guide metadata, bodies, authorship, dates, keywords, and related routes.
- `src/pages/CareerGuidesIndexPage.jsx` renders the hub.
- `src/pages/CareerGuidePage.jsx` renders each guide using the existing accessible content renderer.
- Dedicated route modules keep every canonical guide URL statically prerenderable.
- `src/seo/internalLinks.js` connects the hub, guides, course modules, placements, FAQs, and contact pages. The formal registry includes every guide, so no guide is orphaned.
- `src/seo/seoRoutes.js` provides unique titles, descriptions, canonicals, breadcrumbs, Article entities, and author/date relationships.
- The main blog index links into the career-guide hub for an additional crawl path.
- The hub topic map adds visible primary/support pathways for the ten operations topics without duplicating canonical pages.

## Keyword strategy result

The regenerated report shows:

- 728 mapped keywords
- 728 keywords with published canonical owners
- zero keywords remaining under governed future destinations
- zero unmapped keywords
- zero keyword conflicts
- zero orphan pages

Each published owner is kept separate from business, regional, comparison, interview, and module-intent pages so future content can be added only when it has a distinct purpose and sufficient evidence.

## Automated protection

`tools/verify-career-guides.js` is connected to `npm run seo:check` and validates the hub and all 26 guides for:

- title, description, robots, canonical, H1, and breadcrumb output
- direct answer content, author, and date signals
- Article structured data and article-to-page relationships
- related-guide and contextual internal links
- published program context
- absence of unsupported salary and guarantee language

`tools/verify-phase5-informational-content.js` additionally verifies the approved visible keyword checks, all ten operations-topic pathways, their primary and supporting internal links, and sitemap inclusion for each destination.

## Validation

Run the complete production check with:

```text
npm run deployment:prepare
npm run seo:gate
```

The generated upload directory is `build/client`.

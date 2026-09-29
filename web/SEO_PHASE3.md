# SEO Phase 3 — Strengthen the highest-value pages

Implementation date: 2026-09-24

Phase 3 strengthens the highest-priority approved keyword owners without
creating thin keyword pages or changing the meaning of approved Centaur Careers
content. The Financial Operations Masterclass remains the single primary
program.

## Pages strengthened

- `/courses/` — primary commercial program hub.
- `/locations/lucknow/` — verified offline/local acquisition page.
- `/courses/investment-banking-operations/` — subordinate module page.
- `/courses/retail-banking/` — subordinate module page.
- `/courses/finance-operations/` — subordinate module page.

The current highest-priority contract is derived from the keyword map and covers
`/courses/`, `/locations/lucknow/`, `/courses/kyc-aml/`, `/india/`, and
`/career-guides/choosing-finance-career-course/`. The existing module pages
above remain covered by the commercial-page and internal-link validators.

## Implemented

### Primary program hub

`/courses/` now exposes the verified source material in a clearer crawlable
sequence: modules, program details, practical program features, the three-step
process, online/offline modes and pricing, certificate information, comparison,
program FAQs, contextual links, and application CTA.

The new program details and FAQ content reuse existing approved source values.
No new salary, placement, employer, duration, or certification claim was added.

### Lucknow page

The Lucknow page now connects the verified address and offline mode to the
Financial Operations Masterclass, lists the existing career tracks, links to the
published module/program/contact routes, and exposes selected original program
answers as local student FAQs. No additional branch, landmark, outcome, or local
business claim was introduced.

### Module pages

All three existing module pages now have explicit structural markers for module
overview, process, module directory, and FAQs. Their program relationship is
linked directly to `/courses/` and continues to state that each subject is taught
within the Financial Operations Masterclass rather than presented as a separate
program.

### Commercial decision support

The three linked course-module pages and the KYC / AML high-value module now
include a shared decision checklist. It helps visitors verify the syllabus,
current cohort, learning mode, fees, certificate wording, and written support or
Job Guarantee Program terms before enrolling. The checklist links back to the
primary program and contact routes without creating a separate module offer or
unsupported outcome claim.

## Highest-value page contract

The Phase 2 keyword map now supplies the Phase 3 priority threshold. The
contract in [`src/content/seo/highValuePages.js`](src/content/seo/highValuePages.js)
requires each priority owner to have:

- a rendered indexable page with the approved title, description, canonical, and
  primary keyword;
- visible intent coverage for important search terms, not a keyword list;
- a direct answer or decision-support section appropriate to the page intent;
- contextual links to the next commercial or research step;
- sitemap membership, a conversion path, and a minimum useful content floor.

The current contract covers `/courses/`, `/locations/lucknow/`,
`/courses/kyc-aml/`, `/india/`, and
`/career-guides/choosing-finance-career-course/`. Provider-specific claims
remain confirmation-controlled; the implementation does not add unsupported
salary, employer, placement, local-branch, credential, or outcome claims.

`tools/verify-phase3-high-value-pages.js` is included in `npm run seo:check` and
the full `npm run seo:gate`.

## Validation

`tools/verify-commercial-pages.js` verifies:

- required sections on each commercial page;
- verified program, location, and FAQ material in prerendered HTML;
- links to the primary program and relevant support routes;
- subordinate module wording;
- absence of prohibited guarantee language.

The validator is included in `npm run seo:check` and the full `npm run seo:gate`.

Run the focused Phase 3 check after a production build:

```text
npm run build
npm run seo:phase3:check
```

## Completion

Phase 3 is complete for the five highest-priority owners. The pages are
indexable, rendered, connected to the sitemap, covered by the keyword-
indexability map, and validated for search intent and conversion paths. Lower-
priority owners continue through the later content and maintenance phases.

## Regional commercial completion

Phase 3 now treats all five published regional guides as high-value owners at
the approved regional priority threshold. Each page must render its regional
direct answer, provider-access boundary, online-access bridge, evidence block,
FAQ, illustrative local example, canonical conversion paths, and the one-
program relationship. This keeps regional pages useful for both city queries
and online learners without presenting a city classroom or city-specific job
outcome that is not verified.

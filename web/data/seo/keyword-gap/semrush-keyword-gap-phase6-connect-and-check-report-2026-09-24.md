# Semrush keyword gap: Phase 6 — connect and check pages

Completed: 2026-09-24  
Scope: connect the published Phase 5 keyword pages to relevant discovery hubs and career guidance, then verify those connections in the prerendered production HTML. No new keyword pages or course offerings were added.

## Connection work

- The home-page career-track cards now link directly to each matching module guide rather than depending on a generic course or guide path.
- The Courses and India hubs link their topic cards directly to all six relevant module guides.
- KYC / AML, Digital Payments, and FinTech career-intent pathways now point to their corresponding module guides and clearly identify them as subjects within the Financial Operations Masterclass.
- The contextual internal-link graph now includes hub-to-module and career-guide-to-module connections, with reciprocal module-to-career-guide routes. The three Phase 5 module guides are also tracked as priority internal-authority destinations with required inbound sources.
- Added checked learner journeys for KYC / AML, Digital Payments, and FinTech, alongside the existing commercial, career, resource, regional, and local journeys.

## Repeatable checks

`npm run seo:phase6:check` verifies that:

- Each of the six module guides has descriptive, direct links rendered on Home, Courses, and India.
- The registered topical connections are present in rendered related-page navigation.
- The three relevant career guides render correctly labelled links to their matching module guides.
- All seven Phase 5 destinations are indexable, prerendered, and have registered internal inbound links.
- All 24 approved keyword destinations are published as indexable routes.

The Phase 6 check is included in `npm run seo:check`.

## Verification results

- `npm run build` — passed; generated 51 canonical sitemap URLs and prerendered the site.
- `npm run lint` — passed.
- `npm run seo:phase6:check` — passed; six module routes are connected through the three hubs, the reciprocal topic paths render, seven Phase 5 destinations are reachable, and all 24 keyword destinations are indexable.
- `npm run seo:check` — all included checks passed except the existing protected-content hash check for `src/content/businessData.js` against `docs/content-protection-manifest.json`. Neither protected file was changed in Phase 6. The blog-content check also reports its existing optional cover-image warning for the RBI draft article; that check passes.

These pages are built locally. They have not thereby been deployed, crawled, indexed, or guaranteed rankings; those outcomes depend on the live deployment and search engines.

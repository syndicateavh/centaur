# SEO Phase 9 — comparison content

**Reviewed:** 2026-10-02 (Asia/Kolkata)  
**Status:** Complete in the codebase and production build.

## Implemented

- Published the indexable comparison guide at [`/compare/investment-banking-operations-courses/`](https://centaurcareers.in/compare/investment-banking-operations-courses/).
- Added a neutral, dated content model in `src/content/comparisonPage.js` with a direct answer, five decision criteria, six official provider source snapshots, a separate Centaur description, five FAQs, a before-payment checklist, and a source register.
- Added the comparison renderer in `src/pages/ComparisonPage.jsx` and registered the route in `src/routes.js` and `src/seo/seoRoutes.js`.
- Added canonical, `index,follow`, title, description, breadcrumb, review-status, and source-review markers. The route is included in the generated sitemap.
- Added internal links to relevant course, career-guide, resource, India, FAQ, placement, and contact pages.
- Kept provider descriptions attributable to official URLs. The page has no provider logos, copied competitor wording, unsupported rankings, fee or salary claims, employment guarantees, or Course/Article structured data.
- Added `npm run seo:phase9:check` as the phase-specific alias for the comparison verifier; the existing `npm run seo:comparison:check` remains available.

## Validation

Passed on 2026-10-02:

```text
npm run seo:phase9:check
npm run seo:comparison:check
npm run seo:gate
npm run test:seo:gate-wiring
```

The comparison verifier confirms the prerendered HTML, metadata, canonical, index directive, H1, neutral notice, matrix, checklist, source register, provider attribution, FAQs, internal links, sitemap membership, 650-word minimum, and prohibited-claim controls. The production gate completed the build, lint, route checks, sitemap generation, and architecture checks.

The deployed comparison URL returned HTTP 200 on 2026-10-02 and exposed the expected title, canonical URL, `index,follow` directive, comparison marker, and source-register marker. All seven registered provider URLs also returned HTTP 200 at review time, including the historical brochure reference.

## Source freshness rule

Provider syllabus, schedule, fee, credential, and support terms can change. Before editing a provider summary or source URL, reopen the official page, update `updatedAt` in `src/content/comparisonPage.js`, and rerun both comparison gates. If a source cannot be checked or the neutral evidence rules no longer hold, remove the route from the indexable set until it is reviewed.

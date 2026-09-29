# SEO keyword-indexability map

`seo-keyword-indexability-map.json` is the generated Phase 2 contract for the
approved keyword strategy. It connects search demand to a single canonical page
and proves that page can be discovered and indexed.

The map contains two synchronized layers:

- `targets`: one record per canonical strategy destination, including primary and
  supporting keywords, intent and funnel, evidence and update dates, route
  indexability, sitemap membership, prerendered output, canonical validation,
  internal-link coverage, and conversion destination;
- `keywords`: one record per approved keyword, including its unique owner,
  strategy classification, evidence notes, and inherited indexability state.

## Generate and verify

Run the production build first so sitemap and rendered HTML checks use the same
output that will be deployed:

```text
npm run build
npm run seo:keywords:indexability:map
npm run seo:keywords:indexability:check
```

`npm run seo:check` runs the verifier automatically. The verifier fails when the
generated JSON is stale or when any approved keyword is assigned to a missing,
non-indexable, non-canonical, non-prerendered, sitemap-missing, or orphaned page.

The JSON is generated from `src/content/seo/keywordStrategyData.js`,
`src/seo/seoRoutes.js`, and `src/seo/internalLinks.js`; edit those source-of-truth
files and regenerate the map after an approved strategy or route change.

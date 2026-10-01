# SEO Phase 1 — indexability — 2026-09-30

## Change summary

Made the substantive public policy pages indexable so they are eligible for search discovery and sitemap inclusion:

- `/terms-and-conditions/`
- `/cookie-policy/`
- `/refund-cancellation-policy/`
- `/disclaimer/`

These pages already existed, had page-specific title/description/H1 metadata, contained multi-section policy content, and were linked from the site footer. The privacy policy was already indexable. No new URL was created and no existing URL was removed.

## Kept excluded

- `/404/` remains `noindex,follow` and excluded from the sitemap.
- `/blog-portal` remains `noindex,nofollow,noarchive`.
- Missing blog posts remain noindex.
- Blog categories are included only when they are known categories with published posts; the empty `industry-updates` archive remains noindex while editorially gated.
- Unpublished blog records are excluded from the published-post sitemap.

The site-wide robots file remains open to crawling and points at the canonical sitemap. No robots disallow rule was added. Canonical host, HTTPS redirects, trailing-slash rules, and 404 behavior were not changed.

## Generated outputs

- `public/sitemap.xml` regenerated with 189 canonical URLs.
- `data/seo/indexing/indexing-manifest.json` regenerated with 189 entries.
- SEO route registry now has 97 indexable routes out of 98; the sole route-level noindex URL is `/404/`.

Sitemap and manifest counts describe crawl/indexing eligibility from the current source. They are not evidence that Google has indexed these URLs. Search Console data is still required to measure actual index coverage, clicks and impressions.

## Files changed in this phase

- `src/seo/seoRoutes.js` — changed the four public policy routes to `indexable: true` and set their route update dates to 2026-09-30.
- `public/sitemap.xml` — regenerated from indexable routes and published blog entries.
- `data/seo/indexing/indexing-manifest.json` — regenerated from the sitemap.
- `release/seo-phase1-indexability-2026-09-30.md` — this implementation note.

The Phase 0 snapshot remains unchanged as the pre-Phase-1 baseline. The homepage hero was not edited in this phase. Existing unrelated working-tree changes were preserved. No build, tests, live deployment, or Search Console submission was performed.

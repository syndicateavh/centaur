# SEO Phase 10 — internal linking and authority building

**Reviewed:** 2026-10-02 (Asia/Kolkata)  
**Status:** Phase-specific implementation complete and verified.

## Implemented

- Added the governed authority model in `src/content/seo/authorityBuilding.js` with 12 priority destinations, 13 tested journeys, and a crawl-depth limit of three clicks from the homepage.
- Connected the model to `src/seo/internalLinks.js` and the rendered `InternalLinkGroup`, so indexable pages emit contextual, followable, canonical internal links.
- Added inbound-link requirements for the primary course hub, India hub, career and resource hubs, placements, Lucknow, and course modules.
- Added an evidence-only editorial authority asset inventory. Assets have reader value, audience, format, target URL, and freshness status; gated assets cannot enter the outreach queue.
- Kept the backlink registry manual and guarded. Prospects require asset context and a useful editorial angle; earned or monitoring states require a manually checked public HTTPS source. Automated submissions, paid links, large-scale exchanges, and private networks remain rejected.
- Refreshed `SEO_AUTHORITY_REPORT.md` from the current route graph and registered `npm run seo:phase10:check` as the phase-specific verifier alias.

## Validation

Passed on 2026-10-02:

```text
npm run seo:phase10:check
npm run seo:authority:check
npm run seo:authority:report
npm run backlinks:validate
npm run test:seo:gate-wiring
```

The authority verifier reported 12 priority targets, 13 tested journeys, 359 priority inbound edges, prerendered followable authority links, and an evidence-only backlink plan. The generated report records 97 indexable routes and 22 external prospects as planning records, not earned links.

The deployed homepage, Courses, India, Career Guides, Resources, Placements, and Lucknow routes each returned HTTP 200 on 2026-10-02 and exposed the internal authority-link group without `nofollow` links.

## Evidence boundary

No ranking, traffic, domain-authority, or backlink outcome is claimed. Search Console and backlink-audit imports remain the evidence source for external performance. Genuine external authority can only be recorded after an independent publisher places a relevant public link and that source is manually checked.

The generic `npm run seo:check` currently reports unrelated failures in protected content governance, claim/source controls, keyword ownership, commercial-page evidence, job-intent downloads, and accessibility. Those failures are outside the Phase 10 authority verifier; they must be resolved separately before the repository-wide SEO gate can be green.

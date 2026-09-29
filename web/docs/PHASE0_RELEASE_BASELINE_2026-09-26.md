# Phase 0 release and measurement handoff — 26 September 2026

## Status

The local release is built and passes the complete release QA gate. **Production deployment and the Search Console/confirmed-enquiry baseline are pending external access.** No deployment date or search performance value has been inferred from the local build.

## Release candidate

- QA: `npm run release:qa` passed on 26 September 2026 (see `RELEASE_QA_REPORT.md` and `RELEASE_MANIFEST.json`). This includes the build, lint, content governance, rendered SEO, internal links, schema, HTTP behaviour, and static deployment checks.
- Output: `build/client/`, 363 files, 45 route documents, 40 indexable route pages, and 64 sitemap URLs. Upload the **contents** to Hostinger `public_html/`, including `.htaccess`.
- Portable archive: `release/centaur-phase0-2026-09-26-portable.zip` (35,410,220 bytes). ZIP paths use forward slashes; `.htaccess`, `404/index.html`, `sitemap.xml`, and the route HTML files are present. ZIP CRC check passed.
- Archive SHA-256: `92a9897669d41ed40978562459a69cbce7163988018acd13c4ac570bf4e25bca`.
- The current-offer boundary remains one six-week Financial Operations Masterclass; the linked operations and KYC subjects are modules or career guidance, not separately advertised qualifications. The seven Phase 0 owner pages passed the rendered SEO and claims gates.
- The homepage H1 in this package no longer publishes the unverified ₹3–12 LPA salary claim. Named learner testimonials were removed from the homepage render pending the consent evidence required by `docs/CLAIMS_EVIDENCE_POLICY.md`; source records remain protected.
- The accounting interview resource is in this build because it is already registered as a public route in the worktree. Its worked case is explicitly fictional and the schema uses Centaur Careers as the declared author. Obtain the editorial review described in the Phase 2 brief before approving that new page for production.

## Live check before upload

On 26 September 2026, all eight sampled URLs (`/`, `/courses/`, the five listed Phase 0 career guides, and `/resources/investment-banking-interview-questions/`) returned HTTP 200 with a self canonical, `index,follow`, one H1, and a JSON-LD block. The saved read-only snapshot is `release/phase0-live-predeploy-2026-09-26.json`.

The live homepage still says **“Get a ₹3–12 LPA Finance Job in 6 Weeks”** in its H1. The release package says **“Financial Operations Masterclass with a 100% Job Guarantee”**. The live `/courses/` title, introductory text, and meta description differ from the package. The live high-intent pages also have fewer or different internal links than the package. These observations confirm that the release candidate has **not** yet been deployed; matching title/H1 alone on other URLs does not prove the refreshed sections are live.

## Deployment and post-release verification

1. Back up the current Hostinger document root. Upload the archive **contents** into `public_html/` without an extra directory layer. Keep `.htaccess`. Clear the site/CDN cache after upload.
2. Record the actual upload and cache-clear time in IST here: **unavailable until deployed**.
3. Run `npm run seo:external -- https://centaurcareers.in` after upload. Inspect the eight Phase 0 URLs for HTTP 200, intended title, one H1, first answer, self canonical, `index,follow`, JSON-LD, and contextual links; inspect `/robots.txt` and `/sitemap.xml`. Save the live-check result and any remediation date here.
4. In the authorised Search Console property, inspect Page Indexing, URL Inspection, and sitemap processing. Local QA cannot establish Google indexing.

## Measurement baseline

Use the same verified Search Console property, Web search type, India filter where available, and device scope for both windows. Export **Queries** and **Pages** separately for each completed 28-day period:

| Window | Dates, inclusive | Queries export | Pages export | Confirmed organic enquiries by landing page |
| --- | --- | --- | --- | --- |
| Older | 2026-07-30 to 2026-08-26 | Unavailable | Unavailable | Unavailable |
| Newer | 2026-08-27 to 2026-09-23 | Unavailable | Unavailable | Unavailable |

Import the four exports with the dated `seo:measure:import:gsc` commands in `docs/SEO_MEASUREMENT_AND_MAINTENANCE.md`, then run `npm run seo:measure:report`. Do not turn missing rows into zero traffic. A CTA click is contact intent, not a confirmed enquiry; use authorised GA4/CRM records for the latter. The local measurement report currently records unavailable data.

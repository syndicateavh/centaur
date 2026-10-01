# Final Release QA Report

Generated: 2026-09-29T21:18:36.209Z

Status: **local-qa-failed**

This report covers the repository-controlled static release package. It does not claim that search engines have indexed the site or that external authority/backlinks have been earned.

## Package

- Site origin: https://centaurcareers.in
- Upload directory: `build/client`
- Route documents: 98
- Indexable routes: 97
- Sitemap URLs: 191
- Package files: 663
- Package bytes before transfer compression: 135975334
- Upload rule: upload the contents of `build/client/`, preserving `.htaccess`; do not upload the repository, `build/server`, or a nested `build/client/` directory.

## Automated checks

- FAIL — `npm.cmd run seo:gate` (68550 ms)
- PASS — `npm.cmd run seo:authority:report` (815 ms)
- PASS — `npm.cmd run seo:measure:report` (1000 ms)
- SKIP — `npm run seo:external -- <deployed-origin>` (0 ms)

## External deployment

External verification was not run. Set `RELEASE_EXTERNAL_ORIGIN` after deployment to verify the live host.

The live release remains dependent on uploading this package to the configured hosting document root, clearing any relevant cache, and running the external check against the deployed origin.

## Learning handoff

Run `npm run release:learn` after this QA report to record Search Console, GA4/CRM, and keep/revise/stop decision readiness. Missing exports remain pending evidence.

## Failures

- complete SEO quality gate

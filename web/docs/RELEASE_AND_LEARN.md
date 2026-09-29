# Release and learn

This is the final release handoff for the SEO implementation. It separates the
repository release result from live deployment and from the performance evidence
needed to decide whether each change should stay, be revised, or be stopped.

## Run the handoff

From the project root:

```powershell
npm.cmd run release:prepare
```

`release:prepare` runs the complete local release QA and then writes
`RELEASE_LEARNING_REPORT.md`. The QA package is the contents of `build/client/`.
The current Phase 2 accounting and Phase 3 case materials still require
qualified expert approval before this package is published. A passing QA run
checks the build and technical SEO; it does not grant editorial approval.
Keep `.htaccess`, `robots.txt`, `sitemap.xml`, `llms.txt`, and every prerendered
route when uploading to the hosting document root.

After the upload and cache clear, run the live check:

```powershell
$env:RELEASE_EXTERNAL_ORIGIN = 'https://centaurcareers.in'
npm.cmd run release:qa
npm.cmd run release:learn
```

The external check is intentionally separate from local QA. A passing local build
does not prove that the deployed host serves the current package or that crawlers
can fetch it.

## Learning cycle

For the next completed reporting window, export Search Console **Queries** and
**Pages** for two adjacent completed 28-day periods using the same property,
search type, country, device, and filters. Import the older period first, then
the newer one. The context values below are an example; use the settings actually
selected in Search Console. Use `none` for `--filters` only if no additional
query or page filter was applied:

```powershell
$gscContext = @('--property', 'sc-domain:centaurcareers.in', '--search-type', 'web', '--country', 'IND', '--device', 'all', '--filters', 'none')
npm.cmd run seo:measure:import:gsc -- C:\path\older-queries.csv --from YYYY-MM-DD --to YYYY-MM-DD @gscContext
npm.cmd run seo:measure:import:gsc -- C:\path\older-pages.csv --from YYYY-MM-DD --to YYYY-MM-DD @gscContext
npm.cmd run seo:measure:import:gsc -- C:\path\newer-queries.csv --from YYYY-MM-DD --to YYYY-MM-DD @gscContext
npm.cmd run seo:measure:import:gsc -- C:\path\newer-pages.csv --from YYYY-MM-DD --to YYYY-MM-DD @gscContext
npm.cmd run seo:measure:report
npm.cmd run release:learn
```

Export organic landing-page **confirmed enquiries** from GA4/CRM for the same
windows. `lead_cta_click` is contact intent and cannot stand in for a confirmed
or qualified enquiry. Missing or anonymized Search Console rows are not zero.
For each shortlisted page, export **Queries with that exact Page filter** for
both windows. Sitewide Queries and Pages tables cannot establish a URL/query
pair. The importer records the chosen filter values but cannot verify the
Search Console UI settings from a CSV, so check the exports against the account.

## Decision rules

- **Keep** a change when relevant impressions/clicks and qualified enquiries
  improve without an indexing or content-quality regression.
- **Revise** when exposure exists but CTR, position, landing-page engagement, or
  qualified enquiries are weak after checking query mix and search intent.
- **Stop or consolidate** only after two comparable windows show no relevant
  demand or conversion and overlap with another canonical owner has been checked.
- **Hold** when exports are missing, mismatched, or filtered differently.

The generated report records the current evidence state and next action. It never
claims ranking, indexing, AI citation, or enquiry gains from incomplete data.

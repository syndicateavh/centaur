# Local SEO measurement snapshots

Search Console query/page exports and backlink audits are stored locally. The JSON snapshots, archive history, and generated `src/content/seo/measurements/SEO_MEASUREMENT_REPORT.md` are git-ignored because search queries and referring-site records can be sensitive. Do not commit or share raw exports without authorization.

The Phase 0 handoff is documented in [docs/SEO_PHASE0_MEASUREMENT_BASELINE.md](../../../../docs/SEO_PHASE0_MEASUREMENT_BASELINE.md). It records the event contract and makes the current external baseline boundary explicit: missing Search Console, GA4/CRM, and backlink exports are unavailable, not zero.

## Monthly Search Console review

In Search Console, select the production property, Web search, **all countries**, **all devices**, and no extra query/page filters. Export the **Queries** table and **Pages** table separately for two adjacent, completed, equal-length date ranges. Record the actual UI settings with every import; the CSV alone does not prove them. The normal UI table export may not include a Date column, so pass the selected date range explicitly. For daily exports that do include Date, the importer derives the range unless `--from` and `--to` are supplied.

```text
npm run seo:measure:import:gsc -- C:\path\to\prior-queries.csv --from 2026-08-01 --to 2026-08-28 --property sc-domain:centaurcareers.in --search-type web --country all --device all --filters none
npm run seo:measure:import:gsc -- C:\path\to\prior-pages.csv --from 2026-08-01 --to 2026-08-28 --property sc-domain:centaurcareers.in --search-type web --country all --device all --filters none
npm run seo:measure:import:gsc -- C:\path\to\current-queries.csv --from 2026-08-29 --to 2026-09-25 --property sc-domain:centaurcareers.in --search-type web --country all --device all --filters none
npm run seo:measure:import:gsc -- C:\path\to\current-pages.csv --from 2026-08-29 --to 2026-09-25 --property sc-domain:centaurcareers.in --search-type web --country all --device all --filters none
npm run seo:measure:report
```

Query and page snapshots are kept separately. When a different reporting period or filter setting is imported, the previous snapshot is copied into the local `history/` directory before the latest file is replaced. Import the older comparison period first and the newer period second for both dimensions. Refreshing the same date range with the same settings replaces that dimension's latest snapshot without creating a misleading duplicate-period comparison. The dates above are an example of the import format, not the post-release comparison period.

## Backlink audit

```text
npm run seo:measure:import:backlinks -- C:\path\to\backlink-audit.csv
npm run seo:measure:report
```

The report compares only adjacent, equal-length windows of the same dimension with identical recorded settings. It separates brand-containing and other exported queries, lists the largest matched-row click and impression changes, and lists values seen in only one export for manual inspection. Missing, anonymized, or unexported rows are not treated as zero. A page-review flag is a prompt for human review, not an automatic content change. Query and Page totals are separate views of search activity and must not be added; a page/query pair requires a separate page-filtered Query export. No rankings, qualified leads, or earned backlinks are inferred from missing data or third-party estimates.

## Validation

Run `npm run seo:measurement:check`, `npm run test:seo:measurement`, and `npm run seo:measure:report`. Synthetic fixtures used by the measurement test are created in a temporary directory and removed after the test; they are never presented as site performance.

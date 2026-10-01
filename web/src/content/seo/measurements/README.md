# Local SEO measurement snapshots

Search Console query/page exports and backlink audits are stored locally. The JSON snapshots, archive history, and generated `src/content/seo/measurements/SEO_MEASUREMENT_REPORT.md` are git-ignored because search queries and referring-site records can be sensitive. Do not commit or share raw exports without authorization.

The event contract is implemented in `src/analytics/measurementTaxonomy.js` and `src/components/AnalyticsPageView.jsx`. The baseline boundary is explicit: missing Search Console, GA4/CRM, and backlink exports are unavailable, not zero. Current local files do not include authorized Search Console or GA4/CRM outcome exports, so this workflow cannot report actual organic visits or confirmed leads yet.

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

## Monthly cycle

Use two consecutive completed **28-day windows** with identical Search Console property, search type, country, device, and filter settings. Export Query and Page tables for each window, import the older period first and the newer period second, then generate the report. A missing comparison period, mismatched filters, incomplete daily date coverage, or absent snapshot must remain “unavailable”; do not fill missing rows with zero.

Review these items monthly:

- Clicks, impressions, CTR, and impression-weighted average position for each separately imported dimension.
- Query-to-page ownership against the approved keyword/page map. Confirm the actual landing page in Search Console before changing a page.
- **Landing-page leads:** use authorized GA4/CRM aggregate reporting and a verified successful form or qualified-enquiry event. `lead_cta_click` is contact intent only; it is not a submitted form, confirmed lead, or qualified enquiry. No live GA4/CRM outcome export is available in this workspace.
- Internal pathway engagement from `internal_pathway_click`. It records navigation and does not prove reading, conversion, or a qualified lead.
- Backlink candidates and earned links. Mark a link earned only after manually confirming that the live source URL contains a relevant link to the site.

### Indexing

Review Search Console Page Indexing, URL Inspection, sitemap processing, and manual actions in the authorized account. Local sitemap checks cannot prove Google indexed a URL.

The report's low-CTR/page review thresholds are triage prompts only. Inspect query mix, device/country scope, branded demand, SERP features, the visible result, and the landing page before proposing an edit. Record the evidence, observation date, canonical page owner, proposed change, reviewer, and outcome in the team's change tracker. Search volume or an impression spike alone does not justify creating a page, repeating a keyword, or expanding course claims.

## Quarterly and release maintenance

Quarterly, review keyword ownership for overlap, confirm current course and career facts, refresh dated regional sources, check internal links, and decide whether each page remains useful. Consolidate or retire a URL only after checking search intent, inbound links, and performance evidence. The **Financial Operations Masterclass is the only current offering**; KYC/AML, Digital Payments, and FinTech are modules, not standalone courses or credentials.

After every release, run the normal build, SEO, and deployment checks, then review Search Console crawl and index status after deployment. During an active release or major page refresh, review indexing errors and unexpected canonical or broken-URL changes weekly. A local build or verification result is not evidence of live indexing or traffic.

## Validation

Run `npm run seo:measurement:check`, `npm run test:seo:measurement`, and `npm run seo:measure:report`. Synthetic fixtures used by the measurement test are created in a temporary directory and removed after the test; they are never presented as site performance.

Phase 7 readiness can be checked with `npm run seo:phase7:check`. Its live-baseline status depends on authorized production exports supplied by the account owner; there are no credentials or private exports embedded in this repository.

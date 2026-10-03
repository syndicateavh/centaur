# SEO Phase 8 — performance baseline and indexing evidence

**Reviewed:** 2026-10-02 (Asia/Kolkata)  
**Status:** Current-period export imported; period-over-period baseline and Google index evidence are still pending.

## Work completed

- Reviewed the existing Search Console importer, comparison report, and indexing-inspection workflow. Phase 7 already provides separate Query and Page imports, comparable-window checks, private local storage, and an evidence-only report.
- Checked the local measurement directory. It contains the workflow README and an older generated report, but no current Query/Page snapshot JSON or archived comparison windows.
- Checked indexing evidence. The indexing report records no Google URL Inspection snapshot; the public-fetch snapshot is old and explicitly does not represent Google's index decision.
- Confirmed that `GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN` is not available in this environment. No live Search Console API inspection was attempted.
- Read the supplied workbook `centaurcareers.in-Performance-on-Search-2026-10-02.xlsx`. It contains Chart, Queries, Pages, Countries, Devices, Search appearance, and Filters sheets. The chart covers 2026-09-01 through 2026-09-28; the Filters sheet records Web search and “Last 28 days”.
- Imported 278 Query rows and 86 canonicalized Page rows into the existing local measurement workflow. The generated report is `src/content/seo/measurements/SEO_MEASUREMENT_REPORT.md` and `npm run seo:measurement:check` passes.

## Existing historical evidence (not a Phase 8 baseline)

The 2026-09-26 search-measurement audit records a Search Console workbook for 2026-08-27 through 2026-09-23, Web search, filtered to query `centaur careers` and the former `www` homepage: 59 clicks, 130 impressions, 45.38% CTR, average position 1.22. This is branded, single-URL evidence for one period. It cannot establish non-brand performance, current canonical-page performance, or a period-over-period change.

The repository's sitemap and route manifest describe URLs eligible for discovery from the current source. They are not Google index-coverage data.

## Current export observations

The chart, country, and device sheets report **193 clicks and 3,122 impressions** for the period. The exported Query table contains 278 visible rows with **86 clicks and 1,273 impressions**; this is a visible-row subtotal and does not represent the full property total.

The Query table's visible rows contain 77 brand-containing clicks from 340 impressions and 9 non-brand clicks from 933 impressions. The largest non-brand impression opportunities are `golden rules of accounting` (216 impressions, position 12.00, 0 clicks), `investment banking operations` (71, position 7.34, 2 clicks), `format of trial balance` (34, position 8.41, 0 clicks), and `trial balance format` (23, position 9.13, 0 clicks). These are review candidates, not automatic rewrite instructions.

The Pages sheet contains both `www` and non-`www` homepage rows and a trailing-slash duplicate for one blog URL. They were canonicalized by path before import. The original Page table sums to **194 clicks and 3,888 impressions**, which does not reconcile with the chart/country/device total of 193 clicks and 3,122 impressions. This source inconsistency must be resolved with a fresh export or Search Console UI/API query before using page totals for decisions.

Within the visible Page rows, the clearest review candidates are `/career-guides/investment-banking-operations/` (288 impressions, 1.39% CTR, position 7.60), `/resources/accounting-basics/` (281 impressions, 0 clicks, position 13.26), `/career-guides/kyc-aml-analyst/` (199 impressions, 0 clicks, position 9.39), and `/india/` (211 impressions, 6.64% CTR, position 7.80). These values inherit the export reconciliation limitation.

The older local workbook `centaurcareers.in-Performance-on-Search-2026-09-26.xlsx` cannot be used as the preceding sitewide window. Its Filters sheet restricts the report to query `centaur careers` and page `https://www.centaurcareers.in/`, with chart dates 2026-08-27 through 2026-09-23. It is retained as historical branded evidence only.

## Evidence required to complete the baseline

1. From the verified production Search Console property, export the **Queries** and **Pages** tables for two consecutive, completed, equal-length 28-day windows. Use Web search, all countries, all devices, and no additional query/page filters. Record the exact date ranges and selected settings.
2. Import the older pair first, then the newer pair, using the commands in `src/content/seo/measurements/README.md`. Generate `SEO_MEASUREMENT_REPORT.md` with `npm run seo:measure:report`.
3. In the authorized Search Console account, record Page Indexing and sitemap processing status. Inspect canonical URLs for the course page and priority career guides with URL Inspection. An API run requires an authorized token; an account export or screenshots are acceptable for a manual evidence note.
4. Report clicks, impressions, CTR and impression-weighted average position from the imported rows only. Separate branded and non-branded queries, note export limits/anonymization, and do not infer missing rows as zero.

Until the preceding comparison period, explicit export settings, and index inspection are supplied, changes between periods and current Google index coverage remain **unavailable**. Do not select page rewrites from this report alone; first resolve the page-table reconciliation issue and inspect page-filtered queries for shortlisted URLs.

## Existing local commands

```text
npm run seo:measure:import:gsc -- <older-queries.csv> --from YYYY-MM-DD --to YYYY-MM-DD --property sc-domain:centaurcareers.in --search-type web --country all --device all --filters none
npm run seo:measure:import:gsc -- <older-pages.csv> --from YYYY-MM-DD --to YYYY-MM-DD --property sc-domain:centaurcareers.in --search-type web --country all --device all --filters none
npm run seo:measure:import:gsc -- <newer-queries.csv> --from YYYY-MM-DD --to YYYY-MM-DD --property sc-domain:centaurcareers.in --search-type web --country all --device all --filters none
npm run seo:measure:import:gsc -- <newer-pages.csv> --from YYYY-MM-DD --to YYYY-MM-DD --property sc-domain:centaurcareers.in --search-type web --country all --device all --filters none
npm run seo:measure:report
npm run seo:indexing:inspect -- --priority --live --confirm
npm run seo:indexing:import -- <inspection-export.json> --date YYYY-MM-DD
```

Raw query exports and generated measurements remain git-ignored as documented in the measurement workflow.

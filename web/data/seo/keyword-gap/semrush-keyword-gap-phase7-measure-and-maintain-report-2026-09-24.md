# Semrush keyword gap: Phase 7 — measure and maintain

Completed: 2026-09-24  
Scope: implement a private, repeatable Search Console/backlink measurement workflow and a monthly/quarterly maintenance process. This phase does not invent a ranking, click, lead, or backlink baseline.

## Measurement workflow implemented

- Search Console Query and Page CSV exports are stored independently, so importing one dimension no longer replaces the other.
- Standard period-aggregate exports without a Date column require the selected `--from` and `--to` dates. Daily exports validate their dates and the selected range.
- Page exports are normalized to site-relative canonical paths; off-site page rows are rejected. Backlink exports likewise reject target pages outside the configured site.
- A previous dimension snapshot is archived locally before a different reporting period replaces it. Re-importing the same window refreshes that window without creating a duplicate comparison period.
- The report calculates CTR from total clicks/impressions and impressions-weights average position. It compares only equal-length, earlier archived windows of the same dimension and reports row-scoped totals.
- The report maps exact approved strategy queries and canonical page rows to the 24 approved page owners. Missing or anonymized rows are called out as unavailable—not zero.
- Low-CTR/page-position flags require complete metrics and are review prompts only; the workflow makes no automatic copy changes.
- Backlink imports retain local audit history; a link is not called earned based on a prospect list or an unverified export.
- Raw snapshots, history, and the generated measurement report are git-ignored. Automated tests use synthetic data in a validated temporary folder and remove it after completion.

## Maintenance cadence

Added [`docs/SEO_MEASUREMENT_AND_MAINTENANCE.md`](../../../docs/SEO_MEASUREMENT_AND_MAINTENANCE.md) with same-filter 28-day comparison instructions, monthly performance review, weekly indexing/release checks, quarterly owner/source review, safe prioritization rules, and evidence requirements. Analytics guidance now points to the same workflow.

Commands:

```text
npm run seo:measure:import:gsc -- <queries.csv> --from YYYY-MM-DD --to YYYY-MM-DD
npm run seo:measure:import:gsc -- <pages.csv> --from YYYY-MM-DD --to YYYY-MM-DD
npm run seo:measure:report
npm run seo:measurement:check
npm run test:seo:measurement
npm run seo:phase7:check
```

The measurement test and Phase 7 readiness check are wired into `npm run seo:check`.

## Verification

- `npm run lint` — passed.
- `npm run test:seo:gate-wiring` — passed.
- `npm run test:seo:measurement` — passed for period imports, explicit date requirements, separate Query/Page storage, archive behavior, site URL checks, equal-length period comparison, null-safe review flags, and private report output.
- `npm run seo:measurement:check` — passed.
- `npm run seo:phase7:check` — passed; it reports that authorized live Query and Page exports are still needed.
- `npm run seo:measure:report` — passed and generated a local report that says the live baseline is unavailable. It is git-ignored.
- `npm run seo:check` — all included checks passed except the existing content-governance protected hash mismatch for `src/content/businessData.js` against `docs/content-protection-manifest.json`. That protected file was not changed in Phase 7. The suite's optional RBI draft cover-image warning remains non-failing.

## Data still required to measure actual results

The workspace contains no production Google Search Console CSVs, GA4/CRM landing-page outcome export, or current backlink audit snapshot. Those require an authorized account export. Until supplied, the monthly report appropriately shows no live click/impression or lead baseline. The local build and sitemap cannot prove Google indexing, and no ranking or traffic result is guaranteed.

# SEO measurement and maintenance

## Purpose and evidence boundaries

This workflow evaluates whether approved pages are being discovered and earning relevant organic visits; it does not promise rankings. Semrush volumes and competitor positions are research estimates, not Centaur performance. Only exports from the authorized production Search Console property establish the measured search baseline. The site currently has no imported Search Console, GA4/CRM outcome, or backlink-audit snapshot, so current results remain **unavailable**, not zero.

Raw query exports, backlink snapshots, their archives, and `src/content/seo/measurements/SEO_MEASUREMENT_REPORT.md` stay local and git-ignored. Share only an approved aggregate report. Search Console may suppress queries, and UI exports may be row-limited; absence from an export is not proof of no impressions or clicks.

For the five published city guides, use [the regional search and AI review](REGIONAL_SEARCH_AI_REVIEW.md). It records a screenshot-only fallback, page-level triage, qualified-enquiry separation, and a fixed citation-check method. Screenshots do not become CSV snapshots and must not be presented as a complete query export.

## Monthly cycle

Use Search Console's same property, search type, country/device filters, and two consecutive completed 28-day windows. Export both the Queries and Pages tables for each window. Import the older window first, then the newer one. Query and page dimensions are retained independently, and the importer archives a replaced prior-period snapshot locally.

```text
npm run seo:measure:import:gsc -- <older-queries.csv> --from YYYY-MM-DD --to YYYY-MM-DD
npm run seo:measure:import:gsc -- <older-pages.csv> --from YYYY-MM-DD --to YYYY-MM-DD
npm run seo:measure:import:gsc -- <newer-queries.csv> --from YYYY-MM-DD --to YYYY-MM-DD
npm run seo:measure:import:gsc -- <newer-pages.csv> --from YYYY-MM-DD --to YYYY-MM-DD
npm run seo:measure:report
npm run seo:measurement:check
npm run test:seo:measurement
```

The date flags are required for period-aggregate exports without a Date column. Daily exports may carry dates; those dates are validated against any supplied period. Do not compare windows with different length, search type, country, or device as though they were equivalent. CTR is calculated from clicks/impressions; average position is impressions-weighted. Both describe imported rows only.

Review these measures each month:

- **Clicks and impressions:** directional search exposure/visits, scoped to the imported table and selected property filters.
- **CTR and average position:** weighted summaries for triage, not exact per-keyword rank guarantees.
- **Approved owner-page coverage:** exact matches between imported queries and the 24 approved keyword destinations, plus page-dimension rows for those canonical paths.
- **Landing-page leads:** use authorized GA4/CRM aggregate reports and a verified form-success/qualified-lead event. `lead_cta_click` is contact intent only, not a completed enquiry. This workspace has no live GA4 export or account access.
- **Internal pathway engagement:** use `internal_pathway_click` to compare query-free movements from article content, related-page groups, role-intent pathways, and conversion sections. It is a navigation event, not a lead or proof of content consumption.
- **Indexing:** check Search Console Page Indexing, URL Inspection, and sitemap processing in the authorized account. A local sitemap/build check cannot prove that Google indexed a URL.
- **External authority:** import a fresh audit, inspect each source URL manually, and mark a link earned only when it is publicly present and relevant.

## Review rules

The generated report flags pages with at least 100 imported impressions, average position 10 or better, and CTR below 2%. This is a review threshold only: inspect the query mix, device, country, branded demand, SERP features, snippet promise, and current metadata before changing anything. The flag is not a general CTR benchmark.

For queries around positions 4–20, confirm the page that actually ranks and its search intent before refreshing. Review sudden losses against indexing/canonical issues, page changes, seasonality, and measurement-window differences. Do not create a page, repeat a keyword, or expand course claims solely because a keyword has search volume or an impression spike.

Before an editorial change, record the canonical owner, evidence/source and date, observed issue, proposed change, reviewer, and validation result in the team's normal change tracker. Protect the current-offer boundary: the Financial Operations Masterclass is the only current offering; KYC / AML, Digital Payments, and FinTech are modules, not standalone courses or credentials. Re-check claims, metadata, internal links, visible keyword ownership, accessibility, and the production build after changes.

## Other cadences

- **After every release:** run the build, lint, full SEO check, and deployment HTTP check. Use Search Console after deployment for crawl/index status.
- **Weekly while a release or major edit is being monitored:** review Search Console manual actions, indexing errors, and unexpected broken/canonical URLs; record dates and affected URLs.
- **Quarterly:** review the 24 keyword owners for overlap, verify course/career facts and dated regional sources, audit internal link reachability, and decide whether content remains useful. Retire or consolidate only after intent, inbound links, and traffic evidence are reviewed.

## Commands

- Import query/page export: `npm run seo:measure:import:gsc -- <csv> --from YYYY-MM-DD --to YYYY-MM-DD`
- Import backlink audit: `npm run seo:measure:import:backlinks -- <csv>`
- Generate local report: `npm run seo:measure:report`
- Validate storage, event contracts, imports, and workflow: `npm run seo:measurement:check`
- Test imports, period archiving, and report behavior with synthetic temporary data: `npm run test:seo:measurement`
- Phase 7 readiness: `npm run seo:phase7:check`

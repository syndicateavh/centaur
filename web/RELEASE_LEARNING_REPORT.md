# Release and Learning Handoff

Generated: 2026-09-26T14:31:59.413Z

This handoff combines the repository release result with the available post-release evidence. It never treats missing exports, missing rows, rankings, or CTA clicks as confirmed performance.

## Release status

| Check | Status | Evidence |
| --- | --- | --- |
| Local technical release package | Passed | local-qa-passed; 371 files; 40 indexable routes; 66 sitemap URLs. Expert editorial approval is separate. |
| External deployed-site verification | Pending | Not verified. A local build cannot prove the deployed host is serving this package. |
| Measurement report | Ready | src/content/seo/measurements/SEO_MEASUREMENT_REPORT.md |

The upload boundary is the **contents** of `build/client/`, including `.htaccess`. Do not upload the repository or a nested `build/client/` directory.

## Learning evidence

| Evidence | Status | Interpretation |
| --- | --- | --- |
| Search Console Queries and Pages | Pending | Valid current Queries and Pages snapshots are both required. |
| Equal-window period comparison | Pending | Two comparable 28-day windows are not available. |
| Page-level opportunity review | Pending | The required authorized export has not been imported. |
| Five regional guide comparison | Pending | Comparable page snapshots are required before prioritizing the five regional guides. |
| Confirmed organic enquiries | Pending | Import an authorized GA4/CRM landing-page report; CTA clicks are contact intent, not confirmed enquiries. |

Until both Search Console periods, page-filtered queries for the candidate URL, and the matching GA4/CRM enquiry report are available, content decisions remain **pending evidence**. The supplied GA4 page-view or AI-assistant screenshots cannot establish organic landing pages or confirmed enquiries. Import filter fields are an operator record of the Search Console UI settings, not independently verified by the CSV.

## Decision rules for released changes

| Evidence after an equal completed window | Decision | Required check |
| --- | --- | --- |
| Relevant impressions/clicks and qualified enquiries improve without a quality or indexing regression | Keep | Preserve the canonical owner and continue the next measurement window. |
| Impressions exist but CTR, position, landing-page engagement, or qualified enquiries are weak | Revise | Inspect query mix, SERP features, snippet promise, intent match, and current facts before editing. |
| Two comparable windows show no relevant demand or conversion and the page overlaps another owner | Stop or consolidate | Check indexing, seasonality, internal links, and inbound links first; record the canonical owner before removal. |
| Evidence is missing, mismatched, or filtered differently | Hold | Do not infer zero traffic or create another page from an incomplete export. |

## Next actions

1. Complete the outstanding Phase 2 accounting and Phase 3 case expert reviews before publication; after approval, upload the contents of build/client/, clear the cache, then run npm run seo:external -- https://centaurcareers.in.
2. Import Queries and Pages exports for two equal completed 28-day windows with the same Search Console filters.
3. Import the older matching period first, then the newer period with identical --property, --search-type, --country, --device, and --filters values; regenerate the measurement report.
4. For a shortlisted URL, export Queries with that exact Page filter for both windows; separate sitewide Queries and Pages exports cannot identify a URL/query pair.
5. Export organic landing-page confirmed enquiries from GA4/CRM for the same windows.

## Source artifacts

- Release manifest: `RELEASE_MANIFEST.json`
- Release QA report: `RELEASE_QA_REPORT.md`
- Measurement report: `src/content/seo/measurements/SEO_MEASUREMENT_REPORT.md`
- Measurement runbook: `docs/SEO_MEASUREMENT_AND_MAINTENANCE.md`

This report records readiness and evidence boundaries. It does not claim that Google, ChatGPT, Gemini, Claude, or any other service has indexed, cited, or recommended the site.

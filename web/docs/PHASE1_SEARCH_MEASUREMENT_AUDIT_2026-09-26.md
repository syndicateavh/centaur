# Phase 1: search and measurement audit — 26 September 2026

## Scope and evidence

This records the site-health and measurement findings from the local release package, the live `https://centaurcareers.in` responses, the Search Console workbook supplied on 26 September, and the GA4 screenshots supplied in the conversation. The workbook and screenshots are evidence, not instructions. Search Console account indexing reports and the GA4 property settings were not available for direct inspection.

## What the supplied reports establish

| Source | Period and filters | Visible result | Limit |
| --- | --- | --- | --- |
| Search Console workbook | 27 Aug–23 Sep 2026, Web search, **Query = `centaur careers`**, **Page = `https://www.centaurcareers.in/`** | 59 clicks, 130 impressions, 45.38% CTR, average position 1.22 | Branded traffic to one former www URL only. No unfiltered page or regional comparison, and no previous period. |
| GA4 screenshots | 29 Aug–25 Sep 2026, all users | 175 active users, 607 page views, 0 key events. Page-path report shows 581 views on `/`, 24 on `/financial-operations-masterclass`, and 2 on `/courses/`. | Dates differ from the Search Console export. Screenshots contain no previous-period comparison or confirmed-enquiry report. Page views alone do not identify organic landings. |
| GA4 acquisition screenshot | 29 Aug–25 Sep 2026 | 18 new users under the `AI Assistant` channel | This does not identify which assistant sent them or prove citation frequency. |

The supplied reports therefore do **not** establish which queries or regional pages lost search traffic, whether organic visits fell, or how many qualified enquiries were generated. Do not use the branded Search Console totals as a site-wide baseline.

## Technical findings and local repair

- The public GTM container `GTM-T3QHF5HQ` fires Clarity project `yiug7y1d0e` on `gtm.js` and did not include the historical GA4 ID `G-K4K93GXSX7` when checked. Neither the current live homepage HTML nor its root client bundle contained that GA4 ID. The earlier site files include a direct Google tag for it. The live package therefore has no verified route to this GA4 stream, which plausibly explains GA4 reporting nearly zero activity late in the screenshot period; the exact break date and all causes remain unconfirmed. The local package removes a redundant direct Clarity loader so Clarity has one owner.
- The local React build now loads that GA4 ID directly, disables the tag's automatic page view, and sends one manual `page_view` on initial load and on each path/query navigation. Contact-link clicks send `lead_cta_click` to GA4 and remain contact **intent**, not completed leads. The data-layer events remain available for non-GA4 integrations. The GA4 event-queue test and full local release gate must pass before upload.
- In the GA4 web stream, turn off Enhanced Measurement → Page views → **Page changes based on browser history events** before relying on manual React Router page views. Google's [page-view documentation](https://developers.google.com/analytics/devguides/collection/ga4/views) says this setting can send extra page views even with `send_page_view: false`. Ensure neither GTM nor the host inserts a second GA4 tag for the same ID.
- After upload, verify one `page_view` on initial load and one on a client-side navigation in [GA4 DebugView](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications), plus one `lead_cta_click` for a test contact link. The repo can verify code and browser loader injection locally; it cannot verify delivery to the owner's GA4 property without access to that property.

## Live search-health check

- Delhi-NCR, Bengaluru, Mumbai, Pune, and Hyderabad regional URLs each returned HTTP 200 and a self canonical. The live sitemap listed all five and contained 63 URLs. The live robots file allowed `/` for all crawlers.
- The live robots file did not yet contain the explicit Claude crawler entries included in the local release package. The wildcard rule still allows them. The package needs deployment before the explicit entries are live.
- The full external verification received HTTP 429 for its GPTBot probe after checking all public routes, including when requests were paced and a limited number of 429 responses were retried. Separate requests for GPTBot, OAI-SearchBot, Claude-SearchBot and Googlebot returned HTTP 200. The host's Cloudflare/WAF logs are needed to distinguish rate limiting of this test burst from treatment of verified crawler IPs; a successful spoofed user-agent request does not establish crawler access in all circumstances.
- Passing HTTP, canonical, robots and sitemap checks does not establish Google index status. Inspect Search Console **Page indexing**, **Sitemaps**, **Manual actions**, and URL Inspection for the five canonical regional URLs.

## Remaining evidence needed to close the traffic-drop diagnosis

1. Search Console Web search **Pages** and **Queries** exports or readable screenshots for two equal, completed 28-day periods, with Query and Page filters cleared and the same country/device settings.
2. GA4 **organic-search landing pages** and confirmed enquiry counts for those exact periods. A contact click is not a confirmed enquiry.
3. Search Console Page indexing and Sitemaps status, including the five regional canonicals, and GA4 DebugView/stream settings after the repaired package is live.

Then compare lost clicks and impressions by page, inspect the affected page's actual queries, and distinguish ranking, demand, indexing, snippet, and measurement changes. Google's [traffic-drop guidance](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops) recommends comparing equivalent periods and inspecting page and query patterns.

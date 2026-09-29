# Phase 0 — Measurement and baseline

Status: implemented in the repository; external performance exports are still required for the live baseline. The current local changes must be deployed before their production events can be verified.

Date of implementation: 2026-09-29

## Objective

Create one trustworthy measurement contract before changing regional or topic pages. The repository records page visibility, restricted campaign attribution, internal pathways, and contact intent. Google Search Console and GA4/CRM exports remain the source of live performance truth; the codebase must not manufacture clicks, rankings, leads, or regional demand.

## What is implemented

- GA4 direct event delivery with one manual `page_view` per initial load or React Router path/query change. Page-view payloads omit query strings, while the navigation key still detects query changes.
- GTM data-layer support for `virtual_page_view`, `lead_cta_click`, and `internal_pathway_click` without a second GA4 mapping.
- Microsoft Clarity through the public GTM container; no duplicate direct Clarity loader.
- First-touch and last-touch storage for screened source, medium, campaign, and content UTM tokens. Form values, arbitrary query strings, and click IDs are not added to custom events; the token filter rejects URL syntax, email syntax, and long digit runs.
- URL-derived measurement fields: `page_type`, `content_cluster`, `access_scope`, `regional_market`, `lead_intent_group`, and `conversion_stage`. All 17 new root-level India lead pages have exact-path classifications.
- A quiz WhatsApp handoff event named `quiz_whatsapp_request_prepared`; it cannot be mistaken for a sent message or confirmed lead.
- The rendered homepage H1 uses the approved job-guarantee message without the unsupported salary range; the protected legacy source remains unchanged for traceability.
- Search Console Query and Page imports kept separate, period-aware, filter-provenanced, archived locally, and excluded from git.
- Evidence-only reports that mark missing Search Console, GA4/CRM, and backlink data as unavailable rather than zero.

## Current repository baseline

| Baseline item | Current status | Evidence boundary |
| --- | --- | --- |
| Published regional URLs | Five: Delhi-NCR, Bengaluru, Mumbai, Pune, Hyderabad | Repository route/content registry |
| India access page | Published | Repository route/content registry |
| Published physical location | Lucknow | Existing business/location content; verify operational details before promotion |
| Site and sitemap | Live apex home and sampled lead page return 200; `www` redirects to apex; current sitemap/manifest contain 185 URLs | A sitemap lists submitted candidates; it does not establish Google indexing |
| Priority public fetch | 44 of 44 priority URLs passed the 29 September public HTTP, canonical, robots, noindex, and rendered-content check | This is public fetch evidence, not a Googlebot crawl or index result |
| Recorded sitemap submission | The only local receipt is a 24 September dry run for an older 63-URL manifest | No matching live submission receipt is recorded for the current 185-URL manifest; Search Console UI history may differ |
| Google index coverage | No authenticated URL Inspection snapshot or Page Indexing export is available | Indexed count, Google-selected canonicals, exclusions, and crawl dates remain unknown |
| Root-level India lead pages | Seventeen paths are explicitly classified for analytics | Classification is based on page purpose, not observed search demand |
| Homepage salary claim | Removed from the local rendered H1; the adjacent copy states graduation/job-switcher eligibility, six-week completion, and links to written terms | The live homepage still needs a post-deployment check before this can be called a production fix |
| GA4 implementation | The deployed GA4 asset contains `G-K4K93GXSX7` and `send_page_view: false`; local event tests pass | Needs Tag Assistant, DebugView, and browser network confirmation after the new build is deployed |
| GTM implementation | Public HTML and asset contain `GTM-T3QHF5HQ`; current public container has no literal GA4 measurement ID | Needs Tag Assistant and published-container review after deployment |
| Clarity implementation | Current public GTM asset contains project `yiug7y1d0e` | Needs a live session/recording check in the authorized account |
| Search Console clicks/impressions/CTR/position | Unavailable in this workspace | Requires authorized Query and Page exports for the same property and filters |
| Confirmed leads and qualified enquiries | Unavailable in this workspace | Requires authorized GA4/CRM aggregate export and a verified success event |
| Earned backlinks | Unavailable in this workspace | Requires a dated audit export and manual public verification |

The live HTML/asset check above was made on 29 September 2026. It proves that code is publicly served, not that a browser executed each event or that the authorized GA4 property received it. The current local event changes are newer than the public assets inspected.

The local indexing report is `data/seo/indexing/INDEXING_REPORT.md`; the public check snapshot is ignored from Git and can be refreshed with `node tools/check-public-indexability.js` followed by `npm run seo:indexing:monitor`. The local Search Console report is `src/content/seo/measurements/SEO_MEASUREMENT_REPORT.md` and currently shows every unimported metric as unavailable.

## Event and outcome definitions

| Stage | Evidence | Meaning |
| --- | --- | --- |
| Organic landing session | GA4 landing-page export with `google / organic` or the agreed organic channel filter | An observed session after analytics delivery is verified |
| `lead_cta_click`, `channel=phone` | GA4 event | A tap/click on a `tel:` link; it does not prove a call connected |
| `lead_cta_click`, `channel=whatsapp`, `email`, or `enrollment_form` | GA4 event | An outbound contact or form-open action, not a received message or submitted form |
| `quiz_whatsapp_request_prepared` | GA4 event | A WhatsApp draft was prepared after the on-page checkbox; the visitor still must send it |
| Connected call or received message | Authorized call system or admissions log | A real contact reached the team, counted separately from site clicks |
| Qualified enquiry, appointment, enrollment | Authorized CRM/admissions record with written stage definitions | Business outcomes, never inferred from clicks or quiz drafts |

Do not mark a click or prepared draft as a GA4 key event named "lead" or "enrollment" until the receiving system supplies a verifiable success signal. If matching site sessions to CRM outcomes is unavailable, report the two series separately instead of estimating a conversion rate.

## Reporting dimensions for the first baseline

Export and review two adjacent, completed 28-day windows for:

- Search Console Queries and Pages, filtered consistently for property, web search, country, device, and date range.
- GA4 landing page and page type, regional market, access scope, `lead_cta_click`, and internal pathway events.
- CRM or approved enquiry records, separated from CTA clicks and enrollment-form opens.
- Page-level coverage for the existing intent groups: banking/finance operations, KYC and AML, trade lifecycle and settlements, reconciliations, corporate actions, securities operations, reference data, fund accounting, and client onboarding.

The last line is a review grouping for imported query/page evidence. It does not create new pages, assert that every phrase has a dedicated URL, or authorize unsupported course claims. Separate Search Console Queries and Pages exports cannot be joined into page-by-query pairs; obtain page-filtered Queries or API data for that diagnosis. Search Console can suppress anonymized queries and UI exports can have row limits, so a missing query row is not zero.

Record the release on 27 September 2026 and Google's 24 September 2026 spam-update start as separate annotations. The first complete seven-day window after the Sunday release ends 3 October; the first adjacent 28-day comparison window ends 24 October. A 29 September graph is too early for a full post-release comparison and neither annotation proves a cause.

## External completion checklist

1. Confirm one GA4 `page_view` on first load and one on each client-side path/query change in Tag Assistant, DebugView, and browser requests.
2. Confirm `lead_cta_click` for phone, email, WhatsApp, and enrollment-form outbound actions; keep form success/qualified lead as a separate verified event.
3. Confirm `internal_pathway_click` for article, related-page, role-intent, and conversion-section links.
4. Register the six taxonomy fields as GA4 custom dimensions if report exploration requires them. Mark `lead_cta_click` and `quiz_whatsapp_request_prepared` as intent/engagement, not confirmed lead conversions.
5. Export two matching Search Console windows, import Query and Page tables separately, generate the local report, and retain property/search-type/country/device/date provenance.
6. Inspect Search Console Page indexing, Sitemaps, Manual actions, and priority URLs. Record Google's chosen canonical, indexed state, last crawl, and exclusion reason. A public HTTP check is not an index inspection.
7. Obtain an approved GA4/CRM aggregate export before reporting enquiries or lead quality. Separate website calls from Google Business Profile calls where the system permits.

## Repository validation

```text
npm run seo:phase0:check
npm run seo:measurement:check
npm run test:ga4
npm run test:seo:measurement
npm run seo:indexing:check
npm run seo:quiz:lead:check
npm run release:qa
```

All listed repository checks passed on 29 September 2026. The final prerendered homepage H1 is “Financial Operations Masterclass with a 100% Job Guarantee.” Phase 0 is ready for Phase 1 only when the authorized external checks above have been recorded. Until then, “not available” is the correct baseline result.

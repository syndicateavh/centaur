# Analytics configuration

The site loads Google Analytics 4 measurement ID `G-K4K93GXSX7` directly and Google Tag Manager container `GTM-T3QHF5HQ`. The current public GTM container fires Microsoft Clarity project `yiug7y1d0e` on page load; the redundant direct Clarity loader was removed. The GA4 ID was recovered from the earlier deployed site files. On 26 September 2026, the public GTM container exposed no GA4 tag, so the site's previous data-layer-only page views and contact clicks were not reaching GA4 through that container. The exact date of any tracking break is unconfirmed.

## GA4 page views

The direct Google tag disables its automatic initial page view with `send_page_view: false`. The React Router analytics component sends one manual `page_view` on initial load and one when the path or query changes. It retains the `virtual_page_view` data-layer event on subsequent navigation for other integrations. The page-view `page_path`, `page_location`, and prior-page referrer omit query strings; a query change still produces a page view because it can change quiz content. Turn off GA4 Enhanced Measurement's browser-history page-view option in the GA4 web stream, because that option may still send page views even when `send_page_view` is false.

Do not add a second GA4 Google tag, a GTM `virtual_page_view` to GA4 mapping, or a Hostinger `gtag.js` snippet for this measurement ID. Before publishing, use Tag Assistant, GA4 DebugView and browser network requests to confirm exactly one page view for the initial load and one for each React Router navigation. Recheck after any GTM container change.

## Lead-intent events

The site sends `lead_cta_click` directly to GA4 and also pushes it to the data layer for other integrations. The payload contains `channel`, the query-free `page_path` and `page_location`, and an optional stable `cta_context`; it deliberately excludes link destinations, query strings, form values, email addresses, phone numbers, and other personal information. Do not create a GTM mapping that sends this event to GA4 a second time. Treat it as an outbound/contact click, not a completed lead.

Do not count enrollment as a completed enquiry unless the form owner exposes a verifiable success event or thank-you page that can be measured without sending personal information. Until then, report form clicks separately from confirmed leads. Validate each channel in GA4 DebugView before using the events for optimization.

The quiz emits `quiz_whatsapp_request_prepared` after the visitor completes the consent checkbox and opens a prepared WhatsApp draft. It does **not** prove that the visitor sent the message or that the team received an enquiry. The separate `lead_cta_click` event captures the optional WhatsApp reopen link. Count a connected call, received WhatsApp message, qualified enquiry, appointment, and enrollment only from a verified first-party outcome source with a clear definition. The former `quiz_lead_submitted` name should not be used as a conversion in GA4 reports.

## Internal pathway events

The site sends `internal_pathway_click` directly to GA4 and to the data layer when a visitor follows an internal link from article content, a related-page group, a role-intent pathway, or a conversion section. Its payload contains the query-free `page_path`, `page_location`, `destination_path`, `cta_context`, a stable `cta_id`, and the same non-personal attribution fields used by the existing analytics component. Query strings, fragments, link text, form values, and personal information are excluded.

Use this event to compare which educational pathways help visitors move from an informational page to another relevant article, assessment, module, or course page. It records navigation only; it is not a lead, enrollment, ranking signal, or proof that the destination was fully viewed. Do not add a second GTM-to-GA4 mapping for this event. Validate each supported context in GA4 DebugView before reporting on it.

## Download events

The site sends `download_click` directly to GA4 when a visitor downloads a published file from `/downloads/`. Its payload contains the query-free `page_path` and `page_location`, the page measurement taxonomy, `download_path`, the published `download_name`, a stable `cta_id`, an optional fixed `cta_intent`, and the same non-personal attribution fields used by the existing analytics component. It does not contain form values, email addresses, phone numbers, query strings, or inferred visitor location.

Use this event to measure access to the published syllabus, placement-terms summary, and fictional case-study source files. A download is a content-engagement event, not a lead, enrollment, or confirmation that a file was read. Do not add a second GTM-to-GA4 mapping for this event. Validate the event and file names in GA4 DebugView before using them in reports.

## Syllabus preview events

Published download preview dialogs record `syllabus_preview_open` / `syllabus_preview_completed` for the syllabus and `download_preview_open` / `download_preview_completed` for other published text or CSV files. The events include the page measurement taxonomy, `preview_funnel: published_download`, `download_path`, and `download_name`. Completion means the file reached its end; it does not prove that a visitor understood the content, contacted the team, or enrolled. The WhatsApp link remains measured separately as a `lead_cta_click` outbound action. Do not map preview events to a lead or enrollment conversion in GA4.

## Page measurement taxonomy

Page views, `virtual_page_view`, `lead_cta_click`, `internal_pathway_click`, and `download_click` now include stable URL-derived fields:

- `page_type`: home, regional guide, India landing page, course, comparison, career guide, resource, blog, assessment, location, commercial, legal, or generic page.
- `content_cluster`: regional, national, courses, comparisons, career guides, resources, blog, assessment, locations, placements, conversion, about, legal, home, or site. The 17 root-level India lead pages use exact-path entries rather than falling into `site`.
- `access_scope`: online from a regional market, online across India, in-person Lucknow, online and Lucknow in-person, or sitewide.
- `regional_market`: only for the five published guides (`delhi_ncr`, `bengaluru`, `mumbai`, `pune`, `hyderabad`).
- `lead_intent_group`: a stable content-intent class such as `commercial_best_institute`, `commercial_placement`, `commercial_fees`, `career_fit`, `trust_support`, or `informational_support`.
- `conversion_stage`: `discover`, `trust`, `evaluate`, or `decide`, based on the published page's purpose.

These values describe the published URL and access wording; they do not infer the visitor's location or actual search query. They contain no IP-derived location, form value, phone number, email address, query string, or other personal information. Register the six names as GA4 custom dimensions if the team needs them in standard reports. Keep `regional_market` absent on non-regional URLs rather than sending `unknown`.

CTA events may also include `cta_intent`, a short, fixed content classification such as `commercial_program` or `commercial_placement`. It is not link text, a destination URL, or a user-provided value. The taxonomy shows which India-focused content pathways assist evaluation; it does not claim to know a visitor's private intent or guarantee a lead.

Custom first-touch and last-touch fields use only short source, medium, campaign, and content UTM tokens. The component rejects URL-like strings and long digit runs, and it never adds arbitrary URL query strings, search terms, `gclid`, or `fbclid` to custom events. Review the published GTM container separately because a container tag can read browser URL fields outside this component's payload.

## Organic-search baseline

There is no production Google Search Console export in the workspace, so a live click/impression baseline is not yet available. After an authorized export is provided, import Query and Page tables separately for the same completed date window, then generate the local `src/content/seo/measurements/SEO_MEASUREMENT_REPORT.md`. See `docs/SEO_MEASUREMENT_AND_MAINTENANCE.md` for the exact import commands, previous-period comparison, data boundaries, and review cadence.

Do not treat third-party keyword suggestions or exports with blank positions and URLs as a measured rank baseline. Search Console exports can omit anonymized queries and can be row-limited; missing query rows must not be reported as zero. Compare only equivalent date windows and filters.

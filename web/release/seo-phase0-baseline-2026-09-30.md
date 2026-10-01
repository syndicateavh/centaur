# SEO Phase 0 baseline — 2026-09-30

## Purpose and scope

This is a read-only baseline of the current website source, generated sitemap, analytics wiring, and a small set of live HTTP checks. It is the starting point for later SEO work. The homepage hero is explicitly protected: no hero copy, layout, or styling was changed for this phase.

The matching machine-readable route inventory and HTTP observations are in [`seo-phase0-baseline-2026-09-30.json`](./seo-phase0-baseline-2026-09-30.json).

## Current site inventory

- Framework: React 18 with React Router 7.18.2 and Vite 7.3.1.
- Rendering: static prerendering (`ssr: false`) for configured public routes and published blog content.
- SEO registry: 98 route records; 93 are marked indexable and 5 are marked noindex.
- Noindex route records: Terms and Conditions, Cookie Policy, Refund and Cancellation Policy, Disclaimer, and the 404 page.
- Content inventory: 26 career guides, 13 resources, five city/regional pages, and 86 published blog posts at capture time.
- `public/sitemap.xml`: 185 URLs. The indexing manifest also lists 185 sitemap-eligible URLs. These are site configuration counts, **not** Google index-coverage counts.
- Canonical origin: `https://centaurcareers.in`.

The full registered-route inventory, including titles, descriptions, H1s, primary keywords, canonicals and indexability flags, is in the JSON companion file.

## Live technical observations

Observed on 2026-09-30 local time (2026-09-29 UTC):

| Check | Result |
|---|---|
| Canonical homepage | HTTP 200; self-canonical to `https://centaurcareers.in/`; `index,follow` |
| `https://www.centaurcareers.in/` | HTTP 301 directly to `https://centaurcareers.in/`, then 200 |
| `http://centaurcareers.in/` | HTTP 301 directly to `https://centaurcareers.in/`, then 200 |
| `/robots.txt` | HTTP 200 |
| `/sitemap.xml` | HTTP 200 |
| Random nonexistent path | HTTP 404 |

The previously saved 2026-09-26 pre-deploy snapshot records a homepage hero H1 mismatch between local and live output, including a salary headline in that older live capture. The current recapture returned the same homepage title, H1, canonical and robots directive from the non-www URL and from the www URL after redirect. The older mismatch was not reproduced in this capture. Keep the hero unchanged as requested; use a fresh release comparison before any later deployment.

## Search and visit baseline

No Search Console query/page export, imported Search Console snapshot, or GA4 report/export was present in the workspace at capture time. Consequently:

- Google Search Console clicks, impressions, CTR and average position: **unavailable**.
- Google-indexed URL count: **unavailable**. Sitemap eligibility must not be reported as indexing.
- Organic landing-page visits, sessions and conversions: **unavailable**.
- Unavailable values are `null`, not zero, in the JSON snapshot.

The repository does contain GA4 (`G-K4K93GXSX7`), GTM (`GTM-T3QHF5HQ`), a six-field measurement taxonomy, page-view/pathway/CTA/download event wiring, and a quiz WhatsApp request-prepared event. This confirms implementation presence, not that analytics is receiving events or the size of traffic. Successful application/form submission tracking was not confirmed from the inspected event wiring.

To complete the external performance baseline, import comparable Search Console **Query** and **Page** exports for a defined date range and provide a GA4 landing-page/acquisition report for the same period. Use the existing importer workflow and preserve the selected property, search type, country, device and filters with each snapshot.

## Homepage hero protection

`src/components/home/HomeHero.jsx` was not edited. Its SHA-256 at capture is:

`85fbea076afd5b154206fb530c55cd79b46752024ad1ac3468fb4185714ccc5b`

The JSON snapshot records this hash so later phases can confirm that the hero remains unchanged.

## Workspace safety

There were 251 pre-existing entries in `git status --short` at capture. They were left untouched. Several documentation paths—including prior SEO reports and measurement handoff files—are already deleted in the current working tree. This Phase 0 report was added as a new file under `release/`; deleted files were not restored or overwritten.

## Phase 0 status

**Local technical and route baseline: recorded.** **External query, indexing and visit baseline: pending source exports.** No tests or build were run in this phase.

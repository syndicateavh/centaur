# SEO Plan Status and Release Handoff

Status date: 2026-09-26

## Overall status

All repository-controlled implementation work in Phases 0–12 is complete. The
current local production release passes the complete QA queue and is ready to
upload as the contents of `build/client/`. The live production host remains a
separate deployment gate because hosting credentials are not available to this
repository automation. Existing English copy and meaning were preserved; the
implementation added governed supporting content and technical SEO controls
without keyword stuffing or mass-generated doorway pages. The `release:learn`
handoff joins the package result to the measurement report and records the
evidence needed for keep, revise, or stop decisions.

## Phase status

| Phase | Status | Current result or remaining control |
| --- | --- | --- |
| 0 — Content protection and fact verification | Complete locally | Protected copy and fact-governance checks are active. Four protected files and 17 registered facts are tracked; 12 fact items still require business/evidence review before their status can be approved. |
| 1 — Technical deployment foundation | Complete locally; production pending | Static output, redirects, 404 handling, crawler access, sitemap, robots, caching, and upload-boundary checks pass locally. The live host still needs the current package upload and external verification. |
| 2 — 728-keyword strategy | Complete | 728 keywords imported; 644 have published canonical owners and 84 remain governed across 8 future keyword destinations. Ten readiness records remain gated when current-route evidence and business approvals are included. |
| 3 — Primary commercial pages | Complete | Commercial metadata, content boundaries, internal links, schema, and validation are active. Unsupported claims remain governed. |
| 4 — Lucknow location page | Complete | The verified Mindsprout Career Hub boundary and local-page checks are active. Current business/location facts still need external confirmation. |
| 5 — Career-guide cluster | Complete | Hub plus ten authored guides are published, linked, prerendered, and validated. |
| 6 — Resources and FAQ content | Complete | Resource hub, interview resource, and distinct FAQ roles are published and validated. |
| 7 — India-wide page | Complete | The national page is published without inventing branches or city offices. |
| 8 — Selective regional pages | Complete locally | Delhi-NCR, Bengaluru, Mumbai, Pune, and Hyderabad are published in the local package with distinct market evidence and a clear online-versus-Lucknow access boundary. |
| 9 — Comparison content | Complete locally | The neutral comparison page is indexable after its dated official-source, non-affiliation, and editorial review controls passed. |
| 10 — Internal linking and authority building | Complete | Authority targets, contextual journeys, linkable assets, and outreach guardrails are implemented. Genuine external links still require real outreach and cannot be fabricated in code. |
| 11 — Technical SEO for new routes | Complete | All 33 registered new-route contracts pass metadata, canonical, robots, schema, breadcrumb, sitemap, link, and prerender checks. |
| 12 — Final QA and release | Complete locally; production pending | Final QA passes locally: 40 indexable routes, 45 route documents, 64 sitemap URLs, and a checksummed upload package. |

## Remaining actions outside the repository

1. Upload the contents of `build/client/` to the production document root,
   preserving the hidden `.htaccess` file.
2. Clear the affected hosting/CDN cache and ensure no WAF, managed robots,
   challenge, or access rule blocks Googlebot, Bingbot, OAI-SearchBot,
   PerplexityBot, or other legitimate crawlers. The current external probe
   specifically reports a GPTBot HTTP 429; this is a hosting/CDN policy issue,
   not a repository robots rule, and must be intentionally resolved or
   documented before claiming AI-crawler access.
3. Run external verification after upload. The current live domain is still
   missing the latest blog routes and sitemap entries.
4. Complete the 12 business/permission reviews, comparison editorial/legal
   review, and approvals needed before changing gated destinations to indexable.
5. Verify Google Search Console and Bing Webmaster Tools, submit the sitemap,
   inspect representative URLs, and collect real performance, analytics, and
   backlink data. No indexing, ranking, or backlink result is claimed locally.

After deployment, run:

```powershell
$env:RELEASE_EXTERNAL_ORIGIN = 'https://centaurcareers.in'
npm run release:qa
```

The source repository does not add a crawler block. The live `robots.txt` must
be replaced with the generated package file before the external check can pass.

## Release artifacts

- [`RELEASE_LEARNING_REPORT.md`](RELEASE_LEARNING_REPORT.md) - release status, evidence readiness, and post-release decision rules.
- [`docs/RELEASE_AND_LEARN.md`](docs/RELEASE_AND_LEARN.md) - upload, measurement, and learning runbook.
- [`RELEASE_QA_REPORT.md`](RELEASE_QA_REPORT.md) — latest local QA and upload handoff.
- [`RELEASE_MANIFEST.json`](RELEASE_MANIFEST.json) — route/package manifest and SHA-256 file checksums.
- [`SEO_PHASE12.md`](SEO_PHASE12.md) — release procedure and package contract.
- [`DEPLOYMENT_FOUNDATION.md`](DEPLOYMENT_FOUNDATION.md) — hosting upload and verification procedure.

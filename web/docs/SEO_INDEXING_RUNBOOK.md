# SEO indexing runbook

This workflow separates four facts:

1. The URL is present in the production sitemap and prerendered build.
2. The deployed URL can be fetched publicly with the expected canonical and indexing directives.
3. A sitemap submission was recorded for the authorized Search Console property.
4. Google returned an observed URL-inspection status.

Only the fourth fact can be reported as an observed Google index status. Public fetchability and sitemap submission are not indexing guarantees.

## 1. Build the canonical manifest

```powershell
npm run build
npm run seo:indexing:manifest
```

The manifest is generated from `public/sitemap.xml`; it must not be edited manually.

## 2. Check the live priority URLs without Search Console access

```powershell
node tools/check-public-indexability.js
node tools/monitor-indexing.js
```

The default queue covers 44 priority pages, including the India lead-intent pages, regional discovery, operations guides, and commercial next steps. The check compares the live sitemap to the current repository manifest and fetches each priority URL to inspect HTTP status, robots rules, canonical, noindex directives, and server-rendered content. Use `--url /courses/` for one page or `--all` for the entire manifest. It makes read-only public requests. Its dated evidence is saved under ignored `data/seo/indexing/public-checks/latest.json`, then summarized in `data/seo/indexing/INDEXING_REPORT.md`.

Record the release timestamp from the deployment system and compare it with `checkedAt`. A check made before deployment cannot verify that release. A `public_fetchable` result shows only that this diagnostic client received the expected public response; it does not establish Google's crawl, indexing, or ranking.

## 3. Create or send a sitemap submission

Preview the request first:

```powershell
npm run seo:indexing:submit
```

For an authorized live request, use a short-lived OAuth access token in the current shell and confirm the action explicitly:

```powershell
$env:GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN = '<short-lived token>'
npm run seo:indexing:submit -- --live --confirm
```

Submission receipts contain only request metadata and the bounded API response summary. They do not contain the token and are stored locally under `data/seo/indexing/submissions/`.

## 4. Inspect URLs

Inspect one priority URL first:

```powershell
npm run seo:indexing:inspect -- --url /courses/ --live --confirm
```

For the first post-release review, use the bounded queue covering national/regional discovery, operations information, and commercial next steps:

```powershell
npm run seo:indexing:inspect -- --priority
npm run seo:indexing:inspect -- --priority --live --confirm
```

The priority queue controls inspection order only; it is not evidence of indexing or ranking.

The URL Inspection API reports the version in Google's index. If `lastCrawledAt` predates the release, the result does not verify that Google saw the new page version. For a live Google test, use the Search Console URL Inspection interface. See [Google's URL Inspection API documentation](https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect).

Inspect the complete manifest only when the Search Console quota and review window allow it:

```powershell
npm run seo:indexing:inspect -- --all --live --confirm
```

The latest evidence is stored locally at `data/seo/indexing/inspections/latest.json`; previous snapshots are archived under `history/`. These files are ignored because they are operational account exports.

## 5. Import an existing export instead

```powershell
npm run seo:indexing:import -- C:\path\to\inspection.csv --date 2026-09-24
```

The importer accepts site URLs only, rejects URLs outside the current manifest, normalizes trailing slashes, rejects duplicates, and preserves raw inspection fields alongside a conservative status classification.

## 6. Monitor follow-up work

```powershell
npm run seo:indexing:monitor
npm run seo:indexing:check
```

Review `data/seo/indexing/INDEXING_REPORT.md`. The priority table shows public HTTP and Google inspection evidence in separate columns. Prioritize `error`, `excluded`, and `not_indexed`; keep `submitted_pending_inspection` separate from `indexed`. Missing rows are pending evidence, not zero indexing. A dry-run receipt is a plan, not a live submission. A live receipt for an earlier manifest size cannot establish submission of the current URL set. Submissions through the Search Console interface will not appear in this local receipt directory.

Also review Search Console's Page Indexing and Manual Actions reports in the authorized property. Export Page Indexing findings with their observation date, and use URL Inspection for specific priority URLs; the aggregate Page Indexing report does not prove the status of every sitemap URL. See [Google's Page Indexing report guide](https://support.google.com/webmasters/answer/7440203?hl=en).

## Status meanings

- `indexed`: Google’s URL Inspection evidence says the URL is on Google.
- `excluded`: Google returned an exclusion, duplicate, canonical, noindex, or similar non-indexed state.
- `not_indexed`: Google has not indexed the URL or has not established it in the index.
- `error`: the inspection request or page state returned an error requiring retry or investigation.
- `submitted_pending_inspection`: a successful live sitemap submission receipt with the current manifest URL count exists, but the URL has no inspection evidence.
- `pending_submission`: no matching live sitemap submission receipt is recorded locally; an interface submission may still exist.

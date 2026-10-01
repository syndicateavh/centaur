# SEO Phase 12 — Final QA and release

Phase 12 is the final repository release gate. It builds the production
package, runs the complete SEO and deployment QA suite, records exact package
checksums, and produces a deployment handoff report. It does not alter the
website’s English, invent performance results, or upload files to hosting.

## Release command

Run:

```text
npm run release:prepare
```

This runs `tools/final-release-qa.js`, which:

1. runs the complete `npm run seo:gate`;
2. rechecks the static deployment boundary;
3. refreshes the authority and evidence-only measurement reports;
4. optionally checks the live deployment when `RELEASE_EXTERNAL_ORIGIN` is
   supplied; and
5. verifies and checksums the final `build/client/` package.

The shorter QA alias is:

```text
npm run release:qa
```

The CI script points to the same release QA command.

## Final package contract

The release package must contain:

- every registered route document, including the branded 404 document;
- `.htaccess`, `robots.txt`, `sitemap.xml`, and `llms.txt`;
- the first-party brand asset and compiled production assets; and
- no `build/server` directory or unused SPA fallback.

The upload boundary is the **contents** of `build/client/`. Do not upload the
repository root, the `build/client` folder as a nested directory, source files,
environment files, or `build/server`.

The final manifest records the route count, sitemap count, package file count,
package bytes, route canonicals, build environment, git commit when available,
and SHA-256 for every file in the upload package.

## Generated handoff artifacts

- `RELEASE_QA_REPORT.md` — human-readable QA status, package summary, checks,
  and deployment handoff.
- `RELEASE_MANIFEST.json` — machine-readable route and package manifest with
  file checksums.
- `SEO_AUTHORITY_REPORT.md` — internal-link authority and evidence-only
  outreach report.
- `src/content/seo/measurements/SEO_MEASUREMENT_REPORT.md` — local imported Search Console/backlink evidence, or
  an explicit unavailable-data notice when no snapshot has been imported.

These reports never convert missing data into zeroes or estimates.

## External production verification

The repository cannot authenticate to Hostinger, Cloudflare, Search Console, or
Webmaster Tools. After uploading the contents of `build/client/` and clearing
the relevant cache, run:

```text
$env:RELEASE_EXTERNAL_ORIGIN = 'https://centaurcareers.in'
npm run release:qa
```

The optional external check verifies deployed 200 responses, raw HTML
metadata, JSON-LD, canonical redirects, sitemap, robots, all required crawler
user agents, and a real 404 response. It does not claim indexing or rankings.

If `RELEASE_EXTERNAL_ORIGIN` is omitted, local QA can still pass, but the
manifest marks live verification as `not-run` and the report keeps the release
at “ready for manual upload,” not “live deployment verified.”

## Release acceptance criteria

Release preparation is accepted only when:

- `npm run release:qa` exits successfully;
- all indexable pages have valid prerendered metadata, content, links, and
  structured data;
- all new routes remain correctly indexed or noindexed;
- the sitemap contains only canonical indexable URLs;
- robots rules allow crawlers and do not contain a blocking `Disallow` rule;
- HTTP/HTTPS, host, slash, query-preservation, and 404 behavior pass;
- protected content and evidence controls pass; and
- the generated manifest reports `local-qa-passed` and
  `releaseReadyForUpload: true`.

Genuine live release completion additionally requires the manual upload and a
passing `RELEASE_EXTERNAL_ORIGIN` verification run.

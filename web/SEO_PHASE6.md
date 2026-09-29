# SEO Phase 6 — Submit and monitor indexing

Phase 6 turns indexing into an evidence-only operational workflow. The site can prepare and submit one canonical sitemap, inspect individual URLs through the authorized Search Console API, import inspection exports, and report pending or excluded URLs without treating submission as proof of indexing.

## Implemented

- Generates `data/seo/indexing/indexing-manifest.json` from the production `public/sitemap.xml`.
- Includes every canonical site route and published blog/category URL with its URL kind, route identity, and sitemap eligibility.
- Adds a guarded sitemap submission command:

  ```text
  npm run seo:indexing:submit
  ```

  This is a dry run by default. A live request requires an authorized `GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN` and both `--live --confirm`.
- Adds URL Inspection API monitoring:

  ```text
  npm run seo:indexing:inspect -- --url /courses/ --live --confirm
  npm run seo:indexing:inspect -- --all --live --confirm
  ```

- Adds a bounded first-review queue for the regional/national pages, operations information cluster, and commercial next-step pages:

  ```text
  npm run seo:indexing:inspect -- --priority
  npm run seo:indexing:inspect -- --priority --live --confirm
  ```

  The priority queue is an inspection order only. It does not claim that these URLs are indexed or rank.

- Adds an offline import path for an authorized Search Console inspection CSV or JSON response:

  ```text
  npm run seo:indexing:import -- C:\path\to\inspection.csv --date 2026-09-24
  ```

- Archives previous inspection snapshots and never stores access tokens.
- Generates a follow-up dashboard:

  ```text
  npm run seo:indexing:monitor
  ```

  The dashboard separates `indexed`, `excluded`, `not_indexed`, `error`, `submitted_pending_inspection`, and `pending_submission`.
- Adds `npm run seo:indexing:check` to the SEO gate. It verifies sitemap/manifest parity, canonical URL scope, inspection evidence, submission receipts, and the no-fabricated-status rule.
- The monitor report separately lists the priority inspection queue so regional and online pages can be reviewed first after deployment.
- Adds the sitemap manifest generation to the production build and rewrites this phase documentation around the indexing workflow.

## Authentication boundary

The repository cannot see Google Search Console state without an authorized account. Configure the access token in the shell only:

```powershell
$env:GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN = '<short-lived OAuth access token>'
```

Do not place the token in source, JSON, command history, receipts, or committed files. The token must have access to the `https://centaurcareers.in/` URL-prefix property and the required Search Console API scope.

## Operating rule

Submitting `https://centaurcareers.in/sitemap.xml` tells Search Console where the canonical URL set is. It does not request or guarantee indexing for every URL. Inspect or import evidence for individual pages, fix only supported technical/content issues, then re-inspect. The Indexing API is not used for ordinary site pages; this workflow uses the Search Console sitemap and URL Inspection services.

## Validation

```text
npm run build
npm run seo:indexing:check
npm run seo:indexing:monitor
npm run seo:check
```

Until an authorized inspection snapshot is imported, the monitor correctly reports all URLs as pending inspection rather than indexed.

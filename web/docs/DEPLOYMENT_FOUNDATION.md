# Deployment Foundation

This document defines the Phase 1 deployment contract for the static Centaur Careers website.

## Final production origin

```text
https://centaurcareers.in
```

The canonical host is the non-www HTTPS origin. Public non-root routes use trailing slashes. The repository source of truth is `src/seo/siteConfig.js` and the route registry is `src/seo/seoRoutes.js`.

## Build the upload package

From the repository root:

```text
npm run deployment:prepare
```

This command:

1. Generates the production sitemap and robots file.
2. Builds and prerenders the React Router routes.
3. Removes the unused SPA fallback.
4. Verifies the static deployment contract.

The upload package is the **contents** of:

```text
build/client/
```

The latest local release handoff is recorded in [`RELEASE_QA_REPORT.md`](RELEASE_QA_REPORT.md)
and [`RELEASE_MANIFEST.json`](RELEASE_MANIFEST.json). The package is ready for
manual upload; that status does not mean the live host has been verified.

Upload the contents, including hidden `.htaccess`, into the production document root, normally the Hostinger `public_html/` directory. Do not upload the `build/client` folder as an extra nested directory.

## Required uploaded files

- `index.html`
- `404/index.html`
- every registered route directory and `index.html`
- `.htaccess`
- `robots.txt`
- `sitemap.xml`
- `llms.txt`
- `assets/`
- `images/`

Do not upload `__spa-fallback.html`, `build/server`, source files, or local environment files.

## Safe upload procedure

1. Take a backup of the current production document root.
2. Run `npm run deployment:prepare` locally.
3. Confirm `npm run deployment:check` passes.
4. Upload the contents of `build/client/` to the production document root.
5. Preserve hidden files, especially `.htaccess`.
6. Clear only the hosting/CDN cache for the affected site.
7. If Cloudflare proxies the domain, disable any managed robots, AI Crawl
   Control, Worker, WAF, Access, or bot-challenge rule that blocks or rewrites
   public crawler requests. The repository policy allows every bot; the live
   `robots.txt` must not add `Disallow` rules or return a challenge to crawlers.
8. Run the external verification:

```text
npm run seo:external
```

9. Inspect the homepage, course hub, one course track, contact page, Lucknow page, sitemap, robots file, redirects, and an unknown URL.

If external verification fails, compare the uploaded document root with `build/client/` and restore the backup if unrelated production functionality was affected.

## Local verification commands

```text
npm run deployment:check
npm run seo:gate
npm run seo:external
```

`deployment:check` and `seo:gate` are deterministic local checks. `seo:external` is a live deployment check and is intentionally separate from the local CI gate.

## Current Phase 0 status

The repository deployment package is verified locally when `npm run deployment:prepare` passes. The live domain must still be updated with that package and rechecked; external credentials or hosting access are not available to this repository automation.

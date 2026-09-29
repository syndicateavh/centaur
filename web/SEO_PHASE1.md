# SEO Phase 1 — Technical deployment foundation

Phase 1 makes the repository output upload-ready for the static production
website. It does not publish new keyword pages or rewrite the approved English
content.

## Phase 1 gate

Run the consolidated local gate after every technical SEO change:

```text
npm run build
npm run seo:phase1:check
```

The gate checks prerendered HTML, metadata, indexability, JSON-LD, sitemap,
robots rules, redirects, 404 behavior, the static upload package, performance
safeguards, and registered route contracts together. It does not claim that
Google has indexed a URL. The separate external check may be run only at a
safe crawl pace because the production host can rate-limit automated requests:

```text
# PowerShell
$env:SEO_EXTERNAL_DELAY_MS = '1000'
npm run seo:external
```

## Implemented controls

- React Router prerenders every registered public route into `build/client/`.
- The upload boundary is the **contents** of `build/client/`, not the folder
  itself and not the repository root.
- `.htaccess` serves route `index.html` files, preserves real 404 responses,
  prevents Referer-gated public assets, enables safe compression/caching, and
  normalizes HTTP, `www`, and non-trailing-slash document URLs.
- `robots.txt` explicitly allows Googlebot, Bingbot, OAI-SearchBot,
  PerplexityBot, GPTBot, and every other crawler through the wildcard rule.
- No crawler `Disallow` rule is permitted.
- `sitemap.xml` contains canonical indexable routes and published blog URLs
  only.
- `llms.txt` is copied as a text-first site summary.
- The branded 404 document is present and remains `noindex,follow`.
- Local HTTP tests cover normal browsers plus Googlebot, Bingbot,
  OAI-SearchBot, PerplexityBot, and GPTBot.
- Deployment validation rejects missing route files, preview references,
  invalid canonical URLs, blocked crawlers, missing redirects, missing 404
  output, and incomplete upload assets.

## Local release commands

```text
npm run deployment:prepare
npm run deployment:check
npm run test:http
npm run seo:check
npm run lint
```

`deployment:prepare` is the release command. It rebuilds the static output and
checks that the complete package is upload-ready.

## Hosting release procedure

1. Back up the current Hostinger document root.
2. Run `npm run deployment:prepare` locally.
3. Upload the contents of `build/client/` into `public_html/`.
4. Preserve hidden `.htaccess` and all route directories.
5. Do not upload `build/server`, source files, `.env` files, or a nested
   `build/client` directory.
6. If Cloudflare is enabled, disable managed robots/AI Crawl Control, bot
   challenges, Workers, Access rules, or WAF rules that block or rewrite public
   crawler requests.
7. Clear the affected Hostinger/Cloudflare cache.
8. Run `npm run seo:external` and inspect representative browser and crawler
   responses.

## External completion criteria

Phase 1 is complete on production only when the live domain returns:

- prerendered titles, descriptions, canonicals, H1s, links, main content, and
  JSON-LD;
- `200` for every registered indexable route;
- `404` for unknown paths with the branded noindex response;
- a canonical HTTPS non-`www` redirect;
- a complete canonical sitemap;
- an allow-all `robots.txt` without `Disallow` directives; and
- the same HTML quality for Googlebot, Bingbot, OAI-SearchBot, PerplexityBot,
  and GPTBot.

The repository cannot perform the Hostinger/Cloudflare upload without hosting
credentials. Until that upload and external check pass, the live domain remains
an external deployment dependency.

## Regional technical completion

All five published regional routes—Delhi-NCR, Bengaluru, Mumbai, Pune, and
Hyderabad—are included in the shared new-route technical inventory. Each is
prerendered with one canonical, indexable metadata set, JSON-LD, breadcrumb
output, and sitemap membership. The technical gate therefore checks regional
availability as part of the same static release contract as the national and
commercial routes.

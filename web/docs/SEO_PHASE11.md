# SEO Phase 11 — Technical SEO for every new route

Phase 11 applies one shared technical SEO contract to every route added by the
career-guide, resource, India-wide, regional, and comparison phases. It keeps
the existing English and meaning intact while making route metadata, static
output, indexability, and deployment behavior verifiable.

## New-route inventory

`src/seo/technicalRoutes.js` explicitly inventories 16 new route IDs:

- the career-guide hub and eight authored career guides;
- the resources hub and investment-banking interview resource;
- the India-wide hub and Delhi-NCR, Bengaluru, and Mumbai regional pages; and
- the comparison draft, which remains a deliberately noindex route.

The inventory is checked against `src/seo/seoRoutes.js` and the corresponding
`src/routes/*.jsx` module. Every route module must use the shared
`createRouteMeta()` factory and export a page plus its `meta` function.

## Technical contract

Every indexable new route has:

- one unique title, description, H1, and canonical URL;
- `index,follow` robots metadata and a canonical URL without query strings or
  fragments;
- Open Graph and Twitter card metadata using the first-party site image;
- an explicit primary keyword and valid modification date in the SEO route
  registry;
- a parent relationship for breadcrumbs and a visible breadcrumb trail;
- route-appropriate JSON-LD containing the shared Centaur organization and
  website entities;
- a sitemap entry using the canonical production URL; and
- a prerendered route document containing the title, metadata, H1, content,
  breadcrumbs, links, and JSON-LD before JavaScript runs.

Authored career guides and the authored interview resource additionally emit
author, publication-date, modification-date, and article-section metadata in
the document head. This aligns their social and search presentation with the
Article entities already present in JSON-LD.

The comparison draft has the same canonical and social controls but remains
`noindex,follow`, has no page JSON-LD, and is excluded from the sitemap until
its existing business/editorial review gate is cleared.

## Deployment and crawl controls

The shared React Router prerender list is derived from the full SEO route
registry, so every new route is statically rendered. The production build
copies the route documents plus `.htaccess`, `robots.txt`, `sitemap.xml`,
`llms.txt`, and the 404 document into `build/client/`.

The technical and HTTP validators confirm that:

- canonical HTTPS non-`www` URLs resolve with trailing slashes;
- query strings survive redirects but do not create new canonical pages;
- unknown paths return a real 404 with `noindex,follow`;
- the sitemap contains only canonical indexable URLs;
- robots rules allow all crawlers and contain no blocking `Disallow` rule; and
- Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, GPTBot, and normal browsers
  receive the same indexable prerendered content.

## Verification commands

Run the focused new-route check:

```text
npm run seo:technical-routes:check
```

Run the complete release gate:

```text
npm run seo:gate
```

The focused validator is connected to `seo:check` and `seo:gate`, alongside
the existing technical SEO, structured data, internal-link, performance,
accessibility, deployment, and HTTP validators.

## Validation result

The repository currently validates 16 new route contracts, of which 15 are
indexable and one is the noindex comparison draft. The production output
contains all of them as prerendered documents. No new keyword block, hidden
text, crawler restriction, or rewrite of the approved website literature is
introduced by this phase.

# Blog SEO implementation

Phase 6 makes every published blog record a complete SEO document while preserving the existing site language and meaning.

## Published article contract

- The record controls the title, description, canonical path, index/follow directive, publication date, modified date, author, category, cover image, and related internal routes.
- Article pages emit canonical Open Graph and Twitter metadata. Cover image dimensions, alt text, and MIME type are used when a first-party cover image exists.
- Article pages emit a shared JSON-LD graph containing the Centaur Careers organization, website, WebPage, BreadcrumbList, and BlogPosting entities.
- The visible breadcrumb and JSON-LD breadcrumb use the same Home → Blog → article path.

## Category archive contract

- A category archive is indexable only when it is a supported category with at least one published post.
- Empty or unknown category archives are canonicalized and marked `noindex,follow`.
- Populated archives emit complete social metadata and a JSON-LD graph containing the shared organization, website, CollectionPage, ItemList, and BreadcrumbList entities.

## Verification

Run the focused contract check with:

```text
npm run test:blog:seo
```

The full `npm run seo:check` and `npm run seo:gate` commands include this check, the published-route checks, sitemap checks, and the existing site SEO quality controls.

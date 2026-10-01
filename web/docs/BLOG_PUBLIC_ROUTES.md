# Public Blog Routes — Phase 5

Phase 5 adds the public, published-only blog route layer.

## Routes

- `/blog/` — indexable blog collection page.
- `/blog/category/<category>/` — indexable only when the controlled category has published records.
- `/blog/<slug>/` — indexable only for a validated `published` record.

Draft, review, scheduled, archived, unknown, and invalid records are not rendered as public articles. The local portal remains separate at `/blog-portal/` and is not included in the sitemap.

## Static publishing behavior

The build reads published JSON records and automatically:

- Prerenders each published article and populated category archive.
- Adds article and category URLs to `public/sitemap.xml`.
- Uses the record SEO title, description, canonical path, publication dates, and cover image.
- Renders structured body blocks without allowing arbitrary HTML.
- Emits Article metadata for published article pages.
- Verifies the final published documents and copied blog images in `build/client/` before the build succeeds.

With zero published records, the blog index still builds with a useful empty state and no article/category URLs are added.

## Checks

```text
npm run test:blog:routes
npm run test:blog:structure
npm run seo:gate
```

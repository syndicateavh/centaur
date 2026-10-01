# Local Blog Portal — Phase 3

Phase 3 adds an in-house editor for the file-based blog storage. It does not add an external CMS, database, third-party service, public blog route, or public navigation link.

## Start the portal

Run the development server from the project root:

```text
npm run dev
```

Open:

```text
http://localhost:3000/blog-portal/
```

The local API is available only to loopback requests. The portal route is not in the SEO route registry, sitemap, or prerender list, and its metadata is `noindex,nofollow,noarchive`.

## Editor capabilities

- Create a new draft or load an existing JSON record.
- Edit all fields defined by the blog schema.
- Build the body from paragraph, heading, list, quote, link, image, FAQ, and callout blocks.
- Associate existing SEO routes for contextual internal links.
- Upload first-party images into `public/images/blog/` during local development.
- Accept only AVIF, GIF, JPEG/JPG, PNG, and WebP uploads within the image size limit; validate the binary and fill dimensions automatically.
- Validate draft and published records before saving.
- Show blocking validation errors and non-blocking editorial recommendations.
- Save post records directly into `src/content/blog/posts/<post-id>.json` while running locally.
- Import and export JSON for an explicit file-based fallback workflow.
- Keep a browser-local working draft so an unfinished edit is not lost on refresh.
- Preview the article without allowing arbitrary HTML.

## File-writing boundary

A deployed static site cannot write into the repository. Direct saving therefore works only through the local Vite development server. On another host, use `Export JSON`, then place the downloaded record under `src/content/blog/posts/` and run the structure check before building.

The local API does not expose delete operations. Use the `archived` status for editorial retirement so file history remains recoverable.

## Checks

```text
npm run test:blog:portal
npm run test:blog:validation
npm run test:blog:structure
npm run seo:gate
```

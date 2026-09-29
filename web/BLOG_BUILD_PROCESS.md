# Blog build process

Phase 8 connects the complete in-house blog workflow to the production build. No external CMS, database, or publishing service is required.

## Build sequence

`npm run build` now runs these stages in order:

1. Create the post and image storage directories.
2. Validate every stored blog image, including its binary format, safe filename, size, dimensions, and supported extension.
3. Validate every blog record and its editorial quality rules.
4. Generate the production `public/sitemap.xml` and `public/robots.txt` files.
5. Load published records into React Router prerendering and build the static site.
6. Remove the unused SPA fallback from the upload directory.
7. Verify that generated crawler files, published blog documents, and every blog image are present and byte-identical in `build/client`.

Only records with `status: "published"` are prerendered and added to the sitemap. Draft, review, scheduled, archived, invalid, and noindex records stop or stay out of the public output according to their validation state.

## Commands

```text
npm run build
npm run test:blog:build
npm run deployment:check
npm run seo:gate
```

The deployment upload directory is `build/client/`. Upload that directory after the build succeeds. The generated `public/` files are also kept synchronized with their build copies.

To validate an exported post before placing it in `src/content/blog/posts/`, run:

```text
npm run blog:validate-file -- C:\path\to\blog-post.json
```

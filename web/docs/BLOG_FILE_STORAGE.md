# Blog File Storage — Phase 2

Phase 2 implements the in-house file-based storage layer without an external CMS, content API, database, or production backend.

## Locations

Post records:

```text
src/content/blog/posts/<post-id>.json
```

First-party blog images:

```text
public/images/blog/
```

The post filename is the stable `id`, not the public slug. This allows an approved slug change to preserve the record identity and create a redirect later.

## Commands

Prepare the local storage directories:

```text
npm run blog:storage
```

The production build runs this preparation automatically before validating images, generating the sitemap, prerendering published output, and checking the final `build/client/` directory.

Validate the storage contract:

```text
npm run test:blog:structure
```

## Storage behavior

- JSON records are loaded only from `src/content/blog/posts/`.
- The storage utility creates missing post and image directories.
- Post IDs are validated before being used as filenames.
- Writes use a temporary file followed by an atomic rename.
- Stored filenames must match their JSON `id` field.
- The browser-facing storage module exposes imported records for later static rendering.
- `getPublishedBlogPosts()` is the only intended source for public blog pages.
- Draft, review, scheduled, and archived posts are not public content.
- No article JSON files are seeded in Phase 2, so no new English copy is published.

## Boundaries

The storage utility is local build/editor infrastructure. It is not an online admin service and does not add authentication, public CMS routes, or blog pages. Those belong to later phases.

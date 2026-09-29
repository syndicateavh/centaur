# Blog publishing workflow

Phase 10 adds a controlled, file-based publishing lifecycle. It stays local and in-house: no database, external CMS, third-party publishing service, or public write endpoint is used.

## Lifecycle

```text
draft → review → scheduled → published → archived
          │          │            │
          └──────────┴────────────┴──→ draft/review/archive where allowed
```

Allowed transitions are enforced in `src/content/blog/blogWorkflow.js`:

- `draft` → `review` or `archived`
- `review` → `draft`, `scheduled`, `published`, or `archived`
- `scheduled` → `review`, `published`, or `archived`
- `published` → `review` or `archived`
- `archived` → `draft`

The workflow controls index state automatically. Only `published` records use `index,follow`; all other states remain out of public routes and the sitemap. Publishing sets `publishedAt` when needed, while scheduling requires today or a future `scheduledAt` date.

## Local portal workflow

1. Create or import a record.
2. Save it as `draft`.
3. Use `Submit for review` after editorial review.
4. Use `Schedule publication` with a valid future date, or `Publish` after the final validation passes.
5. Run the production build and SEO gate before uploading `build/client/`.
6. Use `Archive` to retire a post without deleting its JSON history.

The portal exposes status changes as explicit actions. Direct status changes through the ordinary save endpoint are rejected; this prevents an accidental draft-to-published bypass.

## Command-line workflow

List stored records:

```text
npm run blog:list
```

Validate one record or every record:

```text
npm run blog:validate -- post-id
npm run blog:validate
```

Move a record through the lifecycle:

```text
npm run blog:submit -- post-id
npm run blog:schedule -- post-id 2026-09-20
npm run blog:publish -- post-id
npm run blog:archive -- post-id
```

The lower-level command is also available when an explicitly allowed target is needed:

```text
npm run blog:workflow -- transition post-id review
```

Scheduled records do not become public automatically. On the chosen date, run the publish command, then run `npm run seo:gate` and upload the resulting `build/client/` directory.

## Safety controls

- Workflow transitions are validated before the JSON file is replaced.
- The local API accepts loopback requests only.
- A stale editor record cannot transition over a newer stored status.
- Published transitions run the same content validation used by the production build.
- Writes use a temporary file followed by an atomic rename.
- Archived records remain recoverable because the file is retained.
- Workflow behavior is covered by `npm run test:blog:workflow` and included in `npm run seo:check` and `npm run seo:gate`.

Existing website English and meaning are not rewritten by the workflow.

# Blog content directory

For competitor examples, metadata patterns and article briefing guidance, see [Blog competitor SEO guidance](../../../docs/BLOG_COMPETITOR_SEO_GUIDANCE_2026-09-26.md).

This directory stores first-party blog post records for the in-house, file-based blog portal.

Published article records live under `posts/*.json`; the public blog uses a controlled editorial workflow. The `industry-updates` category is reserved for dated, primary-source-led explainers about relevant financial-services developments. Do not publish copied headlines or undated regulatory summaries.

Post records are stored under `posts/*.json` and images are stored under `public/images/blog/`.

Post records use the schema and validators in `blogSchema.js`. Draft, review, scheduled, and archived records stay out of public routes and the sitemap. Only records with `status: "published"` can be rendered publicly. Before publication, check the source document and effective status, explain career/workflow relevance without legal or investment advice, and record source URLs and review notes in `evidenceNotes`.

The `author.type` field may be `Person` (the default for existing bylines) or `Organization`. Use an organization byline only when the organization is the truthful publisher and no individual reviewer/byline has been supplied; never invent a named human reviewer to satisfy structured data.

The portal must create structured body blocks rather than arbitrary HTML. This keeps article output safe, accessible, consistently renderable, and compatible with the existing SEO quality gate. Phase 5 renders only validated records with `status: "published"` through the public blog routes.

Images are first-party raster assets stored under `public/images/blog/`. The existing workflow validates file signature, supported format, file size, dimensions, safe filename, and record dimensions before an image can be used by a published post.

For search metadata, use `seo.focusKeyword` for the article's primary query and `seo.secondaryKeywords` for closely related variants. Keep `tags` as a short, human-readable topical set; they are rendered on the article and emitted as `article:tag`/`BlogPosting` keyword signals. The site does not create thin tag-archive URLs, so each published article remains the canonical indexable owner of its search intent.

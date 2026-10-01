# Blog Content Validation — Phase 4

Phase 4 adds the editorial quality gate on top of the Phase 1 data schema. It validates content before a record can be saved or published, without rewriting or inventing website copy.

## Blocking validation

The existing schema validation remains blocking for all records. Publication validation additionally blocks:

- Fewer than 300 body words.
- No paragraph or H2 section heading.
- H3 headings appearing before the first H2.
- Duplicate headings.
- Unsupported, malformed, or unsafe link URLs.
- Unknown internal route references.
- Non-first-party image paths.
- Image paths whose stored files are missing or whose recorded dimensions do not match the binary image metadata.
- Missing scheduled date for scheduled records.
- Published records that are not indexable or lack a publication date.
- Canonical paths that conflict with existing website routes.
- Duplicate IDs, slugs, or canonical blog paths across stored records.

## Recommendations

Warnings are shown in the local portal and reported during storage checks. They do not block a draft, but editors should review them before publication:

- Title, excerpt, and SEO metadata outside recommended length ranges.
- No contextual internal link.
- No cover image.
- Missing evidence notes for factual review.
- Missing local image files.
- Unused local images (reported by the image verifier for cleanup review).

## Commands

```text
npm run test:blog:validation
npm run test:blog:structure
npm run seo:gate
```

The structure check validates every JSON record under `src/content/blog/posts/`. Published records must pass both schema and editorial validation. Draft and review records may retain quality warnings while still being blocked by structural errors.

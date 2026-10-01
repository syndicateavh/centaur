# Blog Content Structure — Phase 1

Phase 1 defines the in-house blog data contract. It does not add public blog routes, publish an article, or change existing website English or meaning.

## Storage

Blog records will be stored as JSON files under:

```text
src/content/blog/posts/*.json
```

Blog images will be stored under:

```text
public/images/blog/
```

There is no external CMS, content API, database, or third-party publishing service in this design.

## Post record

Each post has these fields:

| Field | Required | Purpose |
| --- | --- | --- |
| `schemaVersion` | Yes | Versioned content contract |
| `id` | Yes | Stable internal lowercase slug |
| `slug` | Yes | Public blog URL segment |
| `status` | Yes | `draft`, `review`, `scheduled`, `published`, or `archived` |
| `title` | Yes | Visible article title and default SEO title |
| `excerpt` | Yes | Listing summary and default description source |
| `category` | Yes | Controlled editorial category |
| `author` | Yes | Visible author identity and role |
| `body` | Yes | Structured content blocks |
| `coverImage` | No | First-party image with alt text and dimensions |
| `publishedAt` | Published only | Original publication date |
| `updatedAt` | Yes | Last meaningful content update |
| `scheduledAt` | No | Future editorial schedule date |
| `seo` | Yes | SEO title, description, canonical, and index state |
| `relatedRouteIds` | No | Existing route IDs for contextual links |
| `redirects` | No | Former site-relative paths after an approved slug change |
| `evidenceNotes` | No | Editorial evidence/provenance notes; not public body copy |

## Controlled values

Categories currently defined:

```text
career-guides
investment-banking
retail-banking
finance-operations
lucknow-careers
interview-preparation
```

The controlled list prevents uncontrolled archive pages and keeps future category routing intentional.

## Structured body blocks

Supported block types:

- `paragraph` — text paragraph
- `heading` — level 2 or 3 only; the article title remains the single H1
- `list` — ordered or unordered text list
- `quote` — quoted text with optional attribution
- `link` — descriptive link with optional existing route ID
- `image` — first-party image with required alt text and dimensions
- `faq` — visible question and answer pair
- `callout` — titled supporting information block

Arbitrary HTML is not part of the content contract.

## Validation rules

- IDs and slugs use lowercase hyphenated values.
- Reserved slugs such as `admin`, `index`, `rss`, `sitemap`, and `404` are rejected.
- IDs and slugs are limited to 96 characters.
- Titles are limited to 160 characters.
- Excerpts are limited to 500 characters.
- SEO descriptions are limited to 320 characters.
- Dates use `YYYY-MM-DD` and must be real calendar dates.
- Published posts require a body, author, publication date, SEO fields, and `noindex: false`.
- Related route IDs must match the existing SEO route registry.
- Cover and body images require source, alt text, width, and height.
- IDs and slugs must be unique across all records.
- Published body content must pass the Phase 4 editorial quality gate.
- Published body content must use first-party image paths under `/images/blog/`.
- Published content should include contextual internal links and evidence notes for factual review.

## Editorial lifecycle

```text
draft → review → scheduled/published → archived
```

The local portal will save draft records in this full shape; publication validation adds stricter requirements such as a body, publication date, SEO fields, and indexability. Content claims must be checked against approved evidence before publication. Existing page copy and business meaning remain protected.

## Implementation boundary

Phase 1 delivers the schema, field definitions, directory contract, and automated validator. Phase 4 adds editorial content validation. Phase 5 adds public blog routes, static prerendering, metadata, and sitemap integration. Later phases can extend RSS and additional discovery surfaces.

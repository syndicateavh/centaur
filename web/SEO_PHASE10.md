# SEO Phase 10 — Internal linking and authority building

Phase 10 turns the existing links into a documented, testable authority graph
and prepares an evidence-only external authority workflow. It keeps the
existing English and page meaning intact. It does not promise rankings,
traffic, domain authority, or backlinks that have not been independently
observed.

## Internal authority graph

The graph is defined in `src/content/seo/authorityBuilding.js` and implemented
through `src/seo/internalLinks.js` plus the existing `InternalLinkGroup`
component.

The intended hierarchy is:

```text
Homepage
├── Financial Operations Masterclass (/courses/)
│   └── Investment Banking Operations, Retail Banking, Finance Operations
├── Career Guides (/career-guides/)
│   └── authored career-guide spokes
├── Resources (/resources/)
│   └── interview preparation resource
├── India-wide availability (/india/)
│   └── Delhi-NCR, Bengaluru, Mumbai regional pages
├── Placement Support (/placements/)
└── Lucknow local availability (/locations/lucknow/)
```

The model records nine priority destinations, required inbound sources, five
tested user journeys, and a maximum three-click crawl-depth rule. The
prerendered related-page group remains followable and uses the route’s existing
H1 labels, so anchor text stays descriptive without changing visible copy.

The validator checks:

- priority commercial, national, local, hub, and module destinations have the
  required inbound links;
- the homepage can reach every indexable route;
- the commercial, career, resource, national, and Lucknow journeys have every
  expected edge;
- every indexable page emits the authority-link group in raw prerendered HTML;
- authority links are canonical, followable, and not orphaned; and
- non-indexable comparison content is not allowed to become an authority
  source for indexable pages.

Run the graph check with:

```text
npm run seo:authority:check
```

## Editorial authority assets and outreach

`LINKABLE_AUTHORITY_ASSETS` identifies six useful first-party destinations for
manual editorial outreach. The backlink registry now ties every prospect to an
asset and a reader-value-based outreach angle. The workflow remains:

```text
candidate → qualified → outreach → earned → monitoring
                    └──────────────→ rejected
```

No external publisher is contacted automatically. A prospect can be marked
`earned` or `monitoring` only with an external HTTPS source URL, and the source
must be manually visible and checked. The workflow rejects missing asset
context and prohibited link-acquisition language. It does not support paid
links, automated submissions, large-scale exchanges, or private link networks.

Use:

```text
npm run backlinks:list
npm run backlinks:validate
npm run backlinks:mark -- <record-id> qualified
npm run backlinks:mark -- <record-id> outreach
npm run backlinks:mark -- <record-id> earned https://external.example/resource
```

Search Console and backlink audit imports remain the source of performance
evidence. Until those imports exist, reports say that data is unavailable; no
authority, traffic, ranking, or backlink outcome is estimated.

## Validation

Phase 10 is connected to the full quality gate:

```text
npm run seo:authority:check
npm run seo:check
npm run seo:gate
```

The repository is ready to support ethical authority work, but genuine
external authority still depends on independent publishers choosing to cite or
reference the site.

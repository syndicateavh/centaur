# SEO Phase 2 — Import the 728-keyword strategy

Implementation date: 2026-09-13

## Phase 2 gate

Regenerate the ownership artifacts after an approved keyword, route, or page-owner change, then run the consolidated gate:

```text
npm run build
npm run seo:keywords:report
npm run seo:keywords:briefs
npm run seo:keywords:indexability:map
npm run seo:phase2:check
```

The gate verifies unique ownership, route and blog primary terms, indexability,
the audited keyword map, current report/brief timestamps, and computed
cannibalization conflicts. It does not turn keyword volume into a ranking claim.

Phase 2 imports the approved `Centaur_Careers_Competitor_SEO_728_Keyword_Strategy.xlsx`
without turning the keyword list into public copy. The workbook remains a planning
and validation source; original English literature is not rewritten or stuffed with
phrases.

## Imported strategy

- 728 unique normalized keywords from the `Keyword Map` sheet.
- 24 canonical target-page definitions from `Content Architecture`.
- Exact workbook fields: cluster, intent, funnel, priority, target URL, page type,
  page action, theme, competitors, evidence URL, wave, and notes.
- One primary owner per keyword, with secondary terms grouped under the same
  authoritative destination.
- 481 `Consolidate`, 160 `Conditional`, 75 `Cluster`, and 12 `Optional` rows.

The generated source is [`src/content/seo/keywordStrategyData.js`](src/content/seo/keywordStrategyData.js).
The ownership API is [`src/seo/keywordOwnership.js`](src/seo/keywordOwnership.js),
with the stable import surface in [`src/seo/keywordMap.js`](src/seo/keywordMap.js).

## Ownership and publishing rules

- `/courses/` owns the primary commercial program cluster.
- `/locations/lucknow/` owns the verified Lucknow local cluster.
- `/courses/retail-banking/` owns its narrower module cluster.
- Any destination that is not ready for publication remains governed as a future
  page and is not auto-published until its Phase 0 content, business, permission,
  or regional requirements are complete. The current route registry publishes
  all 24 imported strategy destinations as indexable owners.
- No keyword query parameters, hidden blocks, meta-keyword tags, doorway pages,
  duplicated city templates, or standalone module Course entities were added.

The current route registry now gives every indexable page an explicit SEO purpose
and primary topic. The strategy owner is separate from supporting pages such as
FAQs, placement support, about, contact, and the blog hub, so those pages do not
cannibalize the workbook destinations.

## Briefs and reporting

- [`docs/seo-keyword-content-briefs.json`](docs/seo-keyword-content-briefs.json)
  contains a brief for all 24 target pages: primary and secondary terms, intent,
  title/H1 direction, outline, FAQ topics, links, schema, status, and content gaps.
- [`docs/seo-keyword-report.json`](docs/seo-keyword-report.json) audits every
  keyword against routes, titles, H1s, semantic text, internal links, canonical,
  sitemap, and prerendered output.
- Future governed destinations, when introduced, stay visibly marked in both
  files and are not treated as published owners until they pass the indexability
  contract.

## Keyword-indexability map

Phase 2 also produces [`docs/seo-keyword-indexability-map.json`](docs/seo-keyword-indexability-map.json).
It is the release-facing contract between keyword ownership and technical SEO:

- every approved keyword has exactly one canonical owner;
- every owner records its primary and supporting terms, intent, funnel, cluster,
  priority, evidence URL, source import date, and page update date;
- every target records its route, canonical URL, `index,follow` policy, sitemap
  membership, prerendered status, rendered-canonical match, and inbound/outbound
  internal-link coverage;
- every target has a linked conversion destination, either the enrolment contact
  page for course/module intent or the commercial course hub for informational,
  regional, resource, and comparison intent.

The map is generated from the workbook-backed strategy, the single SEO route
registry, the registered internal-link architecture, and the current production
build. It is deliberately not page copy or a list of meta keywords.

## Commands

```text
npm run seo:keywords
npm run seo:keywords:check
npm run seo:keywords:briefs
npm run seo:keywords:report
npm run seo:keywords:indexability:map
npm run seo:keywords:indexability:check
npm run seo:check
```

To re-import a revised workbook:

```text
npm run seo:keywords:strategy:import -- C:\path\to\Centaur_Careers_Competitor_SEO_728_Keyword_Strategy.xlsx
```

The importer fails on missing fields, duplicate normalized keywords, unexpected
row counts, or mismatched content-architecture totals. The SEO check fails on
duplicate ownership, duplicate primary keywords, missing target governance, or an
indexable route without a defined SEO purpose and primary topic.

## Completion status

The 728-keyword strategy is imported, owned, briefed, mapped to 24 canonical
destinations, and connected to the SEO validation suite. The indexability check
fails if a keyword points to a missing, non-indexable, non-canonical,
non-prerendered, sitemap-missing, or orphaned page.

## Regional and online ownership completion

The five published regional clusters each have one canonical owner and retain
their local transactional terms on the matching regional route. Online-India
terms remain owned by `/india/` or the approved national/course destination;
they are not copied into city pages. `tools/verify-regional-keyword-ownership.js`
is part of the Phase 2 gate and fails if a regional page starts owning an
online-intent query or loses its measurement-market mapping.

## 2026-09-30 high-intent owner reconciliation

The source workbook is retained as a historical keyword plan. The later
attached-prompt implementation uses `src/content/seo/searchIntentOwnership.js`
as the current route-level owner register and deliberately resolves 19 workbook
assignments to more specific current pages (including fee, syllabus, course
module, regional, BCom, reconciliation, settlement, and payment-reconciliation
owners). `npm run seo:intent:check` reports those differences for review; it
passes because the register is the current approved routing decision. Do not
silently rewrite the imported workbook. If that workbook is re-imported, first
review its target URLs against the current coverage report and route owners.

The current prompt coverage table is in
[`SEO_HIGH_INTENT_PROMPT_COVERAGE_2026-09-30.md`](./SEO_HIGH_INTENT_PROMPT_COVERAGE_2026-09-30.md).

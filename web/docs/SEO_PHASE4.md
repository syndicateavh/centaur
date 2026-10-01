# SEO Phase 4 — Connect the site architecture

Phase 4 makes the site’s internal architecture explicit, contextual, and build-verified. Every important page family now has a defined discovery hub, a route role, a reciprocal path where needed, and a rendered contextual-link requirement.

## Implemented

- Added the canonical architecture contract in `src/content/seo/siteArchitecture.js`.
- Classified all 39 indexable routes as hubs, commercial modules, informational modules, career guides, learning resources, regional guides, comparison pages, entity pages, legal pages, or supporting pages.
- Connected the main discovery hubs:
  - Home → courses, career guides, resources, India, placements, FAQs, blog, and contact.
  - Courses → every course module, its matching career guides, comparison, placements, India, resources, FAQs, and contact.
  - Career guides → every authored guide, course discovery, resources, India, placements, FAQs, and contact.
  - Resources → every resource, quiz, course discovery, career guides, India, placements, FAQs, and contact.
  - India → every regional page, course module, national support page, Lucknow, and contact.
- Added reciprocal parent/child checks for course modules, career guides, resources, and regional pages.
- Added reciprocal module-to-career-guide topic paths for investment banking operations, retail banking, finance operations, KYC/AML, digital payments, and FinTech.
- Connected the Phase 2 keyword destinations and Phase 3 priority owners to the same contextual graph.
- Validated all authority targets and deliberate authority journeys as rendered, canonical internal paths.
- Added the generated architecture report at `docs/seo-site-architecture.json`.
- Added `tools/verify-phase4-site-architecture.js` to fail the SEO gate when a required edge is only declared in source but missing from the rendered build.
- Added a discovery-reachability contract from the Home, Courses, Career Guides,
  Resources, and India hubs. Every indexable route and keyword destination must
  be reachable from at least one of those roots through the registered graph.
- Added `npm run seo:phase4:check` and `npm run seo:architecture:map` and wired both into the SEO build controls.

## Operating rule

New indexable pages must be added to `SEO_ROUTES`, assigned a page role by the architecture contract, added to the appropriate contextual-link registry, and covered by at least one hub or reciprocal path. A route is not considered connected because it exists in the sitemap alone.

## Validation

```text
npm run build
npm run seo:phase4:check
npm run seo:check
```

The architecture check audits both source declarations and prerendered HTML under `build/client`.

## Regional authority completion

The architecture contract includes a tested authority journey for each
published regional guide: Home → India hub → regional guide → relevant career
guide → Courses. This verifies that Delhi-NCR, Bengaluru, Mumbai, Pune, and
Hyderabad are not merely present in the sitemap; each has a crawlable path to
regional research, online access, and the commercial destination.

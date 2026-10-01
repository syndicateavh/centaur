# SEO Baseline Audit

Baseline date: 2026-09-08

This is the pre-implementation audit for the existing Centaur Careers React site. It records verified behavior and items requiring later review. It intentionally does not rewrite English copy or alter the meaning of any page.

## Verification commands and results

The following commands were run against the existing working-tree build and source:

| Command | Result |
| --- | --- |
| npm run test:seo | Pass — 10 indexable pages, one noindex 404 page, canonical metadata and sitemap checks passed |
| npm run test:source | Pass — 10 indexable routes, structured-data and approved-content controls passed |
| npm run test:http | Pass — canonical 200s, one-hop host/protocol redirects, trailing slashes, query preservation, and real 404 checks passed |
| npm run lint | Pass |

The production build command was not rerun during this baseline because the working tree already contained user changes and the build command regenerates deployment artifacts. The existing build/client output was inspected read-only.

## Status legend

- **Pass** — verified by source inspection or an existing automated check.
- **Review** — a potential issue or suitability decision for a later implementation phase; no failure is asserted.
- **External** — cannot be fully verified from this repository.
- **Protected** — content or meaning must not be changed without explicit approval.

## Technical SEO

| Check | Status | Evidence / finding |
| --- | --- | --- |
| Public route inventory | Pass | 10 indexable routes plus /404/ are declared centrally. |
| Crawlable static HTML | Pass | React Router is configured with explicit prerender paths and ssr: false; each inspected route has meaningful initial HTML. |
| Unique titles | Pass | src/seo/seoRoutes.js validates duplicate titles; current output contains unique titles for all routes. |
| Unique descriptions | Pass | The route validator rejects duplicate descriptions; current output contains route-specific descriptions. |
| Canonical tags | Pass | Every inspected route has a canonical tag generated from SITE_ORIGIN and its registered path. |
| Robots metadata | Pass | Indexable routes use index,follow; the 404 route uses noindex,follow. |
| Canonical host | Pass in local contract | public/.htaccess redirects HTTP and www requests to https://centaurcareers.in. Production behavior still needs external verification. |
| Trailing slash policy | Pass in local contract | Non-root public routes are canonicalized with trailing slashes; /courses redirects to /courses/. |
| Query handling | Pass in local contract | Host/protocol redirects preserve the query string. Query parameters are not included in canonical URLs. |
| 404 behavior | Pass in local contract | Missing paths return 404 with the branded document and noindex metadata in the test server. Hostinger behavior remains external. |
| Sitemap | Pass | public/sitemap.xml contains only the 10 indexable canonical URLs and excludes /404/. |
| Sitemap generation | Pass | npm run build invokes tools/generate-sitemap.js before the React Router build. The generated lastmod policy needs later review. |
| Robots.txt | Pass at repository level | public/robots.txt allows public crawling and references the canonical sitemap. WAF/CDN rules are external. |
| Public assets | Pass in local contract | The logo is served without a Referer and receives an image content type in the local HTTP test. |
| Production origin safety | Review | SITE_ORIGIN is hard-coded as https://centaurcareers.in; no environment/staging guard is present in the current inventory. |
| Last-modified dates | Review | All indexable routes currently use the fixed date 2026-08-31; this must remain evidence-based and must not be refreshed automatically without a meaningful content update. |
| Orphan pages | Review | Source-level links show broad site-wide discovery, but a full link graph and deployed crawl have not yet been generated. |
| Duplicate URL variants | Review | The source and local HTTP contract cover host, protocol, slash, and query behavior; deployed query/hash behavior still needs testing. |
| Hreflang | Not applicable in current inventory | Only en-IN content is exposed and no alternate language route is registered. |
| Pagination | Not applicable in current inventory | No paginated route is registered. |

## Rendered on-page baseline

| Check | Status | Evidence / finding |
| --- | --- | --- |
| One H1 per route | Pass | All 11 inspected prerendered documents contain exactly one H1. |
| Primary H1 in initial HTML | Pass | Each route's registered H1 appears in initial HTML. |
| Visible body content | Pass | Every indexable page exceeds the existing 120-word source-test threshold; approximate counts are recorded in SEO_INVENTORY.md. |
| Semantic landmarks | Pass at shared-layout level | The root layout provides header, main, and footer; page components use sections, articles, and asides. Detailed accessibility testing remains open. |
| Visible breadcrumbs | Pass for child pages | Non-root pages use the shared breadcrumb component. The homepage correctly has no child breadcrumb trail. |
| Breadcrumb/schema consistency | Review | Source generation is aligned, but final structured-data validation should compare every visible label and URL against production HTML. |
| Internal links | Pass at source level | Header, footer, homepage, course pages, trust pages, contact, location, and FAQ routes are linked through React Router links. A broken-link crawl is not yet automated. |
| Image alt attributes | Pass in inspected output | 0 missing alt attributes were found across the current route output. Alt text quality and decorative-image intent still need manual review. |
| Image dimensions | Pass for observed logo usage | Logo instances include explicit dimensions. There are no other public image files in the current public directory. |
| Title length | Review | The homepage title is 125 characters. This is a diagnostic item only; no title wording should be changed without approval. |
| Description length | Review | Current descriptions range from 81 to 239 characters. The homepage, courses, and about descriptions are longer than common display guidance; meaning must be preserved if later reviewed. |
| Open Graph | Pass at presence level | Every inspected page has OG title, description, URL, type, site name, image, and image dimensions. All pages use the same first-party logo image. Page-specific imagery is a later enhancement only if real assets exist. |
| Twitter/X cards | Pass at presence level | Every inspected page has summary_large_image, title, description, image, and image alt metadata. |
| Meta keywords | Pass | No keyword meta-tag strategy was found. |

## Content-quality baseline

| Check | Status | Evidence / finding |
| --- | --- | --- |
| Approved content source | Pass | Content provenance and restrictions are documented in src/content/verifiedClaims.js and docs/CLAIMS_EVIDENCE_POLICY.md. |
| Meaning preservation | Protected | Existing English, claims, and program meaning are out of scope for unapproved SEO edits. |
| Thin-page review | Review | Contact and Lucknow pages are shorter than the homepage and course pages, but page purpose—not word count alone—must determine whether they need changes. |
| Duplicate content | Review | Career-track pages intentionally share program process and FAQ material. A later similarity review must distinguish useful shared context from low-value duplication. |
| Unsupported claims | Protected / External | Support, salary, placement, employer, leadership, and location claims require evidence review; this repository alone is not treated as proof. |
| Article/blog coverage | Not present | No article or blog route is registered. No new editorial content is proposed in Phase 1. |
| FAQ usefulness | Pass at visibility level | FAQ answers are visible in native details elements and linked to related pages. Current search-feature eligibility is a later decision. |
| Author identity | Review | Leadership data is present in the About page and schema; author metadata for articles is not applicable because no articles exist. |
| Entity consistency | Review | Business name, domain, contact data, social links, logo, address, and training partner are centralized, but external profile consistency is not verifiable here. |

## Structured-data baseline

| Check | Status | Evidence / finding |
| --- | --- | --- |
| JSON-LD present on indexable pages | Pass | One JSON-LD block is present in each inspected indexable document. |
| JSON-LD absent from noindex 404 | Pass | The noindex 404 output contains no page structured-data block. |
| Organization graph | Review | The current graph uses both EducationalOrganization and LocalBusiness; the correct type and local-business eligibility require factual review. |
| WebSite graph | Pass at source level | Homepage/site graph uses the real brand name and production URL. |
| BreadcrumbList | Pass at source level | Child routes receive breadcrumb data based on the same route hierarchy used for visible breadcrumbs. |
| Course schema | Review | The course hub receives Course data with a six-week duration and program details. The track pages do not currently receive separate Course nodes. Suitability must follow the visible content and official schema requirements. |
| FAQ schema | Review | FAQ questions match the visible FAQ data. Rich-result eligibility is not assumed and should be validated before any later change. |
| Person schema | Review | About-page leadership entities are generated from existing content. Names, roles, descriptions, email values, and employment relationships must remain evidence-backed. |
| Schema syntax | Pass at repository test level | Existing source verification parses the generated graph shape. A dedicated external/validator check has not been run. |
| Schema/content match | Review | No mismatch is asserted, but a later page-by-page comparison is required before final implementation. |

## Performance baseline

| Check | Status | Evidence / finding |
| --- | --- | --- |
| Production asset inventory | Pass | Current build asset totals are recorded in SEO_INVENTORY.md. |
| JavaScript payload | Review | Approximately 494,920 uncompressed bytes across built JavaScript assets. Home motion and GSAP are likely candidates for later measurement. |
| CSS payload | Review | Approximately 41,642 uncompressed bytes across built CSS assets. |
| Font payload | Review | Approximately 841,632 uncompressed bytes across built font assets; actual transfer cost depends on requested subsets and compression. |
| Image payload | Pass at current public-file scope | Approximately 103,666 bytes of copied public images; only the logo is present in public/images. |
| LCP | External | No Lighthouse or field Core Web Vitals measurement was run in Phase 1. |
| INP | External | No field or throttled interaction measurement was run in Phase 1. |
| CLS | External | No Lighthouse or field layout-shift measurement was run in Phase 1. |
| Third-party impact | Review | GTM and external conversion destinations are present; production network impact requires staging measurement. |
| Caching/compression | Review | .htaccess declares asset caching and compression rules; actual Hostinger response headers are not available in this repository. |

## Accessibility and machine-understanding baseline

| Check | Status | Evidence / finding |
| --- | --- | --- |
| Landmarks | Pass at source level | Shared layout includes header, main, footer, and labeled navigation. |
| Navigation labels | Pass at source level | Primary, mobile, and breadcrumb navigations have accessible labels. |
| Mobile menu state | Pass at source level | Menu button exposes aria-expanded and an accessible label. Keyboard and screen-reader behavior still need browser testing. |
| Form accessibility | Review | Contact/enrollment flow includes external form behavior; final form control labels must be checked on the destination as well as this site. |
| Image alternative text | Pass at output level | No missing alt attributes in the inspected build. |
| Heading hierarchy | Review | H1/H2/H3 usage is present, but a rendered heading tree should be reviewed for skipped levels and repeated card headings. |
| Motion/reduced motion | Review | Home motion and GSAP hooks exist; reduced-motion behavior needs a focused browser audit. |
| AI-agent retrieval | Pass at foundational level | Important public content is present in prerendered HTML; no hidden keyword text or AI-only page was found. |

## Crawl and deployment baseline

| Check | Status | Evidence / finding |
| --- | --- | --- |
| Googlebot-like local request | Pass | Existing HTTP contract checks a Googlebot-like request for a public logo and all public routes. |
| Bingbot-like request | Not yet tested | Add to the later crawler simulation phase. |
| OAI-SearchBot request | Not yet tested | robots.txt wildcard allow does not intentionally block it, but deployed WAF behavior is unknown. |
| PerplexityBot request | Not yet tested | robots.txt wildcard allow does not intentionally block it, but deployed WAF behavior is unknown. |
| Host/CDN/WAF rules | External | Only repository .htaccess rules are visible. |
| HTTPS | Pass in local contract | Canonical redirect logic is present and tested locally. Production certificate/redirect behavior remains external. |
| Mixed content | Review | Source-level first-party asset references are relative and the known external services use HTTPS. A deployed browser scan remains open. |
| Security headers | Review | .htaccess sets X-Content-Type-Options; complete production headers are external. |

## Baseline conclusions

### Confirmed strengths

- The site already produces crawlable static HTML for every registered public content route.
- Core metadata, canonical URLs, robots directives, sitemap generation, and JSON-LD are centralized.
- The current automated source, SEO-build, HTTP, and lint checks pass.
- Public route content is visible in initial HTML rather than being dependent on an API response.
- The implementation already avoids fake AI markup, hidden SEO text, and a mass-generated content model.

### Items carried into later phases

1. Confirm production output and headers without overwriting existing user changes.
2. Decide how to protect SITE_ORIGIN across staging and production.
3. Review whether fixed sitemap lastmod values remain accurate.
4. Validate the organization/local-business entity choice against real business facts.
5. Validate Course and FAQ structured-data suitability without changing visible copy.
6. Run a real broken-link and rendered heading-tree audit.
7. Measure mobile Lighthouse/Core Web Vitals on staging.
8. Verify Hostinger/CDN/WAF handling for normal and search-engine user agents.
9. Keep all English wording and page meaning unchanged unless separately approved.

## Phase 1 completion state

Phase 1 — Inventory and baseline: **complete**.

Created deliverables:

- SEO_INVENTORY.md
- SEO_BASELINE.md

Application source and visible content were not modified in this phase.

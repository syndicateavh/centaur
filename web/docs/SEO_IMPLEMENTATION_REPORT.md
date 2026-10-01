# SEO Implementation Report

Report date: 2026-09-14

> Historical report: route totals, release results, and validation statements
> below describe the 14 September 2026 snapshot only. Later high-intent query
> implementation and current source-level verification are tracked in
> [`SEO_HIGH_INTENT_PROMPT_COVERAGE_2026-09-30.md`](./SEO_HIGH_INTENT_PROMPT_COVERAGE_2026-09-30.md).

Repository: `centaur/web`

Preservation rule: existing English, claims, branding, business functionality, and page meaning were preserved. The implementation focused on crawlability, metadata, structured data, internal links, performance, accessibility, validation, and deployment verification.

## 1. Executive summary

The site now has a central SEO route registry, static production metadata, canonical URLs, generated `robots.txt` and sitemap output, route-specific JSON-LD, contextual internal linking, accessibility/performance protections, and a production-output quality gate.

The local production build is healthy: `npm run seo:gate` passed after generating the static deployment output. External verification was also attempted against `https://centaurcareers.in`, but the currently deployed site does not match this repository's finalized SEO contract. The deployment must be updated and the external check rerun before production SEO can be considered complete.

This report does not claim that Google, Bing, ChatGPT Search, or Perplexity has indexed the site. Indexing and Search Console/Webmaster Tools status require external account access.

## Current final state (2026-09-14)

The full repository plan is implemented through Phase 12 and the local release
package passes the final QA gate. The current package contains 28 prerendered
route documents: 26 indexable routes, the noindex comparison draft, and the
noindex 404 document. The generated sitemap contains 29 canonical URLs, and the
upload package is `build/client/`.

The latest live-domain probe was run against `https://centaurcareers.in` and
failed because production is serving a different/stale deployment: route
metadata and HTML do not match the registry, `robots.txt` blocks crawling, the
sitemap is incomplete, unknown paths return 200 instead of the intended 404,
and the tested `www` host does not redirect as required. This is an external
deployment task; no repository-controlled SEO implementation is being invented
to compensate for it.

## 2. Architecture before

- React 18 with React Router and Vite.
- Explicit public routes and static prerendering were already present.
- Page metadata, route behavior, content, and schema responsibilities were distributed across route/page files.
- A sitemap and some HTTP/deployment controls existed, but there was no single fresh-build SEO gate covering every output contract.
- The working-tree baseline recorded local checks but did not establish production-domain behavior.

## 3. Architecture after

- `src/seo/seoRoutes.js` is the source of truth for public route identity, titles, descriptions, H1s, canonical paths, indexing state, breadcrumbs, and structured-data selection.
- `src/seo/siteConfig.js` centralizes the production origin and social image defaults.
- React Router statically prerenders 26 indexable routes and two noindex documents.
- The build generates `public/sitemap.xml` and `public/robots.txt`, then copies them into `build/client`.
- `npm run seo:gate` builds first, runs ESLint, and runs all local SEO validators.
- `npm run seo:external` checks deployed HTTP/HTML behavior without claiming indexing.

## 4. Rendering strategy

The project uses React Router static prerendering with `ssr: false` and explicit `PRERENDER_PATHS`. Important content is present in initial HTML for all 26 indexable routes. The branded `/404/` output and the editorial comparison draft are also prerendered and are not indexable.

## 5. Routes audited

The original baseline route table is retained below for traceability. The current
exact route list and package state are maintained in `RELEASE_MANIFEST.json`; the
final release contains 26 indexable routes, one noindex comparison draft, and
one noindex 404 document.

| URL | Type | Indexable | Canonical | Primary role |
| --- | --- | --- | --- | --- |
| `/` | Commercial landing page | Yes | `https://centaurcareers.in/` | Primary finance-career hub |
| `/courses/` | Course hub | Yes | `https://centaurcareers.in/courses/` | Masterclass discovery |
| `/courses/investment-banking-operations/` | Career-track detail | Yes | Registered route canonical | Investment banking operations intent |
| `/courses/retail-banking/` | Career-track detail | Yes | Registered route canonical | Retail banking intent |
| `/courses/finance-operations/` | Career-track detail | Yes | Registered route canonical | Finance operations intent |
| `/placements/` | Trust/conversion page | Yes | Registered route canonical | Placement promise and support |
| `/about/` | Entity/about page | Yes | Registered route canonical | Organization and leadership |
| `/contact/` | Contact/conversion page | Yes | Registered route canonical | Enrollment/contact intent |
| `/locations/lucknow/` | Location page | Yes | Registered route canonical | Mindsprout Career Hub venue |
| `/faqs/` | FAQ page | Yes | Registered route canonical | Program questions |
| `/404/` and unknown paths | Error document | No | Registered 404 canonical | Recovery and navigation |

The exact title, description, H1, canonical, robots, schema, and breadcrumb values are maintained in `src/seo/seoRoutes.js` and checked against rendered HTML.

## 6. Routes changed

SEO behavior was integrated into the shared shell and existing pages rather than
replacing the route structure. The shared changes affect all prerendered routes;
page-specific page-shell and internal-link integrations affect the registered
public pages. The planned career-guide, resource, India, regional, and neutral
comparison routes were added as distinct governed pages. No doorway page, fake
review, fake author, or AI-only page was added.

## 7. Routes intentionally excluded

- `/404/` is intentionally excluded from the sitemap and uses `noindex,follow`.
- `/compare/investment-banking-operations-courses/` is prerendered as a
  `noindex,follow` editorial draft until its evidence and legal review gate is
  approved.
- Unknown URLs are treated as 404s and are not content targets.
- PocketBase, editor, authentication, and other non-public application helpers are not treated as public SEO routes.
- No mass-generated city templates, competitor landing pages, or keyword-doorway
  pages were created.

## 8. Metadata implementation

Each registered route receives one title, one description, one robots directive, one canonical link, Open Graph metadata, and Twitter card metadata. The production-output verifier checks exact route values, title counts, description counts, canonical counts, robots counts, one H1, meaningful initial HTML, and rendered-title uniqueness.

Existing wording was not shortened, rewritten, or replaced for keyword targeting.

## 9. Canonical implementation

Canonicals are generated from `SITE_ORIGIN` and route paths. The configured policy is HTTPS, non-www, trailing slash for non-root routes, no query string, and no hash. The local HTTP contract verifies HTTPS/host redirects, trailing-slash redirects, and query preservation.

## 10. robots.txt

The build generates a public wildcard allow rule and one canonical sitemap reference:

```text
User-agent: *
Allow: /

Sitemap: https://centaurcareers.in/sitemap.xml
```

The local verifier validates directive syntax, rejects site-wide blocking, and checks the deployed build copy. The live external check currently reports a site-wide `Disallow: /`, so the deployed robots file must be corrected before launch verification is complete.

## 11. Sitemap

The build generates one XML sitemap containing the 29 published canonical URLs
from the current route/content inventory. It excludes the noindex comparison
draft and `/404/`, duplicate URLs, query strings, hashes, and non-production
origins. The local validator checks XML structure, namespace, URL elements,
canonical locations, duplicates, and non-future `lastmod` values.

The live external check currently returned two URLs rather than the repository's 10 expected URLs. The deployed sitemap must be updated and externally rechecked.

## 12. Structured data

The central graph contains only entities supported by the visible site and route registry:

- `EducationalOrganization`
- `WebSite`
- route-specific `WebPage`, `CollectionPage`, `AboutPage`, `ContactPage`, or `FAQPage`
- `BreadcrumbList` for child routes
- `Course` for the masterclass and registered career tracks
- `Place` for the stated training partner location
- visible FAQ `Question`/`Answer` entities
- visible leadership `Person` entities on the About page

The local validators parse JSON-LD, compare it with the shared registry and visible data, enforce entity IDs, and reject unsupported `LocalBusiness` usage for the partner training location. Valid structured data does not promise a rich result.

## 13. Internal linking

`src/seo/internalLinks.js` defines contextual related-page groups. These groups are rendered on all indexable pages with descriptive anchor labels, canonical route targets, inbound coverage, and no vague `click here`/`read more` labels. The rendered-output and technical-link checks reject unknown internal routes and non-canonical route paths.

## 14. Content changes

No existing English copy, claim, salary range, placement promise, testimonial, leadership statement, address, or business meaning was changed as part of the SEO phases. The implementation preserves the approved source-content controls and checks for required original wording.

## 15. Image changes

Existing image meaning and alternative text were preserved. Rendered images are checked for `alt`, explicit dimensions, decoding behavior, and appropriate lazy loading. No new image claim or visual asset was invented.

## 16. Performance changes

- Removed unused font imports and connected the variable IBM Plex Sans family correctly.
- Preserved local `font-display: swap`.
- Deferred GTM until after the initial document head.
- Added image decoding/dimension/loading checks.
- Deferred GSAP motion enhancement and skip it for reduced-motion users.
- Preserved existing intrinsic sizing and content-visibility protections.

The automated gate does not claim Lighthouse or field Core Web Vitals results. LCP, INP, CLS, network payload, and third-party impact still require a real browser measurement on the deployed site.

## 17. Accessibility changes

- Added a keyboard-visible skip link to the main landmark.
- Added global focus-visible styling.
- Added mobile-menu `aria-controls`, `aria-hidden`, and Escape-key focus restoration.
- Marked decorative SVGs and animation elements as hidden from assistive technology.
- Preserved meaningful image alternatives, landmarks, breadcrumbs, and native FAQ disclosure controls.
- Added reduced-motion CSS and JavaScript protections.

The local output validator checks accessible names, ARIA references, landmarks, images, focus styles, and reduced motion across all 28 prerendered documents.

## 18. Crawler compatibility

The local HTTP contract tests normal requests and Googlebot, Bingbot, OAI-SearchBot, and PerplexityBot-like user agents. It verifies status, H1, title, canonical, robots, links, 404 behavior, redirects, sitemap delivery, and public asset delivery.

These tests verify application behavior only. They do not prove that a crawler will index the site.

## 19. Google readiness

Repository readiness:

- crawlable prerendered HTML
- canonical metadata
- sitemap and robots generation
- deployment-foundation and upload-artifact validation
- structured data validation
- local crawler and HTTP contract checks

Manual external tasks remain: verify the domain in Google Search Console, submit the sitemap, inspect representative URLs, monitor Page Indexing and Core Web Vitals, and review Enhancements and Manual Actions.

## 20. Bing/Copilot readiness

Repository readiness includes crawlable HTML, valid canonicals, a sitemap, public robots rules, descriptive internal links, and Bingbot-like local checks. Manual tasks remain: verify Bing Webmaster Tools, submit the sitemap, review crawl/index coverage, and enable IndexNow only if the deployment workflow supports it.

No Copilot visibility or indexing is claimed.

## 21. ChatGPT Search readiness

The site provides public, text-first HTML with clear page titles, descriptions, headings, links, organization context, and factual structured data. No AI-only files, hidden text, fake citations, or fake AI schema were added.

Actual retrieval, citation, or inclusion in ChatGPT Search is not externally verified by this repository.

## 22. Perplexity readiness

PerplexityBot-like behavior is included in the local and external verification tools. The public robots policy is intended to allow crawl access, subject to the deployment's actual host/WAF behavior.

The current external run cannot be considered ready because the deployed site did not match the final route contract and returned an incorrect 404 behavior. Perplexity retrieval or citation is not claimed.

## 23. Automated tests

The local quality gate runs:

- source-content and claim controls
- rendered SEO output
- internal-link architecture
- performance and accessibility output checks
- structured-data/entity consistency
- technical SEO, sitemap, robots, JSON-LD, and localhost checks
- HTTP status, redirects, crawler, and 404 contract checks
- ESLint

Commands:

```text
npm run seo:gate
npm run seo:external
```

`seo:external` is intentionally separate from CI because it depends on mutable network and deployment state. It must not be treated as an indexing test.

## 24. Validation results

### Local production validation

Passed in the final release QA run on 2026-09-14:

- `npm run seo:gate`
- `npm run deployment:prepare`
- production build and static prerender
- ESLint
- `npm run seo:check`
- sitemap and robots validation
- JSON-LD and entity validation
- internal-link validation
- accessibility/performance output validation
- local crawler simulation
- `git diff --check`

The build emitted existing React Router future-flag warnings; they did not fail the gate.

### External deployment validation

`npm run seo:external` was run against `https://centaurcareers.in` on 2026-09-10 and failed, as it should when the deployment does not match the configured contract. Observed categories:

- live titles, descriptions, robots, canonicals, H1/main content, links, and JSON-LD did not match the repository route registry
- live `robots.txt` contained a site-wide `Disallow: /`
- live `sitemap.xml` returned two URLs instead of 29
- an unknown path returned HTTP 200 without the expected noindex 404 response
- the tested `www` redirect did not return the expected canonical redirect

This is a deployment mismatch, not a local build failure.

## 25. Unresolved issues

1. Deploy the current build output/configuration to the production domain.
2. Re-run `npm run seo:external` until the production contract passes.
3. Verify the hosting/WAF/CDN does not block search and answer-engine crawlers.
4. Run Lighthouse or equivalent mobile performance measurement on the deployed site.
5. Review evidence for placement, employer, salary, leadership, testimonial, and location claims outside the repository.
6. Review sitemap `lastmod` values whenever meaningful content changes.

## 26. Manual tasks requiring external access

- Google Search Console domain verification and sitemap submission.
- Google URL Inspection for the homepage, course hub, priority course track, contact page, and Lucknow page.
- Google Page Indexing, Core Web Vitals, Enhancements, Security Issues, and Manual Actions review.
- Bing Webmaster Tools verification, sitemap submission, crawl/index review, and optional IndexNow setup.
- Hosting/CDN/WAF review for HTTPS redirects, 404 handling, cache headers, and bot behavior.
- Production browser/Lighthouse measurement for LCP, INP, CLS, JavaScript, CSS, fonts, images, and third-party requests.
- External-profile consistency review for organization name, contact details, social profiles, and the training-partner relationship.
- Analytics/GTM configuration and conversion-event verification.

## SEO scorecard

These are implementation-readiness assessments, not search-engine rankings:

| Area | Score | Basis |
| --- | ---: | --- |
| Technical SEO | 9/10 | Local production and HTTP contracts pass; live deployment mismatch remains. |
| On-page SEO | 9/10 | Route metadata, H1s, canonicals, and initial HTML are checked; live output must be updated. |
| Structured data | 9/10 | Local JSON-LD graph is consistent with visible content; external deployment is pending. |
| Performance | 8/10 | Static output and loading protections pass; no deployed Lighthouse/CWV measurement yet. |
| Internal linking | 9/10 | Contextual registry, canonical targets, and inbound coverage pass locally. |
| Content quality | 8/10 | Meaning and approved wording are preserved; evidence review remains external. |
| AI-search readiness | 8/10 | Text-first HTML, clear entities, links, and crawler checks are present; retrieval is not promised. |

## Files created across the SEO implementation

- `SEO_PHASE0.md`
- `SEO_BASELINE.md`
- `SEO_INVENTORY.md`
- `SEO_PHASE2.md`
- `SEO_PHASE3.md`
- `SEO_PHASE4.md`
- `SEO_PHASE5.md`
- `SEO_PHASE6.md`
- `SEO_PHASE7.md`
- `DEPLOYMENT_FOUNDATION.md`
- `SEO_IMPLEMENTATION_REPORT.md`
- `src/components/InternalLinkGroup.jsx`
- `src/seo/internalLinks.js`
- `tools/generate-robots.js`
- `tools/verify-deployment-foundation.js`
- `tools/seo-check.js`
- `tools/seo-quality-gate.js`
- `tools/verify-external-seo.js`
- `tools/verify-internal-links.js`
- `tools/verify-performance-accessibility.js`
- `tools/verify-structured-data.js`
- `tools/verify-technical-seo.js`

## Important modified areas

- `package.json` scripts and build pipeline
- `src/root.jsx` and shared layout/accessibility components
- `src/components/` and `src/components/home/`
- `src/pages/`
- `src/content/businessData.js`
- `src/index.css` and `tailwind.config.js`
- `src/seo/seoRoutes.js`
- `tools/generate-sitemap.js`
- `tools/verify-http-contract.js`
- `tools/verify-seo-build.js`
- `tools/verify-source-content.js`
- `BLOG_CONTENT_STRUCTURE.md`
- `BLOG_FILE_STORAGE.md`
- `src/content/blog/blogSchema.js`
- `src/content/blog/blogStorage.js`
- `src/content/blog/storageConfig.js`
- `src/content/blog/imageConfig.js`
- `public/images/blog/.gitkeep`
- `src/content/blog/posts/.gitkeep`
- `tools/blog-storage.js`
- `tools/prepare-blog-storage.js`
- `tools/blog-image.js`
- `tools/verify-blog-images.js`
- `tools/test-blog-image-parser.js`
- `BLOG_BUILD_PROCESS.md`
- `tools/verify-blog-build.js`
- `SEO_PHASE9.md`
- `tools/verify-seo-gate-wiring.js`
- `tools/validate-blog-file.js`
- `BLOG_PUBLISHING_WORKFLOW.md`
- `src/content/blog/blogWorkflow.js`
- `tools/blog-workflow.js`
- `tools/test-blog-workflow.js`
- `SEO_PHASE11.md`
- `src/content/seo/keywordResearch.js`
- `tools/import-semrush-keywords.js`
- `tools/verify-keyword-research.js`
- `src/content/blog/posts/placement-support-eligibility-and-terms.json`
- `SEO_PHASE12.md`
- `src/content/seo/measurements/SEO_MEASUREMENT_REPORT.md`
- `src/content/seo/backlinkWorkflow.js`
- `src/content/seo/backlinkProspects.json`
- `src/content/seo/measurementSchema.js`
- `tools/backlink-workflow.js`
- `tools/import-search-console.js`
- `tools/import-backlink-audit.js`
- `tools/seo-measurement-report.js`
- `tools/verify-seo-measurement.js`
- `tools/verify-blog-content-structure.js`
- `BLOG_PORTAL.md`
- `src/content/blog/portalConfig.js`
- `src/pages/BlogPortalPage.jsx`
- `src/routes/blog-portal.jsx`
- `plugins/blog-portal-api.js`
- `tools/verify-blog-portal.js`
- `src/content/blog/blogValidation.js`
- `BLOG_CONTENT_VALIDATION.md`
- `tools/test-blog-validation.js`
- `src/content/blog/blogRoutes.js`
- `src/content/blog/blogSeo.js`
- `src/pages/BlogIndexPage.jsx`
- `src/pages/BlogPostPage.jsx`
- `src/pages/BlogCategoryPage.jsx`
- `src/components/blog/BlogPostCard.jsx`
- `src/components/blog/BlogContentRenderer.jsx`
- `src/routes/blog.jsx`
- `src/routes/blog-post.jsx`
- `src/routes/blog-category.jsx`
- `BLOG_PUBLIC_ROUTES.md`
- `tools/verify-blog-routes.js`
- `BLOG_SEO_IMPLEMENTATION.md`
- `tools/test-blog-seo.js`
- generated `public/` and `build/client/` deployment artifacts

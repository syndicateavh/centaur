# SEO Phase 9 — Comparison content

Phase 9 publishes the workbook’s optional 12-keyword comparison destination as a complete, neutral research guide. It does not copy competitor wording, use competitor logos, publish rankings, or turn provider marketing language into an independent fact.

## Comparison route

The draft is available at:

`/compare/investment-banking-operations-courses/`

It targets the governed comparison cluster, including searches for alternatives to Imarticus CIBOP, IMS Proschool, upGrad, TimesPro, MentorMeCareers, and SmartSteps.

The page includes:

- a direct answer explaining why course fit is not universal;
- a repeatable decision framework for curriculum, delivery, credential, career-support wording, and total learner commitment;
- a public-source matrix describing what selected official provider pages currently present;
- a separate, evidence-bound summary of the Centaur Careers Financial Operations Masterclass;
- a before-payment verification checklist;
- comparison FAQs;
- an official-source register with review date;
- a clear statement that provider names identify the source being compared and do not imply affiliation, sponsorship, partnership, or endorsement.

The comparison deliberately does not publish fee numbers, salary claims, employer rankings, logos, copied competitor copy, or employment outcomes. The official provider source remains the authority for each provider’s current syllabus, schedule, fee, credential, and support terms.

## Publication control

The page is prerendered as `index,follow` and is included in `public/sitemap.xml`. Its content model carries `approved-for-indexing` plus a dated source review. Existing provider names are used only in plain-text source context; no third-party mark or logo is presented as a Centaur asset.

The page remains governed by source freshness: provider descriptions are attributable snapshots, not permanent facts. Before changing a provider summary, source URL, or commercial wording, re-open the official source, update `updatedAt`, and rerun the comparison and full SEO gates. If a source becomes unavailable or the page can no longer meet the neutral evidence rules, remove it from the indexable route set until reviewed.

## Technical implementation

- Added the structured comparison content model in `src/content/comparisonPage.js`.
- Added the complete comparison renderer in `src/pages/ComparisonPage.jsx`.
- Registered the indexable route in `src/seo/seoRoutes.js` and `src/routes.js`.
- Added a comparison internal-link group that points to existing indexable program, guide, resource, India, FAQ, placement, and contact pages.
- Added `npm run seo:comparison:check` and connected it to `npm run seo:check`, `npm run seo:gate`, and gate-wiring verification.
- Updated keyword reporting so the 12 comparison keywords remain governed rather than being counted as published owners.

## Quality gate

`tools/verify-comparison-page.js` fails when the page is not approved and indexable, is missing metadata, a direct answer, source register, provider matrix, FAQs, internal links, review markers, or sufficient content. It also fails for duplicate or non-HTTPS source URLs, missing provider-to-source-register mappings, competitor images, Course/Article schema, ranking language, or employment-assurance claims, and confirms the indexable URL is present in the sitemap.

## Validation

Passed:

```text
npm run seo:comparison:check
npm run seo:gate
```

The production build includes the indexable comparison guide alongside the existing site and published blog routes. The 12 comparison keywords have one governed comparison owner; existing keyword ownership, crawler access, sitemap integrity, and HTTP behavior remain valid.

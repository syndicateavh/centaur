# SEO Phase 7 — India-wide page

Phase 7 publishes a national finance-operations access page without generating city templates, claiming physical branches outside Lucknow, or changing the meaning of the approved program information.

## Published route

`/india/` is the canonical India-wide hub for the workbook's 108-keyword national cluster.

It explains:

- live online access for learners across India as described in the current program information;
- the six existing curriculum and career directions;
- one canonical discovery path for banking operations, KYC and AML, trade operations, settlements, reconciliations, corporate actions, securities operations, reference data management, fund accounting, and client onboarding;
- online versus the published in-person option;
- the explicit boundary that the physical learning venue is Mindsprout Career Hub, Lucknow;
- the existing three-step program process;
- concise FAQs for learners joining from another city;
- links to the Masterclass, career guides, interview resources, Lucknow page, FAQs, and contact page.

The page does not create duplicate Delhi, Mumbai, Pune, Bengaluru, Hyderabad, state, or district templates. Selective regional guides are governed separately by Phase 8 and are linked only where their original market research and access boundaries have passed review.

## Evidence boundary

The page uses `PROGRAM`, `CAREER_TRACKS`, `LEARNING_MODES`, `PROGRAM_PROCESS`, `BUSINESS_DATA`, and the new national-page copy. Delivery and location facts remain marked for business verification in the content-governance registry. The page therefore tells readers to confirm current cohort schedules, fees, and support terms directly. It does not infer additional classrooms, branches, or city-specific delivery.

## Technical implementation

- Registered `/india/` in `src/routes.js` and `src/seo/seoRoutes.js`.
- Assigned the workbook-owned primary keyword `investment banking operations course India`.
- Added prerendered metadata, canonical URL, robots directive, visible breadcrumb, and WebPage/BreadcrumbList structured data.
- Added India-wide internal-link coverage across the home, courses, modules, career guides, resources, FAQs, location, contact, and placement pages.
- Connected the existing governed operations-topic map to the national page so workflow searches reach their canonical guide or resource without creating duplicate or city-doorway pages.
- Added the URL to `public/llms.txt` and the generated sitemap.
- Added `tools/verify-india-page.js` as `npm run seo:india:check` and connected it to the full SEO check sequence.

## Validation

The complete production gate passes:

```text
npm run seo:gate
```

The current keyword report shows 644 of 728 mapped keywords on published canonical
owners, including the 108 national-cluster keywords. No orphan pages, broken
internal links, duplicate titles, or keyword ownership conflicts were introduced.

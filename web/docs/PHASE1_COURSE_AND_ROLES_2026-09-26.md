# Phase 1 — Course and roles implementation

Date: 26 September 2026

## Status

**Complete in the local release package; production upload pending.** This phase owns six existing URLs. No second course, role-guide duplicate, or new blog URL was created. The live versions returned HTTP 200 on 26 September, but they did not yet contain the new sections below.

| URL | Reader question and implemented change |
| --- | --- |
| `/courses/` | Is investment banking operations taught, and how do I choose? The early answer keeps the single six-week Financial Operations Masterclass and adds links to the operations role and course-selection checklist beside current-term questions. |
| `/career-guides/investment-banking-operations/` | What does an analyst do? The fictional quantity mismatch now leads directly to the full trade lifecycle; a task-to-skill list explains trade support, settlement, and reconciliation. The team comparison links to the broader team-map article. |
| `/career-guides/trade-lifecycle/` | What happens to one trade? The fictional 100-share example now follows capture, confirmation, settlement, reconciliation, and closure or escalation as ordered steps. The exception section links to the reconciliation resource at the point where it helps. |
| `/career-guides/kyc-aml-analyst/` | What belongs to KYC and what belongs to wider financial-crime work? A short role-boundary explanation follows the document discrepancy example and links to the specialist article. |
| `/blog/investment-banking-teams-operations/` | Where do front, middle, and back offices fit? A new team-map section explains common boundaries and sends the reader to the deeper operations-role guide. The article remains a broad team explainer. |
| `/blog/financial-crime-analyst-kyc-aml-career-guide/` | How does a case review hand off to a KYC analyst? The practical workflow now links directly to the KYC guide. Its obsolete RBI KYC reference was replaced with the current official Master Direction URL. The article remains the wider financial-crime career map. |

The two substantive blog revisions have `dateModified` set to 26 September 2026 in their rendered `BlogPosting` data. Workflow cases are explicitly fictional and do not assert employer-specific procedure or outcome. The course copy retains the one-programme boundary and directs readers to the published guarantee terms.

## Verification

- `npm run release:qa` passed: production build, lint, blog validation, career-guide validation, source governance, rendered SEO, internal links, structured data, accessibility, HTTP contract, and static package checks. See `RELEASE_QA_REPORT.md`.
- Each of the six prerendered documents has one H1, a self canonical, `index,follow`, JSON-LD, and the expected contextual HTML links. The new links were checked under the intended headings, not merely in related-link lists.
- The release contains 45 route documents, 40 indexable route pages, and 64 sitemap URLs.
- Upload archive: `release/centaur-phase1-course-roles-2026-09-26.zip` (35,405,767 bytes; 363 entries, valid ZIP CRC). SHA-256: `b701ee228b23ce318f01b468f89f0ab93fedc0f74ad76b480b8328c5ee73c77c`. This archive supersedes the Phase 0 archive for the next upload.

## Production and measurement

Hosting access is not available in this workspace. Upload the **contents** of the Phase 1 archive to the production document root, preserving `.htaccess`, then clear the affected cache and run `npm run seo:external -- https://centaurcareers.in`. Record the actual deployment time and recheck all six live URLs for title, H1, introductory answer, canonical, index rules, schema, and links. The existing Phase 0 handoff gives the Search Console and confirmed-enquiry baseline procedure; those account values remain unavailable here.

The full static package also contains the previously registered accounting-interview resource. Its separate Phase 2 editorial-review condition in the content plan still applies before approving the whole package for publication.

# Phase 3 — Original worked cases implementation

Date: 26 September 2026

## Status

**Both planned articles and their original practice assets are complete in the local build. The production package remains on review hold.** The content plan calls for expert-reviewed case materials, and no named trade-operations or KYC reviewer has supplied approval. The separate Phase 2 accounting-case review is also pending. No production upload or live Search Console check occurred in this workspace.

| Article | Original asset and answer | Useful next step |
| --- | --- | --- |
| `/blog/settlement-trade-break-worked-example/` | Four fictional source records, a pre-settlement 100-versus-10 quantity mismatch, 90-share and INR 22,500 gross differences, investigation steps, model exception log and five-point rubric. Download [source CSV](../public/downloads/settlement-trade-break-source-records.csv) and [answer key](../public/downloads/settlement-trade-break-answer-key.txt). | Trade lifecycle, reconciliation and operations-role guides appear next to the relevant step; the course link follows the worked answer. |
| `/blog/kyc-onboarding-case-file-example/` | Six fictional business-onboarding file entries, unsigned ownership statement, missing owner evidence, conflicting signatory, pending screening/risk review, neutral model case note and six-point rubric. Download [case CSV](../public/downloads/kyc-onboarding-case-file.csv) and [answer key](../public/downloads/kyc-onboarding-case-answer-key.txt). | KYC role and financial-crime guides follow the answer; the course link follows the primary-source context. |

Both records have original topic-specific cover images, truthful organization bylines, one distinct search question, title and description, a self canonical, `BlogPosting` data, and explicit fictional-data labels. Neither article asserts a specific employer workflow, settlement cycle, beneficial-owner threshold, screening result, job outcome or programme credential. The KYC download contains no real personal data. Download links use native anchors with the `download` attribute so the files are fetched as files rather than intercepted as app routes.

## Source and editorial review

The KYC explanation was checked against the current [RBI Master Direction on KYC](https://www.rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=11566) (the official page reports an update as of 14 August 2025 when accessed on 26 September 2026) and the [FATF Recommendations](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html) (amended June 2026). The trade article uses [SEBI investor guidance on trade confirmations](https://investor.sebi.gov.in/securities-dos_and_donts.html) only for broad source-record context. The case records, differences and model notes are Centaur Careers' own teaching examples.

Before clearing the hold, record a trade-operations reviewer's name, relevant role, approval date and corrections after they check the source-record logic, arithmetic, unresolved-status decision and escalation wording. Record a KYC/compliance reviewer's equivalent details after they check the file gaps, risk and screening language, current primary sources, case note and delegated-decision boundary. Do not add a person byline or reviewer claim until that person actually approves. The existing Phase 2 accounting review must also be resolved before uploading this whole build.

| Review | Reviewer and role | Approval date | Corrections and status |
| --- | --- | --- | --- |
| Trade operations case | Pending | Pending | Pending |
| KYC onboarding case | Pending | Pending | Pending |
| Phase 2 accounting case | Pending | Pending | See [Phase 2 record](./PHASE2_DECISIONS_AND_INTERVIEWS_2026-09-26.md) |

## Build verification and release

- `npm run test:blog:structure`, `npm run test:blog:images`, and `npm run release:qa` passed on 26 September 2026. See `release/phase3-worked-cases-qa.log` and `RELEASE_QA_REPORT.md`.
- Both generated article documents have one H1, self canonical, `index,follow`, `BlogPosting` data, two native download links and sitemap entries. The four downloads and both cover images are present in `build/client` and the portable archive. The trade guide, operations guide, reconciliation resource, KYC guide, financial-crime blog and portfolio blog link to the cases in context.
- Candidate archive: `release/centaur-phase3-original-worked-cases-2026-09-26-REVIEW-HOLD.zip` (38,688,037 bytes; 371 entries; ZIP CRC valid). SHA-256: `b7d0f3cc05ad49120b643a2c14f6280ff75b5093b9327189c362ccdd47390acb`. This is a review artifact, not an approved production upload.

Once reviews are recorded, rerun release QA and create a fresh archive without the review-hold label. Upload the contents to the production document root, retaining `.htaccess`, then verify both live pages and all four file URLs return HTTP 200. Check the live title, H1, canonical, robots, schema, links and mobile layout; then measure page-filtered impressions, clicks, relevant queries and confirmed enquiries in completed Search Console windows. The local build cannot establish indexing or ranking gains.

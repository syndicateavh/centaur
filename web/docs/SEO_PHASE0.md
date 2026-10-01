# SEO Phase 0 — Content protection and fact verification

Phase 0 establishes the source-copy, fact, and page-readiness contract without changing existing English, branding, claims, or page meaning.

The technical deployment contract is documented separately in `SEO_PHASE1.md`.

## Implemented

- Protected the approved source and business-fact files with a SHA-256 baseline.
- Added `src/content/contentGovernance.js` with fact status, route inventory,
  proposed-page readiness, and do-not-build rules.
- Added `tools/verify-content-governance.js` to validate the baseline and all
  governance records.
- Added `tools/update-content-baseline.js` for explicit approval-only baseline
  updates.
- Added `docs/CONTENT_PROTECTION_BASELINE.md` and the machine-readable manifest.
- Wired content governance into `npm run seo:check` and `npm run seo:gate`.

## Validation

Passed locally:

- `npm run content:check`
- `npm run seo:check`
- `npm run lint`
- `git diff --check`

Business evidence and publication permission remain explicit inputs for later
phases; the repository does not mark unsupported facts as verified.

## Regional measurement completion

The measurement baseline now covers every published regional guide with a
stable `regional_market` value and the shared `online_from_regional_market`
access scope. Regional pages are measured as landing-page markets, not as a
claim about the visitor's physical location. The national `/india/` page
remains the canonical owner for online-India intent; regional pages are not
allowed to create a second online-intent measurement or keyword owner.

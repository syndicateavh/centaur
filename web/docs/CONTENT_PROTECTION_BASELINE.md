# Phase 0 content protection and fact verification

This document defines the content-safety boundary for the SEO implementation.
The goal is to add useful search coverage without rewriting the meaning of the
approved Centaur Careers literature.

## Protected source

The surviving original production bundle is the approved source for existing
program, outcome, support, employer, testimonial, and leadership wording. The
centralized source files are protected by SHA-256 hashes in:

```text
docs/content-protection-manifest.json
```

Run the read-only check with:

```text
npm run content:check
```

If an approved source change is genuinely required, obtain content-owner
approval, review the semantic diff, then intentionally regenerate the baseline:

```text
npm run content:baseline:update
```

SEO work must not update the baseline merely to hide an accidental copy change.

## Review statuses

- `repository-verified`: verified from repository configuration or structure.
- `approved-original`: wording exists in the approved source.
- `needs-business-verification`: current business evidence is required.
- `needs-permission`: publication permission or identity evidence is required.
- `needs-original-content`: a new page needs genuinely original material.
- `needs-regional-data`: a regional page needs unique local research.
- `do-not-build`: the proposed page pattern is prohibited or unjustified.

Source approval does not automatically prove that a time-sensitive business fact
is current. Fees, duration, delivery, location, placement support, employer
relationships, salary ranges, counts, testimonials, and leadership details remain
gated until current evidence or permission is recorded.

## Current route inventory

| Route | Purpose | Copy boundary |
| --- | --- | --- |
| `/` | Brand and Financial Operations Masterclass overview | Existing source copy plus append-only verified context |
| `/blog/` | Published first-party article index | Editorial content must carry validation and evidence notes |
| `/courses/` | Primary commercial program page | One authoritative program entity and verified program facts |
| `/courses/investment-banking-operations/` | Investment Banking Operations module | Subordinate module; no separate program promise |
| `/courses/retail-banking/` | Retail Banking module | Subordinate module; no separate program promise |
| `/courses/finance-operations/` | Finance Operations module | Subordinate module; no separate program promise |
| `/placements/` | Placement assistance and student support | No stronger outcome, employer, salary, or support claim without evidence |
| `/about/` | Business and leadership information | Leadership expansion requires approved bios and consent |
| `/contact/` | Enrollment and contact information | Contact and location facts must stay synchronized |
| `/locations/lucknow/` | Verified physical training location | Local facts, photographs, and directions require confirmation |
| `/faqs/` | Program-level questions and answers | Answers must match current program terms |

The machine-readable version is maintained in
`src/content/contentGovernance.js`.

## Proposed workbook destinations

The workbook contains 24 consolidated target destinations, not 728 pages. Their
readiness status, mapped keyword count, priority, wave, and blocking requirements
are maintained in `PROPOSED_PAGE_READINESS`.

No new page is publishable solely because a keyword exists. New editorial pages
must have original material; regional pages must have unique research; and
business claims must have current evidence.

## Meaning-preservation rules

- Do not automatically paraphrase or replace protected paragraphs.
- Add SEO headings, explanations, FAQs, and links only when they are accurate and
  editorially reviewed.
- Keep modules subordinate to the Financial Operations Masterclass.
- Use Placement Assistance, Placement Support, Career Support, and Interview
  Preparation; do not turn support language into a guarantee.
- Do not add physical branches, employer relationships, salary outcomes, counts,
  testimonials, or certificates without evidence and permission.
- Do not create state/city doorway pages, query-parameter landing pages, hidden
  keyword blocks, or one page per workbook keyword.

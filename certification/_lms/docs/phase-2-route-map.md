# Phase 2 public route map and content model

Phase 2 presents the free LMS as a proposal until Centaur approves the offer, syllabus, study effort, format, certificate wording, and learner support. It contains no signup, enrollment, learner profile, progress, assessment, or certificate records.

## Public routes

| Route | Purpose | Indexing |
| --- | --- | --- |
| `/` | Introduce the separate proposed learning initiative and point to role tracks | Indexable |
| `/courses` | Search and filter the six proposed tracks | Indexable |
| `/courses/[slug]` | Explain topic areas, potential roles, and open product decisions | Indexable; statically generated |
| `/faq` | Explain availability, free-offer status, separate paid program, and certificate boundaries | Indexable |
| `/help` | Show platform status and current support contact boundary | Indexable |
| `/certificates/verify` | Non-functional shell for a future minimum-disclosure verifier | Indexable, clearly marked preview |
| `/privacy`, `/terms` | Existing development drafts | `noindex` inherited from the root layout |
| `/admin`, `/api/admin/health`, `/api/health` | Internal diagnostics and liveness | Admin stays development-only; APIs excluded from crawling |

## Proposed course content model

The source of truth is `src/data/courses.ts`. Each public track has a stable slug, display title, topic category, proposal description, potential role examples, and planning focus areas. All six are rendered with `Planned` status. Study time, prerequisites, delivery format, assessments, and certificate rules explicitly remain unconfirmed until approved.

Tracks: investment banking operations; retail banking operations; KYC and AML operations; digital payments operations; finance and credit operations; FinTech and neo-banking operations.

## Design and accessibility

- Shared navigation, footer, brand colors, focus styles, reduced-motion behavior, and skip link live in `src/app/layout.tsx` and `src/app/globals.css`.
- Catalogue search/filter uses labeled native controls, keyboard operation, live result announcements, and an empty state with a clear-filters action.
- FAQ uses native disclosure elements. Course details use headings, lists, status text, and a labeled metadata list.
- No external fonts, images, analytics, forms, enrollment APIs, or third-party runtime calls are used.

## Public indexing configuration

Set `LMS_PUBLIC_URL` to the approved HTTPS origin as a Docker build argument and runtime environment variable before producing a publicly indexed production release. At build time it supplies the metadata base and canonical URLs; at runtime it supplies sitemap URLs and the robots sitemap reference. Production without this value disallows crawling. The example local value is `http://localhost:3000`; replace it for any approved public build. Staging should remain access-controlled even if robots directives are present because robots is not an access-control mechanism.

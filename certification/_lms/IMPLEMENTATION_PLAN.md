# Centaur Free Banking Certifications — Implementation Plan

## Objective

Build a separate learning platform where students can register for free, complete short courses for practical banking and financial-services roles, pass assessments, and receive verifiable course-completion certificates. Keep it in this repository under `certification/_lms`, but release it independently from the public Centaur Careers website.

## Current status (2026-09-29)

- Phase 1 foundation is implemented in this directory: Next.js App Router/TypeScript, local Docker Compose configuration, internal PostgreSQL migration workflow, health endpoints, a development-only admin diagnostic panel, and LMS-scoped CI.
- The application uses internal PostgreSQL and Next.js APIs. Supabase auth/configuration and the prior external auth hooks were removed to follow the internal-only requirement. Learner authentication and course features remain for later phases.
- Phase 1 verification is complete: `npm run lint`, `npm run typecheck`, `npm run build`, and `npm run db:migrate:check` pass; the initial migration is applied to local PostgreSQL; Docker Compose services and the standalone Docker image build successfully; `/api/health`, `/api/admin/health`, and `/admin` respond as expected in development.
- The admin panel is read-only and development-only; the production standalone server returns 404 for both `/admin` and `/api/admin/health` while `/api/health` remains available. No internal staging host or deployment credentials have been selected, so Phase 1 delivers a deployable image and internal runbook without publishing it to a server.
- Internal operations notes now define synthetic-only seed data, structured local error logs, local PostgreSQL backup/restore, and app/schema rollback guidance. No real learner data is present.
- Phase 2 public discovery pages are implemented: LMS landing, searchable/filterable six-track catalogue, statically generated track details, FAQs, help/status, and certificate-verification preview. Public pages have explicit indexing metadata; robots/sitemap output is controlled by `LMS_PUBLIC_URL`. Public learner registration and certificate lookup remain unavailable until product and release approvals.
- Phase 3 internal identity and enrollment foundation is implemented: LMS-owned Better Auth email/password accounts, consent-version capture, verification and reset mail, local mail previews, learner profile/deletion requests, internal PostgreSQL learner schemas and row policies, least-privilege runtime role, and a local-only sandbox enrollment flow. Auth pages evaluate the deployment gate at request time, and sign-in return paths are allowlisted. Public signup stays disabled outside local development until an HTTPS deployment, strong secret, and approved SMTP relay are configured. Phase 3 does not publish an approved course or certificate.
- Phase 4 implementation is present locally: migration-backed course review metadata, an immutable-after-publication version boundary, source-controlled KYC/AML pilot v1 (five modules, ten text lessons), a fictional practice packet and downloadable workbook, glossary, dated official sources, account-bound lesson progress, resume/completion checklist, and a local-only reviewer preview. The course/version remain draft, sandbox-only, and review-pending; qualified legal/AML subject-matter signoff has not yet occurred.
- Phase 5 implementation is present locally: five formative knowledge checks, a 15-question objective-balanced final assessment, server-only answer keys/grading, resumable attempts and history, three-attempt/80% final rules, objective-level final feedback, append-only assessment review records, and server-validated course completion tied to the learner's enrolled course/assessment versions. Assessment content remains a local draft pending qualified review; no certificate is issued in this phase.
- LMS visual branding is now aligned with the Centaur Careers site: navy/gold design tokens, the official local logo, locally bundled IBM Plex Sans and Source Serif 4 fonts, and locally served hero/track imagery. Asset references remain inside this app; source paths and synchronization notes are in `docs/BRAND_ASSETS.md`. Photography/logo usage rights still need confirmation for the LMS release.
- The live Financial Operations Masterclass pages list six topic areas: investment banking operations, retail banking, KYC/AML, digital payments, finance operations, and FinTech/neo-banking. They describe these as modules in the six-week paid program, not independent courses or certifications. The free LMS must be presented as a separate proposed offering, with availability and certificate rules approved before publication.
- Application stack: Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui where useful. Run application APIs inside Next.js and PostgreSQL on Centaur-controlled infrastructure. Do not use Supabase, Vercel, hosted identity, analytics, email, or other third-party runtime APIs during internal development.

## Repository and deployment approach

- Create the LMS as an independent app under `certification/_lms`; give it its own package manifest, source, environment configuration, build output, and release workflow.
- Deploy the learner platform on a dedicated subdomain such as `learn.centaurcareers.in` (confirm the final name before DNS setup). Keep the existing marketing website at `centaurcareers.in` and its static Hostinger build/deployment process unchanged.
- Link to the LMS from the marketing site with clear “Free learning” / “Start learning” calls to action. Keep public course descriptions crawlable on the marketing site; authenticated lesson, progress, and student pages belong in the LMS.
- Use Next.js App Router and TypeScript for route-level layouts, public course pages, student pages, server rendering, and server-side mutations. Keep interactive lesson/player elements as client components only where needed.
- Use Tailwind CSS for layout and design tokens, with shadcn/ui components for accessible primitives where useful. Keep the LMS design system local to this app; share brand tokens by reference, not by coupling the two builds.
- Use PostgreSQL on Centaur-controlled infrastructure for LMS data and internal Next.js Route Handlers/Server Actions for application APIs. Track schema changes as SQL migrations in this repository. Bind local development services to localhost and use fictional data.
- Use Docker Compose for the internal app and PostgreSQL development stack. Do not add third-party service credentials or make runtime calls to hosted APIs. Production hosting and public DNS are later decisions; do not deploy the LMS to the existing static Hostinger document root.
- Keep the marketing site's PocketBase usage isolated. The LMS must not call its `/hcgi/platform` endpoint or share the existing website's auth state.

## Learner experience and scope

### Public pages

- LMS home page explaining that courses are free, self-paced or cohort-based (decide per course), and lead to a Centaur course-completion certificate after stated requirements.
- Course catalogue with role, estimated effort, prerequisites, delivery format, learning outcomes, assessment rules, and certificate wording.
- Individual course pages with sample lesson, syllabus, instructor/reviewer attribution, update date, and a clear enrollment action.
- Public certificate verification page that accepts a certificate ID or QR link and shows only the holder name (if approved), course, issue date, certificate status, and issuer. Do not expose email, account details, assessment answers, or other student records.

### Student account and learning area

- Email-based sign-up, verification, sign-in, password reset, profile, and account deletion request process.
- Course enrollment without payment or card collection.
- Student dashboard showing enrolled courses, lesson progress, assessment status, and earned certificates.
- Lesson pages supporting text, downloadable worksheets, and embedded video from an approved provider. Track completion at lesson level; make video watch-time rules explicit if used.
- Knowledge checks with accessible question types, clear pass score, attempt and retake rules, feedback, and saved results.
- Final assessment with a published passing threshold and reasonable retakes. Keep answer keys and grading logic server-side where possible.
- Certificate page to download/print a PDF and copy a public verification link. Include a unique ID, issue date, issuer, course title, and plain-language credential description.

### Admin and course operations

- Restricted admin roles for creating courses/modules/lessons, publishing revisions, setting prerequisites and assessments, reviewing learner completion, and revoking/reissuing certificates with a recorded reason.
- Record who changed course content, assessment rules, learner completion overrides, and certificate status.
- Begin with a minimal admin UI or controlled content import workflow; do not make all student records or answer keys publicly readable.

## Initial course catalogue

Start with one pilot course, then add role tracks after content and assessment review. Candidate modules:

1. KYC and AML operations fundamentals.
2. Retail banking and branch operations.
3. Digital payments operations.
4. Credit and loan operations.
5. Investment banking operations.
6. General finance operations and reconciliations.

Each course should use fictional/sample records, practice scenarios, a glossary, learning objectives, a short assessment blueprint, and named subject-matter review. Explain that training is educational, does not authorize regulated work, and is not a government, regulator, bank, or employer credential. Describe the award as a Centaur course-completion certificate unless a separately verified accreditation supports stronger wording. Do not promise jobs or imply that a free certificate guarantees employment.

## Suggested data model

- `users`: account identity, verification state, roles, consent/preferences.
- `courses`: slug, title, summary, status, version, estimated effort, prerequisites, outcomes, certificate template/version.
- `modules` and `lessons`: ordered content, publication state, version, and completion requirements.
- `enrollments`: learner, course/version, status, enrolled/completed timestamps.
- `lesson_progress`: learner, lesson/version, state, timestamps.
- `assessments`, `questions`, and `attempts`: versioned assessment definitions, attempt state, score, pass state, and only the minimum necessary answer data.
- `certificates`: opaque unique public ID, learner, course/version, issue date, status, and revocation metadata.
- `audit_events`: actor, action, target, time, and relevant change summary for privileged actions.

Use server-enforced record access rules. Students may access only their own account, enrollments, progress, attempts, and certificates; public verification should resolve only the minimum certificate fields. Admin access should be role-gated and audited. Define retention, deletion, backups, and restoration before accepting real learner data.

## Phase-wise implementation roadmap

The phases are ordered so product and certificate decisions are made before building data flows, and the pilot proves the complete learner journey before the other role tracks are authored. Each phase ends at an explicit review gate. Do not treat a track as launch-ready just because its page exists.

### Phase 0 — product definition and decisions

**Work**

- Confirm this is a separate free, self-paced learning product. The live Financial Operations Masterclass stays a separate paid offer; do not reuse its paid-program guarantees, cohort terms, or support promises for free LMS tracks.
- Choose pilot course, recommended: KYC/AML operations fundamentals, based on existing Centaur topic coverage. Confirm the target learner, prerequisites, language, delivery format, support contact, and expected study effort.
- Approve what is free, what the certificate represents, course-completion rules, assessment threshold/retakes, and whether learner names appear on public verification.
- Confirm the internal development/staging host, who can access it, PostgreSQL ownership, data residency, backup/restore owner, and internal-only network boundary before using real learner information.
- Identify subject-matter reviewers and sources for each lesson, including how often operational/regulatory content must be reviewed.

**Deliverables**: a signed-off product brief, pilot syllabus, certificate wording, data/privacy decisions, and named product/content owners.

**Exit gate**: no unresolved ambiguity about the free offer, pilot outcomes, certificate claims, or learner-data handling.

### Phase 1 — technical foundation and environments

**Work**

- Create the independent Next.js App Router application in `certification/_lms` using TypeScript, Tailwind CSS, ESLint, and shadcn/ui where it helps. Keep this project separate from `web` and its static build scripts.
- Set up local configuration and secrets outside Git. Use Docker Compose for the app and PostgreSQL, with service ports bound to localhost and fictional data only.
- Establish SQL migrations, seed-data approach, error logging, backup/restore notes, CI build checks, and a rollback process. Avoid deployment credentials until an internal staging host is selected.
- Define code structure for route groups, server/client component boundaries, internal Route Handlers/Server Actions, database access, validation schemas, and reusable UI.
- Add a development-only admin health panel for app readiness, PostgreSQL connectivity, migration state, and missing local configuration. Return not-found outside local development until admin authentication exists.

**Deliverables**: runnable Next.js skeleton, local Docker Compose environment, environment template, initial PostgreSQL migration, CI build workflow, internal operations notes, and a development-only admin health panel.

**Exit gate**: app and PostgreSQL start locally, the migration applies from a clean database, the admin panel reports app/database status without exposing secrets, and marketing-site changes do not trigger or block LMS CI.

### Phase 2 — product UX and public course discovery

**Work**

- Design responsive public pages: LMS landing page, course catalogue, course detail, FAQ/credential scope, contact/help, and certificate-verification shell.
- Set up shared LMS layout, navigation, design tokens, accessible form/button/dialog patterns, empty/loading/error states, and mobile/keyboard/screen-reader behavior.
- Model the six published topic areas as proposed LMS tracks: investment banking operations, retail banking, KYC/AML, digital payments, finance operations/credit, and FinTech/neo-banking. Mark each as planned until its free syllabus is approved.
- Keep public catalogue pages server-rendered and indexable; no private student progress or profile content should be exposed in public page data.

**Deliverables**: responsive page designs, route map, shared accessible layout, proposed-track content model, and public discovery pages with accurate planned/available states.

**Exit gate**: product/content owners review and approve the wording and can distinguish the free learning initiative from the existing paid masterclass. Implementation is complete; owner approval remains a release decision.

### Phase 3 — database, identity, and enrollment

**Work**

- Implement LMS-owned email/password identity, verification, sign-in, password reset, sign-out, and account deletion requests using server-validated sessions and secure HTTP-only cookies. Store only password hashes and keep sensitive auth logic server-side.
- Create versioned schemas for profiles, courses, modules, lessons, enrollments, lesson progress, assessments, attempts, certificates, and audit events.
- Enforce authorization in internal server code and least-privilege PostgreSQL roles/queries. Learners can access only their own profile, enrollment, progress, attempt, and certificate records; admin actions require server-verified roles.
- Add enrollment without payment collection, duplicate-enrollment handling, account email templates, consent capture, and basic abuse/rate limits.
- Use fictitious development records only. Keep service-role keys and answer keys on the server.

**Deliverables**: authenticated learner flow, enrollment workflow, database migrations, authorization rules, and access-control review notes.

**Exit gate**: automated authorization checks prove learner A cannot read/write learner B's records, and unauthenticated users cannot access learner-only pages/data. Implemented with PostgreSQL RLS/duplicate-enrollment checks (`npm run db:authz:check`) and a production-mode anonymous-route/auth-disabled check (`npm run auth:routes:check`).

### Phase 4 — pilot course and learning player

**Work**

- Produce and review the KYC/AML pilot curriculum: objectives, lesson sequence, glossary, fictional case packet, activities, references, and review date.
- Implement module/lesson navigation, readable text lesson pages, downloadable worksheets, progress saving/resume, and course completion checklist.
- Decide how video is hosted and captioned before embedding it. Support low-bandwidth text-first access and provide transcripts/captions for any video.
- Version published course content. Preserve the course version attached to a learner's enrollment and certificate eligibility.

  **Deliverables**: one complete, versioned KYC/AML pilot draft, lesson player, saved progress, learner-facing lesson checklist, reviewer view, and official-source register. Public release still requires named subject-matter signoff.

  **Exit gate**: a learner can start, leave, return, and finish every lesson on desktop and mobile; a qualified subject-matter reviewer signs off on legal accuracy and practice material. The course implementation is prepared, but this human review remains pending and the pilot stays local-only until approved.

### Phase 5 — assessment and course completion

**Work**

- Define a balanced assessment blueprint from the course objectives; author and review questions, answer explanations, pass threshold, time limit if any, and retake policy.
- Implement accessible knowledge checks and final assessment. Grade and validate attempts server-side; never send answer keys in public page data.
- Make course-completion calculation deterministic and server-validated from the required lesson and assessment states. Record assessment/course versions and completion time.
- Build learner results and retry flows that explain gaps without revealing protected answer keys where that would undermine assessment integrity.

  **Deliverables**: versioned formative/final assessments, server grading, resumable attempt history, objective-level feedback, a deterministic completion service, and append-only assessment review records.

  **Exit gate**: passing, failing, retaking, interrupted, and stale-course-version cases produce the expected results and cannot be bypassed by editing browser state. Implementation is available in the local draft; qualified question/content review and release approval remain pending.

### Phase 6 — certificates and verification

**Work**

- Finalize certificate wording and template with the issuer, course title/version, learner name policy, issue date, unique non-sequential public ID, and completion criteria.
- Issue the certificate only after server-validated completion. Generate a print-ready/downloadable PDF and QR/link to the verification page.
- Implement public verification that reveals only approved minimum fields. Support active, revoked, and not-found states without disclosing email, assessment details, or learner profile data.
- Add admin revocation/reissue with a required reason and an audit trail; do not silently mutate an issued certificate.

**Deliverables**: certificate issuance service, PDF page, public verification route, revocation flow, and test records.

**Exit gate**: an independently issued sample certificate verifies correctly; revoked certificates show revoked; private learner data is absent from public responses.

### Phase 7 — admin operations, support, and launch readiness

**Work**

- Add protected admin workflows to draft, review, schedule, publish, version, and retire courses and assessments. Keep draft answer keys and unpublished content inaccessible to learners.
- Add operational views for enrollment, completion, learner-support requests, failed email delivery, and certificate status with least-privilege roles and audit history.
- Configure the Centaur-owned SMTP relay or approved internal mail server; define learner support response process, privacy retention, backup monitoring, incident response, and database restore runbook. No hosted email API in the initial rollout.
- Complete security review, accessibility review, performance checks, error monitoring, and production environment setup.

**Deliverables**: restricted admin area, support runbook, privacy/security review, launch checklist, and production release candidate.

**Exit gate**: operational staff can safely publish and support the pilot; a restore drill succeeds; no unresolved critical auth, access-control, certificate, or accessibility issues remain.

### Phase 8 — controlled pilot launch

**Work**

- Release the LMS to a small invited learner cohort on Centaur-controlled staging first. Add a public subdomain and marketing-site links only after internal validation and hosting approval.
- Observe sign-up, enrollment, lesson completion, assessment outcomes, support requests, certificate verification, and error rates without collecting unnecessary personal information.
- Interview learners and reviewers; fix confusing instructions, content gaps, mobile/accessibility issues, and assessment defects before expanding.

**Deliverables**: pilot report, prioritized changes, and a go/no-go recommendation for public rollout.

**Exit gate**: product owner accepts pilot results, critical issues are closed, and support/data operations are sustainable.

### Phase 9 — expand courses and improve

**Work**

- Add the remaining role tracks only after subject-matter review and a complete assessment blueprint: retail banking, digital payments, finance/credit operations, investment banking operations, and FinTech/neo-banking.
- Reuse the course model and authoring workflow; do not create separate hand-built learner systems per role.
- Prioritize enhancements from pilot evidence: search/filtering, multilingual learning, additional practice formats, cohort sessions, and learner analytics.
- Set recurring review dates and an owner for every published course; archive stale versions while preserving the version tied to earned certificates.

**Deliverables**: approved track releases, recurring content-review calendar, and post-launch product backlog.

**Exit gate**: each new course has approved learning outcomes, content sources/reviewer, assessment, completion rule, and certificate version before publication.

## Separate development and release workflow

- Keep LMS source, dependencies, scripts, and release notes inside `certification/_lms`; run its install, development, lint, and build commands from that directory.
- Add CI that builds and validates the LMS independently. LMS-only changes should affect only LMS checks; marketing-site releases should not require an LMS backend or build. Keep CI build steps free of calls to external learner-facing APIs.
- Store secrets outside Git, with different credentials and data for local, staging, and production. Commit a safe `.env.example` containing variable names only.
- Use separate Centaur-controlled staging and production environments and migrate schemas deliberately. Never use production student data for local development.
- Document rollback for frontend releases and database/schema changes. Back up the database and certificate records before migrations.
- Add links from the marketing site only after staging is usable; publish production course pages and cross-links in a coordinated release.

## Launch acceptance criteria

- A new learner can create and verify an account, enroll in the pilot for free, complete lessons, pass the assessment, and download a certificate.
- A third party can verify an active certificate from its ID/QR link without seeing private learner data; a revoked certificate is clearly marked.
- Students cannot read or alter another learner's progress, assessment attempts, profile, or certificates; non-admin users cannot publish courses or issue certificates.
- The LMS can be deployed and rolled back independently of the marketing website, and learner data has a tested backup and restore process.
- Course pages state prerequisites, completion rules, certificate scope, review date, and that the certificate is a Centaur course-completion award rather than a regulated or guaranteed employment credential.

## First implementation milestone

Start coding only after Phase 0 is approved. The first product milestone is Phases 1–5 on Centaur-controlled development/staging infrastructure: a learner can create an account, enroll free in the reviewed KYC/AML pilot, complete lessons, pass a server-graded assessment, and see verified completion. Add public hosting only after the internal pilot is approved; deliver Phase 6 certificates and public verification before inviting learners.

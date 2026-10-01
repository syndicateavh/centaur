# Centaur Free Banking Certifications — Implementation Plan

## Objective

Build a separate learning platform where students can register for free, complete short courses for practical banking and financial-services roles, pass assessments, and receive verifiable course-completion certificates. Keep it in this repository under `certification/_lms`, but release it independently from the public Centaur Careers website.

## Current status (2026-10-01)

- Phase 1 foundation is implemented in this directory: Next.js App Router/TypeScript, local Docker Compose configuration, internal PostgreSQL migration workflow, health endpoints, a development-only admin diagnostic panel, and LMS-scoped CI.
- The application uses internal PostgreSQL and Next.js APIs. Supabase auth/configuration and prior external auth hooks were removed to follow the internal-only requirement.
- Phase 1 local setup was verified on 2026-10-01: a clean temporary PostgreSQL database applied migrations `0001`–`0009`, both fictional seeds completed, migration and row-authorization checks passed, and a synthetic account was verified through local mail, granted an audited local admin role, and used to open `/admin/operations`. The persistent local Compose app also returned healthy at `/api/health`; `/admin` and `/admin/mail` responded in development.
- The admin panel is read-only and development-only; the production standalone server returns 404 for both `/admin` and `/api/admin/health` while `/api/health` remains available. No internal staging host or deployment credentials have been selected, so Phase 1 delivers a deployable image and internal runbook without publishing it to a server.
- Internal operations notes now define synthetic-only seed data, structured local error logs, local PostgreSQL backup/restore, and app/schema rollback guidance. No real learner data is present.
- Phase 2 public discovery pages are implemented: LMS landing, searchable/filterable six-track catalogue, statically generated track details, FAQs, help/status, and certificate verification. Public pages have explicit indexing metadata; robots/sitemap output is controlled by `LMS_PUBLIC_URL`. Public learner registration remains unavailable pending product and release approvals; verification returns not-found until an eligible certificate is issued.
- Phase 3 internal identity and enrollment foundation is implemented: LMS-owned Better Auth email/password accounts, consent-version capture, verification and reset mail, local mail previews, learner profile/deletion requests, internal PostgreSQL learner schemas and row policies, least-privilege runtime role, and a local-only sandbox enrollment flow. Auth pages evaluate the deployment gate at request time, and sign-in return paths are allowlisted. Public signup stays disabled outside local development until an HTTPS deployment, strong secret, and approved SMTP relay are configured. Phase 3 does not publish an approved course or certificate.
- Phase 4 implementation is present locally: migration-backed course review metadata, an immutable-after-publication version boundary, source-controlled KYC/AML pilot v1 (five modules, ten text lessons), a fictional practice packet and downloadable workbook, glossary, dated official sources, account-bound lesson progress, resume/completion checklist, and a local-only reviewer preview. The course/version remain draft, sandbox-only, and review-pending; qualified legal/AML subject-matter signoff has not yet occurred.
- Phase 4 now records the 220 minutes of lesson content separately from the 45-minute offline workbook estimate (265 minutes total), uses canonical RBI source links checked on 2026-10-01, and documents the text-first/no-video decision and reviewer steps in `docs/phase-4-pilot-course.md`. The local database-dependent route flow is available with the running Compose stack; qualified subject-matter review remains pending.
- Phase 5 implementation is present locally: five formative knowledge checks, a 15-question objective-balanced final assessment, server-only answer keys/grading, resumable attempts and history, three-attempt/80% final rules, objective-level final feedback, append-only assessment review records, and server-validated course completion tied to the learner's enrolled course/assessment versions. Assessment content remains a local draft pending qualified review; no certificate is issued in this phase.
- Phase 6 certificate workflow is implemented locally: eligible completion triggers idempotent certificate issuance, issue-time course/name snapshots and opaque IDs are stored immutably, owners can download an internally generated PDF/QR, public lookup returns only minimum verification fields, and admins can revoke or reissue with reasons and audit records. The pilot remains draft/sandbox-only, so no active certificate can be minted from current seed content; a real independently issued certificate and revoked record await approved course publication and learner completion.
- Phase 7 operations implementation is present locally: role-gated course and assessment drafting/review/versioning/scheduling/publishing/retirement, two-person publication approval, internal scheduled publishing, learner support, safe SMTP delivery-failure records, admin operations/audit views, and security/privacy/restore launch checklists. Migration `0008_admin_operations.sql` and the local protected admin route are verified. Production host, SMTP owner, support owner, backup owner, and required reviewers remain release decisions.
- Phase 8 controlled-pilot code is present locally: course-level invitation gating, account-bound learner feedback, privacy-limited cohort metrics, staging runbook, and pilot report template. Migrations `0001`–`0009` and fictional local seeds have been verified; invitation, feedback, and cohort workflows have not been run with a real pilot cohort. `LMS_CONTROLLED_PILOT=true` must be set on staging; no approved staging host or pilot cohort exists, and the sandbox course remains ineligible.
- Student panel completion work is implemented locally: signed-in responsive navigation across learning, catalogue, account, and help; a progress dashboard with next-action links, enrollment options, final-assessment state, certificate actions, and pilot feedback; loading/error/not-found states; and accurate draft-versus-approved review messaging throughout the learner path. TypeScript passes. The synthetic end-to-end certificate path still depends on a reviewed, published course; the only seeded course remains a sandbox draft and is intentionally certificate-ineligible.
- Learning-path coherence work is implemented locally: the player now orders lessons with module checkpoints and the final assessment, explains optional practice versus required completion, links learners forward after a submitted check, surfaces the fictional case and workbook at the relevant point, and counts only lessons visible in the player's active course version. The pilot source and local draft seed are synchronized. Workstream D's qualified subject-matter and learning-design approval remains an external release gate.
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

  **Deliverables**: versioned formative/final assessments, server grading, resumable attempt history, objective-level feedback, a deterministic completion service, append-only assessment review records, a structural/source consistency check, and immutable reviewed/published question sets.

  **Exit gate**: passing, failing, retaking, interrupted, and stale-course-version cases produce the expected results and cannot be bypassed by editing browser state. Implementation is available in the local draft; qualified question/content review and release approval remain pending.

### Phase 6 — certificates and verification

**Work**

- Store the issuer, credential wording, course title/version, recipient name, issue date, privacy choice, and non-sequential public ID as issue-time certificate data. Current holder-name display defaults to private.
- Issue idempotently inside the completion transaction only when the learner has completed every required lesson and passed the latest approved final assessment for the same pinned course version. Draft/sandbox courses cannot issue credentials.
- Generate a print-ready PDF and QR link locally inside the app. The download requires the authenticated owner and an active certificate.
- Provide an unindexed public verification form with active, revoked, and not-found states. A database function returns only the certificate ID, course, version, issuer, description, issue date, status, and the holder name only when public display is enabled.
- Allow admins to revoke with a required reason and reissue a revoked credential with a new ID only while completion eligibility still holds. Preserve immutable issue snapshots and append actor/action/reason audit records.

**Deliverables**: migration-backed certificate records, transaction-bound issuance, authenticated PDF/QR download, privacy-limited public verification, admin revocation/reissue interface, and an operator verification checklist.

**Exit gate**: implementation paths and app build checks are in place. Migrations through `0009` apply locally, but certificate issue/revoke/verify scenarios still need database-backed walkthroughs. The real credential acceptance gate (independently issued certificate verifies, revoked sample displays revoked, and privacy response is reviewed) also awaits qualified course approval/publication and learner completion.

### Phase 7 — admin operations, support, and launch readiness

**Work**

- Add protected `admin`/`course_editor` workflows to draft courses and lessons, create assessment drafts, record append-only reviews, clone versions, schedule/publish approved versions, and retire versions. A different reviewer and publisher are required. Draft answer keys remain outside learner page data.
- Add protected operational views for enrollment/completion, support cases, delivery failures, audit events, and certificate status. Use least-privilege roles, RLS policies, and audited support/certificate changes.
- Record internal SMTP setup, support process, a proposed retention schedule, backup/restore, and incident-response runbooks. Use only Centaur-owned SMTP; no hosted email API.
- Add internal scheduled publication through a role-checked command and document scheduler configuration. Define the security, accessibility, performance, monitoring, and production-environment checks that must pass before invited learners.

The protected workflows and runbooks are documented in `docs/phase-7-operations.md`. Migration `0008_admin_operations.sql` has applied on clean and persistent local databases; a synthetic verified admin reached `/admin/operations`. Production relay/hosting/backup/support ownership and human review decisions remain unselected, and individual course publishing/support/certificate actions still need end-to-end review.

**Deliverables**: protected course operations and version lifecycle, internal scheduled publisher, support queue, SMTP delivery diagnostics, admin operations dashboard, audit trail, and privacy/security/restore launch checklist.

**Exit gate**: code paths and runbooks are ready for review. Phase 7 is not production-ready until the migration is applied and database-backed flows, restore drill, SMTP, security/accessibility reviews, and named support/backup/incident owners are confirmed.

### Phase 8 — controlled pilot launch

**Implemented**: controlled enrollment invitations and email-fingerprint checks, one optional account-bound feedback survey per learner/course, privacy-limited admin cohort reporting, staging/pilot runbook, and a report template in `docs/phase-8-controlled-pilot.md` and `docs/pilot-report-template.md`.

**Still requires real-world execution**: deploy to an approved Centaur staging host, apply migration `0009_controlled_pilot.sql`, configure HTTPS/SMTP and `LMS_CONTROLLED_PILOT=true`, publish a reviewed non-sandbox course, invite a small cohort, conduct the pilot, resolve findings, and record the product owner's go/no-go decision. The existing KYC/AML pilot remains sandboxed and pending subject-matter review.

**Deliverables**: a completed pilot report, prioritized fixes, and a documented go/no-go recommendation. No result is claimed until learners have actually participated.

**Exit gate**: product owner accepts real pilot results, critical issues are closed, and support/data operations are sustainable. Code and templates alone do not satisfy the launch gate.

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

## Next-level completion plan: working student and admin product

This section translates the implemented foundation into the next deliverable: a coherent, responsive learning platform with a complete student journey, a usable protected admin workspace, and one real reviewed learning path. It takes priority over adding more course tracks. The phase notes above describe code already present; this plan closes the database, content, interface, and real-user verification gaps before calling the LMS complete.

### Current starting point

- Public discovery, account flows, learner dashboard/player, progress, knowledge checks, final assessment, certificate routes, and several protected admin routes exist in the app.
- The KYC/AML course and assessments are draft/sandbox material. They need qualified subject-matter review and must remain ineligible for real certificates until approved.
- Several newer database migrations and the admin/pilot workflows have not been applied and exercised against a running PostgreSQL instance. Code presence is not proof that the full journey works end to end.
- `/admin` is the shared authenticated, role-aware staff workspace. Local diagnostics are isolated under `/admin/local` and remain development-only; each operational route and mutation enforces its own role.
- Staging, SMTP, backup/restore ownership, privacy/terms approval, course review, and pilot participants are still external launch dependencies.

### Workstream A — make the local platform reproducible

**Work**

- Start PostgreSQL from a clean local volume, apply every migration in order, run the migration check, and seed only fictional learner/course records.
- Verify the runtime database role, row policies, Better Auth tables, and migrations `0001` through `0009` agree. Fix migration or seed failures before UI feature work continues.
- Write one operator walkthrough that starts the app, creates a synthetic learner, verifies email from the local mail preview, grants an admin role through the documented safe process, and resets local data without touching external environments.
- Record actual results and remaining defects in this plan; distinguish checks run against a local database from checks that require staging.

**Exit gate**: a new developer can start the app and reach both learner and protected admin workflows from a clean database using the documented commands and synthetic data.

**Verified 2026-10-01**: a temporary clean PostgreSQL 17 instance applied all nine migrations, passed `db:migrate:check` and `db:authz:check`, and accepted the enrollment and KYC/AML draft seeds. The persistent Compose stack is running with a healthy database and successful one-shot migration service. `/api/health`, `/admin`, and `/admin/mail` responded locally; a synthetic learner completed email verification, received an audited local admin role through the guarded bootstrap command, signed in, and opened `/admin/operations`. Migration, seed, authorization-fixture, and bootstrap issues discovered during this walkthrough were fixed.

### Workstream B — finish the student panel and learning journey

**Work**

- Give signed-in learners a consistent navigation shell for dashboard, courses, account, help, and sign-out. On small screens, keep navigation reachable without crowding the public header.
- Make the dashboard actionable: show each enrollment's course state, completed lessons, next lesson, assessment state, completion percentage, and certificate action where eligible. Add clear empty, loading, unavailable, and error states.
- Present the course player as a visible path: ordered modules and lessons, locked/available/completed states where rules require them, current position, previous/next lesson links, saved progress, and a clear route to each knowledge check and final assessment.
- Explain course expectations before enrollment: outcomes, estimated effort, prerequisites, lesson/assessment completion rules, retakes, review date, and certificate scope. Show a draft/sandbox label only in the internal preview.
- Make forms and results understandable on keyboard and screen readers. Preserve learner answers and progress safely after validation errors or interrupted assessment attempts.
- Keep account, deletion, support, feedback, certificate download, and certificate verification actions discoverable from the learner area.

**Exit gate**: a synthetic learner can enroll in the approved pilot, leave and resume lessons, complete checks, pass or fail and retake the final assessment according to policy, see accurate progress, submit support feedback, and access an eligible certificate without using direct database edits.

### Workstream C — finish the protected admin workspace

**Work**

- Add a role-aware admin navigation shell and landing page that links to course operations, review queue, learner/support operations, mail delivery, certificates, audit activity, and pilot reporting. Keep local service diagnostics clearly separate from production administration.
- Make the course workflow readable from draft to review to scheduled/published/retired. Show version, reviewer decision, required next action, and why a publish action is unavailable. Keep review and publication permissions separated and audited.
- Make course and assessment editing practical for content operators: validate required fields, ordering, references, outcomes, assessment blueprint, pass rules, and certificate settings before review. Preview learner-facing pages before publication.
- Provide support staff with searchable/filterable queues and clear status updates. Restrict learner details to authorized roles, record staff actions, and avoid showing answer keys or unnecessary personal data in operational views.
- Provide an enrollment/completion overview, certificate status and revoke/reissue reason flow, delivery-failure review, and audit history with useful filters and pagination. Handle empty and high-volume states.
- Document and implement the safe bootstrap process for the first admin account; never grant privileged roles through learner signup or an unaudited client action.

**Exit gate**: an authorized editor can prepare a course version, a separate reviewer can approve it, an authorized publisher can release it, and support/admin staff can resolve a learner issue and audit a certificate action. A learner or unprivileged account cannot reach or mutate these workflows.

**Implemented locally 2026-10-01**: the `/admin` workspace now has a verified staff-role gate, responsive role-filtered navigation, and role-specific operational links. Local health and mail previews are separated into development-only routes. Course operations now expose draft module/lesson/assessment editing, immutable assessment content after review or learner attempts, visible release blockers, and distinct review/publish gates. Support and audit views have search/filter/pagination, and direct curriculum/mail previews require the correct role as well as development mode. The LMS production build and TypeScript check both pass locally. Staging role-boundary walkthroughs, delivery/restore operations, and human course approval remain launch prerequisites.

### Workstream D — turn the pilot into a real learning path

**Work**

- Appoint a qualified KYC/AML reviewer and a product owner. Review all outcomes, official source links, lesson claims, scenarios, glossary, answer explanations, assessment blueprint, retake policy, completion rules, and certificate wording.
- Resolve every reviewer finding in a new course/assessment version; preserve the reviewed version and record reviewer identity, decision, date, and notes. Do not edit a published version in place.
- Have a learning designer verify that each module progresses from concept to worked example to learner practice to knowledge check, with a meaningful final assessment and accessible downloadable materials.
- Publish only after content, privacy, support, certificate, and pilot access decisions are approved. Keep the other five catalogue tracks clearly marked as proposed until each has its own complete and reviewed path.

**Exit gate**: the KYC/AML pilot has a complete reviewed sequence with traceable sources, practical exercises, objective-aligned assessments, explicit completion rules, and truthful course-completion credential wording.

### Workstream E — responsive and accessible quality pass

**Work**

- Review representative pages at narrow phone, large phone, tablet, laptop, and wide desktop widths: home, catalogue/detail, sign-in/up, dashboard, lesson/player, assessment/results, account, admin dashboard, course review/editor, support, and certificate views.
- Fix horizontal overflow, cramped forms/tables, unusable mobile navigation, small touch targets, long-title wrapping, sticky-header overlap, and PDF/print layout issues. Tables and dense admin data need an intentional small-screen presentation.
- Check keyboard-only operation, visible focus, heading order, labels/errors, status announcements, contrast, reduced motion, zoom/reflow, and meaningful image alternatives. Keep content usable when images or motion are unavailable.
- Define measurable performance budgets for the deployed environment and check image/font payloads, route loading, database query counts, and slow/failed states with realistic seeded data.

**Exit gate**: the documented core journeys work at phone and desktop widths, keyboard users can complete them, and no critical accessibility or layout defects remain.

**Implemented locally 2026-10-01**: shared responsive wrapping and overflow behavior, mobile-scrollable public navigation, 44px interactive control targets, higher-contrast form borders and keyboard focus, reduced-motion and forced-colors support, print styles, wrapped dynamic text, and an explicitly scrollable/labelled operations table are in place. Assessment radio groups now use native required validation while the save-and-leave action still permits partial drafts. Authentication and sign-out announce busy/result states, and course progress exposes its text equivalent. The production build and TypeScript check pass. A manual viewport, keyboard, screen-reader, zoom/reflow, and print review is still needed before declaring the exit gate passed.

### Workstream F — prove the complete journeys and prepare the controlled pilot

**Work**

- Run end-to-end learner scenarios: signup/verification, sign-in/reset, invitation and enrollment, lesson resume, formative checks, assessment pass/fail/retake/expiry, course-version change, completion, certificate PDF/QR/verification, support, and account deletion request.
- Run admin scenarios: role boundary checks, course version/review/publish/schedule/retire, support updates, SMTP failure review, certificate revoke/reissue, and audit visibility. Verify public verification exposes only the approved fields.
- Exercise migrations on a clean database and an upgrade copy, then run a backup and restore drill. Confirm app/database rollback instructions work before real learner data is introduced.
- Complete security, accessibility, privacy, content, email, monitoring, and operations reviews. Resolve owner assignments and configure only Centaur-controlled staging, HTTPS, SMTP, and backups.
- Invite a small approved cohort, provide a support channel, observe completion and usability without collecting unnecessary data, resolve critical findings, and fill in `docs/pilot-report-template.md` for a product-owner go/no-go decision.

**Exit gate**: database-backed scenarios pass in staging, restore and access controls are verified, real learners complete the pilot, critical issues are closed, and the product owner records a go/no-go decision. Production launch follows only after this gate.

**Local verification 2026-10-01**: the synthetic learner completed sign-up/email verification and password reset, enrollment, lesson progress, a failed and retaken formative check, a failed and passed final assessment, certificate PDF/public verification, support submission, and an account-deletion request. The synthetic admin/editor workflow created, reviewed, published, and retired a course; staff resolved the support request and revoked/reissued the certificate with audit records. The deletion-request test exposed and fixed a UUID/text parameter bug in its audit insert. Build, lint, typecheck, migration, assessment-content, and anonymous-route checks pass locally. Full results and evidence are in [the Phase 6 journey verification report](docs/phase-6-journey-verification.md). This is local verification only: scheduled publication, version replacement, invitation redemption, SMTP failure handling, restore, manual accessibility review, staging, and the approved human pilot remain open. The Workstream F exit gate is not passed.

**Controlled-pilot preparation 2026-10-01**: rollback-only synthetic checks passed invitation redemption/replay/expiry/identity controls and feedback uniqueness/role visibility. No local invitation or feedback records remain. The pilot cannot start: local pilot mode and SMTP are off, and there is no approved published non-sandbox course. No real staging environment or cohort was supplied. See [the Phase 7 pilot run status](docs/phase-7-controlled-pilot-run.md); this is not a pilot result and the launch gate remains open.

### Recommended execution order

1. Workstream A: prove migrations and local setup.
2. In parallel, complete Workstreams B and C using the running local database.
3. Complete Workstream D review before changing the course from sandbox to eligible.
4. Complete Workstream E across student and admin journeys.
5. Complete Workstream F in approved staging, then make the launch decision.

Do not expand the catalogue before the pilot gate. The next implementation should prioritize coherent student/admin navigation and progress visibility, then fix any database-backed blockers exposed by the end-to-end walkthrough. Responsive refinement should be part of each feature and receive a final cross-route review in Workstream E.

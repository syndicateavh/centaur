# Phase 4 — KYC/AML pilot course and learning player

## Implementation status

The technical Phase 4 deliverables are implemented as a local-only draft:

- Source content: `content/kyc-aml-pilot-v1.json` contains five learning objectives, five ordered modules, ten text lessons, glossary, practice activities, dated official references, and the fictional Riverstone Textiles case.
- Lesson time: the lesson pages total 220 minutes. The downloadable workbook has a separate 45-minute estimate, for 265 minutes total. Both values are stored with the course version.
- Learner player: authenticated enrolled learners can navigate lessons, mark a lesson in progress or complete, resume from saved progress, see a lesson checklist, use the glossary/source register, and download the offline workbook.
- Learning path: the course outline places each optional module knowledge check after its lessons and the final assessment after the full lesson sequence. Completed modules link into their check; submitted checks link to the next module or final assessment. The integrated case lesson links directly to its offline workbook, and the course outline exposes the fictional case facts and practice questions.
- Reviewer view: `/admin/curriculum` is development-only and read-only. It shows the draft, lesson content, case packet, source register, assessment material, and a reviewer checklist. It cannot approve or publish content.
- Versioning: an enrollment pins its course-version ID. Published lesson and version content is immutable; edits after publication require a new version.

## Video and low-bandwidth decision

Pilot v1 is text-first and has no hosted video or third-party embed. This keeps lessons usable on low-bandwidth connections and avoids introducing a video provider before privacy, hosting, captions, transcripts, and retention are approved. If a later version adds video, publish a transcript and captions with the video and retain a text route through the same learning objectives.

## Local setup

From this directory, start Docker Desktop, then run:

```powershell
docker compose up -d database
npm run db:migrate
npm run db:seed:local
npm run db:seed:pilot
$env:LMS_AUTH_ENABLED = 'true'
npm run dev
```

Create a synthetic learner through `/sign-up`; use the development mail preview at `/admin/mail` to verify the address. Enroll in the KYC/AML draft from the learner dashboard, then inspect `/learn/kyc-aml-operations-pilot` and its lesson pages. Open `/admin/curriculum` to review the draft. Seed scripts refuse non-local databases and keep this course in draft/sandbox state.

The database-dependent reviewer and learner routes cannot be verified until the local PostgreSQL container is running. They are not enabled as a public production course.

## Source register refresh

The reference links were checked on 2026-10-01. The RBI's consolidated KYC Direction page identifies an update through 14 August 2025; the separate June 2025 amendment is retained to make amendment scope and time-bound clauses visible. Legal and operational statements still require a qualified reviewer to compare the complete course, workbook, and assessment against the latest official text and applicable institutional procedures.

## Required human review before release

The course remains `draft`, `sandbox`, and `review_status=pending`; no reviewer is recorded. Before publication, a qualified India AML/KYC subject-matter reviewer must:

1. Check every legal/regulatory statement, including definitions and time-bound provisions, against current official material.
2. Review the lesson order, learning objectives, practice prompts, fictional case, workbook, and assessment for accuracy and safe role boundaries.
3. Record name, date, decision, required corrections, and the source set through the controlled review process.
4. Approve a new immutable course version for publication only after corrections are applied and re-reviewed.

The content preview is prepared for review; it is not itself evidence of expert signoff.

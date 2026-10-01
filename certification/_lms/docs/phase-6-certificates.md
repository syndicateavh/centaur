# Phase 6: certificates and verification

## Award policy

The award is a **Centaur Careers Course Completion Certificate**. It records successful completion of one named course version. It is an educational course-completion award; it is not a government, regulator, bank, employer, or accredited qualification, does not authorize regulated work, and does not guarantee employment.

A certificate is issued only when the learner's pinned enrollment is completed, every required lesson in that version is complete, the latest approved final assessment for that version has a passing submitted attempt, and the course and version are published, reviewed, and not sandbox records. Issuance runs in the same transaction that records completion. Repeating the completion request returns the existing active certificate instead of creating another one.

The certificate keeps the course title, learner display name, issuer, issue date, credential wording, version, and generated `CTC-` public ID as an issue-time snapshot. The holder name is private on public verification by default. The PDF itself contains the holder name and can only be downloaded by the authenticated owner while the certificate is active.

## Verification and status changes

The PDF contains a QR code and link to `/certificates/verify?id=<public-id>`. The public route accepts only a correctly shaped public ID and calls `lms.verify_certificate`, a narrowly scoped database function. Its response includes the public ID, course title/version, issuer, credential description, issue date, active/revoked status, and holder name only if that certificate explicitly allows public display. It returns no learner email, internal user/certificate UUID, profile, assessment, or attempt data. The route is marked `noindex` and is excluded from the sitemap.

Admin revocation requires a reason of at least 10 characters. Certificate issue fields cannot be edited; the database permits only an active-to-revoked transition. The action records the administrator, timestamp, reason, and audit event. Reissue creates a new public ID and links the old revoked record; it is allowed only if the learner still qualifies under the currently published course and assessment rules. The old ID continues to verify as revoked.

## Local operational steps

1. Start the internal PostgreSQL development service, then run `npm run db:migrate` from this project to apply migration `0007_certificates_verification.sql`.
2. Keep the current pilot in draft/sandbox state while subject-matter review is pending. Its learner preview must not create a certificate.
3. After authorized content review and publication, complete a course as a learner through the actual lesson and assessment routes. Do not insert an active certificate manually to simulate learner completion.
4. Download the PDF from the learner course page. Scan the QR code and verify the active record. Confirm the response contains no email or learner profile data.
5. From `/admin/certificates`, revoke the record with a documented reason. Verify the old public ID now reads revoked and that its issue-time fields have not changed.
6. If the learner remains eligible, reissue with a reason and verify the new ID is active while the old ID remains revoked.

The current development environment has no PostgreSQL service running, and the seeded course is not approved for issuance. Therefore no active or revoked sample credential has been created. Complete steps 1 and 3–6 after the internal database and qualified course approval are available; this is the remaining acceptance gate, not evidence of an issued credential.

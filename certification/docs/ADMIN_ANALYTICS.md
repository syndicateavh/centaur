# Admin analytics and learner operations

## Dashboard definitions

- **Users:** all accounts in the LMS.
- **Enrollments:** all course enrollment records, including archived courses.
- **Active learners:** distinct enrolled users with at least one enrollment `last_accessed_at` timestamp in the rolling 30 days before the dashboard request. Account creation, a quiz attempt without a recent course access, and stale enrollment do not count by themselves.
- **Published courses:** courses whose current status is `published`.
- **Completions:** immutable learner/course completion snapshots.
- **Certificates:** all issued certificate records. **Valid certificates** are records whose current status is `ready`; revoked, pending, processing, and failed records are not counted as valid.
- **Recent activity:** the latest 20 account-created, enrollment, completion, quiz-attempt, and certificate audit events, sorted by event time.

The dashboard computes counts from PostgreSQL when requested. It does not cache or pre-aggregate them. Student and course lists, certificate lists, and certificate audit results use server-side pagination with a maximum page size of 100 (the UI requests 25). Learner and course detail pages request bounded enrollment pages and compute progress from required lessons; required quiz pass state is shown separately.

## Admin views

- `/admin`: count cards, active learner window, and recent activity.
- `/admin/students`: searchable and activity-filtered learners; each row includes enrollment/completion counts and last course access.
- `/admin/students/:id`: account details, paginated enrollment progress, required quiz status, and related certificate links.
- `/admin/courses`: paginated course management with title/slug search and status filters.
- `/admin/analytics/courses`: paginated course performance; detail pages show paginated learner progress and related certificate links.
- `/admin/certificates`: paginated, searchable certificate records, status filter, revoke/retry actions, and detail pages.
- `/admin/audit/certificates`: paginated issue, generation failure, and revocation events with actor and reason where present.

Dashboard and recent activity require `admin:dashboard:view`. Learner identity, detailed course enrollment, certificate administration, and audit routes require `admin:courses:manage`. Both permissions are assigned to the seeded `SUPER_ADMIN` role. All query inputs are validated and page sizes are bounded server-side.

Analytics use the existing event timestamps and certificate audit log. The phase adds indexes for user/courses recency, enrollment access/enrollment dates, quiz submission recency, and global certificate audit ordering. Text search uses case-insensitive substring matching and may scan the filtered record set; if the catalogue grows enough to make this slow, add a PostgreSQL trigram index after confirming the production database supports `pg_trgm`.

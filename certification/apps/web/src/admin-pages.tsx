import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import { loadCurrentUser } from './lib/auth-api.js';
import { getAdminCourseAnalytics, getAdminStudent, listAdminCertificateAudit, listAdminCourseAnalytics, listAdminStudents, type PageResult } from './lib/admin-analytics-api.js';
import { getAdminCertificate } from './lib/certificates-api.js';
import { Button } from './components/ui/button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card.js';

function AdminHeader({ title, back = '/admin' }: { title: string; back?: string }) {
  return <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8"><div><Link to="/" className="text-lg font-bold text-slate-950">Centaur <span className="text-sky-700">Learn</span></Link><p className="mt-3 text-xs font-semibold uppercase tracking-wider text-violet-700">Admin analytics</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{title}</h1></div><Button asChild variant="outline"><Link to={back}>Back</Link></Button></div></header>;
}

function AdminAccess({ children }: { children: React.ReactNode }) {
  const user = useQuery({ queryKey: ['me'], queryFn: loadCurrentUser });
  if (user.isPending) return <main className="p-10 text-center text-slate-600">Loading account…</main>;
  if (user.isError) return <main className="p-10 text-center text-red-700">Could not load your account.</main>;
  if (!user.data) return <Navigate to="/login" replace />;
  if (!user.data.permissions.includes('admin:courses:manage')) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function AdminStudentsPage() { return <AdminAccess><StudentsTable /></AdminAccess>; }
function StudentsTable() {
  const [search, setSearch] = useState(''); const [submittedSearch, setSubmittedSearch] = useState(''); const [activity, setActivity] = useState(''); const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['adminStudents', submittedSearch, activity, page], queryFn: () => listAdminStudents({ q: submittedSearch, activity, page }) });
  function submit(event: FormEvent) { event.preventDefault(); setPage(1); setSubmittedSearch(search.trim()); }
  return <main className="min-h-screen bg-slate-50"><AdminHeader title="Learners"/><section className="mx-auto max-w-6xl space-y-5 px-5 py-10 sm:px-8">
    <Card><CardContent className="p-5"><form onSubmit={submit} className="flex flex-wrap gap-3"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" aria-label="Search learners" className="min-h-10 min-w-64 flex-1 rounded-lg border border-slate-300 px-3 text-sm"/><select value={activity} onChange={(event) => { setPage(1); setActivity(event.target.value); }} aria-label="Learner activity filter" className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm"><option value="">All learners</option><option value="active">Active in last 30 days</option><option value="inactive">No access in last 30 days</option></select><Button type="submit">Search</Button></form></CardContent></Card>
    {query.isPending && <p className="text-sm text-slate-600">Loading learners…</p>}{query.isError && <p role="alert" className="text-sm text-red-700">Learner records could not be loaded.</p>}
    {query.data?.items.map((student) => <Card key={student.id}><CardContent className="flex flex-wrap items-center justify-between gap-4 p-5"><div><h2 className="font-semibold text-slate-950">{student.displayName || 'Learner'}</h2><p className="text-sm text-slate-600">{student.email}</p><p className="mt-1 text-xs text-slate-500">{student.enrollmentCount} enrollments · {student.completionCount} completions · Last active {student.lastActiveAt ? new Date(student.lastActiveAt).toLocaleDateString() : 'Never'}</p></div><Button asChild variant="outline"><Link to={`/admin/students/${student.id}`}>View learner</Link></Button></CardContent></Card>)}
    {query.data && <Pagination result={query.data} page={page} setPage={setPage} />}
  </section></main>;
}

function Pagination<T>({ result, page, setPage }: { result: PageResult<T>; page: number; setPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));
  return <div className="flex items-center justify-between gap-3 py-3 text-sm text-slate-600"><span>Page {page} of {pages} · {result.total} records</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button></div></div>;
}

export function AdminStudentDetailPage() { return <AdminAccess><StudentDetail /></AdminAccess>; }
function StudentDetail() {
  const { userId = '' } = useParams(); const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['adminStudent', userId, page], queryFn: () => getAdminStudent(userId, page), enabled: Boolean(userId) });
  if (query.isPending) return <main className="p-10 text-center">Loading learner…</main>;
  if (query.isError) return <main className="mx-auto max-w-4xl px-5 py-10"><Card><CardHeader><CardTitle>Learner not found</CardTitle><CardDescription>This learner record could not be loaded.</CardDescription></CardHeader></Card></main>;
  const { student, courses } = query.data;
  return <main className="min-h-screen bg-slate-50"><AdminHeader title={student.displayName || student.email} back="/admin/students"/><section className="mx-auto max-w-6xl space-y-5 px-5 py-10 sm:px-8">
    <Card><CardHeader><CardTitle>Learner account</CardTitle><CardDescription>{student.email} · Joined {new Date(student.createdAt).toLocaleDateString()}</CardDescription></CardHeader></Card>
    <h2 className="text-xl font-semibold text-slate-950">Enrollments and progress</h2>
    {courses.items.map((course) => <Card key={course.enrollmentId}><CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"><div><Link className="font-semibold text-sky-800 hover:underline" to={`/admin/analytics/courses/${course.courseId}`}>{course.title}</Link><p className="mt-1 text-sm text-slate-600">{course.completedRequiredLessonCount}/{course.requiredLessonCount} required lessons · {course.progressPercent}%{course.quizRequired ? ` · Required quiz ${course.quizPassed ? 'passed' : 'not passed'}` : ''}</p><div className="mt-2 h-2 w-64 max-w-full overflow-hidden rounded bg-slate-200"><div className="h-full bg-sky-700" style={{ width: `${course.progressPercent}%` }} /></div><p className="mt-2 text-xs text-slate-500">Enrolled {new Date(course.enrolledAt).toLocaleDateString()} · Last accessed {course.lastAccessedAt ? new Date(course.lastAccessedAt).toLocaleDateString() : 'Never'}</p></div>{course.certificate && <Button asChild variant="outline"><Link to={`/admin/certificates/${course.certificate.id}`}>Certificate · {course.certificate.status}</Link></Button>}</CardContent></Card>)}
    {courses.items.length === 0 && <Card><CardContent className="p-5 text-sm text-slate-600">This learner has no enrollments.</CardContent></Card>}
    <Pagination result={courses} page={page} setPage={setPage} />
  </section></main>;
}

export function AdminCourseAnalyticsPage() { return <AdminAccess><CourseAnalyticsTable /></AdminAccess>; }
function CourseAnalyticsTable() {
  const [search, setSearch] = useState(''); const [submittedSearch, setSubmittedSearch] = useState(''); const [status, setStatus] = useState(''); const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['adminCourseAnalytics', submittedSearch, status, page], queryFn: () => listAdminCourseAnalytics({ q: submittedSearch, status, page }) });
  function submit(event: FormEvent) { event.preventDefault(); setPage(1); setSubmittedSearch(search.trim()); }
  return <main className="min-h-screen bg-slate-50"><AdminHeader title="Course performance"/><section className="mx-auto max-w-6xl space-y-5 px-5 py-10 sm:px-8">
    <Card><CardContent className="p-5"><form onSubmit={submit} className="flex flex-wrap gap-3"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or slug" aria-label="Search courses" className="min-h-10 min-w-64 flex-1 rounded-lg border border-slate-300 px-3 text-sm"/><select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }} aria-label="Course status" className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm"><option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select><Button type="submit">Search</Button></form></CardContent></Card>
    {query.isError && <p role="alert" className="text-sm text-red-700">Course analytics could not be loaded.</p>}{query.data?.items.map((course) => <Card key={course.id}><CardContent className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{course.status} · {course.slug}</p><h2 className="mt-1 font-semibold text-slate-950">{course.title}</h2><p className="mt-1 text-sm text-slate-600">{course.lessonCount} lessons · {course.enrollmentCount} learners · {course.completionCount} completions</p><p className="text-xs text-slate-500">Updated {new Date(course.updatedAt).toLocaleDateString()}</p></div><Button asChild variant="outline"><Link to={`/admin/analytics/courses/${course.id}`}>View progress</Link></Button></CardContent></Card>)}
    {query.data && <Pagination result={query.data} page={page} setPage={setPage} />}
  </section></main>;
}

export function AdminCourseDetailPage() { return <AdminAccess><CourseDetail /></AdminAccess>; }
function CourseDetail() {
  const { courseId = '' } = useParams(); const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['adminCourseAnalyticsDetail', courseId, page], queryFn: () => getAdminCourseAnalytics(courseId, page), enabled: Boolean(courseId) });
  if (query.isPending) return <main className="p-10 text-center">Loading course analytics…</main>;
  if (query.isError) return <main className="p-10 text-center text-red-700">Course analytics could not be loaded.</main>;
  const { course, learners } = query.data;
  return <main className="min-h-screen bg-slate-50"><AdminHeader title={course.title} back="/admin/analytics/courses"/><section className="mx-auto max-w-6xl space-y-4 px-5 py-10 sm:px-8"><p className="text-sm text-slate-600">{course.status} · {learners.total} enrolled learners{course.quizRequired ? ' · Required quiz' : ''}</p>
    {learners.items.map((learner) => <Card key={learner.enrollmentId}><CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"><div><Link className="font-semibold text-sky-800 hover:underline" to={`/admin/students/${learner.userId}`}>{learner.displayName || learner.email}</Link><p className="text-sm text-slate-600">{learner.email} · {learner.completedRequiredLessonCount}/{learner.requiredLessonCount} required lessons · {learner.progressPercent}%</p><div className="mt-2 h-2 w-64 max-w-full overflow-hidden rounded bg-slate-200"><div className="h-full bg-sky-700" style={{ width: `${learner.progressPercent}%` }} /></div><p className="mt-2 text-xs text-slate-500">Enrolled {new Date(learner.enrolledAt).toLocaleDateString()} · Last accessed {learner.lastAccessedAt ? new Date(learner.lastAccessedAt).toLocaleDateString() : 'Never'} · Quiz {course.quizRequired ? learner.quizPassed ? 'passed' : 'not passed' : 'not required'}</p></div>{learner.certificate && <Button asChild variant="outline"><Link to={`/admin/certificates/${learner.certificate.id}`}>Certificate · {learner.certificate.status}</Link></Button>}</CardContent></Card>)}
    {learners.items.length === 0 && <Card><CardContent className="p-5 text-sm text-slate-600">There are no enrollments for this course.</CardContent></Card>}<Pagination result={learners} page={page} setPage={setPage} />
  </section></main>;
}

export function AdminCertificateAuditPage() { return <AdminAccess><CertificateAudit /></AdminAccess>; }
function CertificateAudit() {
  const [search, setSearch] = useState(''); const [submittedSearch, setSubmittedSearch] = useState(''); const [action, setAction] = useState(''); const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['adminCertificateAudit', submittedSearch, action, page], queryFn: () => listAdminCertificateAudit({ q: submittedSearch, action, page }) });
  function submit(event: FormEvent) { event.preventDefault(); setPage(1); setSubmittedSearch(search.trim()); }
  return <main className="min-h-screen bg-slate-50"><AdminHeader title="Certificate audit"/><section className="mx-auto max-w-6xl space-y-5 px-5 py-10 sm:px-8"><Card><CardContent className="p-5"><form onSubmit={submit} className="flex flex-wrap gap-3"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search certificate, learner, course, actor" aria-label="Search audit" className="min-h-10 min-w-64 flex-1 rounded-lg border border-slate-300 px-3 text-sm"/><select value={action} onChange={(event) => { setPage(1); setAction(event.target.value); }} aria-label="Audit action" className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm"><option value="">All actions</option><option value="issued">Issued</option><option value="revoked">Revoked</option><option value="generation_failed">Generation failed</option></select><Button type="submit">Search</Button></form></CardContent></Card>
    {query.isError && <p role="alert" className="text-sm text-red-700">Audit entries could not be loaded.</p>}{query.data?.items.map((row) => <Card key={row.id}><CardContent className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{row.action.replace('_', ' ')} · {new Date(row.createdAt).toLocaleString()}</p><h2 className="mt-1 font-semibold text-slate-950">{row.learnerName} · {row.courseTitle}</h2><p className="text-sm text-slate-600">{row.publicCertificateId} · Status: {row.certificateStatus} · {row.actorEmail ? `By ${row.actorEmail}` : 'System event'}</p>{row.reason && <p className="mt-1 text-sm text-slate-700">{row.reason}</p>}</div><Button asChild variant="outline"><Link to={`/admin/certificates/${row.certificateId}`}>Certificate details</Link></Button></CardContent></Card>)}
    {query.data && <Pagination result={query.data} page={page} setPage={setPage} />}
  </section></main>;
}

export function AdminCertificateDetailPage() { return <AdminAccess><CertificateDetail /></AdminAccess>; }
function CertificateDetail() {
  const { certificateId = '' } = useParams();
  const query = useQuery({ queryKey: ['adminCertificateDetail', certificateId], queryFn: () => getAdminCertificate(certificateId), enabled: Boolean(certificateId) });
  if (query.isPending) return <main className="p-10 text-center">Loading certificate…</main>;
  if (query.isError) return <main className="p-10 text-center text-red-700">Certificate details could not be loaded.</main>;
  const { certificate, audit } = query.data;
  return <main className="min-h-screen bg-slate-50"><AdminHeader title="Certificate details" back="/admin/certificates"/><section className="mx-auto max-w-4xl space-y-5 px-5 py-10 sm:px-8"><Card><CardHeader><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{certificate.status} · {certificate.publicCertificateId}</p><CardTitle>{certificate.courseTitle}</CardTitle><CardDescription>{certificate.learnerName} · {certificate.learnerEmail}</CardDescription></CardHeader><CardContent className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2"><p>Completed {new Date(certificate.completedAt).toLocaleDateString()}</p><p>Issued {certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : 'Pending'}</p><p>Generated {certificate.generatedAt ? new Date(certificate.generatedAt).toLocaleDateString() : 'Not generated'}</p><p>Revoked {certificate.revokedAt ? new Date(certificate.revokedAt).toLocaleDateString() : 'No'}</p>{certificate.revocationReason && <p className="sm:col-span-2">Revocation reason: {certificate.revocationReason}</p>}<Button asChild variant="outline" className="w-fit"><Link to={`/verify/${certificate.publicCertificateId}`}>Open public verification</Link></Button></CardContent></Card>
    <div><h2 className="mb-3 text-xl font-semibold text-slate-950">Audit history</h2>{audit.map((item) => <Card key={item.id} className="mb-3"><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-slate-500">{item.action.replace('_', ' ')} · {new Date(item.createdAt).toLocaleString()}</p><p className="mt-1 text-sm text-slate-700">{item.actorEmail ? `By ${item.actorEmail}` : 'System event'}{item.reason ? ` · ${item.reason}` : ''}</p></CardContent></Card>)}</div>
  </section></main>;
}

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import { loadCurrentUser } from './lib/auth-api.js';
import { createAdminEnrollment, getAdminAnalyticsOverview, getAdminCourseAnalytics, getAdminStudent, listAdminCertificateAudit, listAdminCourseAnalytics, listAdminEnrollments, listAdminStudents, type PageResult } from './lib/admin-analytics-api.js';
import { abortMediaUpload, listAdminMedia, retryMediaProcessing, type AdminMediaLibraryItem, type MediaAssetSummary } from './lib/courses-api.js';
import { getAdminCertificate } from './lib/certificates-api.js';
import { Button } from './components/ui/button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card.js';

function AdminHeader({ title, back = '/admin' }: { title: string; back?: string }) {
  return <header className="admin-page-header border-b border-paper-line bg-white px-5 py-5 sm:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Administration</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{title}</h1></div>{back !== '' && <Button asChild variant="outline"><Link to={back}>Back</Link></Button>}</div></header>;
}

function AdminAccess({ children }: { children: React.ReactNode }) {
  const user = useQuery({ queryKey: ['me'], queryFn: loadCurrentUser });
  if (user.isPending) return <main className="p-10 text-center text-slate-600">Loading account…</main>;
  if (user.isError) return <main className="p-10 text-center text-red-700">Could not load your account.</main>;
  if (!user.data) return <Navigate to="/login" replace />;
  if (!user.data.permissions.includes('admin:courses:manage')) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function AdminMediaLibraryPage() { return <AdminAccess><MediaLibrary /></AdminAccess>; }

function MediaLibrary() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [kind, setKind] = useState<MediaAssetSummary['kind'] | ''>('');
  const [status, setStatus] = useState<MediaAssetSummary['status'] | ''>('');
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState('');
  const query = useQuery({
    queryKey: ['adminMediaLibrary', submittedSearch, kind, status, page],
    queryFn: () => listAdminMedia({ q: submittedSearch, kind, status, page }),
    refetchInterval: (current) => current.state.data?.items.some((asset) => asset.status === 'uploading' || asset.status === 'processing') ? 4000 : false,
  });
  const refresh = async () => { setActionError(''); await queryClient.invalidateQueries({ queryKey: ['adminMediaLibrary'] }); };
  const cancel = useMutation({ mutationFn: abortMediaUpload, onSuccess: refresh, onError: (error) => setActionError(error instanceof Error ? error.message : 'The upload could not be cancelled.') });
  const retry = useMutation({ mutationFn: retryMediaProcessing, onSuccess: refresh, onError: (error) => setActionError(error instanceof Error ? error.message : 'Processing could not be retried.') });
  const statuses: Array<{ value: MediaAssetSummary['status'] | ''; label: string }> = [
    { value: '', label: 'All statuses' }, { value: 'uploading', label: 'Uploading' }, { value: 'processing', label: 'Processing' },
    { value: 'ready', label: 'Ready' }, { value: 'failed', label: 'Failed' }, { value: 'aborted', label: 'Cancelled' },
  ];
  const statusStyles: Record<MediaAssetSummary['status'], string> = {
    uploading: 'bg-blue-50 text-blue-800', processing: 'bg-amber-50 text-amber-900', ready: 'bg-emerald-50 text-emerald-800',
    failed: 'bg-red-50 text-red-800', aborted: 'bg-slate-100 text-slate-600',
  };
  const statusLabels: Record<MediaAssetSummary['status'], string> = { uploading: 'Uploading', processing: 'Processing', ready: 'Ready', failed: 'Failed', aborted: 'Cancelled' };
  const pages = query.data ? Math.max(1, Math.ceil(query.data.total / query.data.pageSize)) : 1;

  function submit(event: FormEvent) { event.preventDefault(); setPage(1); setSubmittedSearch(search.trim()); }
  function updateKind(value: MediaAssetSummary['kind'] | '') { setKind(value); setPage(1); }
  function updateStatus(value: MediaAssetSummary['status'] | '') { setStatus(value); setPage(1); }
  function cancelUpload(asset: AdminMediaLibraryItem) {
    if (window.confirm(`Cancel the upload for “${asset.originalFileName}”?`)) cancel.mutate(asset.id);
  }

  return <main className="min-h-screen bg-paper"><AdminHeader title="Media library"/><section className="mx-auto max-w-7xl space-y-5 px-5 py-7 sm:px-8 sm:py-9">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-slate-600">Review lesson files, processing status and recent uploads across your courses.</p>{query.data && <p className="mt-1 text-xs font-medium text-slate-500">{query.data.total.toLocaleString()} {query.data.total === 1 ? 'asset' : 'assets'} match your filters · newest first</p>}</div><Button asChild variant="outline"><Link to="/admin/courses">Manage courses</Link></Button></div>
    <Card><CardContent className="p-4 sm:p-5"><form onSubmit={submit} className="grid gap-3 md:grid-cols-[minmax(12rem,1fr)_10rem_12rem_auto]">
      <label className="min-w-0"><span className="sr-only">Search media</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search file, course or lesson" aria-label="Search media files" className="min-h-11 w-full rounded-lg border border-paper-line-strong px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" /></label>
      <label><span className="sr-only">Filter by media type</span><select value={kind} onChange={(event) => updateKind(event.target.value as MediaAssetSummary['kind'] | '')} aria-label="Filter by media type" className="min-h-11 w-full rounded-lg border border-paper-line-strong bg-white px-3 text-sm"><option value="">All file types</option><option value="VIDEO">Video</option><option value="PDF">PDF</option></select></label>
      <label><span className="sr-only">Filter by upload status</span><select value={status} onChange={(event) => updateStatus(event.target.value as MediaAssetSummary['status'] | '')} aria-label="Filter by upload status" className="min-h-11 w-full rounded-lg border border-paper-line-strong bg-white px-3 text-sm">{statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      <Button type="submit" variant="outline">Search</Button>
    </form></CardContent></Card>
    {actionError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{actionError}</p>}
    {query.isPending && <Card><CardContent className="p-5 text-sm text-slate-600">Loading media library…</CardContent></Card>}
    {query.isError && <Card><CardContent className="p-5"><p role="alert" className="text-sm text-red-800">Media records could not be loaded.</p><Button className="mt-3" size="sm" variant="outline" onClick={() => void query.refetch()}>Try again</Button></CardContent></Card>}
    {query.data?.items.map((asset) => <MediaLibraryRow key={asset.id} asset={asset} statusLabel={statusLabels[asset.status]} statusClass={statusStyles[asset.status]} busy={cancel.isPending || retry.isPending} onCancel={cancelUpload} onRetry={(id) => retry.mutate(id)} />)}
    {query.data?.items.length === 0 && <Card><CardContent className="p-6"><h2 className="font-semibold text-slate-950">No media found</h2><p className="mt-1 text-sm text-slate-600">Try another search or filter. Lesson media can be uploaded from the course builder.</p><Button className="mt-4" asChild variant="outline"><Link to="/admin/courses">Open courses</Link></Button></CardContent></Card>}
    {query.data && query.data.total > 0 && <div className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm text-slate-600"><span>Page {page} of {pages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button></div></div>}
    <Card><CardContent className="flex flex-wrap items-start gap-3 p-4 text-xs leading-5 text-slate-600 sm:p-5"><span className="font-semibold text-slate-800">Upload activity</span><span>Uploading and processing states refresh automatically. Exact byte progress is available in the lesson editor while an upload is open. Failed processing can be retried here.</span></CardContent></Card>
  </section></main>;
}

function MediaLibraryRow({ asset, statusLabel, statusClass, busy, onCancel, onRetry }: {
  asset: AdminMediaLibraryItem; statusLabel: string; statusClass: string; busy: boolean;
  onCancel: (asset: AdminMediaLibraryItem) => void; onRetry: (id: string) => void;
}) {
  return <Card><CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
    <div className="flex min-w-0 flex-1 items-start gap-3"><span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-xs font-bold text-brand-800">{asset.kind === 'VIDEO' ? 'VID' : 'PDF'}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="max-w-full truncate font-semibold text-slate-950">{asset.originalFileName}</h2><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass}`}>{statusLabel}</span></div><p className="mt-1 truncate text-sm text-slate-600">{asset.courseTitle} <span aria-hidden="true">·</span> {asset.moduleTitle} <span aria-hidden="true">·</span> {asset.lessonTitle}</p><p className="mt-1 text-xs text-slate-500">{(asset.sourceSizeBytes / (1024 * 1024)).toFixed(1)} MB · Added {new Date(asset.createdAt).toLocaleDateString()}{asset.durationSeconds ? ` · ${Math.floor(asset.durationSeconds / 60)}:${String(asset.durationSeconds % 60).padStart(2, '0')}` : ''}{asset.width && asset.height ? ` · ${asset.width} × ${asset.height}` : ''}</p>{asset.status === 'processing' && <p className="mt-1 text-xs text-slate-600">Preparing this file for learners.</p>}{asset.errorCode && <p className="mt-1 text-xs text-red-700">{asset.errorCode}</p>}</div></div>
    <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">{asset.status === 'uploading' && <Button size="sm" variant="outline" disabled={busy} onClick={() => onCancel(asset)}>Cancel upload</Button>}{asset.status === 'failed' && <Button size="sm" variant="outline" disabled={busy} onClick={() => onRetry(asset.id)}>Retry processing</Button>}<Button size="sm" variant="ghost" asChild><Link to={`/admin/courses/${asset.courseId}`}>Open course builder</Link></Button></div>
  </CardContent></Card>;
}

export function AdminStudentsPage() { return <AdminAccess><StudentsTable /></AdminAccess>; }

export function AdminEnrollmentsPage() { return <AdminAccess><EnrollmentsTable /></AdminAccess>; }

function EnrollmentsTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [courseId, setCourseId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [email, setEmail] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const coursesQuery = useQuery({ queryKey: ['adminEnrollmentCourseOptions'], queryFn: () => listAdminCourseAnalytics({ page: 1, pageSize: 100 }) });
  const query = useQuery({ queryKey: ['adminEnrollments', submittedSearch, courseId, status, page], queryFn: () => listAdminEnrollments({ q: submittedSearch, courseId, status, page }) });
  const enrollMutation = useMutation({
    mutationFn: () => createAdminEnrollment({ email: email.trim(), courseId: selectedCourseId }),
    onSuccess: async () => {
      setEmail('');
      setPage(1);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['adminEnrollments'] }),
        queryClient.invalidateQueries({ queryKey: ['adminStudents'] }),
        queryClient.invalidateQueries({ queryKey: ['adminStudent'] }),
        queryClient.invalidateQueries({ queryKey: ['adminAnalyticsOverview'] }),
        queryClient.invalidateQueries({ queryKey: ['adminCourseAnalytics'] }),
        queryClient.invalidateQueries({ queryKey: ['adminCourseAnalyticsDetail'] }),
      ]);
    },
  });
  function submitSearch(event: FormEvent) { event.preventDefault(); setPage(1); setSubmittedSearch(search.trim()); }
  function submitEnrollment(event: FormEvent) { event.preventDefault(); enrollMutation.mutate(); }
  function changeFilter(setter: (value: string) => void, value: string) { setPage(1); setter(value); }
  const pages = query.data ? Math.max(1, Math.ceil(query.data.total / query.data.pageSize)) : 1;

  return <main className="min-h-screen bg-paper"><AdminHeader title="Enrollments"/><section className="mx-auto max-w-7xl space-y-5 px-5 py-7 sm:px-8 sm:py-9">
    <div><p className="text-sm text-slate-600">Review learner access, progress and completion across published and archived courses.</p>{query.data && <p className="mt-1 text-xs font-medium text-slate-500">{query.data.total.toLocaleString()} enrollments</p>}</div>
    <Card><CardHeader><CardTitle className="text-lg">Enroll a learner</CardTitle><CardDescription>Assign an existing learner account to a published course. The learner will see it in My Courses after signing in.</CardDescription></CardHeader><CardContent>
      <form onSubmit={submitEnrollment} className="grid gap-3 md:grid-cols-[minmax(12rem,1fr)_minmax(14rem,1fr)_auto]">
        <label className="block space-y-1.5 text-sm font-medium text-slate-800">Learner email<input required type="email" maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="learner@example.com" className="min-h-11 w-full rounded-lg border border-paper-line-strong bg-white px-3 text-sm font-normal outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" /></label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-800">Published course<select required value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} className="min-h-11 w-full rounded-lg border border-paper-line-strong bg-white px-3 text-sm font-normal outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"><option value="">{coursesQuery.isPending ? 'Loading courses…' : 'Choose a course'}</option>{coursesQuery.data?.items.filter((course) => course.status === 'published').map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
        <div className="flex items-end"><Button type="submit" className="w-full md:w-auto" disabled={!selectedCourseId || enrollMutation.isPending || coursesQuery.isPending}>{enrollMutation.isPending ? 'Enrolling…' : 'Enroll learner'}</Button></div>
      </form>
      {coursesQuery.isError && <p role="alert" className="mt-3 text-sm text-red-800">Published courses could not be loaded. Refresh the page to try again.</p>}
      {coursesQuery.data && coursesQuery.data.items.every((course) => course.status !== 'published') && <p className="mt-3 text-sm text-slate-600">There are no published courses to enroll learners in.</p>}
      {enrollMutation.isError && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{enrollMutation.error instanceof Error ? enrollMutation.error.message : 'The learner could not be enrolled.'}</p>}
      {enrollMutation.isSuccess && <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Learner enrolled successfully.</p>}
    </CardContent></Card>
    <Card><CardContent className="p-4 sm:p-5"><form onSubmit={submitSearch} className="grid gap-3 md:grid-cols-[minmax(12rem,1fr)_minmax(11rem,15rem)_minmax(10rem,13rem)_auto]">
      <label className="min-w-0"><span className="sr-only">Search enrollments</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search learner, email or course" aria-label="Search enrollments" className="min-h-11 w-full rounded-lg border border-paper-line-strong bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" /></label>
      <label><span className="sr-only">Filter by course</span><select value={courseId} onChange={(event) => changeFilter(setCourseId, event.target.value)} aria-label="Filter enrollments by course" className="min-h-11 w-full rounded-lg border border-paper-line-strong bg-white px-3 text-sm"><option value="">All courses</option>{coursesQuery.data?.items.map((course) => <option key={course.id} value={course.id}>{course.title} · {course.status}</option>)}</select></label>
      <label><span className="sr-only">Filter by completion</span><select value={status} onChange={(event) => changeFilter(setStatus, event.target.value)} aria-label="Filter enrollments by completion" className="min-h-11 w-full rounded-lg border border-paper-line-strong bg-white px-3 text-sm"><option value="">All statuses</option><option value="active">Not completed</option><option value="completed">Completed</option></select></label>
      <Button type="submit" variant="outline">Search</Button>
    </form></CardContent></Card>
    {query.isPending && <Card><CardContent className="p-5 text-sm text-slate-600">Loading enrollments…</CardContent></Card>}
    {query.isError && <Card><CardContent className="p-5"><p role="alert" className="text-sm text-red-800">Enrollment records could not be loaded.</p><Button className="mt-3" size="sm" variant="outline" onClick={() => void query.refetch()}>Try again</Button></CardContent></Card>}
    {query.data?.items.map((row) => <Card key={row.id}><CardContent className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(10rem,0.8fr)_auto] lg:items-center">
      <div className="min-w-0"><Link className="font-semibold text-brand-800 hover:underline" to={`/admin/students/${row.userId}`}>{row.displayName || 'Learner'}</Link><p className="truncate text-sm text-slate-600">{row.email}</p><p className="mt-1 text-xs text-slate-500">Enrolled {new Date(row.enrolledAt).toLocaleDateString()}</p></div>
      <div className="min-w-0"><Link className="font-semibold text-slate-900 hover:text-brand-800 hover:underline" to={`/admin/analytics/courses/${row.courseId}`}>{row.courseTitle}</Link><p className="text-xs capitalize text-slate-500">{row.courseStatus} · {row.courseSlug}</p></div>
      <div><div className="flex items-center justify-between gap-2 text-xs"><span className="font-semibold text-slate-800">{row.completedAt ? 'Completed' : 'Not completed'}</span><span className="tabular-nums text-slate-600">{row.progressPercent}%</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-brand-700" style={{ width: `${Math.min(100, Math.max(0, row.progressPercent))}%` }} /></div><p className="mt-1 text-xs text-slate-500">{row.completedRequiredLessonCount}/{row.requiredLessonCount} required lessons · Last active {row.lastAccessedAt ? new Date(row.lastAccessedAt).toLocaleDateString() : 'Never'}</p></div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">{row.quizRequired && <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${row.quizPassed ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>Quiz {row.quizPassed ? 'passed' : 'pending'}</span>}{row.certificate && <Button size="sm" variant="outline" asChild><Link to={`/admin/certificates/${row.certificate.id}`}>Certificate</Link></Button>}<Button size="sm" variant="ghost" asChild><Link to={`/admin/students/${row.userId}`}>View learner</Link></Button></div>
    </CardContent></Card>)}
    {query.data?.items.length === 0 && <Card><CardContent className="p-6"><h2 className="font-semibold text-slate-950">No enrollments found</h2><p className="mt-1 text-sm text-slate-600">Adjust the filters or enroll an existing learner in a published course.</p></CardContent></Card>}
    {query.data && query.data.total > 0 && <div className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm text-slate-600"><span>Page {page} of {pages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button></div></div>}
    <p className="text-xs leading-5 text-slate-500">Enrollment removal is unavailable because completed enrollment records connect to learner progress and certificate history.</p>
  </section></main>;
}

function StudentsTable() {
  const [search, setSearch] = useState(''); const [submittedSearch, setSubmittedSearch] = useState(''); const [activity, setActivity] = useState(''); const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['adminStudents', submittedSearch, activity, page], queryFn: () => listAdminStudents({ q: submittedSearch, activity, page }) });
  function submit(event: FormEvent) { event.preventDefault(); setPage(1); setSubmittedSearch(search.trim()); }
  return <main className="min-h-screen bg-paper"><AdminHeader title="Learners"/><section className="mx-auto max-w-6xl space-y-5 px-5 py-10 sm:px-8">
    <Card><CardContent className="p-5"><form onSubmit={submit} className="flex flex-wrap gap-3"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" aria-label="Search learners" className="min-h-10 min-w-64 flex-1 rounded-lg border border-paper-line-strong px-3 text-sm"/><select value={activity} onChange={(event) => { setPage(1); setActivity(event.target.value); }} aria-label="Learner activity filter" className="min-h-10 rounded-lg border border-paper-line-strong px-3 text-sm"><option value="">All learners</option><option value="active">Active in last 30 days</option><option value="inactive">No access in last 30 days</option></select><Button type="submit">Search</Button></form></CardContent></Card>
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
  return <main className="min-h-screen bg-paper"><AdminHeader title={student.displayName || student.email} back="/admin/students"/><section className="mx-auto max-w-6xl space-y-5 px-5 py-10 sm:px-8">
    <Card><CardHeader><CardTitle>Learner account</CardTitle><CardDescription>{student.email} · Joined {new Date(student.createdAt).toLocaleDateString()}</CardDescription></CardHeader></Card>
    <h2 className="text-xl font-semibold text-slate-950">Enrollments and progress</h2>
    {courses.items.map((course) => <Card key={course.enrollmentId}><CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"><div><Link className="font-semibold text-brand-800 hover:underline" to={`/admin/analytics/courses/${course.courseId}`}>{course.title}</Link><p className="mt-1 text-sm text-slate-600">{course.completedRequiredLessonCount}/{course.requiredLessonCount} required lessons · {course.progressPercent}%{course.quizRequired ? ` · Required quiz ${course.quizPassed ? 'passed' : 'not passed'}` : ''}</p><div className="mt-2 h-2 w-64 max-w-full overflow-hidden rounded bg-slate-200"><div className="h-full bg-brand-700" style={{ width: `${course.progressPercent}%` }} /></div><p className="mt-2 text-xs text-slate-500">Enrolled {new Date(course.enrolledAt).toLocaleDateString()} · Last accessed {course.lastAccessedAt ? new Date(course.lastAccessedAt).toLocaleDateString() : 'Never'}</p></div>{course.certificate && <Button asChild variant="outline"><Link to={`/admin/certificates/${course.certificate.id}`}>Certificate · {course.certificate.status}</Link></Button>}</CardContent></Card>)}
    {courses.items.length === 0 && <Card><CardContent className="p-5 text-sm text-slate-600">This learner has no enrollments.</CardContent></Card>}
    <Pagination result={courses} page={page} setPage={setPage} />
  </section></main>;
}

export function AdminCourseAnalyticsPage() { return <AdminAccess><CourseAnalyticsTable /></AdminAccess>; }
function AnalyticsSnapshot() {
  const query = useQuery({ queryKey: ['adminAnalyticsOverview'], queryFn: getAdminAnalyticsOverview });
  if (query.isPending) return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <Card key={index}><CardContent className="p-5"><div className="h-3 w-28 animate-pulse rounded bg-slate-200"/><div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-100"/></CardContent></Card>)}</div>;
  if (query.isError) return <Card><CardContent className="p-5"><p role="alert" className="text-sm text-red-800">Analytics overview could not be loaded.</p><Button className="mt-3" size="sm" variant="outline" onClick={() => void query.refetch()}>Try again</Button></CardContent></Card>;
  const metrics = [
    { label: 'Students', value: query.data.students, hint: 'Accounts with learner access' },
    { label: 'Enrollments', value: query.data.enrollments, hint: 'Across all courses' },
    { label: `Active learners · ${query.data.activeLearnerWindowDays} days`, value: query.data.activeLearners, hint: 'Based on recorded course access' },
    { label: 'Course completions', value: query.data.completions, hint: 'Recorded completion records' },
    { label: 'Overall completion rate', value: `${query.data.enrollments ? Math.round(query.data.completions * 100 / query.data.enrollments) : 0}%`, hint: 'Completions divided by enrollments' },
    { label: 'Certificates', value: query.data.certificates, hint: `${query.data.validCertificates} ready to verify` },
  ];
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{metrics.map((metric) => <Card key={metric.label}><CardContent className="p-5"><p className="text-sm font-medium text-slate-600">{metric.label}</p><p className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">{metric.value}</p><p className="mt-1 text-xs text-slate-500">{metric.hint}</p></CardContent></Card>)}</div>;
}

function LearnerProgressPanel() {
  const query = useQuery({ queryKey: ['adminAnalyticsLearnerProgress'], queryFn: () => listAdminEnrollments({ page: 1, sort: 'activity' }) });
  return <Card><CardHeader><div className="flex flex-wrap items-end justify-between gap-3"><div><CardTitle>Learner progress</CardTitle><CardDescription>Recent activity, based on each learner’s last recorded course access.</CardDescription></div><Button size="sm" variant="outline" asChild><Link to="/admin/enrollments">View all enrollments</Link></Button></div></CardHeader><CardContent className="pt-3">
    {query.isPending && <p className="py-4 text-sm text-slate-600">Loading learner progress…</p>}
    {query.isError && <p role="alert" className="py-4 text-sm text-red-800">Learner progress could not be loaded.</p>}
    {query.data && <div className="overflow-x-auto rounded-lg border border-paper-line"><table className="w-full min-w-[680px] border-collapse text-left text-sm"><thead className="bg-paper text-xs uppercase tracking-wide text-slate-500"><tr><th scope="col" className="px-4 py-3 font-semibold">Student</th><th scope="col" className="px-4 py-3 font-semibold">Course</th><th scope="col" className="px-4 py-3 font-semibold">Progress</th><th scope="col" className="px-4 py-3 font-semibold">Last activity</th></tr></thead><tbody className="divide-y divide-paper-line bg-white">{query.data.items.map((row) => <tr key={row.id}><td className="px-4 py-3"><Link className="font-medium text-brand-800 hover:underline" to={`/admin/students/${row.userId}`}>{row.displayName || 'Learner'}</Link><span className="block text-xs text-slate-500">{row.email}</span></td><td className="px-4 py-3"><Link className="text-slate-800 hover:text-brand-800 hover:underline" to={`/admin/analytics/courses/${row.courseId}`}>{row.courseTitle}</Link></td><td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-brand-700" style={{ width: `${Math.min(100, Math.max(0, row.progressPercent))}%` }} /></div><span className="tabular-nums text-slate-700">{row.progressPercent}%</span></div></td><td className="px-4 py-3 text-slate-600">{row.lastAccessedAt ? new Date(row.lastAccessedAt).toLocaleDateString() : 'Not started'}</td></tr>)}</tbody></table>{query.data.items.length === 0 && <p className="p-5 text-sm text-slate-600">No learner enrollments yet.</p>}</div>}
  </CardContent></Card>;
}

function CourseAnalyticsTable() {
  const [search, setSearch] = useState(''); const [submittedSearch, setSubmittedSearch] = useState(''); const [status, setStatus] = useState(''); const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['adminCourseAnalytics', submittedSearch, status, page], queryFn: () => listAdminCourseAnalytics({ q: submittedSearch, status, page }) });
  function submit(event: FormEvent) { event.preventDefault(); setPage(1); setSubmittedSearch(search.trim()); }
  return <main className="min-h-screen bg-paper"><AdminHeader title="Learning analytics"/><section className="mx-auto max-w-7xl space-y-6 px-5 py-7 sm:px-8 sm:py-9">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-slate-600">A view of learner activity, course completion and credentials.</p><p className="mt-1 text-xs text-slate-500">Metrics come from enrollment, progress and certificate records.</p></div><Button asChild variant="outline"><Link to="/admin/enrollments">All enrollments</Link></Button></div>
    <AnalyticsSnapshot />
    <div><h2 className="text-xl font-semibold text-slate-950">Course performance</h2><p className="mt-1 text-sm text-slate-600">Compare how learners start and complete each course.</p></div>
    {query.isPending && <Card><CardContent className="p-5 text-sm text-slate-600">Loading course performance…</CardContent></Card>}
    <Card><CardContent className="p-5"><form onSubmit={submit} className="flex flex-wrap gap-3"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or slug" aria-label="Search courses" className="min-h-10 min-w-64 flex-1 rounded-lg border border-paper-line-strong px-3 text-sm"/><select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }} aria-label="Course status" className="min-h-10 rounded-lg border border-paper-line-strong px-3 text-sm"><option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select><Button type="submit">Search</Button></form></CardContent></Card>
    {query.isError && <p role="alert" className="text-sm text-red-700">Course analytics could not be loaded.</p>}{query.data?.items.map((course) => <Card key={course.id}><CardContent className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{course.status} · {course.slug}</p><h2 className="mt-1 font-semibold text-slate-950">{course.title}</h2><p className="mt-1 text-sm text-slate-600">{course.lessonCount} lessons · {course.enrollmentCount} learners · {course.completionCount} completions</p><p className="mt-1 text-sm text-slate-700">{course.startedCount} started · {course.enrollmentCount ? Math.round(course.completionCount * 100 / course.enrollmentCount) : 0}% completion</p><p className="text-xs text-slate-500">Updated {new Date(course.updatedAt).toLocaleDateString()}</p></div><Button asChild variant="outline"><Link to={`/admin/analytics/courses/${course.id}`}>View progress</Link></Button></CardContent></Card>)}
    {query.data && <Pagination result={query.data} page={page} setPage={setPage} />}
    {query.data?.items.length === 0 && <Card><CardContent className="p-5 text-sm text-slate-600">No courses match these filters.</CardContent></Card>}
    <LearnerProgressPanel />
  </section></main>;
}

export function AdminCourseDetailPage() { return <AdminAccess><CourseDetail /></AdminAccess>; }
function CourseDetail() {
  const { courseId = '' } = useParams(); const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['adminCourseAnalyticsDetail', courseId, page], queryFn: () => getAdminCourseAnalytics(courseId, page), enabled: Boolean(courseId) });
  if (query.isPending) return <main className="p-10 text-center">Loading course analytics…</main>;
  if (query.isError) return <main className="p-10 text-center text-red-700">Course analytics could not be loaded.</main>;
  const { course, learners } = query.data;
  return <main className="min-h-screen bg-paper"><AdminHeader title={course.title} back="/admin/analytics"/><section className="mx-auto max-w-6xl space-y-4 px-5 py-10 sm:px-8"><p className="text-sm text-slate-600">{course.status} · {learners.total} enrolled learners{course.quizRequired ? ' · Required quiz' : ''}</p>
    {learners.items.map((learner) => <Card key={learner.enrollmentId}><CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"><div><Link className="font-semibold text-brand-800 hover:underline" to={`/admin/students/${learner.userId}`}>{learner.displayName || learner.email}</Link><p className="text-sm text-slate-600">{learner.email} · {learner.completedRequiredLessonCount}/{learner.requiredLessonCount} required lessons · {learner.progressPercent}%</p><div className="mt-2 h-2 w-64 max-w-full overflow-hidden rounded bg-slate-200"><div className="h-full bg-brand-700" style={{ width: `${learner.progressPercent}%` }} /></div><p className="mt-2 text-xs text-slate-500">Enrolled {new Date(learner.enrolledAt).toLocaleDateString()} · Last accessed {learner.lastAccessedAt ? new Date(learner.lastAccessedAt).toLocaleDateString() : 'Never'} · Quiz {course.quizRequired ? learner.quizPassed ? 'passed' : 'not passed' : 'not required'}</p></div>{learner.certificate && <Button asChild variant="outline"><Link to={`/admin/certificates/${learner.certificate.id}`}>Certificate · {learner.certificate.status}</Link></Button>}</CardContent></Card>)}
    {learners.items.length === 0 && <Card><CardContent className="p-5 text-sm text-slate-600">There are no enrollments for this course.</CardContent></Card>}<Pagination result={learners} page={page} setPage={setPage} />
  </section></main>;
}

export function AdminCertificateAuditPage() { return <AdminAccess><CertificateAudit /></AdminAccess>; }
function CertificateAudit() {
  const [search, setSearch] = useState(''); const [submittedSearch, setSubmittedSearch] = useState(''); const [action, setAction] = useState(''); const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['adminCertificateAudit', submittedSearch, action, page], queryFn: () => listAdminCertificateAudit({ q: submittedSearch, action, page }) });
  function submit(event: FormEvent) { event.preventDefault(); setPage(1); setSubmittedSearch(search.trim()); }
  return <main className="min-h-screen bg-paper"><AdminHeader title="Certificate audit"/><section className="mx-auto max-w-6xl space-y-5 px-5 py-10 sm:px-8"><Card><CardContent className="p-5"><form onSubmit={submit} className="flex flex-wrap gap-3"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search certificate, learner, course, actor" aria-label="Search audit" className="min-h-10 min-w-64 flex-1 rounded-lg border border-paper-line-strong px-3 text-sm"/><select value={action} onChange={(event) => { setPage(1); setAction(event.target.value); }} aria-label="Audit action" className="min-h-10 rounded-lg border border-paper-line-strong px-3 text-sm"><option value="">All actions</option><option value="issued">Issued</option><option value="revoked">Revoked</option><option value="generation_failed">Generation failed</option></select><Button type="submit">Search</Button></form></CardContent></Card>
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
  return <main className="min-h-screen bg-paper"><AdminHeader title="Certificate details" back="/admin/certificates"/><section className="mx-auto max-w-4xl space-y-5 px-5 py-10 sm:px-8"><Card><CardHeader><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{certificate.status} · {certificate.publicCertificateId}</p><CardTitle>{certificate.courseTitle}</CardTitle><CardDescription>{certificate.learnerName} · {certificate.learnerEmail}</CardDescription></CardHeader><CardContent className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2"><p>Completed {new Date(certificate.completedAt).toLocaleDateString()}</p><p>Issued {certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : 'Pending'}</p><p>Generated {certificate.generatedAt ? new Date(certificate.generatedAt).toLocaleDateString() : 'Not generated'}</p><p>Revoked {certificate.revokedAt ? new Date(certificate.revokedAt).toLocaleDateString() : 'No'}</p>{certificate.revocationReason && <p className="sm:col-span-2">Revocation reason: {certificate.revocationReason}</p>}<Button asChild variant="outline" className="w-fit"><Link to={`/verify/${certificate.publicCertificateId}`}>Open public verification</Link></Button></CardContent></Card>
    <div><h2 className="mb-3 text-xl font-semibold text-slate-950">Audit history</h2>{audit.map((item) => <Card key={item.id} className="mb-3"><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-slate-500">{item.action.replace('_', ' ')} · {new Date(item.createdAt).toLocaleString()}</p><p className="mt-1 text-sm text-slate-700">{item.actorEmail ? `By ${item.actorEmail}` : 'System event'}{item.reason ? ` · ${item.reason}` : ''}</p></CardContent></Card>)}</div>
  </section></main>;
}

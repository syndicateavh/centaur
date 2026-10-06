import { lazy, Suspense } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import type { SessionUser } from '@centaur/lms-shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card.js';
import { Button } from './components/ui/button.js';
import { loadAdminDashboard, loadCurrentUser, loadLearnerDashboard, logout } from './lib/auth-api.js';
import { listMyCourses } from './lib/courses-api.js';
import { getAdminAnalyticsOverview, getAdminRecentActivity } from './lib/admin-analytics-api.js';

const LoginPage = lazy(() => import('./auth-pages.js').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./auth-pages.js').then((module) => ({ default: module.RegisterPage })));
const PublicCourseCataloguePage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.PublicCourseCataloguePage })));
const PublicCourseDetailsPage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.PublicCourseDetailsPage })));
const AdminCourseListPage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.AdminCourseListPage })));
const CourseEditorPage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.CourseEditorPage })));
const MyCoursesPage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.MyCoursesPage })));
const LearnerCoursePage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.LearnerCoursePage })));
const LearnerLessonPage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.LearnerLessonPage })));
const LearnerQuizPage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.LearnerQuizPage })));
const LearnerProfilePage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.LearnerProfilePage })));
const LearnerCertificatesPage = lazy(() => import('./certificate-pages.js').then((module) => ({ default: module.LearnerCertificatesPage })));
const PublicCertificateVerificationPage = lazy(() => import('./certificate-pages.js').then((module) => ({ default: module.PublicCertificateVerificationPage })));
const AdminCertificatesPage = lazy(() => import('./certificate-pages.js').then((module) => ({ default: module.AdminCertificatesPage })));
const AdminStudentsPage = lazy(() => import('./admin-pages.js').then((module) => ({ default: module.AdminStudentsPage })));
const AdminStudentDetailPage = lazy(() => import('./admin-pages.js').then((module) => ({ default: module.AdminStudentDetailPage })));
const AdminCourseAnalyticsPage = lazy(() => import('./admin-pages.js').then((module) => ({ default: module.AdminCourseAnalyticsPage })));
const AdminCourseDetailPage = lazy(() => import('./admin-pages.js').then((module) => ({ default: module.AdminCourseDetailPage })));
const AdminCertificateAuditPage = lazy(() => import('./admin-pages.js').then((module) => ({ default: module.AdminCertificateAuditPage })));
const AdminCertificateDetailPage = lazy(() => import('./admin-pages.js').then((module) => ({ default: module.AdminCertificateDetailPage })));

function PageLoading() {
  return <div className="grid min-h-screen place-items-center text-sm text-slate-600">Loading…</div>;
}

function LandingPage() {
  return <main className="min-h-screen">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
      <Link to="/" className="text-lg font-bold tracking-tight text-slate-950">Centaur <span className="text-sky-700">Learn</span></Link>
      <nav className="flex items-center gap-3"><Link className="px-3 py-2 text-sm font-medium text-slate-700" to="/courses">Courses</Link><Link className="px-3 py-2 text-sm font-medium text-slate-700" to="/login">Sign in</Link><Button asChild><Link to="/register">Get started</Link></Button></nav>
    </header>
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1.15fr_0.85fr] md:py-28">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Free Certification LMS</p>
        <h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-6xl">Learn useful skills. Earn your next opportunity.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Learn online at your own pace, pick up where you left off, and build skills with courses designed for real work.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Button size="lg" asChild><Link to="/courses">Explore courses</Link></Button><Button size="lg" variant="outline" asChild><Link to="/register">Create a free account</Link></Button></div>
      </div>
      <Card className="border-sky-100 bg-gradient-to-br from-white to-sky-50"><CardHeader className="p-7"><p className="text-sm font-semibold text-sky-700">Your learning, in one place</p><CardTitle className="text-2xl">A clear path from curious to capable</CardTitle><CardDescription>Build a steady learning habit with progress saved to your account.</CardDescription></CardHeader><CardContent className="px-7 pb-7"><ul className="space-y-4 text-sm text-slate-700"><li>✓ Learn on a schedule that works for you</li><li>✓ Return to your progress when you sign in</li><li>✓ Work toward course certificates</li></ul></CardContent></Card>
    </section>
    <footer className="border-t border-slate-200 px-5 py-6 text-center text-sm text-slate-500">Centaur Learn · Free online learning</footer>
  </main>;
}

function Dashboard({ user }: { user: SessionUser }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const coursesQuery = useQuery({ queryKey: ['myCourses'], queryFn: listMyCourses });
  const mutation = useMutation({ mutationFn: logout, onSuccess: async () => {
    queryClient.setQueryData(['me'], null);
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    await navigate('/', { replace: true });
  } });
  return <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8"><Link to="/" className="text-lg font-bold text-slate-950">Centaur <span className="text-sky-700">Learn</span></Link><div className="flex flex-wrap items-center gap-2"><Button asChild variant="outline"><Link to="/my-courses">My courses</Link></Button><Button asChild variant="outline"><Link to="/certificates">Certificates</Link></Button><Button asChild variant="outline"><Link to="/profile">Profile</Link></Button>{user.permissions.includes('admin:dashboard:view') && <Button asChild variant="outline"><Link to="/admin">Admin console</Link></Button>}<Button variant="outline" onClick={() => mutation.mutate()} disabled={mutation.isPending}>{mutation.isPending ? 'Signing out…' : 'Sign out'}</Button></div></div></header>
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8"><p className="text-sm font-semibold uppercase tracking-wider text-sky-700">Learner dashboard</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Welcome{user.displayName ? `, ${user.displayName}` : ''}</h1><p className="mt-2 text-slate-600">You’re signed in as {user.email}.</p>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-slate-600">Account created {new Date(user.createdAt).toLocaleDateString()}.</p><Button asChild><Link to="/courses">Explore courses</Link></Button></div>
      {coursesQuery.isError && <Card className="mt-5"><CardContent className="p-5 text-sm text-red-800">Your enrolled courses could not be loaded. Refresh to try again.</CardContent></Card>}
      {coursesQuery.data?.length === 0 && <Card className="mt-5"><CardHeader><CardTitle>Start learning</CardTitle><CardDescription>Enroll in a free course and it will appear here.</CardDescription></CardHeader><CardContent><Button asChild><Link to="/courses">Browse courses</Link></Button></CardContent></Card>}
      {Boolean(coursesQuery.data?.length) && <section className="mt-8"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold text-slate-950">Continue learning</h2><Button asChild size="sm" variant="outline"><Link to="/my-courses">All my courses</Link></Button></div><div className="grid gap-4 md:grid-cols-2">{coursesQuery.data?.slice(0, 4).map((course) => <Card key={course.enrollmentId}><CardHeader><CardTitle className="text-lg">{course.title}</CardTitle><CardDescription>{course.description || 'Continue your self-paced course.'}</CardDescription></CardHeader><CardContent className="flex items-center justify-between gap-3"><span className="text-sm text-slate-600">{course.lessonCount} {course.lessonCount === 1 ? 'lesson' : 'lessons'}</span><Button size="sm" asChild><Link to={`/learn/courses/${course.id}${course.continueLessonId ? `/lessons/${course.continueLessonId}` : ''}`}>{course.lastAccessedLessonId ? 'Continue' : course.lessonCount ? 'Start' : 'Open'}</Link></Button></CardContent></Card>)}</div></section>}
      {mutation.isError && <p role="alert" className="mt-4 text-sm text-red-700">Could not sign out. Please try again.</p>}
    </section>
  </main>;
}

function ProtectedDashboard() {
  const { data: user, isPending, isError } = useQuery({ queryKey: ['me'], queryFn: loadCurrentUser });
  const dashboard = useQuery({ queryKey: ['learnerDashboard'], queryFn: loadLearnerDashboard, enabled: Boolean(user) });
  if (isPending) return <PageLoading />;
  if (isError) return <main className="grid min-h-screen place-items-center px-5"><Card className="max-w-md"><CardHeader><CardTitle>We couldn’t load your account</CardTitle><CardDescription>Check your connection and try again.</CardDescription></CardHeader><CardContent><Button onClick={() => window.location.reload()}>Retry</Button></CardContent></Card></main>;
  if (!user) return <Navigate to="/login" replace />;
  if (dashboard.isPending) return <PageLoading />;
  if (dashboard.isError) return <AccessDenied />;
  return <Dashboard user={user} />;
}

function AccessDenied() {
  return <main className="grid min-h-screen place-items-center px-5"><Card className="max-w-md"><CardHeader><CardTitle>Access denied</CardTitle><CardDescription>Your account does not have permission to open this page.</CardDescription></CardHeader><CardContent><Button asChild variant="outline"><Link to="/dashboard">Return to learner dashboard</Link></Button></CardContent></Card></main>;
}

function AdminConsole({ user }: { user: SessionUser }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const canManage = user.permissions.includes('admin:courses:manage');
  const mutation = useMutation({ mutationFn: logout, onSuccess: async () => {
    queryClient.setQueryData(['me'], null);
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    await navigate('/', { replace: true });
  } });
  const overview = useQuery({ queryKey: ['adminAnalyticsOverview'], queryFn: getAdminAnalyticsOverview });
  const activity = useQuery({ queryKey: ['adminRecentActivity'], queryFn: getAdminRecentActivity });
  return <main className="min-h-screen bg-slate-50">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8"><Link to="/" className="text-lg font-bold text-slate-950">Centaur <span className="text-sky-700">Learn</span></Link><div className="flex items-center gap-3"><Button asChild variant="outline"><Link to="/dashboard">Learner view</Link></Button><Button variant="outline" onClick={() => mutation.mutate()} disabled={mutation.isPending}>Sign out</Button></div></div></header>
    <section className="mx-auto max-w-6xl space-y-8 px-5 py-12 sm:px-8"><div><p className="text-sm font-semibold uppercase tracking-wider text-violet-700">Administration</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Admin console</h1><p className="mt-2 text-slate-600">Signed in as {user.email}</p></div>
      {overview.isError && <Card><CardContent className="p-5 text-sm text-red-700">Analytics could not be loaded.</CardContent></Card>}
      {overview.data && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[
        ['Users', overview.data.users], ['Enrollments', overview.data.enrollments], [`Active learners · ${overview.data.activeLearnerWindowDays}d`, overview.data.activeLearners],
        ['Published courses', overview.data.publishedCourses], ['Completions', overview.data.completions], ['Valid certificates', `${overview.data.validCertificates} / ${overview.data.certificates}`],
      ].map(([label, value]) => <Card key={String(label)}><CardContent className="p-5"><p className="text-sm text-slate-600">{label}</p><p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p></CardContent></Card>)}</div>}
      {canManage && <div className="flex flex-wrap gap-2"><Button asChild><Link to="/admin/courses">Manage courses</Link></Button><Button asChild variant="outline"><Link to="/admin/analytics/courses">Course performance</Link></Button><Button asChild variant="outline"><Link to="/admin/students">Learners</Link></Button><Button asChild variant="outline"><Link to="/admin/certificates">Certificates</Link></Button><Button asChild variant="outline"><Link to="/admin/audit/certificates">Certificate audit</Link></Button></div>}
      <Card><CardHeader><CardTitle>Recent activity</CardTitle><CardDescription>Latest account, enrollment, completion, quiz, and certificate events.</CardDescription></CardHeader><CardContent className="space-y-3">{activity.isPending && <p className="text-sm text-slate-600">Loading activity…</p>}{activity.isError && <p className="text-sm text-red-700">Recent activity could not be loaded.</p>}{activity.data?.map((event) => <div key={`${event.type}-${event.id}`} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 last:border-0"><div><p className="text-sm font-medium text-slate-900">{event.title}</p><p className="text-sm text-slate-600">{event.subject}</p></div><time className="text-xs text-slate-500">{new Date(event.occurredAt).toLocaleString()}</time></div>)}{activity.data?.length === 0 && <p className="text-sm text-slate-600">No recorded activity yet.</p>}</CardContent></Card>
    </section>
  </main>;
}

function ProtectedAdminConsole() {
  const currentUser = useQuery({ queryKey: ['me'], queryFn: loadCurrentUser });
  const canAccess = currentUser.data?.permissions.includes('admin:dashboard:view') ?? false;
  const dashboard = useQuery({ queryKey: ['adminDashboard'], queryFn: loadAdminDashboard, enabled: currentUser.isSuccess && canAccess });
  if (currentUser.isPending) return <PageLoading />;
  if (currentUser.isError) return <PageLoading />;
  if (!currentUser.data) return <Navigate to="/login" replace />;
  if (!canAccess) return <AccessDenied />;
  if (dashboard.isPending) return <PageLoading />;
  if (dashboard.isError) return <AccessDenied />;
  return <AdminConsole user={dashboard.data.user} />;
}

export default function App() {
  return <Suspense fallback={<PageLoading />}><Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/courses" element={<PublicCourseCataloguePage />} />
    <Route path="/courses/:slug" element={<PublicCourseDetailsPage />} />
    <Route path="/dashboard" element={<ProtectedDashboard />} />
    <Route path="/my-courses" element={<MyCoursesPage />} />
    <Route path="/profile" element={<LearnerProfilePage />} />
    <Route path="/certificates" element={<LearnerCertificatesPage />} />
    <Route path="/verify/:publicCertificateId" element={<PublicCertificateVerificationPage />} />
    <Route path="/learn/courses/:courseId" element={<LearnerCoursePage />} />
    <Route path="/learn/courses/:courseId/lessons/:lessonId" element={<LearnerLessonPage />} />
    <Route path="/learn/courses/:courseId/quiz" element={<LearnerQuizPage />} />
    <Route path="/admin" element={<ProtectedAdminConsole />} />
    <Route path="/admin/courses" element={<AdminCourseListPage />} />
    <Route path="/admin/courses/:courseId" element={<CourseEditorPage />} />
    <Route path="/admin/certificates" element={<AdminCertificatesPage />} />
    <Route path="/admin/certificates/:certificateId" element={<AdminCertificateDetailPage />} />
    <Route path="/admin/students" element={<AdminStudentsPage />} />
    <Route path="/admin/students/:userId" element={<AdminStudentDetailPage />} />
    <Route path="/admin/analytics/courses" element={<AdminCourseAnalyticsPage />} />
    <Route path="/admin/analytics/courses/:courseId" element={<AdminCourseDetailPage />} />
    <Route path="/admin/audit/certificates" element={<AdminCertificateAuditPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense>;
}

import { lazy, Suspense } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import type { SessionUser } from '@centaur/lms-shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card.js';
import { Button } from './components/ui/button.js';
import { AdminLayout, CentaurBrand, PortalNav, PublicMenuBar } from './components/brand.js';
import { loadAdminDashboard, loadCurrentUser, loadLearnerDashboard, logout } from './lib/auth-api.js';
import { listMyCourses } from './lib/courses-api.js';
import { getAdminAnalyticsOverview, getAdminRecentActivity } from './lib/admin-analytics-api.js';

const LoginPage = lazy(() => import('./auth-pages.js').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./auth-pages.js').then((module) => ({ default: module.RegisterPage })));
const PublicCourseCataloguePage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.PublicCourseCataloguePage })));
const PublicCourseDetailsPage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.PublicCourseDetailsPage })));
const AdminCourseListPage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.AdminCourseListPage })));
const CourseEditorPage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.CourseEditorPage })));
const AdminCoursePreviewPage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.AdminCoursePreviewPage })));
const MyCoursesPage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.MyCoursesPage })));
const LearnerCoursePage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.LearnerCoursePage })));
const LearnerLessonPage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.LearnerLessonPage })));
const LearnerQuizPage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.LearnerQuizPage })));
const LearnerProfilePage = lazy(() => import('./course-pages.js').then((module) => ({ default: module.LearnerProfilePage })));
const LearnerCertificatesPage = lazy(() => import('./certificate-pages.js').then((module) => ({ default: module.LearnerCertificatesPage })));
const PublicCertificateVerificationPage = lazy(() => import('./certificate-pages.js').then((module) => ({ default: module.PublicCertificateVerificationPage })));
const AdminCertificatesPage = lazy(() => import('./certificate-pages.js').then((module) => ({ default: module.AdminCertificatesPage })));
const AdminStudentsPage = lazy(() => import('./admin-pages.js').then((module) => ({ default: module.AdminStudentsPage })));
const AdminEnrollmentsPage = lazy(() => import('./admin-pages.js').then((module) => ({ default: module.AdminEnrollmentsPage })));
const AdminStudentDetailPage = lazy(() => import('./admin-pages.js').then((module) => ({ default: module.AdminStudentDetailPage })));
const AdminMediaLibraryPage = lazy(() => import('./admin-pages.js').then((module) => ({ default: module.AdminMediaLibraryPage })));
const AdminCourseAnalyticsPage = lazy(() => import('./admin-pages.js').then((module) => ({ default: module.AdminCourseAnalyticsPage })));
const AdminCourseDetailPage = lazy(() => import('./admin-pages.js').then((module) => ({ default: module.AdminCourseDetailPage })));
const AdminCertificateAuditPage = lazy(() => import('./admin-pages.js').then((module) => ({ default: module.AdminCertificateAuditPage })));
const AdminCertificateDetailPage = lazy(() => import('./admin-pages.js').then((module) => ({ default: module.AdminCertificateDetailPage })));

function PageLoading() {
  return <div className="grid min-h-screen place-items-center text-sm text-slate-600">Loading…</div>;
}

function LandingPage() {
  return <main className="min-h-screen">
    <PublicMenuBar />
    <section className="landing-hero mx-auto mt-6 grid max-w-7xl items-center gap-10 px-5 py-10 sm:mt-8 sm:px-8 sm:py-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:px-14 lg:py-16">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="relative z-10 min-w-0">
        <p className="inline-flex items-center gap-2 rounded-full border border-red-200/30 bg-red-300/10 px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-red-100 sm:text-xs"><span className="size-2 rounded-full bg-red-300" />Free certification learning</p>
        <p className="mt-6 text-base font-semibold text-brand-gold sm:text-lg">Practical skills. A stronger next step.</p>
        <h1 className="mt-3 max-w-2xl text-[clamp(2.35rem,5.6vw,4.4rem)] font-bold leading-[1.02] tracking-tight text-white">Build skills that move your career forward.</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">Learn useful skills at your pace, track your progress, and earn certificates as you complete your courses.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button variant="gold" size="lg" asChild><Link to="/courses">Explore courses <span aria-hidden="true">→</span></Link></Button><Button size="lg" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild><Link to="/register">Create a free account</Link></Button></div>
        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/10 pt-5 text-sm text-white/75"><span className="flex items-center gap-2"><span className="text-brand-gold">✓</span> Self-paced courses</span><span className="flex items-center gap-2"><span className="text-brand-gold">✓</span> Progress saved as you learn</span><span className="flex items-center gap-2"><span className="text-brand-gold">✓</span> Shareable certificates</span></div>
      </div>
      <aside className="glass-panel relative z-10 p-5 sm:p-7" aria-label="Your learning path">
        <div className="flex items-center gap-3 border-b border-white/10 pb-5"><img className="size-11 rounded-full border border-white/20 bg-white object-cover" src="/brand/centaur-careers-logo.webp" alt="" width="96" height="96" /><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-gold">Centaur Careers Learning</p><p className="mt-1 text-sm text-white/60">A clear path from curious to capable</p></div></div>
        <ol className="py-5">{[
          ['01', 'Choose a course', 'Find a practical topic to build your skills.'],
          ['02', 'Learn by doing', 'Work through lessons and check your understanding.'],
          ['03', 'Earn your certificate', 'Complete course requirements and save your achievement.'],
        ].map(([number, title, description], index) => <li key={number} className="relative flex gap-4 pb-5 last:pb-0"><span className="relative z-10 grid size-9 shrink-0 place-items-center rounded-xl border border-brand-gold/50 bg-brand-gold/10 text-xs font-bold text-brand-gold">{number}</span><div className="min-w-0 pt-0.5"><p className="font-semibold text-white">{title}</p><p className="mt-1 text-sm leading-6 text-white/60">{description}</p></div>{index < 2 && <span className="absolute bottom-0 left-[1.08rem] top-9 w-px bg-white/15" aria-hidden="true" />}</li>)}
        </ol>
        <div className="flex flex-wrap gap-2 border-t border-white/10 pt-5">{['Lessons', 'Quizzes', 'Certificates'].map((item) => <span key={item} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75">{item}</span>)}</div>
      </aside>
    </section>
    <footer className="mx-auto mt-8 max-w-7xl border-t border-paper-line px-5 py-6 text-center text-sm text-slate-500">© {new Date().getFullYear()} Centaur Careers · Learn at your own pace</footer>
  </main>;
}

function Dashboard({ user }: { user: SessionUser }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const coursesQuery = useQuery({ queryKey: ['myCourses'], queryFn: listMyCourses });
  const nextCourse = coursesQuery.data?.find((course) => !course.isCompleted) ?? coursesQuery.data?.[0];
  const mutation = useMutation({ mutationFn: logout, onSuccess: async () => {
    queryClient.setQueryData(['me'], null);
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    await navigate('/', { replace: true });
  } });
  return <main className="min-h-screen bg-paper">
      <header className="app-header"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8"><CentaurBrand /><div className="flex flex-wrap items-center gap-2">{user.permissions.includes('admin:dashboard:view') && <Button asChild variant="outline"><Link to="/admin">Admin</Link></Button>}<Button variant="outline" onClick={() => mutation.mutate()} disabled={mutation.isPending}>{mutation.isPending ? 'Signing out…' : 'Sign out'}</Button></div></div><div className="mx-auto max-w-7xl px-4 sm:px-8"><PortalNav /></div></header>
    <section className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12"><div className="mb-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Learner dashboard</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Welcome{user.displayName ? `, ${user.displayName}` : ''}</h1><p className="mt-2 text-slate-600">You’re signed in as {user.email}.</p></div>
      {coursesQuery.data && coursesQuery.data.length > 0 && <div className="mb-7 grid gap-3 sm:grid-cols-3"><Card><CardContent className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Enrolled courses</p><p className="mt-2 text-2xl font-bold text-slate-950">{coursesQuery.data.length}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Required lessons completed</p><p className="mt-2 text-2xl font-bold text-slate-950">{coursesQuery.data.reduce((total, course) => total + course.completedRequiredLessonCount, 0)}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Courses completed</p><p className="mt-2 text-2xl font-bold text-slate-950">{coursesQuery.data.filter((course) => course.isCompleted).length}</p></CardContent></Card></div>}
      <div className="dashboard-feature mb-8 flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center sm:p-8"><div className="relative z-10"><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">Keep your momentum</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{nextCourse ? 'Your next lesson is one click away.' : 'Start learning something new.'}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/65">{nextCourse ? 'Pick up where you left off, or explore the course catalogue to build another skill.' : 'Choose a practical course, work through lessons, and track your progress as you go.'}</p></div><div className="relative z-10 flex shrink-0 flex-wrap gap-3"><Button variant="gold" asChild><Link to={nextCourse ? `/learn/courses/${nextCourse.id}${nextCourse.continueLessonId ? `/lessons/${nextCourse.continueLessonId}` : ''}` : '/courses'}>{nextCourse ? 'Continue learning' : 'Explore courses'}</Link></Button><Button variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild><Link to="/courses">Course catalogue</Link></Button></div></div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-slate-600">Account created {new Date(user.createdAt).toLocaleDateString()}.</p><Button asChild><Link to="/courses">Explore courses</Link></Button></div>
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
  const canManage = user.permissions.includes('admin:courses:manage');
  const overview = useQuery({ queryKey: ['adminAnalyticsOverview'], queryFn: getAdminAnalyticsOverview });
  const activity = useQuery({ queryKey: ['adminRecentActivity'], queryFn: getAdminRecentActivity });
  return <main className="min-h-screen bg-paper">
    <section className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8 sm:py-10"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Administration</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Admin console</h1><p className="mt-2 text-slate-600">Signed in as {user.email}</p></div>
      {overview.isError && <Card><CardContent className="p-5 text-sm text-red-700">Analytics could not be loaded.</CardContent></Card>}
      {overview.data && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[
        ['Students', overview.data.students], ['Enrollments', overview.data.enrollments], [`Active learners · ${overview.data.activeLearnerWindowDays}d`, overview.data.activeLearners],
        ['Published courses', overview.data.publishedCourses], ['Completions', overview.data.completions], ['Valid certificates', `${overview.data.validCertificates} / ${overview.data.certificates}`],
      ].map(([label, value]) => <Card key={String(label)}><CardContent className="p-5"><p className="text-sm text-slate-600">{label}</p><p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p></CardContent></Card>)}</div>}
      {canManage && <div className="flex flex-wrap gap-2"><Button asChild><Link to="/admin/courses">Manage courses</Link></Button><Button asChild variant="outline"><Link to="/admin/media">Media library</Link></Button><Button asChild variant="outline"><Link to="/admin/students">Learners</Link></Button><Button asChild variant="outline"><Link to="/admin/enrollments">Enrollments</Link></Button><Button asChild variant="outline"><Link to="/admin/analytics">Analytics</Link></Button><Button asChild variant="outline"><Link to="/admin/certificates">Certificates</Link></Button><Button asChild variant="outline"><Link to="/admin/audit/certificates">Certificate audit</Link></Button></div>}
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
    <Route path="/admin" element={<AdminLayout><ProtectedAdminConsole /></AdminLayout>} />
    <Route path="/admin/courses" element={<AdminLayout><AdminCourseListPage /></AdminLayout>} />
    <Route path="/admin/courses/:courseId/preview" element={<AdminLayout><AdminCoursePreviewPage /></AdminLayout>} />
    <Route path="/admin/courses/:courseId" element={<AdminLayout><CourseEditorPage /></AdminLayout>} />
    <Route path="/admin/media" element={<AdminLayout><AdminMediaLibraryPage /></AdminLayout>} />
    <Route path="/admin/certificates" element={<AdminLayout><AdminCertificatesPage /></AdminLayout>} />
    <Route path="/admin/certificates/:certificateId" element={<AdminLayout><AdminCertificateDetailPage /></AdminLayout>} />
    <Route path="/admin/students" element={<AdminLayout><AdminStudentsPage /></AdminLayout>} />
    <Route path="/admin/students/:userId" element={<AdminLayout><AdminStudentDetailPage /></AdminLayout>} />
    <Route path="/admin/enrollments" element={<AdminLayout><AdminEnrollmentsPage /></AdminLayout>} />
    <Route path="/admin/analytics" element={<AdminLayout><AdminCourseAnalyticsPage /></AdminLayout>} />
    <Route path="/admin/analytics/courses" element={<AdminLayout><AdminCourseAnalyticsPage /></AdminLayout>} />
    <Route path="/admin/analytics/courses/:courseId" element={<AdminLayout><AdminCourseDetailPage /></AdminLayout>} />
    <Route path="/admin/audit/certificates" element={<AdminLayout><AdminCertificateAuditPage /></AdminLayout>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense>;
}

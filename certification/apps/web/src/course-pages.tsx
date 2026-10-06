import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState, type ChangeEventHandler, type FormEvent, type ReactNode } from 'react';
import type Hls from 'hls.js';
import { ApiRequestError, getApiBaseUrl, loadCurrentUser } from './lib/auth-api.js';
import {
  changeCourseStatus, createCourse, createLesson, createModule, deleteCourse, deleteLesson, deleteModule,
  abortMediaUpload, completeMediaUpload, enrollInCourse, getAdminCourse, getAdminQuiz, getEnrolledCourse, getLearnerProfile, getLessonPlaybackMedia, getMediaUploadPartUrl, getLearnerQuiz, getPublishedCourse, listAdminCourses, listCourses, listLessonMedia, listMyCourses, openLearnerLesson, reorderLessons, reorderModules, retryMediaProcessing, saveAdminQuiz, startMediaUpload, submitLearnerQuiz,
  getAdminLessonMediaPreview,
  updateCourse, updateLesson, updateModule,
  getLessonProgress, markLessonComplete, recordVideoProgress,
  type AdminQuizResponse, type CourseInput, type CourseModuleRecord, type CourseRecord, type CourseStatus, type EnrolledCourse, type EnrolledCourseSummary, type LearnerLesson, type LessonInput, type LessonProgress, type MediaAssetSummary, type ModuleInput, type QuizAttemptResult, type QuizDraft, type QuizQuestionDraft, type QuizQuestionType, type QuizSubmission,
} from './lib/courses-api.js';
import { Button } from './components/ui/button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card.js';
import { CentaurBrand, PortalNav } from './components/brand.js';

function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  const admin = eyebrow.startsWith('Admin');
  if (admin) return <header className="admin-page-header border-b border-paper-line bg-white px-5 py-5 sm:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">{eyebrow}</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{title}</h1></div>{children}</div></header>;
  return <header className="app-header"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8"><div><CentaurBrand /><p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">{eyebrow}</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{title}</h1></div>{children}</div><div className="mx-auto max-w-7xl px-4 sm:px-8"><PortalNav admin={admin} /></div></header>;
}

function FormInput({ label, name, type = 'text', defaultValue, value, onChange, required = false, disabled = false, min, max, minLength, maxLength }: { label: string; name: string; type?: string; defaultValue?: string | number; value?: string; onChange?: ChangeEventHandler<HTMLInputElement>; required?: boolean; disabled?: boolean; min?: number; max?: number; minLength?: number; maxLength?: number }) {
  return <label className="block space-y-1.5 text-sm font-medium text-slate-800">{label}<input name={name} type={type} {...(value === undefined ? { defaultValue } : { value })} onChange={onChange} required={required} disabled={disabled} min={min} max={max} minLength={minLength} maxLength={maxLength} className="min-h-10 w-full rounded-lg border border-paper-line-strong px-3 text-sm font-normal outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-paper-muted" /></label>;
}

function FormTextarea({ label, name, defaultValue, rows = 3, disabled = false }: { label: string; name: string; defaultValue?: string | null; rows?: number; disabled?: boolean }) {
  return <label className="block space-y-1.5 text-sm font-medium text-slate-800">{label}<textarea name={name} defaultValue={defaultValue ?? ''} rows={rows} disabled={disabled} className="w-full rounded-lg border border-paper-line-strong px-3 py-2 text-sm font-normal outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-paper-muted" /></label>;
}

function FormCheckbox({ label, name, defaultChecked = false, checked, disabled = false, onChange }: { label: string; name: string; defaultChecked?: boolean; checked?: boolean; disabled?: boolean; onChange?: ChangeEventHandler<HTMLInputElement> }) {
  return <label className={`flex items-start gap-2 text-sm ${disabled ? 'cursor-not-allowed text-slate-500' : 'text-slate-700'}`}><input name={name} type="checkbox" {...(checked === undefined ? { defaultChecked } : { checked })} disabled={disabled} onChange={onChange} className="mt-0.5 size-4 accent-brand-700 disabled:opacity-50" />{label}</label>;
}

function getCourseInput(form: HTMLFormElement): CourseInput {
  const data = new FormData(form);
  return {
    title: String(data.get('title') ?? '').trim(),
    slug: String(data.get('slug') ?? '').trim(),
    description: String(data.get('description') ?? '').trim() || null,
    certificateEnabled: form.elements.namedItem('certificateEnabled') instanceof HTMLInputElement && (form.elements.namedItem('certificateEnabled') as HTMLInputElement).checked,
    quizEnabled: form.elements.namedItem('quizEnabled') instanceof HTMLInputElement && (form.elements.namedItem('quizEnabled') as HTMLInputElement).checked,
    quizRequired: form.elements.namedItem('quizRequired') instanceof HTMLInputElement && (form.elements.namedItem('quizRequired') as HTMLInputElement).checked,
    quizPassPercent: Number(data.get('quizPassPercent') ?? 70),
    videoCompletionPercent: Number(data.get('videoCompletionPercent') ?? 90),
    textCompletionMode: String(data.get('textCompletionMode') ?? 'manual') as CourseInput['textCompletionMode'],
  };
}

function getModuleInput(form: HTMLFormElement): ModuleInput {
  const data = new FormData(form);
  return { title: String(data.get('title') ?? '').trim(), description: String(data.get('description') ?? '').trim() || null };
}

function getLessonInput(form: HTMLFormElement): LessonInput {
  const data = new FormData(form);
  const requiredInput = form.elements.namedItem('required');
  return {
    title: String(data.get('title') ?? '').trim(),
    description: String(data.get('description') ?? '').trim() || null,
    type: String(data.get('type') ?? 'TEXT') as LessonInput['type'],
    content: String(data.get('content') ?? '').trim() || null,
    required: requiredInput instanceof HTMLInputElement && requiredInput.checked,
  };
}

function ErrorNotice({ error }: { error: unknown }) {
  const message = error instanceof ApiRequestError ? error.message : 'The request could not be completed. Please try again.';
  return <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p>;
}

function LoadingMessage() { return <div className="mx-auto max-w-6xl px-5 py-12 text-sm text-slate-600">Loading courses…</div>; }

export function PublicCourseCataloguePage() {
  const coursesQuery = useQuery({ queryKey: ['courses'], queryFn: listCourses });
  return <main className="min-h-screen bg-paper"><PageHeader eyebrow="Explore" title="Courses"><Button asChild variant="outline"><Link to="/">Home</Link></Button></PageHeader><section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
    {coursesQuery.isPending && <LoadingMessage />}
    {coursesQuery.isError && <ErrorNotice error={coursesQuery.error} />}
    {coursesQuery.data?.length === 0 && <Card><CardContent className="p-6 text-sm text-slate-600">No courses are published yet. Please check again soon.</CardContent></Card>}
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{coursesQuery.data?.map((course) => <Card key={course.id}><CardHeader><p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Published course</p><CardTitle>{course.title}</CardTitle><CardDescription>{course.description || 'Explore this free course and its learning outline.'}</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between gap-3 text-sm text-slate-600"><span>{course.certificateEnabled ? 'Certificate enabled' : 'Self-paced course'}</span><Button asChild size="sm" variant="outline"><Link to={`/courses/${course.slug}`}>View course</Link></Button></div></CardContent></Card>)}</div>
  </section></main>;
}

export function PublicCourseDetailsPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userQuery = useQuery({ queryKey: ['me'], queryFn: loadCurrentUser });
  const courseQuery = useQuery({ queryKey: ['publishedCourse', slug], queryFn: () => getPublishedCourse(slug), enabled: Boolean(slug) });
  const myCoursesQuery = useQuery({ queryKey: ['myCourses'], queryFn: listMyCourses, enabled: Boolean(userQuery.data) });
  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => enrollInCourse(courseId),
    onSuccess: async (_result, courseId) => {
      await queryClient.invalidateQueries({ queryKey: ['myCourses'] });
      await navigate(`/learn/courses/${courseId}`);
    },
  });
  if (courseQuery.isPending) return <LoadingMessage />;
  if (courseQuery.isError) return <main className="mx-auto max-w-3xl px-5 py-12"><ErrorNotice error={courseQuery.error} /><Button className="mt-5" asChild variant="outline"><Link to="/courses">Back to courses</Link></Button></main>;
  const course = courseQuery.data;
  const enrollment = myCoursesQuery.data?.find((item) => item.id === course.id);
  return <main className="min-h-screen bg-paper"><PageHeader eyebrow="Course overview" title={course.title}><Button asChild variant="outline"><Link to="/courses">All courses</Link></Button></PageHeader><section className="mx-auto max-w-4xl space-y-5 px-5 py-10 sm:px-8"><Card><CardHeader><CardDescription>{course.description || 'Course outline'}</CardDescription><CardTitle className="text-xl">What you’ll learn</CardTitle></CardHeader><CardContent className="space-y-5">{course.modules.map((module) => <section key={module.id} className="rounded-xl border border-paper-line p-4"><h2 className="font-semibold text-slate-950">{module.title}</h2>{module.description && <p className="mt-1 text-sm text-slate-600">{module.description}</p>}<ul className="mt-3 space-y-2">{module.lessons.map((lesson) => <li key={lesson.id} className="flex items-center justify-between gap-3 text-sm text-slate-700"><span>{lesson.title}</span><span className="text-xs text-slate-500">{lesson.type} · {lesson.required ? 'Required' : 'Optional'}{enrollment && enrollment.continueLessonId === lesson.id ? ' · Current' : enrollment ? ' · Available' : ' · Locked'}</span></li>)}</ul></section>)}{course.certificateEnabled && <p className="text-sm font-medium text-brand-800">Certificate available on eligible completion.</p>}<div className="flex flex-wrap items-center gap-3">{!userQuery.data && <Button asChild><Link to="/login">Sign in to enroll</Link></Button>}{userQuery.data && enrollment && <Button asChild><Link to={`/learn/courses/${course.id}`}>Continue learning</Link></Button>}{userQuery.data && !enrollment && <Button onClick={() => enrollMutation.mutate(course.id)} disabled={enrollMutation.isPending || myCoursesQuery.isPending || myCoursesQuery.isError}>{enrollMutation.isPending ? 'Enrolling…' : 'Enroll for free'}</Button>}{myCoursesQuery.isError && <ErrorNotice error={myCoursesQuery.error} />}{enrollMutation.isError && <ErrorNotice error={enrollMutation.error} />}</div></CardContent></Card></section></main>;
}

function LearnerAccess({ children }: { children: ReactNode }) {
  const userQuery = useQuery({ queryKey: ['me'], queryFn: loadCurrentUser });
  if (userQuery.isPending) return <LoadingMessage />;
  if (userQuery.isError) return <main className="mx-auto max-w-3xl px-5 py-12"><ErrorNotice error={userQuery.error} /></main>;
  if (!userQuery.data) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function MyCoursesPage() {
  return <LearnerAccess><MyCourses /></LearnerAccess>;
}

function MyCourses() {
  const coursesQuery = useQuery({ queryKey: ['myCourses'], queryFn: listMyCourses });
  return <main className="min-h-screen bg-paper"><PageHeader eyebrow="Your learning" title="My courses"><div className="flex gap-2"><Button asChild variant="outline"><Link to="/dashboard">Dashboard</Link></Button><Button asChild><Link to="/courses">Explore courses</Link></Button></div></PageHeader><section className="mx-auto max-w-6xl space-y-5 px-5 py-10 sm:px-8">
    {coursesQuery.isPending && <LoadingMessage />}{coursesQuery.isError && <ErrorNotice error={coursesQuery.error} />}
    {coursesQuery.data?.length === 0 && <Card><CardHeader><CardTitle>No enrolled courses yet</CardTitle><CardDescription>Choose a published course to start learning. Your course will appear here.</CardDescription></CardHeader><CardContent><Button asChild><Link to="/courses">Browse courses</Link></Button></CardContent></Card>}
    <div className="grid gap-5 md:grid-cols-2">{coursesQuery.data?.map((course: EnrolledCourseSummary) => <Card key={course.enrollmentId}><CardHeader><p className="text-xs font-semibold uppercase tracking-wider text-brand-700">{course.isCompleted ? 'Course completed' : `Enrolled ${new Date(course.enrolledAt).toLocaleDateString()}`}</p><CardTitle>{course.title}</CardTitle><CardDescription>{course.description || 'Continue your self-paced course.'}</CardDescription></CardHeader><CardContent><div className="mb-2 flex justify-between text-sm text-slate-600"><span>{course.completedRequiredLessonCount} of {course.requiredLessonCount} required lessons</span><span>{course.progressPercent}%</span></div><div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-brand-700" style={{ width: `${course.progressPercent}%` }} /></div>{course.completionBlockedByQuiz && <p className="mb-4 text-sm text-amber-900">Pass the required quiz to complete this course.</p>}<div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600"><span>{course.lessonCount} {course.lessonCount === 1 ? 'lesson' : 'lessons'}</span>{course.lastAccessedAt && <span>Last opened {new Date(course.lastAccessedAt).toLocaleDateString()}</span>}{course.certificateEnabled && <span>Certificate enabled</span>}</div><div className="flex flex-wrap gap-2"><Button asChild><Link to={`/learn/courses/${course.id}${course.continueLessonId ? `/lessons/${course.continueLessonId}` : ''}`}>{course.isCompleted ? 'Review course' : course.lastAccessedLessonId ? 'Continue learning' : course.lessonCount ? 'Start learning' : 'View course'}</Link></Button>{course.completionBlockedByQuiz && <Button asChild variant="outline"><Link to={`/learn/courses/${course.id}/quiz`}>Take required quiz</Link></Button>}</div></CardContent></Card>)}</div>
  </section></main>;
}

function LearnerCourseUnavailable({ error }: { error: unknown }) {
  const forbidden = error instanceof ApiRequestError && error.status === 403;
  return <main className="min-h-screen bg-paper"><PageHeader eyebrow="Learning" title={forbidden ? 'Enrollment required' : 'Course unavailable'}><Button asChild variant="outline"><Link to="/courses">Course catalogue</Link></Button></PageHeader><section className="mx-auto max-w-3xl px-5 py-10"><Card><CardHeader><CardTitle>{forbidden ? 'Enroll to access this course' : 'We could not open this course'}</CardTitle><CardDescription>{forbidden ? 'Enroll in this published course before opening its lessons.' : 'The course may have been unpublished or removed.'}</CardDescription></CardHeader><CardContent><Button asChild><Link to="/courses">Browse courses</Link></Button></CardContent></Card></section></main>;
}

export function LearnerCoursePage() {
  return <LearnerAccess><LearnerCourse /></LearnerAccess>;
}

function LearnerCourse() {
  const { courseId = '' } = useParams();
  const courseQuery = useQuery({ queryKey: ['enrolledCourse', courseId], queryFn: () => getEnrolledCourse(courseId), enabled: Boolean(courseId) });
  if (courseQuery.isPending) return <LoadingMessage />;
  if (courseQuery.isError) return <LearnerCourseUnavailable error={courseQuery.error} />;
  const course: EnrolledCourse = courseQuery.data;
  const lessonCount = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  return <main className="min-h-screen bg-paper"><PageHeader eyebrow="Your course" title={course.title}><div className="flex gap-2"><Button asChild variant="outline"><Link to="/my-courses">My courses</Link></Button><Button asChild variant="outline"><Link to={`/courses/${course.slug}`}>Course overview</Link></Button></div></PageHeader><section className="mx-auto max-w-5xl space-y-5 px-5 py-10 sm:px-8"><Card><CardHeader><CardTitle>Course outline</CardTitle><CardDescription>{course.description || `You are enrolled in this course with ${lessonCount} lessons.`}</CardDescription></CardHeader><CardContent className="space-y-5"><div className="flex items-center justify-between text-sm text-slate-600"><span>{course.completedRequiredLessonCount} / {course.requiredLessonCount} required lessons</span><span>{course.progressPercent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-brand-700" style={{ width: `${course.progressPercent}%` }} /></div>{course.completionBlockedByQuiz && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Required lessons are complete. Pass the course quiz to complete this course.</p>}{course.isCompleted && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">Course completed.</p>}{course.modules.length === 0 && <p className="text-sm text-slate-600">This course has no modules yet.</p>}{course.modules.map((module, moduleIndex) => <section key={module.id} className="rounded-xl border border-paper-line p-4"><h2 className="font-semibold text-slate-950">Module {moduleIndex + 1}: {module.title}</h2>{module.description && <p className="mt-1 text-sm text-slate-600">{module.description}</p>}<ul className="mt-3 space-y-2">{module.lessons.map((lesson) => <li key={lesson.id}><Link className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-sm text-slate-800 hover:bg-brand-50" to={`/learn/courses/${course.id}/lessons/${lesson.id}`}><span>{lesson.title}</span><span className="shrink-0 text-xs text-brand-800">{lesson.progressStatus === 'completed' ? 'Completed' : lesson.id === course.currentLessonId ? 'Current' : `${lesson.type} · Available`}</span></Link></li>)}</ul></section>)}{course.currentLessonId && <Button asChild><Link to={`/learn/courses/${course.id}/lessons/${course.currentLessonId}`}>Continue learning</Link></Button>}{course.quizEnabled && <Button variant="outline" asChild><Link to={`/learn/courses/${course.id}/quiz`}>{course.quizRequired ? 'Take required quiz' : 'Take optional quiz'}</Link></Button>}</CardContent></Card></section></main>;
}

export function LearnerLessonPage() {
  return <LearnerAccess><LearnerLesson /></LearnerAccess>;
}

function LessonMediaPlayer({ courseId, lessonId, type, progress, onProgress }: { courseId: string; lessonId: string; type: 'VIDEO' | 'PDF'; progress: LessonProgress; onProgress: (progress: LessonProgress) => void }) {
  const mediaQuery = useQuery({ queryKey: ['lessonPlaybackMedia', courseId, lessonId], queryFn: () => getLessonPlaybackMedia(courseId, lessonId) });
  if (mediaQuery.isPending) return <div className="grid min-h-64 place-items-center rounded-xl bg-slate-950 text-sm text-white">Loading media…</div>;
  if (mediaQuery.isError) return <div role="status" className="grid min-h-64 place-items-center rounded-xl border border-dashed border-paper-line-strong bg-white p-6 text-center"><div><p className="font-medium text-slate-900">Media is not ready yet</p><p className="mt-2 max-w-md text-sm text-slate-600">The course team may still be processing this file. Please try again shortly.</p><Button className="mt-4" variant="outline" onClick={() => void mediaQuery.refetch()}>Check again</Button></div></div>;
  if (mediaQuery.data.kind !== type) return <ErrorNotice error={new Error('The media type does not match this lesson.')} />;
  if (type === 'PDF') return <iframe title="PDF lesson" src={mediaQuery.data.url} className="h-[75vh] min-h-96 w-full rounded-xl border border-paper-line bg-white" />;
  return <VideoMediaPlayer courseId={courseId} lessonId={lessonId} url={mediaQuery.data.url} initialPositionSeconds={progress.lastPositionSeconds} onProgress={onProgress} {...(mediaQuery.data.posterUrl ? { posterUrl: mediaQuery.data.posterUrl } : {})} />;
}

function VideoMediaPlayer({ courseId, lessonId, url, posterUrl, initialPositionSeconds, onProgress }: { courseId: string; lessonId: string; url: string; posterUrl?: string; initialPositionSeconds: number; onProgress: (progress: LessonProgress) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef(initialPositionSeconds);
  const initializedRef = useRef(false);
  const pendingRef = useRef(false);
  const lastSampleAtRef = useRef(0);
  const [playbackError, setPlaybackError] = useState(false);
  const queryClient = useQueryClient();
  useEffect(() => { cursorRef.current = initialPositionSeconds; }, [initialPositionSeconds]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setPlaybackError(false);
    const manifestUrl = `${getApiBaseUrl()}${url}`;
    let active = true;
    let hls: Hls | undefined;
    const initializePosition = () => {
      if (initializedRef.current || !video.duration || !Number.isFinite(video.duration)) return;
      video.currentTime = Math.min(initialPositionSeconds, Math.max(0, video.duration - 1));
      cursorRef.current = video.currentTime;
      lastSampleAtRef.current = video.currentTime;
      initializedRef.current = true;
    };
    video.addEventListener('loadedmetadata', initializePosition);
    const record = async (positionSeconds: number) => {
      if (pendingRef.current || !initializedRef.current) return;
      pendingRef.current = true;
      const fromPositionSeconds = cursorRef.current;
      try {
        const progress = await recordVideoProgress(courseId, lessonId, fromPositionSeconds, positionSeconds);
        cursorRef.current = progress.lastPositionSeconds;
        onProgress(progress);
        if (progress.status === 'completed') {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['myCourses'] }),
            queryClient.invalidateQueries({ queryKey: ['enrolledCourse', courseId] }),
          ]);
        }
      } catch {
        // Keep the last acknowledged server cursor; the next heartbeat retries from it.
      } finally {
        pendingRef.current = false;
      }
    };
    const handlePlay = () => { lastSampleAtRef.current = video.currentTime; void record(video.currentTime); };
    const handleTimeUpdate = () => {
      if (video.paused || video.seeking || !initializedRef.current) return;
      if (video.currentTime - lastSampleAtRef.current >= 8) {
        lastSampleAtRef.current = video.currentTime;
        void record(video.currentTime);
      }
    };
    const handleSeeked = () => {
      if (!video.paused && initializedRef.current) {
        lastSampleAtRef.current = video.currentTime;
        void record(video.currentTime);
      }
    };
    const handlePause = () => {
      if (initializedRef.current && video.currentTime > cursorRef.current) void record(video.currentTime);
    };
    video.addEventListener('play', handlePlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('pause', handlePause);
    void import('hls.js/light').then(({ default: HlsLibrary }) => {
      if (!active) return;
      if (!HlsLibrary.isSupported()) {
        setPlaybackError(true);
        return;
      }
      const apiOrigin = new URL(getApiBaseUrl()).origin;
      const instance = new HlsLibrary({ xhrSetup: (xhr, requestUrl) => { xhr.withCredentials = new URL(requestUrl).origin === apiOrigin; } });
      hls = instance;
      instance.loadSource(manifestUrl);
      instance.attachMedia(video);
      instance.on(HlsLibrary.Events.ERROR, (_event, data) => { if (data.fatal) setPlaybackError(true); });
    }).catch(() => { if (active) setPlaybackError(true); });
    return () => {
      active = false;
      hls?.destroy();
      video.removeEventListener('loadedmetadata', initializePosition);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('pause', handlePause);
    };
  }, [url, courseId, lessonId, onProgress, queryClient]);
  return <div className="space-y-3"><video ref={videoRef} controls playsInline poster={posterUrl} className="aspect-video w-full rounded-xl bg-black" />{playbackError && <p role="alert" className="text-sm text-red-700">Video playback failed. Refresh the lesson and try again.</p>}</div>;
}

function LearnerLesson() {
  const { courseId = '', lessonId = '' } = useParams();
  const queryClient = useQueryClient();
  const lessonQuery = useQuery({ queryKey: ['learnerLesson', courseId, lessonId], queryFn: async () => {
    const lesson = await openLearnerLesson(courseId, lessonId);
    if (lesson.progress) queryClient.setQueryData(['lessonProgress', courseId, lessonId], lesson.progress);
    await queryClient.invalidateQueries({ queryKey: ['myCourses'] });
    return lesson;
  }, enabled: Boolean(courseId && lessonId) });
  const progressQuery = useQuery({ queryKey: ['lessonProgress', courseId, lessonId], queryFn: () => getLessonProgress(courseId, lessonId), enabled: Boolean(courseId && lessonId) });
  const courseQuery = useQuery({ queryKey: ['enrolledCourse', courseId], queryFn: () => getEnrolledCourse(courseId), enabled: Boolean(courseId) });
  const completeMutation = useMutation({ mutationFn: () => markLessonComplete(courseId, lessonId), onSuccess: async (progress) => {
    queryClient.setQueryData(['lessonProgress', courseId, lessonId], progress);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['myCourses'] }),
      queryClient.invalidateQueries({ queryKey: ['enrolledCourse', courseId] }),
    ]);
  } });
  const updateProgress = useCallback((progress: LessonProgress) => {
    queryClient.setQueryData(['lessonProgress', courseId, lessonId], progress);
  }, [queryClient, courseId, lessonId]);
  if (lessonQuery.isPending || courseQuery.isPending || progressQuery.isPending) return <LoadingMessage />;
  if (lessonQuery.isError) return <LearnerCourseUnavailable error={lessonQuery.error} />;
  if (courseQuery.isError) return <LearnerCourseUnavailable error={courseQuery.error} />;
  if (progressQuery.isError) return <main className="mx-auto max-w-3xl px-5 py-12"><ErrorNotice error={progressQuery.error} /></main>;
  const lesson: LearnerLesson = lessonQuery.data;
  const progress = progressQuery.data;
  const course = courseQuery.data;
  const orderedLessons = course.modules.flatMap((module) => module.lessons);
  const currentIndex = orderedLessons.findIndex((item) => item.id === lesson.id);
  const previous = orderedLessons[currentIndex - 1];
  const next = orderedLessons[currentIndex + 1];
  return <main className="min-h-screen bg-paper"><PageHeader eyebrow={lesson.moduleTitle} title={lesson.courseTitle}><div className="flex gap-2"><Button asChild variant="outline"><Link to="/my-courses">My courses</Link></Button><Button asChild variant="outline"><Link to={`/learn/courses/${course.id}`}>Outline</Link></Button></div></PageHeader><section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
    <div className="space-y-5"><Card><CardHeader><p className="text-xs font-semibold uppercase tracking-wider text-brand-700">{lesson.type} lesson{lesson.required ? ' · Required' : ''}</p><CardTitle className="text-2xl">{lesson.title}</CardTitle><CardDescription>{lesson.description || `Opened ${new Date(lesson.accessedAt).toLocaleString()}`}</CardDescription></CardHeader><CardContent>
      {lesson.type === 'TEXT' ? <article className="min-h-48 whitespace-pre-wrap break-words rounded-xl bg-white p-4 text-base leading-7 text-slate-800">{lesson.content || 'This lesson does not have text content yet.'}</article> : <LessonMediaPlayer courseId={course.id} lessonId={lesson.id} type={lesson.type} progress={progress} onProgress={updateProgress} />}
      {lesson.type !== 'VIDEO' && <div className="mt-4 flex flex-wrap items-center gap-3"><Button disabled={progress.status === 'completed' || completeMutation.isPending || (lesson.type === 'TEXT' && lesson.progress?.status === 'completed')} onClick={() => completeMutation.mutate()}>{progress.status === 'completed' ? 'Lesson completed' : completeMutation.isPending ? 'Saving…' : 'Mark lesson complete'}</Button>{lesson.type === 'PDF' && <span className="text-xs text-slate-500">PDF completion is confirmed manually after reading.</span>}{lesson.type === 'TEXT' && <span className="text-xs text-slate-500">{lesson.progress?.status === 'completed' ? 'This lesson completes when opened.' : 'Read the lesson, then mark it complete.'}</span>}</div>}
      {completeMutation.isError && <ErrorNotice error={completeMutation.error} />}
      <div className="mt-6 flex flex-wrap justify-between gap-3">{previous ? <Button asChild variant="outline"><Link to={`/learn/courses/${course.id}/lessons/${previous.id}`}>Previous lesson</Link></Button> : <span />}{next && <Button asChild><Link to={`/learn/courses/${course.id}/lessons/${next.id}`}>Next lesson</Link></Button>}</div>
      <div className="mt-4 rounded-lg bg-paper p-3 text-sm text-slate-700" role="status">{progress.status === 'completed' ? 'Lesson completed.' : lesson.type === 'VIDEO' ? `Video watched ${progress.progressPercent}% of its ${progress.completionThresholdPercent}% completion target.` : 'Lesson not completed yet.'}</div>
    </CardContent></Card></div>
    <aside className="lg:sticky lg:top-4 lg:self-start"><Card><CardHeader><CardTitle className="text-lg">Course lessons</CardTitle><CardDescription>{currentIndex + 1} of {orderedLessons.length} · {course.progressPercent}% course progress</CardDescription></CardHeader><CardContent className="max-h-[70vh] space-y-4 overflow-y-auto">{course.modules.map((module) => <section key={module.id}><h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{module.title}</h2><ul className="space-y-1">{module.lessons.map((item) => <li key={item.id}><Link aria-current={item.id === lesson.id ? 'page' : undefined} className={`block rounded-md px-2 py-2 text-sm ${item.id === lesson.id ? 'bg-brand-100 font-semibold text-brand-950' : 'text-slate-700 hover:bg-paper-muted'}`} to={`/learn/courses/${course.id}/lessons/${item.id}`}><span>{item.title}</span><span className="ml-2 text-xs">{item.progressStatus === 'completed' ? '✓' : item.progressStatus === 'in_progress' ? 'In progress' : ''}</span></Link></li>)}</ul></section>)}</CardContent></Card></aside>
  </section></main>;
}

export function LearnerQuizPage() {
  return <LearnerAccess><LearnerQuiz /></LearnerAccess>;
}

function LearnerQuiz() {
  const { courseId = '' } = useParams();
  const queryClient = useQueryClient();
  const quizQuery = useQuery({ queryKey: ['learnerQuiz', courseId], queryFn: () => getLearnerQuiz(courseId), enabled: Boolean(courseId) });
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [formError, setFormError] = useState('');
  const submit = useMutation({ mutationFn: (input: QuizSubmission) => submitLearnerQuiz(courseId, input), onSuccess: async (attempt) => {
    setResult(attempt);
    setFormError('');
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['learnerQuiz', courseId] }),
      queryClient.invalidateQueries({ queryKey: ['myCourses'] }),
      queryClient.invalidateQueries({ queryKey: ['enrolledCourse', courseId] }),
    ]);
  } });
  if (quizQuery.isPending) return <LoadingMessage />;
  if (quizQuery.isError) return <main className="mx-auto max-w-3xl px-5 py-12"><ErrorNotice error={quizQuery.error} /><Button className="mt-4" asChild variant="outline"><Link to={`/learn/courses/${courseId}`}>Back to course</Link></Button></main>;
  const quiz = quizQuery.data;
  function submitAttempt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const answers = quiz.questions.map((question) => ({ questionId: question.id, optionIds: selectedOptions[question.id] ?? [] }));
    if (answers.some((answer) => answer.optionIds.length === 0)) {
      setFormError('Choose an answer for every question before submitting.');
      return;
    }
    submit.mutate({ answers });
  }
  function toggleOption(questionId: string, optionId: string, multiple: boolean) {
    setSelectedOptions((current) => {
      const selected = current[questionId] ?? [];
      const next = multiple
        ? selected.includes(optionId) ? selected.filter((item) => item !== optionId) : [...selected, optionId]
        : selected.includes(optionId) ? [] : [optionId];
      return { ...current, [questionId]: next };
    });
    setResult(null);
  }
  return <main className="min-h-screen bg-paper"><PageHeader eyebrow="Course quiz" title={quiz.title}><Button asChild variant="outline"><Link to={`/learn/courses/${courseId}`}>Back to course</Link></Button></PageHeader><section className="mx-auto max-w-3xl space-y-5 px-5 py-10 sm:px-8">
    <Card><CardHeader><CardDescription>{quiz.description || 'Answer all questions and submit when you are ready.'}</CardDescription><CardTitle className="text-lg">Pass mark: {quiz.passPercent}% · Unlimited attempts</CardTitle>{quiz.hasPassed && <p className="text-sm font-medium text-emerald-800">A passing attempt is already recorded for this course.</p>}</CardHeader></Card>
    <form className="space-y-5" onSubmit={submitAttempt}>{quiz.questions.map((question, index) => {
      const feedback = result?.answers.find((answer) => answer.questionId === question.id);
      return <Card key={question.id}><CardHeader><CardTitle className="text-lg">{index + 1}. {question.prompt}</CardTitle><CardDescription>{question.points} {question.points === 1 ? 'point' : 'points'} · {question.type === 'multiple_choice' ? 'Select all that apply' : 'Select one answer'}</CardDescription></CardHeader><CardContent><fieldset className="space-y-2"><legend className="sr-only">Question {index + 1} answers</legend>{question.options.map((option) => {
        const selected = (selectedOptions[question.id] ?? []).includes(option.id);
        const isCorrect = feedback?.correctOptionIds.includes(option.id) ?? false;
        return <label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${feedback ? isCorrect ? 'border-emerald-300 bg-emerald-50' : selected ? 'border-red-300 bg-red-50' : 'border-paper-line' : selected ? 'border-brand-300 bg-brand-50' : 'border-paper-line bg-white'}`}><input type={question.type === 'multiple_choice' ? 'checkbox' : 'radio'} name={`question-${question.id}`} checked={selected} onChange={() => toggleOption(question.id, option.id, question.type === 'multiple_choice')} className="size-4 accent-brand-700" />{option.label}{feedback && isCorrect && <span className="ml-auto text-xs font-semibold text-emerald-800">Correct answer</span>}</label>;
      })}</fieldset>{feedback && <p className={`mt-3 text-sm font-medium ${feedback.isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>{feedback.isCorrect ? 'Correct' : 'Not correct'}</p>}</CardContent></Card>;
    })}
    {formError && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{formError}</p>}{submit.isError && <ErrorNotice error={submit.error} />}
    {result && <Card className={result.attempt.passed ? 'border-emerald-300' : 'border-amber-300'}><CardHeader><CardTitle>{result.attempt.passed ? 'You passed' : 'Try again'}</CardTitle><CardDescription>Score: {result.attempt.scorePercent}% ({result.attempt.earnedPoints} of {result.attempt.totalPoints} points). Passing score: {result.attempt.passPercent}%.</CardDescription></CardHeader><CardContent><p className="text-sm text-slate-700">{result.attempt.passed ? 'Your passing attempt has been saved.' : 'Review your answers and submit another attempt when ready.'}</p></CardContent></Card>}
    <Button type="submit" disabled={submit.isPending}>{submit.isPending ? 'Scoring…' : 'Submit answers'}</Button></form>
    <Card><CardHeader><CardTitle className="text-lg">Attempt history</CardTitle><CardDescription>Your 20 most recent submissions. Passing the quiz is retained even if a later attempt does not pass.</CardDescription></CardHeader><CardContent>{quiz.attempts.length ? <ul className="space-y-2">{quiz.attempts.map((attempt) => <li key={attempt.id} className="flex items-center justify-between gap-4 rounded-lg bg-paper px-3 py-2 text-sm"><span>{new Date(attempt.submittedAt).toLocaleString()}</span><span className={attempt.passed ? 'font-semibold text-emerald-800' : 'text-slate-600'}>{attempt.scorePercent}% · {attempt.passed ? 'Passed' : 'Not passed'}</span></li>)}</ul> : <p className="text-sm text-slate-600">No attempts yet.</p>}</CardContent></Card>
  </section></main>;
}

export function LearnerProfilePage() {
  return <LearnerAccess><LearnerProfile /></LearnerAccess>;
}

function LearnerProfile() {
  const profileQuery = useQuery({ queryKey: ['learnerProfile'], queryFn: getLearnerProfile });
  if (profileQuery.isPending) return <LoadingMessage />;
  if (profileQuery.isError) return <main className="mx-auto max-w-3xl px-5 py-12"><ErrorNotice error={profileQuery.error} /></main>;
  const profile = profileQuery.data;
  return <main className="min-h-screen bg-paper"><PageHeader eyebrow="Account" title="Profile"><div className="flex gap-2"><Button asChild variant="outline"><Link to="/dashboard">Dashboard</Link></Button><Button asChild><Link to="/my-courses">My courses</Link></Button></div></PageHeader><section className="mx-auto max-w-3xl px-5 py-10"><Card><CardHeader><CardTitle>Account details</CardTitle><CardDescription>Your learner profile information.</CardDescription></CardHeader><CardContent><dl className="grid gap-4 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</dt><dd className="mt-1 text-sm text-slate-900">{profile.displayName || 'Not provided'}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt><dd className="mt-1 break-all text-sm text-slate-900">{profile.email}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Member since</dt><dd className="mt-1 text-sm text-slate-900">{new Date(profile.createdAt).toLocaleDateString()}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Roles</dt><dd className="mt-1 text-sm text-slate-900">{profile.roles.join(', ')}</dd></div></dl></CardContent></Card></section></main>;
}

function AdminGate({ children }: { children: React.ReactNode }) {
  const userQuery = useQuery({ queryKey: ['me'], queryFn: loadCurrentUser });
  if (userQuery.isPending) return <LoadingMessage />;
  if (userQuery.isError) return <main className="mx-auto max-w-3xl px-5 py-12"><ErrorNotice error={userQuery.error} /></main>;
  if (!userQuery.data) return <Navigate to="/login" replace />;
  if (!userQuery.data.permissions.includes('admin:courses:manage')) return <main className="mx-auto max-w-3xl px-5 py-12"><Card><CardHeader><CardTitle>Access denied</CardTitle><CardDescription>Your account cannot manage courses.</CardDescription></CardHeader><CardContent><Button asChild variant="outline"><Link to="/dashboard">Learner dashboard</Link></Button></CardContent></Card></main>;
  return <>{children}</>;
}

export function AdminCourseListPage() {
  return <AdminGate><CourseList /></AdminGate>;
}

function CourseList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [submittedCourseSearch, setSubmittedCourseSearch] = useState('');
  const [courseStatus, setCourseStatus] = useState('');
  const [coursePage, setCoursePage] = useState(1);
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [quizEnabled, setQuizEnabled] = useState(false);
  const [quizRequired, setQuizRequired] = useState(false);
  const [certificateEnabled, setCertificateEnabled] = useState(false);
  const [actionError, setActionError] = useState<unknown>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const coursesQuery = useQuery({ queryKey: ['adminCourses', submittedCourseSearch, courseStatus, coursePage], queryFn: () => listAdminCourses({ q: submittedCourseSearch, status: courseStatus, page: coursePage }) });
  const mutation = useMutation({ mutationFn: createCourse, onSuccess: async (course) => {
    await queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
    await navigate(`/admin/courses/${course.id}`);
  } });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CourseStatus }) => changeCourseStatus(id, status),
    onSuccess: async () => {
      setActionError(null);
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['adminCourses'] }), queryClient.invalidateQueries({ queryKey: ['courses'] })]);
    },
    onError: setActionError,
  });
  useEffect(() => {
    if (!createOpen) return;
    titleRef.current?.focus();
    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !mutation.isPending) {
        setCreateOpen(false);
        requestAnimationFrame(() => openerRef.current?.focus());
      }
      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleDialogKeys);
    return () => window.removeEventListener('keydown', handleDialogKeys);
  }, [createOpen, mutation.isPending]);

  function openCreateDialog(opener: HTMLElement) {
    openerRef.current = opener;
    setSlug('');
    setSlugEdited(false);
    setQuizEnabled(false);
    setQuizRequired(false);
    setCertificateEnabled(false);
    setCreateOpen(true);
  }
  function closeCreateDialog() {
    if (mutation.isPending) return;
    setCreateOpen(false);
    requestAnimationFrame(() => openerRef.current?.focus());
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate({ ...getCourseInput(event.currentTarget), quizEnabled, quizRequired: quizEnabled && quizRequired, certificateEnabled });
  }
  function submitCourseSearch(event: FormEvent) {
    event.preventDefault();
    setCoursePage(1);
    setSubmittedCourseSearch(courseSearch.trim());
  }

  const pageCount = coursesQuery.data ? Math.max(1, Math.ceil(coursesQuery.data.total / coursesQuery.data.pageSize)) : 1;
  return <main className="min-h-screen bg-paper">
    <PageHeader eyebrow="Admin · Courses" title="Courses"><Button onClick={(event) => openCreateDialog(event.currentTarget)}>+ Create course</Button></PageHeader>
    <section className="mx-auto max-w-7xl space-y-5 px-5 py-7 sm:px-8 sm:py-9">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold text-slate-950">All courses</h2><p className="mt-1 text-sm text-slate-600">Manage drafts and published learning content.</p></div><p className="text-sm text-slate-500">Sorted by recently updated</p></div>
      <Card><CardContent className="p-4 sm:p-5"><form onSubmit={submitCourseSearch} className="flex flex-col gap-3 sm:flex-row">
        <label className="min-w-0 flex-1"><span className="sr-only">Search courses</span><input aria-label="Search courses" placeholder="Search by course title or slug" value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} className="min-h-11 w-full px-3 text-sm" /></label>
        <label><span className="sr-only">Filter by status</span><select aria-label="Filter by status" value={courseStatus} onChange={(event) => { setCoursePage(1); setCourseStatus(event.target.value); }} className="min-h-11 w-full px-3 text-sm sm:w-48"><option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <Button type="submit" variant="outline">Search</Button>
      </form></CardContent></Card>
      {actionError && <ErrorNotice error={actionError} />}
      {coursesQuery.isPending && <LoadingMessage />}{coursesQuery.isError && <ErrorNotice error={coursesQuery.error} />}
      <div className="space-y-3" aria-live="polite">
        {coursesQuery.data?.items.map((course) => <Card key={course.id} className="overflow-hidden"><CardContent className="flex flex-col gap-4 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h3 className="break-words text-base font-semibold text-slate-950">{course.title}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${course.status === 'published' ? 'bg-emerald-50 text-emerald-800' : course.status === 'archived' ? 'bg-slate-100 text-slate-700' : 'bg-amber-50 text-amber-900'}`}>{course.status}</span></div>
            <p className="mt-1 break-all text-sm text-slate-500">/{course.slug}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600"><span>{course.moduleCount} {course.moduleCount === 1 ? 'module' : 'modules'}</span><span>{course.lessonCount} {course.lessonCount === 1 ? 'lesson' : 'lessons'}</span><span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>{course.certificateEnabled && <span>Certificate enabled</span>}{course.quizRequired && <span>Required quiz</span>}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <Button asChild size="sm" variant="outline"><Link to={`/admin/courses/${course.id}`}>Edit course</Link></Button>
            {course.status === 'draft' && <Button size="sm" onClick={() => statusMutation.mutate({ id: course.id, status: 'published' })} disabled={statusMutation.isPending}>Publish</Button>}
            {course.status === 'published' && <Button size="sm" variant="outline" onClick={() => { if (window.confirm(`Unpublish “${course.title}”? Learners will lose access until it is published again.`)) statusMutation.mutate({ id: course.id, status: 'draft' }); }} disabled={statusMutation.isPending}>Unpublish</Button>}
            {course.status !== 'archived' && <Button size="sm" variant="ghost" onClick={() => { if (window.confirm(`Archive “${course.title}”?`)) statusMutation.mutate({ id: course.id, status: 'archived' }); }} disabled={statusMutation.isPending}>Archive</Button>}
            {course.status === 'archived' && <Button size="sm" variant="outline" onClick={() => statusMutation.mutate({ id: course.id, status: 'draft' })} disabled={statusMutation.isPending}>Restore draft</Button>}
          </div>
        </CardContent></Card>)}
      </div>
      {!coursesQuery.isPending && coursesQuery.data?.items.length === 0 && <Card><CardContent className="p-6 text-center"><h3 className="font-semibold text-slate-950">No courses found</h3><p className="mt-1 text-sm text-slate-600">Try changing the search or status filter, or create your first course.</p><Button className="mt-4" onClick={(event) => openCreateDialog(event.currentTarget)}>Create course</Button></CardContent></Card>}
      {coursesQuery.data && <div className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm text-slate-600"><span>Page {coursePage} of {pageCount} · {coursesQuery.data.total} courses</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={coursePage <= 1} onClick={() => setCoursePage(coursePage - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={coursePage >= pageCount} onClick={() => setCoursePage(coursePage + 1)}>Next</Button></div></div>}
    </section>
    {createOpen && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCreateDialog(); }}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="create-course-title" className="my-auto w-full max-w-2xl rounded-2xl border border-paper-line bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-paper-line px-5 py-5 sm:px-7"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Course setup</p><h2 id="create-course-title" className="mt-1 text-xl font-bold text-slate-950">Create a course</h2><p className="mt-1 text-sm text-slate-600">Start with the basics. Your course will be saved as a private draft.</p></div><Button type="button" variant="ghost" aria-label="Close create course dialog" onClick={closeCreateDialog} disabled={mutation.isPending}>Close</Button></header>
        <form className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7" onSubmit={submit}>
          <div className="sm:col-span-2"><label className="block space-y-1.5 text-sm font-medium text-slate-800">Course title<input ref={titleRef} name="title" required minLength={3} maxLength={160} onChange={(event) => { if (!slugEdited) setSlug(event.currentTarget.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 180)); }} className="min-h-11 w-full rounded-lg border border-paper-line-strong px-3 text-sm font-normal" /></label></div>
          <FormInput label="Course URL slug" name="slug" value={slug} required onChange={(event) => { setSlug(event.currentTarget.value); setSlugEdited(true); }} />
          <div className="sm:col-span-2"><FormTextarea label="Description" name="description" rows={4} /></div>
          <div className="space-y-3 rounded-xl bg-paper p-4 sm:col-span-2"><p className="text-sm font-semibold text-slate-900">Course completion</p><label className="flex items-start gap-2 text-sm text-slate-700"><input name="certificateEnabled" type="checkbox" checked={certificateEnabled} onChange={(event) => setCertificateEnabled(event.currentTarget.checked)} className="mt-0.5 size-4 accent-brand-700" />Enable a completion certificate</label><label className="flex items-start gap-2 text-sm text-slate-700"><input name="quizEnabled" type="checkbox" checked={quizEnabled} onChange={(event) => { const enabled = event.currentTarget.checked; setQuizEnabled(enabled); if (!enabled) setQuizRequired(false); }} className="mt-0.5 size-4 accent-brand-700" />Enable a course quiz</label>{quizEnabled && <><label className="flex items-start gap-2 text-sm text-slate-700"><input name="quizRequired" type="checkbox" checked={quizRequired} onChange={(event) => setQuizRequired(event.currentTarget.checked)} className="mt-0.5 size-4 accent-brand-700" />Require passing the quiz to complete the course</label><FormInput label="Quiz passing score (%)" name="quizPassPercent" type="number" defaultValue={70} required /></>}<p className="text-xs text-slate-500">Quiz questions can be added in the course builder.</p></div>
          <FormInput label="Video completion threshold (%)" name="videoCompletionPercent" type="number" defaultValue={90} required />
          <label className="block space-y-1.5 text-sm font-medium text-slate-800">Text lesson completion<select name="textCompletionMode" defaultValue="manual" className="min-h-11 w-full rounded-lg border border-paper-line-strong px-3 text-sm font-normal"><option value="manual">Learner marks complete</option><option value="on_open">Complete when opened</option></select></label>
          {mutation.isError && <div className="sm:col-span-2"><ErrorNotice error={mutation.error} /></div>}
          <div className="flex flex-col-reverse gap-2 border-t border-paper-line pt-4 sm:col-span-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={closeCreateDialog} disabled={mutation.isPending}>Cancel</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Creating course…' : 'Save as draft and continue'}</Button></div>
        </form>
      </section>
    </div>}
  </main>;
}
export function CourseEditorPage() {
  return <AdminGate><CourseEditor /></AdminGate>;
}

export function AdminCoursePreviewPage() {
  return <AdminGate><CoursePreview /></AdminGate>;
}

function CoursePreview() {
  const { courseId = '' } = useParams();
  const courseQuery = useQuery({ queryKey: ['adminCourse', courseId], queryFn: () => getAdminCourse(courseId), enabled: Boolean(courseId) });
  const course = courseQuery.data;
  const quizQuery = useQuery({ queryKey: ['adminQuiz', courseId], queryFn: () => getAdminQuiz(courseId), enabled: Boolean(course?.quizEnabled) });
  if (courseQuery.isPending) return <LoadingMessage />;
  if (courseQuery.isError || !course) return <main className="mx-auto max-w-3xl px-5 py-12"><ErrorNotice error={courseQuery.error} /><Button className="mt-5" asChild variant="outline"><Link to="/admin/courses">Back to courses</Link></Button></main>;
  const lessons = course.modules.flatMap((module) => module.lessons);
  const requiredLessons = lessons.filter((lesson) => lesson.required).length;
  return <main className="min-h-screen bg-paper">
    <PageHeader eyebrow={`Admin · ${course.status} preview`} title="Learner preview"><div className="flex flex-wrap gap-2"><Button asChild size="sm" variant="outline"><Link to={`/admin/courses/${course.id}`}>Back to builder</Link></Button></div></PageHeader>
    <section className="mx-auto max-w-5xl space-y-5 px-5 py-7 sm:px-8 sm:py-9">
      <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900"><span className="font-semibold">Preview mode.</span> Enrollment and learner progress are disabled. This preview shows the course structure and uses admin-authorized lesson media previews.</div>
      <Card><CardHeader><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Self-paced course</p><CardTitle className="text-2xl sm:text-3xl">{course.title}</CardTitle><CardDescription className="text-base leading-7">{course.description || 'Course description has not been added yet.'}</CardDescription></CardHeader><CardContent><div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600"><span className="rounded-full bg-paper px-3 py-1.5">{course.modules.length} {course.modules.length === 1 ? 'module' : 'modules'}</span><span className="rounded-full bg-paper px-3 py-1.5">{lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}</span><span className="rounded-full bg-paper px-3 py-1.5">{requiredLessons} required</span>{course.certificateEnabled && <span className="rounded-full bg-brand-50 px-3 py-1.5 text-brand-800">Certificate available</span>}</div></CardContent></Card>
      <Card><CardHeader><CardTitle>Course content</CardTitle><CardDescription>This is how the course outline and lesson content are organized for learners.</CardDescription></CardHeader><CardContent className="space-y-4">{course.modules.map((module, moduleIndex) => <section key={module.id} className="rounded-xl border border-paper-line p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Module {moduleIndex + 1}</p><h2 className="mt-1 text-lg font-semibold text-slate-950">{module.title}</h2>{module.description && <p className="mt-1 text-sm text-slate-600">{module.description}</p>}</div><span className="text-xs text-slate-500">{module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}</span></div>
        <div className="mt-4 space-y-3">{module.lessons.map((lesson, lessonIndex) => <article key={lesson.id} className="rounded-lg bg-paper p-3 sm:p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold text-brand-700">Lesson {lessonIndex + 1} · {lesson.type}</p><h3 className="mt-1 font-semibold text-slate-900">{lesson.title}</h3>{lesson.description && <p className="mt-1 text-sm leading-6 text-slate-600">{lesson.description}</p>}</div><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${lesson.required ? 'bg-blue-50 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>{lesson.required ? 'Required' : 'Optional'}</span></div>{lesson.type === 'TEXT' ? <div className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-paper-line bg-white p-4 text-sm leading-6 text-slate-800">{lesson.content || <span className="italic text-slate-500">Text content has not been added yet.</span>}</div> : <AdminLessonMediaPreview lesson={lesson} />}</article>)}</div>
      </section>)}{course.modules.length === 0 && <p className="rounded-lg border border-dashed border-paper-line-strong p-5 text-sm text-slate-600">No modules have been added to this course yet.</p>}</CardContent></Card>
      {course.quizEnabled && <Card><CardHeader><CardTitle>Course quiz</CardTitle><CardDescription>At the end of the course · {course.quizRequired ? `Required to complete · pass mark ${course.quizPassPercent}%` : `Optional · pass mark ${course.quizPassPercent}%`}</CardDescription></CardHeader><CardContent>{quizQuery.isPending && <p className="text-sm text-slate-600">Loading quiz preview…</p>}{quizQuery.isError && <ErrorNotice error={quizQuery.error} />}{quizQuery.data?.quiz ? <div><h3 className="font-semibold text-slate-900">{quizQuery.data.quiz.title}</h3>{quizQuery.data.quiz.description && <p className="mt-1 text-sm text-slate-600">{quizQuery.data.quiz.description}</p>}<ol className="mt-4 space-y-3">{quizQuery.data.quiz.questions.map((question, index) => <li key={question.id} className="rounded-lg bg-paper p-3"><p className="text-sm font-medium text-slate-900">{index + 1}. {question.prompt}</p><ul className="mt-2 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <li key={optionIndex} className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm text-slate-700">{option.label}</li>)}</ul></li>)}</ol></div> : !quizQuery.isPending && !quizQuery.isError && <p className="text-sm text-amber-900">Quiz is enabled, but no quiz has been configured.</p>}</CardContent></Card>}
      <Card><CardHeader><CardTitle>Certificate eligibility</CardTitle><CardDescription>{course.certificateEnabled ? 'A certificate is issued after the configured course completion rules are met.' : 'Certificates are disabled for this course.'}</CardDescription></CardHeader><CardContent><ul className="space-y-2 text-sm text-slate-700"><li>{requiredLessons} required {requiredLessons === 1 ? 'lesson' : 'lessons'} must be completed.</li><li>{course.quizRequired ? `Learners must pass the quiz with at least ${course.quizPassPercent}%.` : course.quizEnabled ? 'The quiz is optional and does not block course completion.' : 'No course quiz is enabled.'}</li></ul></CardContent></Card>
    </section>
  </main>;
}

function AdminLessonMediaPreview({ lesson }: { lesson: CourseModuleRecord['lessons'][number] }) {
  const [open, setOpen] = useState(false);
  const query = useQuery({ queryKey: ['adminLessonMediaPreview', lesson.id], queryFn: () => getAdminLessonMediaPreview(lesson.id), enabled: open });
  return <div className="mt-3"><Button type="button" size="sm" variant="outline" aria-expanded={open} onClick={() => setOpen((current) => !current)}>{open ? 'Hide media preview' : `Preview ${lesson.type === 'VIDEO' ? 'video' : 'PDF'}`}</Button>{open && <div className="mt-3">{query.isPending && <p className="rounded-lg bg-white p-4 text-sm text-slate-600">Loading media preview…</p>}{query.isError && <p role="status" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">A ready file is not available to preview. Check its status in the course builder.</p>}{query.data?.kind === 'PDF' && <iframe title={`${lesson.title} PDF preview`} src={query.data.url} className="h-[70vh] min-h-96 w-full rounded-lg border border-paper-line bg-white" />}{query.data?.kind === 'VIDEO' && <AdminVideoPreview url={query.data.url} posterUrl={query.data.posterUrl ?? undefined} />}</div>}</div>;
}

function AdminVideoPreview({ url, posterUrl }: { url: string; posterUrl?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const manifestUrl = `${getApiBaseUrl()}${url}`;
    let active = true;
    let hls: Hls | undefined;
    if (video.canPlayType('application/vnd.apple.mpegurl')) video.src = manifestUrl;
    else void import('hls.js').then(({ default: HlsPlayer }) => {
      if (!active || !HlsPlayer.isSupported()) return;
      hls = new HlsPlayer({ xhrSetup: (request) => { request.withCredentials = true; } });
      hls.loadSource(manifestUrl);
      hls.attachMedia(video);
    });
    return () => { active = false; hls?.destroy(); video.removeAttribute('src'); video.load(); };
  }, [url]);
  return <video ref={videoRef} controls playsInline poster={posterUrl} aria-label="Course video preview" className="max-h-[70vh] w-full rounded-lg bg-slate-950" />;
}

function CourseEditor() {
  const { courseId = '' } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const courseQuery = useQuery({ queryKey: ['adminCourse', courseId], queryFn: () => getAdminCourse(courseId), enabled: Boolean(courseId) });
  const mediaLessons = courseQuery.data?.modules.flatMap((module) => module.lessons).filter((lesson) => lesson.type !== 'TEXT') ?? [];
  const mediaReadinessQueries = useQueries({ queries: mediaLessons.map((lesson) => ({
    queryKey: ['adminLessonMedia', lesson.id],
    queryFn: () => listLessonMedia(lesson.id),
    refetchInterval: (query) => query.state.data?.some((media) => media.status === 'uploading' || media.status === 'processing') ? 2500 : false,
  })) });
  const readinessQuizQuery = useQuery({ queryKey: ['adminQuiz', courseId], queryFn: () => getAdminQuiz(courseId), enabled: Boolean(courseQuery.data?.quizEnabled) });
  const [actionError, setActionError] = useState<unknown>(null);
  const [activeTab, setActiveTab] = useState<'setup' | 'curriculum' | 'quiz' | 'certificate'>('setup');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const invalidate = async () => {
    setActionError(null);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['adminCourse', courseId] }),
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] }),
      queryClient.invalidateQueries({ queryKey: ['courses'] }),
    ]);
  };
  const statusMutation = useMutation({ mutationFn: (status: CourseRecord['status']) => changeCourseStatus(courseId, status), onSuccess: invalidate, onError: setActionError });
  const deleteMutation = useMutation({ mutationFn: () => deleteCourse(courseId), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['adminCourses'] }); await navigate('/admin/courses'); }, onError: setActionError });
  const updateMutation = useMutation({ mutationFn: (input: CourseInput) => updateCourse(courseId, input), onSuccess: invalidate, onError: setActionError });
  if (courseQuery.isPending) return <LoadingMessage />;
  if (courseQuery.isError) return <main className="mx-auto max-w-3xl px-5 py-12"><ErrorNotice error={courseQuery.error} /><Button className="mt-5" asChild variant="outline"><Link to="/admin/courses">Back to courses</Link></Button></main>;
  const course = courseQuery.data;
  const editable = course.status === 'draft';
  const publishReadiness = getCoursePublishReadiness(course, mediaLessons, mediaReadinessQueries, readinessQuizQuery);
  const tabs = [
    { id: 'setup', label: 'Course setup' },
    { id: 'curriculum', label: 'Curriculum', detail: String(course.modules.length) },
    { id: 'quiz', label: 'Quiz', detail: course.quizEnabled ? course.quizRequired ? 'Required' : 'Optional' : 'Off' },
    { id: 'certificate', label: 'Certificate', detail: course.certificateEnabled ? 'On' : 'Off' },
  ] as const;
  function focusTab(index: number) {
    const nextIndex = (index + tabs.length) % tabs.length;
    setActiveTab(tabs[nextIndex]!.id);
    tabRefs.current[nextIndex]?.focus();
  }
  function courseDefaults(): CourseInput {
    return {
      title: course.title, slug: course.slug, description: course.description,
      certificateEnabled: course.certificateEnabled, quizEnabled: course.quizEnabled, quizRequired: course.quizRequired,
      quizPassPercent: course.quizPassPercent, videoCompletionPercent: course.videoCompletionPercent,
      textCompletionMode: course.textCompletionMode,
    };
  }
  function submitSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    updateMutation.mutate({ ...courseDefaults(), title: String(data.get('title') ?? '').trim(), slug: String(data.get('slug') ?? '').trim(), description: String(data.get('description') ?? '').trim() || null, videoCompletionPercent: Number(data.get('videoCompletionPercent')), textCompletionMode: String(data.get('textCompletionMode')) as CourseInput['textCompletionMode'] });
  }
  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);

  return <main className="min-h-screen bg-paper">
    <PageHeader eyebrow="Admin · Course builder" title={course.title}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${course.status === 'published' ? 'bg-emerald-50 text-emerald-800' : course.status === 'archived' ? 'bg-slate-100 text-slate-700' : 'bg-amber-50 text-amber-900'}`}>{course.status}</span>
        <Button asChild size="sm" variant="outline"><Link to="/admin/courses">All courses</Link></Button>
        <Button asChild size="sm" variant="outline"><Link to={`/admin/courses/${course.id}/preview`}>Preview course</Link></Button>
        {course.status === 'draft' && <Button size="sm" aria-describedby="course-publish-readiness" onClick={() => statusMutation.mutate('published')} disabled={!publishReadiness.canPublish || statusMutation.isPending}>{statusMutation.isPending ? 'Publishing…' : 'Publish course'}</Button>}
        {course.status === 'published' && <Button size="sm" variant="outline" onClick={() => statusMutation.mutate('draft')} disabled={statusMutation.isPending}>Unpublish</Button>}
        {course.status !== 'archived' && <Button size="sm" variant="ghost" onClick={() => { if (window.confirm(`Archive "${course.title}"?`)) statusMutation.mutate('archived'); }} disabled={statusMutation.isPending}>Archive</Button>}
        {course.status === 'archived' && <Button size="sm" variant="outline" onClick={() => statusMutation.mutate('draft')} disabled={statusMutation.isPending}>Restore draft</Button>}
      </div>
    </PageHeader>
    <section className="mx-auto max-w-6xl space-y-5 px-5 py-7 sm:px-8 sm:py-9">
      {(actionError || updateMutation.isError || statusMutation.isError || deleteMutation.isError) && <ErrorNotice error={actionError ?? updateMutation.error ?? statusMutation.error ?? deleteMutation.error} />}
      <CourseReadinessPanel readiness={publishReadiness} />
      <div role="tablist" aria-label="Course builder sections" className="flex gap-1 overflow-x-auto rounded-xl border border-paper-line bg-white p-1.5">
        {tabs.map((tab, index) => <button key={tab.id} ref={(node) => { tabRefs.current[index] = node; }} id={`builder-tab-${tab.id}`} type="button" role="tab" aria-selected={activeTab === tab.id} aria-controls={`builder-panel-${tab.id}`} tabIndex={activeTab === tab.id ? 0 : -1}
          onClick={() => setActiveTab(tab.id)} onKeyDown={(event) => { if (event.key === 'ArrowRight') { event.preventDefault(); focusTab(index + 1); } else if (event.key === 'ArrowLeft') { event.preventDefault(); focusTab(index - 1); } else if (event.key === 'Home') { event.preventDefault(); focusTab(0); } else if (event.key === 'End') { event.preventDefault(); focusTab(tabs.length - 1); } }}
          className={`admin-builder-tab whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${activeTab === tab.id ? 'bg-brand-navy text-white shadow-sm' : 'text-slate-600 hover:bg-paper-muted hover:text-brand-navy'}`}>
          {tab.label}{'detail' in tab && <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${activeTab === tab.id ? 'bg-white/15 text-white' : 'bg-paper-muted text-slate-600'}`}>{tab.detail}</span>}
        </button>)}
      </div>
      <section id="builder-panel-setup" role="tabpanel" aria-labelledby="builder-tab-setup" tabIndex={0} hidden={activeTab !== 'setup'} className="space-y-5 outline-none">
        <Card><CardHeader><CardTitle>Course details</CardTitle><CardDescription>Set the name, public URL and overview learners see before enrolling.</CardDescription></CardHeader><CardContent><form key={`setup-${course.id}-${course.updatedAt}`} className="grid gap-4 md:grid-cols-2" onSubmit={submitSetup}>
          <FormInput label="Course title" name="title" defaultValue={course.title} required disabled={!editable} />
          <FormInput label="URL slug" name="slug" defaultValue={course.slug} required disabled={!editable} />
          <div className="md:col-span-2"><FormTextarea label="Course description" name="description" defaultValue={course.description} rows={5} disabled={!editable} /></div>
          <FormInput label="Video completion threshold (%)" name="videoCompletionPercent" type="number" defaultValue={course.videoCompletionPercent} required disabled={!editable} />
          <label className="block space-y-1.5 text-sm font-medium text-slate-800">Text lesson completion<select name="textCompletionMode" defaultValue={course.textCompletionMode} disabled={!editable} className="min-h-10 w-full rounded-lg border border-paper-line-strong px-3 text-sm font-normal disabled:bg-paper-muted"><option value="manual">Learner marks complete</option><option value="on_open">Complete when opened</option></select></label>
          <div className="flex flex-wrap items-center gap-3 md:col-span-2"><Button type="submit" disabled={!editable || updateMutation.isPending}>{updateMutation.isPending ? 'Saving…' : 'Save course setup'}</Button>{!editable && <p className="text-sm text-slate-500">Return this course to draft to make changes.</p>}</div>
        </form></CardContent></Card>
        {editable && <Card className="border-red-200"><CardHeader><CardTitle className="text-base">Danger zone</CardTitle><CardDescription>Deleting a draft removes its course records and cannot be undone.</CardDescription></CardHeader><CardContent><Button size="sm" variant="ghost" className="text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => { if (window.confirm('Delete this draft and its outline?')) deleteMutation.mutate(); }} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? 'Deleting…' : 'Delete draft'}</Button></CardContent></Card>}
      </section>
      <section id="builder-panel-curriculum" role="tabpanel" aria-labelledby="builder-tab-curriculum" tabIndex={0} hidden={activeTab !== 'curriculum'} className="space-y-5 outline-none">
        <Card><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle>Course curriculum</CardTitle><CardDescription>Organize lessons into modules. Reorder items with the arrow controls.</CardDescription></div><div className="flex gap-2 text-xs font-semibold text-slate-600"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-800">{course.modules.length} modules</span><span className="rounded-full bg-violet-50 px-2.5 py-1 text-violet-800">{lessonCount} lessons</span></div></div></CardHeader><CardContent className="space-y-5">{course.modules.map((module, index) => <ModuleEditor key={`${module.id}-${module.updatedAt}`} course={course} module={module} moduleIndex={index} canEdit={editable} onError={setActionError} onChanged={invalidate} />)}{editable && <CreateModuleForm courseId={course.id} onError={setActionError} onChanged={invalidate} />}{course.modules.length === 0 && <p className="rounded-lg border border-dashed border-paper-line-strong p-5 text-sm text-slate-600">Add your first module to start building the learning path.</p>}</CardContent></Card>
      </section>
      <section id="builder-panel-quiz" role="tabpanel" aria-labelledby="builder-tab-quiz" tabIndex={0} hidden={activeTab !== 'quiz'} className="space-y-5 outline-none">
        <QuizSettingsForm key={`quiz-settings-${course.id}-${course.updatedAt}`} course={course} editable={editable} pending={updateMutation.isPending} onSave={(quizEnabled, quizRequired, quizPassPercent) => updateMutation.mutate({ ...courseDefaults(), quizEnabled, quizRequired, quizPassPercent })} />
        {course.quizEnabled ? <QuizBuilder courseId={course.id} editable={editable} /> : <Card><CardContent className="p-5 text-sm text-slate-600">The course quiz is disabled. Enable it above to add questions.</CardContent></Card>}
      </section>
      <section id="builder-panel-certificate" role="tabpanel" aria-labelledby="builder-tab-certificate" tabIndex={0} hidden={activeTab !== 'certificate'} className="space-y-5 outline-none">
        <CertificateSettings course={course} editable={editable} pending={updateMutation.isPending} onSave={(certificateEnabled) => updateMutation.mutate({ ...courseDefaults(), certificateEnabled })} />
      </section>
    </section>
  </main>;
}

type ReadinessState = 'ready' | 'blocked' | 'checking' | 'recommended';
interface CourseReadinessCheck { id: string; label: string; state: ReadinessState; detail: string }
interface CoursePublishReadiness { canPublish: boolean; checks: CourseReadinessCheck[] }

function getCoursePublishReadiness(
  course: CourseRecord,
  mediaLessons: CourseModuleRecord['lessons'],
  mediaQueries: Array<{ data?: MediaAssetSummary[]; isPending: boolean; isError: boolean }>,
  quizQuery: { data?: AdminQuizResponse; isPending: boolean; isError: boolean },
): CoursePublishReadiness {
  const lessons = course.modules.flatMap((module) => module.lessons);
  const textLessons = lessons.filter((lesson) => lesson.type === 'TEXT');
  const contentCount = lessons.length;
  const outlineReady = course.modules.length > 0 && contentCount > 0;
  const textMissing = textLessons.filter((lesson) => !lesson.content?.trim());
  const checks: CourseReadinessCheck[] = [
    { id: 'course', label: 'Course details', state: course.description?.trim() ? 'ready' : 'recommended', detail: course.description?.trim() ? 'Title and course description are set.' : 'Add a description so learners know what the course covers. This will not block publishing.' },
    { id: 'curriculum', label: 'Curriculum', state: outlineReady ? 'ready' : 'blocked', detail: outlineReady ? `${course.modules.length} ${course.modules.length === 1 ? 'module' : 'modules'} · ${contentCount} ${contentCount === 1 ? 'lesson' : 'lessons'}.` : 'Add at least one module and one lesson.' },
    { id: 'text', label: 'Text lesson content', state: textMissing.length ? 'blocked' : 'ready', detail: textMissing.length ? `Add content to: ${textMissing.map((lesson) => lesson.title).join(', ')}.` : textLessons.length ? `Content is set for all ${textLessons.length} text ${textLessons.length === 1 ? 'lesson' : 'lessons'}.` : 'No text lessons need content.' },
  ];

  if (!mediaLessons.length) checks.push({ id: 'media', label: 'Video and PDF files', state: 'ready', detail: 'No video or PDF lessons need files.' });
  else if (mediaQueries.some((query) => query.isError)) checks.push({ id: 'media', label: 'Video and PDF files', state: 'blocked', detail: 'Could not verify media status. Retry loading media before publishing.' });
  else if (mediaQueries.some((query) => query.isPending)) checks.push({ id: 'media', label: 'Video and PDF files', state: 'checking', detail: 'Checking lesson files and processing status…' });
  else {
    const notReady = mediaLessons.flatMap((lesson, index) => {
      const query = mediaQueries[index];
      if (query?.data?.some((media) => media.kind === lesson.type && media.status === 'ready')) return [];
      const latestStatus = query?.data?.find((media) => media.kind === lesson.type)?.status;
      const reason = latestStatus === 'uploading' ? 'upload is still active' : latestStatus === 'processing' ? 'file is processing' : latestStatus === 'failed' ? 'processing failed; retry or replace the file' : 'no ready file';
      return [`${lesson.title} (${reason})`];
    });
    checks.push({ id: 'media', label: 'Video and PDF files', state: notReady.length ? 'blocked' : 'ready', detail: notReady.length ? `Complete media setup for: ${notReady.join('; ')}.` : `Ready media is available for all ${mediaLessons.length} media ${mediaLessons.length === 1 ? 'lesson' : 'lessons'}.` });
  }

  if (!course.quizEnabled) checks.push({ id: 'quiz', label: 'Course quiz', state: 'ready', detail: 'No quiz is enabled.' });
  else if (quizQuery.isError) checks.push({ id: 'quiz', label: 'Course quiz', state: 'blocked', detail: 'Could not verify quiz configuration. Retry loading the quiz before publishing.' });
  else if (quizQuery.isPending) checks.push({ id: 'quiz', label: 'Course quiz', state: 'checking', detail: 'Checking quiz questions and answer keys…' });
  else {
    const quiz = quizQuery.data?.quiz;
    const noQuestions = !quiz?.questions.length;
    const missingKeys = quiz?.questions.filter((question) => !question.options.some((option) => option.isCorrect)).length ?? 0;
    const valid = Boolean(quiz) && !noQuestions && missingKeys === 0;
    checks.push({ id: 'quiz', label: 'Course quiz', state: valid ? 'ready' : 'blocked', detail: valid ? `${quiz!.questions.length} questions configured${course.quizRequired ? ` · passing score ${course.quizPassPercent}% required` : ' · optional for completion'}.` : noQuestions ? 'Add at least one question before publishing an enabled quiz.' : 'Mark a correct answer for every quiz question.' });
  }

  checks.push({ id: 'certificate', label: 'Certificate', state: course.certificateEnabled ? 'ready' : 'recommended', detail: course.certificateEnabled ? 'Automatically issued when configured course requirements are met.' : 'Certificates are disabled. Enable one if learners should receive a credential.' });
  checks.push({ id: 'thumbnail', label: 'Course thumbnail', state: 'recommended', detail: 'Thumbnail uploads are not available yet; this does not block publishing.' });
  return { canPublish: checks.every((check) => check.state !== 'blocked' && check.state !== 'checking'), checks };
}

function CourseReadinessPanel({ readiness }: { readiness: CoursePublishReadiness }) {
  const statusClasses: Record<ReadinessState, string> = { ready: 'bg-emerald-50 text-emerald-800', blocked: 'bg-red-50 text-red-800', checking: 'bg-blue-50 text-blue-800', recommended: 'bg-amber-50 text-amber-900' };
  const statusText: Record<ReadinessState, string> = { ready: 'Ready', blocked: 'Needs attention', checking: 'Checking', recommended: 'Optional' };
  return <Card id="course-publish-readiness"><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="text-lg">Course readiness</CardTitle><CardDescription>Publishing checks use the current course content. The server checks required content again when you publish.</CardDescription></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${readiness.canPublish ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>{readiness.canPublish ? 'Ready to publish' : 'Cannot publish yet'}</span></div></CardHeader><CardContent><ul className="grid gap-2 sm:grid-cols-2">{readiness.checks.map((check) => <li key={check.id} className="rounded-lg border border-paper-line bg-white p-3"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold text-slate-900">{check.label}</h3><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClasses[check.state]}`}>{statusText[check.state]}</span></div><p className="mt-1 text-xs leading-5 text-slate-600">{check.detail}</p></li>)}</ul></CardContent></Card>;
}

function CertificateSettings({ course, editable, pending, onSave }: {
  course: CourseRecord; editable: boolean; pending: boolean; onSave: (enabled: boolean) => void;
}) {
  const requiredLessons = course.modules.flatMap((module) => module.lessons).filter((lesson) => lesson.required).length;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(new FormData(event.currentTarget).has('certificateEnabled'));
  }
  return <Card><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle>Course certificate</CardTitle><CardDescription>Issue a completion certificate when the learner satisfies this course’s existing completion rules.</CardDescription></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${course.certificateEnabled ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{course.certificateEnabled ? 'Enabled' : 'Disabled'}</span></div></CardHeader><CardContent><form key={`certificate-${course.id}-${course.updatedAt}`} className="space-y-5" onSubmit={submit}>
    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${course.certificateEnabled ? 'border-brand-500 bg-brand-50/60' : 'border-paper-line bg-white'} ${!editable ? 'cursor-not-allowed opacity-70' : ''}`}><input name="certificateEnabled" type="checkbox" defaultChecked={course.certificateEnabled} disabled={!editable} className="mt-0.5 size-4 accent-brand-700" /><span><span className="block text-sm font-semibold text-slate-950">Issue a certificate on course completion</span><span className="mt-1 block text-xs leading-5 text-slate-600">Eligible learners receive their certificate automatically after course completion.</span></span></label>
    <div className="rounded-xl border border-paper-line bg-paper p-4 sm:p-5"><h3 className="text-sm font-semibold text-slate-950">Completion rules used for eligibility</h3><dl className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-white p-3"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Required lessons</dt><dd className="mt-1 text-sm text-slate-800">{requiredLessons} {requiredLessons === 1 ? 'lesson' : 'lessons'} must be completed</dd></div><div className="rounded-lg bg-white p-3"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Course quiz</dt><dd className="mt-1 text-sm text-slate-800">{course.quizRequired ? `Pass required · ${course.quizPassPercent}% score` : course.quizEnabled ? 'Optional · does not block completion' : 'No quiz enabled'}</dd></div></dl><p className="mt-3 text-xs leading-5 text-slate-500">These are the same completion rules used by the course. This setting only controls whether a certificate is issued; it does not change learner progress or existing certificates.</p></div>
    <div className="flex flex-wrap items-center gap-3 border-t border-paper-line pt-4"><Button type="submit" disabled={!editable || pending}>{pending ? 'Saving settings…' : 'Save certificate settings'}</Button>{!editable && <p className="text-sm text-slate-500">Unpublish this course to change its settings.</p>}</div>
  </form></CardContent></Card>;
}

function QuizSettingsForm({ course, editable, pending, onSave }: {
  course: CourseRecord; editable: boolean; pending: boolean;
  onSave: (enabled: boolean, required: boolean, passPercent: number) => void;
}) {
  const [enabled, setEnabled] = useState(course.quizEnabled);
  const [required, setRequired] = useState(course.quizRequired);
  const [passPercent, setPassPercent] = useState(String(course.quizPassPercent));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(enabled, enabled && required, Number(passPercent));
  }
  return <Card><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle>Quiz settings</CardTitle><CardDescription>Set up an assessment for the end of this course and choose how it affects completion.</CardDescription></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${enabled ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{enabled ? 'Quiz enabled' : 'Quiz disabled'}</span></div></CardHeader><CardContent><form key={`quiz-settings-${course.id}-${course.updatedAt}`} className="space-y-5" onSubmit={submit}>
    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${enabled ? 'border-brand-500 bg-brand-50/60' : 'border-paper-line bg-white'} ${!editable ? 'cursor-not-allowed opacity-70' : ''}`}><input name="quizEnabled" type="checkbox" checked={enabled} disabled={!editable} onChange={(event) => { const next = event.currentTarget.checked; setEnabled(next); if (!next) setRequired(false); }} className="mt-0.5 size-4 accent-brand-700" /><span><span className="block text-sm font-semibold text-slate-950">Enable the course quiz</span><span className="mt-1 block text-xs leading-5 text-slate-600">Learners will see a quiz at the end of the course. Questions and answers are managed below.</span></span></label>
    <div className={`grid gap-4 rounded-xl bg-paper p-4 sm:grid-cols-2 ${!enabled ? 'opacity-60' : ''}`}>
      <label className={`flex items-start gap-2 text-sm ${!enabled || !editable ? 'cursor-not-allowed text-slate-500' : 'text-slate-700'}`}><input name="quizRequired" type="checkbox" checked={required} disabled={!enabled || !editable} onChange={(event) => setRequired(event.currentTarget.checked)} className="mt-0.5 size-4 accent-brand-700 disabled:opacity-50" /><span><span className="block font-medium">Require a pass for course completion</span><span className="mt-1 block text-xs leading-5 text-slate-500">When off, the quiz is optional and does not block completion.</span></span></label>
      <FormInput label="Passing score (%)" name="quizPassPercent" type="number" value={passPercent} onChange={(event) => setPassPercent(event.currentTarget.value)} min={1} max={100} required disabled={!enabled || !editable} />
    </div>
    <div className="flex flex-wrap items-center gap-3 border-t border-paper-line pt-4"><Button type="submit" disabled={!editable || pending}>{pending ? 'Saving settings…' : 'Save quiz settings'}</Button>{!editable && <p className="text-sm text-slate-500">Unpublish this course to change its settings.</p>}{!enabled && <p className="text-xs text-slate-500">The existing quiz content is kept if you disable the quiz.</p>}</div>
  </form></CardContent></Card>;
}

function blankQuizQuestion(): QuizQuestionDraft {
  return { prompt: '', type: 'single_choice', points: 1, options: [{ label: '', isCorrect: true }, { label: '', isCorrect: false }] };
}

function QuizBuilder({ courseId, editable }: { courseId: string; editable: boolean }) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['adminQuiz', courseId], queryFn: () => getAdminQuiz(courseId) });
  const [draft, setDraft] = useState<QuizDraft>({ title: 'Course quiz', description: null, questions: [blankQuizQuestion()] });
  const [validationError, setValidationError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  useEffect(() => {
    if (!query.data?.quiz) return;
    setDraft({
      title: query.data.quiz.title,
      description: query.data.quiz.description,
      questions: query.data.quiz.questions.map(({ prompt, type, points, options }) => ({
        prompt, type, points, options: options.map(({ label, isCorrect }) => ({ label, isCorrect })),
      })),
    });
  }, [query.data]);
  const save = useMutation({ mutationFn: (input: QuizDraft) => saveAdminQuiz(courseId, input), onSuccess: async () => {
    setSavedMessage('Quiz saved.');
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['adminQuiz', courseId] }),
      queryClient.invalidateQueries({ queryKey: ['adminCourse', courseId] }),
    ]);
  } });
  const locked = !editable || Boolean(query.data?.editingLocked);
  function markEditing() { setSavedMessage(''); setValidationError(''); }
  function updateQuestion(questionIndex: number, update: Partial<QuizQuestionDraft>) {
    markEditing();
    setDraft((current) => ({ ...current, questions: current.questions.map((question, index) => index === questionIndex ? { ...question, ...update } : question) }));
  }
  function setQuestionType(questionIndex: number, type: QuizQuestionType) {
    const question = draft.questions[questionIndex];
    if (!question) return;
    let options = type === 'true_false'
      ? [{ label: 'True', isCorrect: true }, { label: 'False', isCorrect: false }]
      : question.options.length >= 2 ? question.options : [{ label: '', isCorrect: true }, { label: '', isCorrect: false }];
    if (type === 'single_choice') {
      const correctIndex = Math.max(0, options.findIndex((option) => option.isCorrect));
      options = options.map((option, index) => ({ ...option, isCorrect: index === correctIndex }));
    }
    updateQuestion(questionIndex, {
      type,
      options,
    });
  }
  function updateOption(questionIndex: number, optionIndex: number, patch: Partial<QuizQuestionDraft['options'][number]>) {
    const question = draft.questions[questionIndex];
    if (!question) return;
    const options = question.options.map((option, index) => {
      if (index !== optionIndex) return question.type === 'single_choice' && patch.isCorrect ? { ...option, isCorrect: false } : option;
      return { ...option, ...patch };
    });
    updateQuestion(questionIndex, { options });
  }
  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    markEditing();
    if (draft.title.trim().length < 2 || draft.title.trim().length > 160) { setValidationError('Enter a quiz title between 2 and 160 characters.'); return; }
    if (draft.description && draft.description.length > 5000) { setValidationError('Keep the quiz description under 5,000 characters.'); return; }
    if (draft.questions.length < 1 || draft.questions.length > 100) { setValidationError('A quiz must contain between 1 and 100 questions.'); return; }
    for (const [index, question] of draft.questions.entries()) {
      const questionNumber = index + 1;
      if (question.prompt.trim().length < 2 || question.prompt.trim().length > 5000) { setValidationError(`Question ${questionNumber}: enter a prompt between 2 and 5,000 characters.`); return; }
      if (!Number.isInteger(question.points) || question.points < 1 || question.points > 100) { setValidationError(`Question ${questionNumber}: points must be a whole number from 1 to 100.`); return; }
      if (question.options.length < 2 || question.options.length > 8) { setValidationError(`Question ${questionNumber}: add between 2 and 8 answer options.`); return; }
      const labels = question.options.map((option) => option.label.trim().toLocaleLowerCase());
      if (labels.some((label) => !label) || labels.some((label, labelIndex) => labels.indexOf(label) !== labelIndex)) { setValidationError(`Question ${questionNumber}: answer options must be filled in and unique.`); return; }
      const correctCount = question.options.filter((option) => option.isCorrect).length;
      if (question.type === 'single_choice' && correctCount !== 1) { setValidationError(`Question ${questionNumber}: mark exactly one correct answer.`); return; }
      if (question.type === 'multiple_choice' && correctCount < 1) { setValidationError(`Question ${questionNumber}: mark at least one correct answer.`); return; }
      if (question.type === 'true_false' && (question.options.length !== 2 || correctCount !== 1 || labels[0] !== 'true' || labels[1] !== 'false')) { setValidationError(`Question ${questionNumber}: choose one correct answer for True / False.`); return; }
    }
    const cleanDraft: QuizDraft = { ...draft, title: draft.title.trim(), description: draft.description?.trim() || null, questions: draft.questions.map((question) => ({ ...question, prompt: question.prompt.trim(), options: question.options.map((option) => ({ ...option, label: option.label.trim() })) })) };
    save.mutate(cleanDraft);
  }
  if (query.isPending) return <Card><CardContent className="p-5 text-sm text-slate-600">Loading quiz builder…</CardContent></Card>;
  if (query.isError) return <ErrorNotice error={query.error} />;
  return <Card><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle>Course quiz</CardTitle><CardDescription>{query.data.editingLocked ? 'This quiz is locked because learners have submitted attempts; scores retain the original answer key.' : query.data.quiz ? 'Edit questions and answers. Learners see their results after submitting an attempt.' : 'Create the course quiz by adding questions and choosing the correct answers.'}</CardDescription></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${query.data.editingLocked ? 'bg-amber-50 text-amber-900' : query.data.quiz ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800'}`}>{query.data.editingLocked ? 'Locked after first attempt' : query.data.quiz ? `${query.data.quiz.questions.length} questions` : 'Not saved yet'}</span></div></CardHeader><CardContent><form className="space-y-5" onSubmit={saveDraft}>
    <FormInput label="Quiz title" name="quizTitle" value={draft.title} required minLength={2} maxLength={160} disabled={locked} onChange={(event) => { markEditing(); setDraft((current) => ({ ...current, title: event.currentTarget.value })); }} />
    <label className="block space-y-1.5 text-sm font-medium text-slate-800">Description<textarea value={draft.description ?? ''} onChange={(event) => { markEditing(); setDraft((current) => ({ ...current, description: event.currentTarget.value || null })); }} rows={3} maxLength={5000} disabled={locked} className="w-full rounded-lg border border-paper-line-strong px-3 py-2 text-sm font-normal disabled:bg-paper-muted" /><span className="block text-xs font-normal text-slate-500">Shown to learners before they begin.</span></label>
    {draft.questions.map((question, questionIndex) => <section key={questionIndex} className="space-y-3 rounded-xl border border-paper-line p-4">
      <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-900">Question {questionIndex + 1}</h3><Button type="button" size="sm" variant="ghost" disabled={locked || draft.questions.length <= 1} onClick={() => { markEditing(); setDraft((current) => ({ ...current, questions: current.questions.filter((_, index) => index !== questionIndex) })); }}>Remove</Button></div>
      <label className="block space-y-1.5 text-sm font-medium text-slate-800">Question prompt<textarea value={question.prompt} onChange={(event) => updateQuestion(questionIndex, { prompt: event.currentTarget.value })} required minLength={2} maxLength={5000} rows={2} disabled={locked} className="w-full rounded-lg border border-paper-line-strong px-3 py-2 text-sm font-normal disabled:bg-paper-muted" /><span className="block text-xs font-normal text-slate-500">{question.prompt.length.toLocaleString()} / 5,000 characters</span></label>
      <div className="grid gap-3 sm:grid-cols-2"><label className="block space-y-1.5 text-sm font-medium text-slate-800">Question type<select value={question.type} disabled={locked} onChange={(event) => setQuestionType(questionIndex, event.currentTarget.value as QuizQuestionType)} className="min-h-10 w-full rounded-lg border border-paper-line-strong px-3 text-sm font-normal disabled:bg-paper-muted"><option value="single_choice">Single choice</option><option value="multiple_choice">Multiple choice</option><option value="true_false">True / False</option></select></label><FormInput label="Points" name={`points-${questionIndex}`} type="number" value={String(question.points)} min={1} max={100} required disabled={locked} onChange={(event) => updateQuestion(questionIndex, { points: Number(event.currentTarget.value) })} /></div>
      <fieldset disabled={locked} className="space-y-2"><legend className="text-sm font-medium text-slate-800">Options · mark the correct {question.type === 'multiple_choice' ? 'answers' : 'answer'}</legend>{question.options.map((option, optionIndex) => <div key={optionIndex} className="flex items-center gap-2"><input aria-label={`Option ${optionIndex + 1} correct`} type={question.type === 'multiple_choice' ? 'checkbox' : 'radio'} name={`correct-${questionIndex}`} checked={option.isCorrect} onChange={(event) => updateOption(questionIndex, optionIndex, { isCorrect: event.currentTarget.checked })} className="size-4 accent-brand-700" /><input aria-label={`Option ${optionIndex + 1}`} value={option.label} readOnly={question.type === 'true_false'} onChange={(event) => updateOption(questionIndex, optionIndex, { label: event.currentTarget.value })} placeholder={`Option ${optionIndex + 1}`} required minLength={1} maxLength={500} className="min-h-10 flex-1 rounded-lg border border-paper-line-strong px-3 text-sm" />{question.type !== 'true_false' && <Button type="button" size="sm" variant="ghost" disabled={question.options.length <= 2} onClick={() => updateQuestion(questionIndex, { options: question.options.filter((_, index) => index !== optionIndex) })}>Remove</Button>}</div>)}{question.type !== 'true_false' && <Button type="button" size="sm" variant="outline" disabled={question.options.length >= 8 || locked} onClick={() => updateQuestion(questionIndex, { options: [...question.options, { label: '', isCorrect: false }] })}>Add option</Button>}</fieldset>
    </section>)}
    <div className="flex flex-wrap items-center gap-3 border-t border-paper-line pt-4"><Button type="button" variant="outline" disabled={locked || draft.questions.length >= 100} onClick={() => { markEditing(); setDraft((current) => ({ ...current, questions: [...current.questions, blankQuizQuestion()] })); }}>Add question</Button><Button type="submit" disabled={locked || save.isPending}>{save.isPending ? 'Saving quiz…' : 'Save quiz'}</Button><span className="text-xs text-slate-500">{draft.questions.reduce((total, question) => total + (Number.isFinite(question.points) ? question.points : 0), 0)} points across {draft.questions.length} questions</span></div>
    {validationError && <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{validationError}</p>}{savedMessage && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{savedMessage}</p>}{save.isError && <ErrorNotice error={save.error} />}
  </form></CardContent></Card>;
}

function ModuleEditor({ course, module, moduleIndex, canEdit, onError, onChanged }: {
  course: CourseRecord; module: CourseModuleRecord; moduleIndex: number; canEdit: boolean; onError: (error: unknown) => void; onChanged: () => Promise<void>;
}) {
  const update = useMutation({ mutationFn: (input: ModuleInput) => updateModule(course.id, module.id, input), onSuccess: onChanged, onError });
  const remove = useMutation({ mutationFn: () => deleteModule(course.id, module.id), onSuccess: onChanged, onError });
  const reorder = useMutation({ mutationFn: (ids: string[]) => reorderModules(course.id, ids), onSuccess: onChanged, onError });
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); update.mutate(getModuleInput(event.currentTarget)); }
  function move(delta: number) {
    const ids = course.modules.map((item) => item.id);
    const target = moduleIndex + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[moduleIndex], ids[target]] = [ids[target]!, ids[moduleIndex]!];
    reorder.mutate(ids);
  }
  return <section className="rounded-xl border border-paper-line p-4 sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Module {moduleIndex + 1}</p><h3 className="mt-1 font-semibold text-slate-950">{module.title}</h3></div><div className="flex gap-2"><Button type="button" size="sm" variant="outline" disabled={!canEdit || moduleIndex === 0 || reorder.isPending} aria-label="Move module up" onClick={() => move(-1)}>↑</Button><Button type="button" size="sm" variant="outline" disabled={!canEdit || moduleIndex === course.modules.length - 1 || reorder.isPending} aria-label="Move module down" onClick={() => move(1)}>↓</Button></div></div>
    {canEdit && <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={submit}><FormInput label="Module title" name="title" defaultValue={module.title} required /><FormInput label="Description" name="description" defaultValue={module.description ?? ''} /><div className="flex items-end gap-2"><Button size="sm" type="submit" disabled={update.isPending}>Save</Button><Button type="button" size="sm" variant="ghost" onClick={() => { if (window.confirm('Delete this module and its lessons?')) remove.mutate(); }}>Delete</Button></div></form>}
    <div className="mt-5 space-y-3">{module.lessons.map((lesson, index) => <div key={lesson.id} className="rounded-lg bg-paper p-3"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-slate-900">{lesson.title}</p><p className="mt-1 text-xs text-slate-500">{lesson.type} · {lesson.required ? 'Required' : 'Optional'}</p></div><div className="flex gap-1"><Button type="button" size="sm" variant="ghost" disabled={!canEdit || index === 0} aria-label="Move lesson up" onClick={() => { const ids = module.lessons.map((item) => item.id); [ids[index - 1], ids[index]] = [ids[index]!, ids[index - 1]!]; reorderLessons(course.id, module.id, ids).then(onChanged).catch(onError); }}>↑</Button><Button type="button" size="sm" variant="ghost" disabled={!canEdit || index === module.lessons.length - 1} aria-label="Move lesson down" onClick={() => { const ids = module.lessons.map((item) => item.id); [ids[index], ids[index + 1]] = [ids[index + 1]!, ids[index]!]; reorderLessons(course.id, module.id, ids).then(onChanged).catch(onError); }}>↓</Button></div></div>{canEdit && <details className="mt-2"><summary className="cursor-pointer text-xs font-medium text-brand-800">Edit lesson</summary><LessonEditor courseId={course.id} moduleId={module.id} lesson={lesson} onError={onError} onChanged={onChanged} /></details>}</div>)}</div>
    {canEdit && <CreateLessonForm courseId={course.id} moduleId={module.id} onError={onError} onChanged={onChanged} />}
  </section>;
}

function CreateModuleForm({ courseId, onError, onChanged }: { courseId: string; onError: (error: unknown) => void; onChanged: () => Promise<void> }) {
  const mutation = useMutation({ mutationFn: (input: ModuleInput) => createModule(courseId, input), onSuccess: onChanged, onError });
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; mutation.mutate(getModuleInput(form), { onSuccess: () => form.reset() }); }
  return <form className="grid gap-3 rounded-xl border border-dashed border-paper-line-strong p-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={submit}><FormInput label="New module title" name="title" required /><FormInput label="Description" name="description" /><Button type="submit" disabled={mutation.isPending}>Add module</Button>{mutation.isError && <div className="md:col-span-3"><ErrorNotice error={mutation.error} /></div>}</form>;
}

function CreateLessonForm({ courseId, moduleId, onError, onChanged }: { courseId: string; moduleId: string; onError: (error: unknown) => void; onChanged: () => Promise<void> }) {
  const [lessonType, setLessonType] = useState<LessonInput['type']>('VIDEO');
  const [textContent, setTextContent] = useState('');
  const mutation = useMutation({ mutationFn: (input: LessonInput) => createLesson(courseId, moduleId, input), onSuccess: async () => { setLessonType('VIDEO'); await onChanged(); }, onError });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = getLessonInput(form);
    mutation.mutate({ ...input, type: lessonType, content: lessonType === 'TEXT' ? textContent.trim() || null : null }, { onSuccess: () => { form.reset(); setTextContent(''); } });
  }
  const types: Array<{ type: LessonInput['type']; title: string; detail: string }> = [
    { type: 'VIDEO', title: 'Video', detail: 'Teach with a recorded lesson' },
    { type: 'PDF', title: 'PDF', detail: 'Share a document or worksheet' },
    { type: 'TEXT', title: 'Text', detail: 'Write a lesson directly' },
  ];
  return <form className="mt-4 space-y-4 rounded-xl border border-paper-line-strong bg-white p-4 sm:p-5" onSubmit={submit}>
    <div><h4 className="text-sm font-semibold text-slate-950">Add a lesson</h4><p className="mt-1 text-xs text-slate-600">Choose a format, then add its details.</p></div>
    <div role="group" aria-label="Lesson format" className="grid gap-2 sm:grid-cols-3">{types.map(({ type, title, detail }) => <button key={type} type="button" aria-pressed={lessonType === type} onClick={() => setLessonType(type)} className={`min-h-20 rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${lessonType === type ? 'border-brand-700 bg-brand-50 ring-1 ring-brand-700' : 'border-paper-line-strong hover:border-brand-300 hover:bg-paper'}`}><span className="block text-sm font-semibold text-slate-950">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-600">{detail}</span></button>)}</div>
    <input type="hidden" name="type" value={lessonType} />
    <div className="grid gap-3 md:grid-cols-2"><FormInput label="Lesson title" name="title" required /><FormTextarea label="Lesson description" name="description" rows={2} />{lessonType === 'TEXT' && <TextLessonContentField value={textContent} onChange={setTextContent} />}</div>
    {lessonType !== 'TEXT' && <p className="rounded-lg bg-paper px-3 py-2 text-xs leading-5 text-slate-600">After creating the lesson, you can upload its {lessonType === 'VIDEO' ? 'video' : 'PDF'} file. Learners can open it once processing is complete.</p>}
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-paper-line pt-4"><FormCheckbox label="Required for course completion" name="required" defaultChecked /><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Adding…' : 'Add lesson'}</Button></div>
    {mutation.isError && <ErrorNotice error={mutation.error} />}
  </form>;
}

function LessonEditor({ courseId, moduleId, lesson, onError, onChanged }: {
  courseId: string; moduleId: string; lesson: CourseModuleRecord['lessons'][number]; onError: (error: unknown) => void; onChanged: () => Promise<void>;
}) {
  const [lessonType, setLessonType] = useState<LessonInput['type']>(lesson.type);
  const [textContent, setTextContent] = useState(lesson.content ?? '');
  const update = useMutation({ mutationFn: (input: LessonInput) => updateLesson(courseId, moduleId, lesson.id, input), onSuccess: onChanged, onError });
  const remove = useMutation({ mutationFn: () => deleteLesson(courseId, moduleId, lesson.id), onSuccess: onChanged, onError });
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const input = getLessonInput(event.currentTarget); update.mutate({ ...input, type: lessonType, content: lessonType === 'TEXT' ? textContent.trim() || null : null }); }
  return <div><form key={`${lesson.id}-${lesson.updatedAt}`} className="mt-3 grid gap-3 md:grid-cols-2" onSubmit={submit}><FormInput label="Lesson title" name="title" defaultValue={lesson.title} required /><label className="block space-y-1.5 text-sm font-medium text-slate-800">Lesson type<select name="type" value={lessonType} onChange={(event) => setLessonType(event.currentTarget.value as LessonInput['type'])} className="min-h-10 w-full rounded-lg border border-paper-line-strong bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"><option value="VIDEO">Video</option><option value="PDF">PDF</option><option value="TEXT">Text</option></select></label><FormTextarea label="Lesson description" name="description" defaultValue={lesson.description} rows={2} />{lessonType === 'TEXT' && <TextLessonContentField value={textContent} onChange={setTextContent} />}<FormCheckbox label="Required for course completion" name="required" defaultChecked={lesson.required} /><div className="flex items-end gap-2"><Button size="sm" type="submit" disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save lesson'}</Button><Button size="sm" type="button" variant="ghost" onClick={() => { if (window.confirm('Delete this lesson?')) remove.mutate(); }}>Delete</Button></div>{(update.isError || remove.isError) && <div className="md:col-span-2"><ErrorNotice error={update.error ?? remove.error} /></div>}</form>{lessonType !== 'TEXT' && <MediaUploadPanel key={`${lesson.id}-${lessonType}`} lesson={{ ...lesson, type: lessonType }} />}</div>;
}

function TextLessonContentField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label className="block space-y-1.5 text-sm font-medium text-slate-800 md:col-span-2">Lesson content<textarea name="content" value={value} onChange={(event) => onChange(event.currentTarget.value)} rows={12} placeholder="Write the lesson content here…" className="w-full resize-y rounded-lg border border-paper-line-strong px-3 py-2.5 text-sm font-normal leading-6 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" /><span className="flex flex-wrap justify-between gap-2 text-xs font-normal text-slate-500"><span>Plain text is shown to learners as written. Use blank lines to separate paragraphs.</span><span aria-live="polite">{value.length.toLocaleString()} characters</span></span></label>;
}

function MediaUploadPanel({ lesson }: { lesson: CourseModuleRecord['lessons'][number] }) {
  const queryClient = useQueryClient();
  const mediaQuery = useQuery({
    queryKey: ['adminLessonMedia', lesson.id],
    queryFn: () => listLessonMedia(lesson.id),
    refetchInterval: (query) => query.state.data?.some((media) => media.status === 'uploading' || media.status === 'processing') ? 2500 : false,
  });
  const [stage, setStage] = useState<'idle' | 'starting' | 'uploading' | 'finalizing' | 'canceling'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [transferredBytes, setTransferredBytes] = useState(0);
  const [dropActive, setDropActive] = useState(false);
  const [uploadError, setUploadError] = useState<unknown>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const uploadController = useRef<AbortController | null>(null);
  const uploading = stage !== 'idle';
  const retryMutation = useMutation({ mutationFn: retryMediaProcessing, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['adminLessonMedia', lesson.id] }); } });

  async function uploadFile(file: File) {
    setSelectedFile(file);
    setUploadError(null);
    setUploadMessage('');
    const extension = file.name.toLowerCase().split('.').pop() ?? '';
    const supportedExtensions = lesson.type === 'VIDEO' ? ['mp4', 'm4v', 'mov', 'webm', 'mkv'] : ['pdf'];
    if (!supportedExtensions.includes(extension)) {
      setUploadError(`Choose a ${lesson.type === 'VIDEO' ? 'video file (.mp4, .m4v, .mov, .webm or .mkv)' : 'PDF file (.pdf)'}.`);
      return;
    }
    if (file.size === 0) {
      setUploadError('This file is empty. Choose a file that contains content.');
      return;
    }
    const controller = new AbortController();
    uploadController.current = controller;
    setStage('starting');
    setProgress(0);
    setTransferredBytes(0);
    let mediaId: string | undefined;
    try {
      const contentType = mimeTypeForFile(file.name);
      const started = await startMediaUpload({ lessonId: lesson.id, fileName: file.name, contentType, sizeBytes: file.size });
      mediaId = started.media.id;
      if (controller.signal.aborted) throw new DOMException('Upload cancelled', 'AbortError');
      const totalParts = Math.ceil(file.size / started.partSizeBytes);
      let nextPart = 0;
      let transferred = 0;
      setStage('uploading');
      const uploadPart = async () => {
        while (true) {
          if (controller.signal.aborted) throw new DOMException('Upload cancelled', 'AbortError');
          const index = nextPart++;
          if (index >= totalParts) return;
          const blob = file.slice(index * started.partSizeBytes, Math.min(file.size, (index + 1) * started.partSizeBytes));
          let sent = false;
          for (let attempt = 0; attempt < 3 && !sent; attempt += 1) {
            try {
              const part = await getMediaUploadPartUrl(mediaId!, index + 1);
              if (controller.signal.aborted) throw new DOMException('Upload cancelled', 'AbortError');
              const response = await fetch(part.url, { method: 'PUT', body: blob, signal: controller.signal });
              sent = response.ok;
            } catch (error) {
              if (controller.signal.aborted) throw error;
              if (attempt === 2) throw new Error(`Part ${index + 1} could not be uploaded. Please retry.`);
            }
            if (!sent && attempt === 2) throw new Error(`Part ${index + 1} could not be uploaded. Please retry.`);
          }
          transferred += blob.size;
          setTransferredBytes(transferred);
          setProgress(file.size ? Math.round((transferred / file.size) * 100) : 100);
        }
      };
      await Promise.all(Array.from({ length: Math.min(3, totalParts) }, () => uploadPart()));
      if (controller.signal.aborted) throw new DOMException('Upload cancelled', 'AbortError');
      setStage('finalizing');
      await completeMediaUpload(mediaId);
      setProgress(100);
      setTransferredBytes(file.size);
      setUploadMessage('Upload received. Your file is being processed and will appear below when ready.');
      await queryClient.invalidateQueries({ queryKey: ['adminLessonMedia', lesson.id] });
    } catch (error) {
      if (mediaId) await abortMediaUpload(mediaId).catch(() => undefined);
      if (controller.signal.aborted) setUploadMessage('Upload cancelled. Choose the file again when you are ready.');
      else setUploadError(error);
      await queryClient.invalidateQueries({ queryKey: ['adminLessonMedia', lesson.id] });
    } finally {
      uploadController.current = null;
      setStage('idle');
    }
  }

  async function cancelUpload() {
    if (!uploadController.current || stage === 'finalizing') return;
    setStage('canceling');
    uploadController.current.abort();
  }

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (file && !uploading) void uploadFile(file);
  }

  const accept = lesson.type === 'VIDEO' ? 'video/mp4,video/quicktime,video/webm,video/x-matroska,.mp4,.m4v,.mov,.webm,.mkv' : 'application/pdf,.pdf';
  const kindLabel = lesson.type === 'VIDEO' ? 'video' : 'PDF';
  const statusStyles: Record<MediaAssetSummary['status'], string> = { uploading: 'bg-blue-50 text-blue-800', processing: 'bg-amber-50 text-amber-900', ready: 'bg-emerald-50 text-emerald-800', failed: 'bg-red-50 text-red-800', aborted: 'bg-slate-100 text-slate-600' };
  const statusLabel: Record<MediaAssetSummary['status'], string> = { uploading: 'Uploading', processing: 'Processing', ready: 'Ready', failed: 'Failed', aborted: 'Cancelled' };
  const stageLabel = stage === 'starting' ? 'Preparing secure upload…' : stage === 'uploading' || stage === 'canceling' ? 'Uploading directly to secure storage' : stage === 'finalizing' ? 'Finishing upload…' : '';
  return <section className="mt-4 space-y-4 rounded-xl border border-paper-line bg-white p-4 sm:p-5" aria-labelledby={`lesson-media-title-${lesson.id}`}>
    <div><h4 id={`lesson-media-title-${lesson.id}`} className="text-sm font-semibold text-slate-950">{kindLabel} file</h4><p className="mt-1 text-xs leading-5 text-slate-600">Upload goes directly to private storage. Learners can access the file after processing is complete.</p></div>
    <div onDragEnter={(event) => { event.preventDefault(); if (!uploading) setDropActive(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropActive(false); }} onDrop={(event) => { event.preventDefault(); setDropActive(false); onFiles(event.dataTransfer.files); }} className={`rounded-xl border-2 border-dashed p-4 text-center transition sm:p-6 ${dropActive ? 'border-brand-600 bg-brand-50' : 'border-paper-line-strong bg-paper/60'} ${uploading ? 'opacity-70' : ''}`}>
      <input id={`media-file-${lesson.id}`} className="peer sr-only" type="file" accept={accept} disabled={uploading} aria-label={`Choose ${kindLabel} file`} onChange={(event) => { onFiles(event.currentTarget.files); event.currentTarget.value = ''; }} />
      <p className="text-sm font-semibold text-slate-900">{dropActive ? 'Drop your file to start uploading' : 'Drag and drop your file here'}</p>
      <p className="mt-1 text-xs text-slate-600">or choose a {kindLabel} from your device</p>
      <label htmlFor={`media-file-${lesson.id}`} className={`mt-3 inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-paper-line-strong bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm hover:border-brand-500 hover:text-brand-800 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 peer-focus-visible:ring-offset-2 ${uploading ? 'pointer-events-none opacity-50' : ''}`}>Choose {kindLabel} file</label>
      <p className="mt-3 text-xs text-slate-500">Supported: {lesson.type === 'VIDEO' ? 'MP4, M4V, MOV, WebM and MKV' : 'PDF'}</p>
    </div>
    {selectedFile && <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-paper-line bg-white px-3 py-2.5"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900">{selectedFile.name}</p><p className="text-xs text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p></div>{uploadError && typeof uploadError !== 'string' && stage === 'idle' && <Button size="sm" variant="outline" onClick={() => void uploadFile(selectedFile)}>Retry upload</Button>}</div>}
    {uploading && <div className="space-y-2" aria-live="polite"><div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600"><span>{stageLabel}</span>{stage === 'uploading' && <span>{(transferredBytes / (1024 * 1024)).toFixed(1)} / {((selectedFile?.size ?? 0) / (1024 * 1024)).toFixed(1)} MB · {progress}%</span>}</div>{stage === 'uploading' && <progress className="h-2 w-full accent-brand-700" max={100} value={progress} aria-label="File upload progress" />}{stage !== 'finalizing' && <Button size="sm" type="button" variant="outline" disabled={stage === 'canceling'} onClick={() => void cancelUpload()}>{stage === 'canceling' ? 'Cancelling…' : 'Cancel upload'}</Button>}</div>}
    {Boolean(uploadMessage) && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{uploadMessage}</p>}
    {Boolean(uploadError) && <div className="space-y-2">{typeof uploadError === 'string' ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{uploadError}</p> : <ErrorNotice error={uploadError} />}<p className="text-xs text-slate-600">Your file is still selected, so you can retry without choosing it again.</p></div>}
    {mediaQuery.isError && <ErrorNotice error={mediaQuery.error} />}{retryMutation.isError && <ErrorNotice error={retryMutation.error} />}
    <div className="space-y-2" aria-live="polite">{mediaQuery.data?.length === 0 && <p className="rounded-lg bg-paper px-3 py-3 text-sm text-slate-600">No {kindLabel.toLowerCase()} uploaded yet.</p>}{mediaQuery.data?.map((media) => <div key={media.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-paper px-3 py-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="max-w-full truncate text-sm font-medium text-slate-900">{media.originalFileName}</p><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyles[media.status]}`}>{statusLabel[media.status]}</span></div><p className="mt-1 text-xs text-slate-500">{(media.sourceSizeBytes / (1024 * 1024)).toFixed(1)} MB{media.durationSeconds ? ` · ${Math.floor(media.durationSeconds / 60)}:${String(media.durationSeconds % 60).padStart(2, '0')}` : ''}{media.width && media.height ? ` · ${media.width} × ${media.height}` : ''}</p>{media.status === 'processing' && <p className="mt-1 text-xs text-slate-600">This file is being prepared for learners. The page will update automatically.</p>}{media.errorCode && <p className="mt-1 text-xs text-red-700">{media.errorCode}</p>}</div>{media.status === 'failed' && <Button size="sm" variant="outline" disabled={retryMutation.isPending} onClick={() => retryMutation.mutate(media.id)}>{retryMutation.isPending ? 'Retrying…' : 'Retry processing'}</Button>}</div>)}</div>
  </section>;
}

function mimeTypeForFile(fileName: string) {
  const extension = fileName.toLowerCase().split('.').pop();
  const types: Record<string, string> = { pdf: 'application/pdf', mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', mkv: 'video/x-matroska' };
  return types[extension ?? ''] ?? 'application/octet-stream';
}

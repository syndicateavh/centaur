import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState, type ChangeEventHandler, type FormEvent, type ReactNode } from 'react';
import type Hls from 'hls.js';
import { ApiRequestError, getApiBaseUrl, loadCurrentUser } from './lib/auth-api.js';
import {
  changeCourseStatus, createCourse, createLesson, createModule, deleteCourse, deleteLesson, deleteModule,
  abortMediaUpload, completeMediaUpload, enrollInCourse, getAdminCourse, getAdminQuiz, getEnrolledCourse, getLearnerProfile, getLessonPlaybackMedia, getMediaUploadPartUrl, getLearnerQuiz, getPublishedCourse, listAdminCourses, listCourses, listLessonMedia, listMyCourses, openLearnerLesson, reorderLessons, reorderModules, retryMediaProcessing, saveAdminQuiz, startMediaUpload, submitLearnerQuiz,
  updateCourse, updateLesson, updateModule,
  getLessonProgress, markLessonComplete, recordVideoProgress,
  type CourseInput, type CourseModuleRecord, type CourseRecord, type EnrolledCourse, type EnrolledCourseSummary, type LearnerLesson, type LessonInput, type LessonProgress, type MediaAssetSummary, type ModuleInput, type QuizAttemptResult, type QuizDraft, type QuizQuestionDraft, type QuizQuestionType, type QuizSubmission,
} from './lib/courses-api.js';
import { Button } from './components/ui/button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card.js';

function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8"><div><Link to="/" className="text-lg font-bold text-slate-950">Centaur <span className="text-sky-700">Learn</span></Link><p className="mt-3 text-xs font-semibold uppercase tracking-wider text-sky-700">{eyebrow}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{title}</h1></div>{children}</div></header>;
}

function FormInput({ label, name, type = 'text', defaultValue, value, onChange, required = false, disabled = false }: { label: string; name: string; type?: string; defaultValue?: string | number; value?: string; onChange?: ChangeEventHandler<HTMLInputElement>; required?: boolean; disabled?: boolean }) {
  return <label className="block space-y-1.5 text-sm font-medium text-slate-800">{label}<input name={name} type={type} {...(value === undefined ? { defaultValue } : { value })} onChange={onChange} required={required} disabled={disabled} className="min-h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100" /></label>;
}

function FormTextarea({ label, name, defaultValue, rows = 3 }: { label: string; name: string; defaultValue?: string | null; rows?: number }) {
  return <label className="block space-y-1.5 text-sm font-medium text-slate-800">{label}<textarea name={name} defaultValue={defaultValue ?? ''} rows={rows} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100" /></label>;
}

function FormCheckbox({ label, name, defaultChecked = false }: { label: string; name: string; defaultChecked?: boolean }) {
  return <label className="flex items-start gap-2 text-sm text-slate-700"><input name={name} type="checkbox" defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-sky-700" />{label}</label>;
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
  return <main className="min-h-screen bg-slate-50"><PageHeader eyebrow="Explore" title="Courses"><Button asChild variant="outline"><Link to="/">Home</Link></Button></PageHeader><section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
    {coursesQuery.isPending && <LoadingMessage />}
    {coursesQuery.isError && <ErrorNotice error={coursesQuery.error} />}
    {coursesQuery.data?.length === 0 && <Card><CardContent className="p-6 text-sm text-slate-600">No courses are published yet. Please check again soon.</CardContent></Card>}
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{coursesQuery.data?.map((course) => <Card key={course.id}><CardHeader><p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Published course</p><CardTitle>{course.title}</CardTitle><CardDescription>{course.description || 'Explore this free course and its learning outline.'}</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between gap-3 text-sm text-slate-600"><span>{course.certificateEnabled ? 'Certificate enabled' : 'Self-paced course'}</span><Button asChild size="sm" variant="outline"><Link to={`/courses/${course.slug}`}>View course</Link></Button></div></CardContent></Card>)}</div>
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
  return <main className="min-h-screen bg-slate-50"><PageHeader eyebrow="Course overview" title={course.title}><Button asChild variant="outline"><Link to="/courses">All courses</Link></Button></PageHeader><section className="mx-auto max-w-4xl space-y-5 px-5 py-10 sm:px-8"><Card><CardHeader><CardDescription>{course.description || 'Course outline'}</CardDescription><CardTitle className="text-xl">What you’ll learn</CardTitle></CardHeader><CardContent className="space-y-5">{course.modules.map((module) => <section key={module.id} className="rounded-xl border border-slate-200 p-4"><h2 className="font-semibold text-slate-950">{module.title}</h2>{module.description && <p className="mt-1 text-sm text-slate-600">{module.description}</p>}<ul className="mt-3 space-y-2">{module.lessons.map((lesson) => <li key={lesson.id} className="flex items-center justify-between gap-3 text-sm text-slate-700"><span>{lesson.title}</span><span className="text-xs text-slate-500">{lesson.type} · {lesson.required ? 'Required' : 'Optional'}{enrollment && enrollment.continueLessonId === lesson.id ? ' · Current' : enrollment ? ' · Available' : ' · Locked'}</span></li>)}</ul></section>)}{course.certificateEnabled && <p className="text-sm font-medium text-sky-800">Certificate available on eligible completion.</p>}<div className="flex flex-wrap items-center gap-3">{!userQuery.data && <Button asChild><Link to="/login">Sign in to enroll</Link></Button>}{userQuery.data && enrollment && <Button asChild><Link to={`/learn/courses/${course.id}`}>Continue learning</Link></Button>}{userQuery.data && !enrollment && <Button onClick={() => enrollMutation.mutate(course.id)} disabled={enrollMutation.isPending || myCoursesQuery.isPending || myCoursesQuery.isError}>{enrollMutation.isPending ? 'Enrolling…' : 'Enroll for free'}</Button>}{myCoursesQuery.isError && <ErrorNotice error={myCoursesQuery.error} />}{enrollMutation.isError && <ErrorNotice error={enrollMutation.error} />}</div></CardContent></Card></section></main>;
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
  return <main className="min-h-screen bg-slate-50"><PageHeader eyebrow="Your learning" title="My courses"><div className="flex gap-2"><Button asChild variant="outline"><Link to="/dashboard">Dashboard</Link></Button><Button asChild><Link to="/courses">Explore courses</Link></Button></div></PageHeader><section className="mx-auto max-w-6xl space-y-5 px-5 py-10 sm:px-8">
    {coursesQuery.isPending && <LoadingMessage />}{coursesQuery.isError && <ErrorNotice error={coursesQuery.error} />}
    {coursesQuery.data?.length === 0 && <Card><CardHeader><CardTitle>No enrolled courses yet</CardTitle><CardDescription>Choose a published course to start learning. Your course will appear here.</CardDescription></CardHeader><CardContent><Button asChild><Link to="/courses">Browse courses</Link></Button></CardContent></Card>}
    <div className="grid gap-5 md:grid-cols-2">{coursesQuery.data?.map((course: EnrolledCourseSummary) => <Card key={course.enrollmentId}><CardHeader><p className="text-xs font-semibold uppercase tracking-wider text-sky-700">{course.isCompleted ? 'Course completed' : `Enrolled ${new Date(course.enrolledAt).toLocaleDateString()}`}</p><CardTitle>{course.title}</CardTitle><CardDescription>{course.description || 'Continue your self-paced course.'}</CardDescription></CardHeader><CardContent><div className="mb-2 flex justify-between text-sm text-slate-600"><span>{course.completedRequiredLessonCount} of {course.requiredLessonCount} required lessons</span><span>{course.progressPercent}%</span></div><div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-sky-700" style={{ width: `${course.progressPercent}%` }} /></div>{course.completionBlockedByQuiz && <p className="mb-4 text-sm text-amber-900">Pass the required quiz to complete this course.</p>}<div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600"><span>{course.lessonCount} {course.lessonCount === 1 ? 'lesson' : 'lessons'}</span>{course.lastAccessedAt && <span>Last opened {new Date(course.lastAccessedAt).toLocaleDateString()}</span>}{course.certificateEnabled && <span>Certificate enabled</span>}</div><div className="flex flex-wrap gap-2"><Button asChild><Link to={`/learn/courses/${course.id}${course.continueLessonId ? `/lessons/${course.continueLessonId}` : ''}`}>{course.isCompleted ? 'Review course' : course.lastAccessedLessonId ? 'Continue learning' : course.lessonCount ? 'Start learning' : 'View course'}</Link></Button>{course.completionBlockedByQuiz && <Button asChild variant="outline"><Link to={`/learn/courses/${course.id}/quiz`}>Take required quiz</Link></Button>}</div></CardContent></Card>)}</div>
  </section></main>;
}

function LearnerCourseUnavailable({ error }: { error: unknown }) {
  const forbidden = error instanceof ApiRequestError && error.status === 403;
  return <main className="min-h-screen bg-slate-50"><PageHeader eyebrow="Learning" title={forbidden ? 'Enrollment required' : 'Course unavailable'}><Button asChild variant="outline"><Link to="/courses">Course catalogue</Link></Button></PageHeader><section className="mx-auto max-w-3xl px-5 py-10"><Card><CardHeader><CardTitle>{forbidden ? 'Enroll to access this course' : 'We could not open this course'}</CardTitle><CardDescription>{forbidden ? 'Enroll in this published course before opening its lessons.' : 'The course may have been unpublished or removed.'}</CardDescription></CardHeader><CardContent><Button asChild><Link to="/courses">Browse courses</Link></Button></CardContent></Card></section></main>;
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
  return <main className="min-h-screen bg-slate-50"><PageHeader eyebrow="Your course" title={course.title}><div className="flex gap-2"><Button asChild variant="outline"><Link to="/my-courses">My courses</Link></Button><Button asChild variant="outline"><Link to={`/courses/${course.slug}`}>Course overview</Link></Button></div></PageHeader><section className="mx-auto max-w-5xl space-y-5 px-5 py-10 sm:px-8"><Card><CardHeader><CardTitle>Course outline</CardTitle><CardDescription>{course.description || `You are enrolled in this course with ${lessonCount} lessons.`}</CardDescription></CardHeader><CardContent className="space-y-5"><div className="flex items-center justify-between text-sm text-slate-600"><span>{course.completedRequiredLessonCount} / {course.requiredLessonCount} required lessons</span><span>{course.progressPercent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-sky-700" style={{ width: `${course.progressPercent}%` }} /></div>{course.completionBlockedByQuiz && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Required lessons are complete. Pass the course quiz to complete this course.</p>}{course.isCompleted && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">Course completed.</p>}{course.modules.length === 0 && <p className="text-sm text-slate-600">This course has no modules yet.</p>}{course.modules.map((module, moduleIndex) => <section key={module.id} className="rounded-xl border border-slate-200 p-4"><h2 className="font-semibold text-slate-950">Module {moduleIndex + 1}: {module.title}</h2>{module.description && <p className="mt-1 text-sm text-slate-600">{module.description}</p>}<ul className="mt-3 space-y-2">{module.lessons.map((lesson) => <li key={lesson.id}><Link className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-sm text-slate-800 hover:bg-sky-50" to={`/learn/courses/${course.id}/lessons/${lesson.id}`}><span>{lesson.title}</span><span className="shrink-0 text-xs text-sky-800">{lesson.progressStatus === 'completed' ? 'Completed' : lesson.id === course.currentLessonId ? 'Current' : `${lesson.type} · Available`}</span></Link></li>)}</ul></section>)}{course.currentLessonId && <Button asChild><Link to={`/learn/courses/${course.id}/lessons/${course.currentLessonId}`}>Continue learning</Link></Button>}{course.quizEnabled && <Button variant="outline" asChild><Link to={`/learn/courses/${course.id}/quiz`}>{course.quizRequired ? 'Take required quiz' : 'Take optional quiz'}</Link></Button>}</CardContent></Card></section></main>;
}

export function LearnerLessonPage() {
  return <LearnerAccess><LearnerLesson /></LearnerAccess>;
}

function LessonMediaPlayer({ courseId, lessonId, type, progress, onProgress }: { courseId: string; lessonId: string; type: 'VIDEO' | 'PDF'; progress: LessonProgress; onProgress: (progress: LessonProgress) => void }) {
  const mediaQuery = useQuery({ queryKey: ['lessonPlaybackMedia', courseId, lessonId], queryFn: () => getLessonPlaybackMedia(courseId, lessonId) });
  if (mediaQuery.isPending) return <div className="grid min-h-64 place-items-center rounded-xl bg-slate-950 text-sm text-white">Loading media…</div>;
  if (mediaQuery.isError) return <div role="status" className="grid min-h-64 place-items-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center"><div><p className="font-medium text-slate-900">Media is not ready yet</p><p className="mt-2 max-w-md text-sm text-slate-600">The course team may still be processing this file. Please try again shortly.</p><Button className="mt-4" variant="outline" onClick={() => void mediaQuery.refetch()}>Check again</Button></div></div>;
  if (mediaQuery.data.kind !== type) return <ErrorNotice error={new Error('The media type does not match this lesson.')} />;
  if (type === 'PDF') return <iframe title="PDF lesson" src={mediaQuery.data.url} className="h-[75vh] min-h-96 w-full rounded-xl border border-slate-200 bg-white" />;
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
  return <main className="min-h-screen bg-slate-50"><PageHeader eyebrow={lesson.moduleTitle} title={lesson.courseTitle}><div className="flex gap-2"><Button asChild variant="outline"><Link to="/my-courses">My courses</Link></Button><Button asChild variant="outline"><Link to={`/learn/courses/${course.id}`}>Outline</Link></Button></div></PageHeader><section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
    <div className="space-y-5"><Card><CardHeader><p className="text-xs font-semibold uppercase tracking-wider text-sky-700">{lesson.type} lesson{lesson.required ? ' · Required' : ''}</p><CardTitle className="text-2xl">{lesson.title}</CardTitle><CardDescription>{lesson.description || `Opened ${new Date(lesson.accessedAt).toLocaleString()}`}</CardDescription></CardHeader><CardContent>
      {lesson.type === 'TEXT' ? <article className="min-h-48 whitespace-pre-wrap break-words rounded-xl bg-white p-4 text-base leading-7 text-slate-800">{lesson.content || 'This lesson does not have text content yet.'}</article> : <LessonMediaPlayer courseId={course.id} lessonId={lesson.id} type={lesson.type} progress={progress} onProgress={updateProgress} />}
      {lesson.type !== 'VIDEO' && <div className="mt-4 flex flex-wrap items-center gap-3"><Button disabled={progress.status === 'completed' || completeMutation.isPending || (lesson.type === 'TEXT' && lesson.progress?.status === 'completed')} onClick={() => completeMutation.mutate()}>{progress.status === 'completed' ? 'Lesson completed' : completeMutation.isPending ? 'Saving…' : 'Mark lesson complete'}</Button>{lesson.type === 'PDF' && <span className="text-xs text-slate-500">PDF completion is confirmed manually after reading.</span>}{lesson.type === 'TEXT' && <span className="text-xs text-slate-500">{lesson.progress?.status === 'completed' ? 'This lesson completes when opened.' : 'Read the lesson, then mark it complete.'}</span>}</div>}
      {completeMutation.isError && <ErrorNotice error={completeMutation.error} />}
      <div className="mt-6 flex flex-wrap justify-between gap-3">{previous ? <Button asChild variant="outline"><Link to={`/learn/courses/${course.id}/lessons/${previous.id}`}>Previous lesson</Link></Button> : <span />}{next && <Button asChild><Link to={`/learn/courses/${course.id}/lessons/${next.id}`}>Next lesson</Link></Button>}</div>
      <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700" role="status">{progress.status === 'completed' ? 'Lesson completed.' : lesson.type === 'VIDEO' ? `Video watched ${progress.progressPercent}% of its ${progress.completionThresholdPercent}% completion target.` : 'Lesson not completed yet.'}</div>
    </CardContent></Card></div>
    <aside className="lg:sticky lg:top-4 lg:self-start"><Card><CardHeader><CardTitle className="text-lg">Course lessons</CardTitle><CardDescription>{currentIndex + 1} of {orderedLessons.length} · {course.progressPercent}% course progress</CardDescription></CardHeader><CardContent className="max-h-[70vh] space-y-4 overflow-y-auto">{course.modules.map((module) => <section key={module.id}><h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{module.title}</h2><ul className="space-y-1">{module.lessons.map((item) => <li key={item.id}><Link aria-current={item.id === lesson.id ? 'page' : undefined} className={`block rounded-md px-2 py-2 text-sm ${item.id === lesson.id ? 'bg-sky-100 font-semibold text-sky-950' : 'text-slate-700 hover:bg-slate-100'}`} to={`/learn/courses/${course.id}/lessons/${item.id}`}><span>{item.title}</span><span className="ml-2 text-xs">{item.progressStatus === 'completed' ? '✓' : item.progressStatus === 'in_progress' ? 'In progress' : ''}</span></Link></li>)}</ul></section>)}</CardContent></Card></aside>
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
  return <main className="min-h-screen bg-slate-50"><PageHeader eyebrow="Course quiz" title={quiz.title}><Button asChild variant="outline"><Link to={`/learn/courses/${courseId}`}>Back to course</Link></Button></PageHeader><section className="mx-auto max-w-3xl space-y-5 px-5 py-10 sm:px-8">
    <Card><CardHeader><CardDescription>{quiz.description || 'Answer all questions and submit when you are ready.'}</CardDescription><CardTitle className="text-lg">Pass mark: {quiz.passPercent}% · Unlimited attempts</CardTitle>{quiz.hasPassed && <p className="text-sm font-medium text-emerald-800">A passing attempt is already recorded for this course.</p>}</CardHeader></Card>
    <form className="space-y-5" onSubmit={submitAttempt}>{quiz.questions.map((question, index) => {
      const feedback = result?.answers.find((answer) => answer.questionId === question.id);
      return <Card key={question.id}><CardHeader><CardTitle className="text-lg">{index + 1}. {question.prompt}</CardTitle><CardDescription>{question.points} {question.points === 1 ? 'point' : 'points'} · {question.type === 'multiple_choice' ? 'Select all that apply' : 'Select one answer'}</CardDescription></CardHeader><CardContent><fieldset className="space-y-2"><legend className="sr-only">Question {index + 1} answers</legend>{question.options.map((option) => {
        const selected = (selectedOptions[question.id] ?? []).includes(option.id);
        const isCorrect = feedback?.correctOptionIds.includes(option.id) ?? false;
        return <label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${feedback ? isCorrect ? 'border-emerald-300 bg-emerald-50' : selected ? 'border-red-300 bg-red-50' : 'border-slate-200' : selected ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white'}`}><input type={question.type === 'multiple_choice' ? 'checkbox' : 'radio'} name={`question-${question.id}`} checked={selected} onChange={() => toggleOption(question.id, option.id, question.type === 'multiple_choice')} className="size-4 accent-sky-700" />{option.label}{feedback && isCorrect && <span className="ml-auto text-xs font-semibold text-emerald-800">Correct answer</span>}</label>;
      })}</fieldset>{feedback && <p className={`mt-3 text-sm font-medium ${feedback.isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>{feedback.isCorrect ? 'Correct' : 'Not correct'}</p>}</CardContent></Card>;
    })}
    {formError && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{formError}</p>}{submit.isError && <ErrorNotice error={submit.error} />}
    {result && <Card className={result.attempt.passed ? 'border-emerald-300' : 'border-amber-300'}><CardHeader><CardTitle>{result.attempt.passed ? 'You passed' : 'Try again'}</CardTitle><CardDescription>Score: {result.attempt.scorePercent}% ({result.attempt.earnedPoints} of {result.attempt.totalPoints} points). Passing score: {result.attempt.passPercent}%.</CardDescription></CardHeader><CardContent><p className="text-sm text-slate-700">{result.attempt.passed ? 'Your passing attempt has been saved.' : 'Review your answers and submit another attempt when ready.'}</p></CardContent></Card>}
    <Button type="submit" disabled={submit.isPending}>{submit.isPending ? 'Scoring…' : 'Submit answers'}</Button></form>
    <Card><CardHeader><CardTitle className="text-lg">Attempt history</CardTitle><CardDescription>Your 20 most recent submissions. Passing the quiz is retained even if a later attempt does not pass.</CardDescription></CardHeader><CardContent>{quiz.attempts.length ? <ul className="space-y-2">{quiz.attempts.map((attempt) => <li key={attempt.id} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2 text-sm"><span>{new Date(attempt.submittedAt).toLocaleString()}</span><span className={attempt.passed ? 'font-semibold text-emerald-800' : 'text-slate-600'}>{attempt.scorePercent}% · {attempt.passed ? 'Passed' : 'Not passed'}</span></li>)}</ul> : <p className="text-sm text-slate-600">No attempts yet.</p>}</CardContent></Card>
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
  return <main className="min-h-screen bg-slate-50"><PageHeader eyebrow="Account" title="Profile"><div className="flex gap-2"><Button asChild variant="outline"><Link to="/dashboard">Dashboard</Link></Button><Button asChild><Link to="/my-courses">My courses</Link></Button></div></PageHeader><section className="mx-auto max-w-3xl px-5 py-10"><Card><CardHeader><CardTitle>Account details</CardTitle><CardDescription>Your learner profile information.</CardDescription></CardHeader><CardContent><dl className="grid gap-4 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</dt><dd className="mt-1 text-sm text-slate-900">{profile.displayName || 'Not provided'}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt><dd className="mt-1 break-all text-sm text-slate-900">{profile.email}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Member since</dt><dd className="mt-1 text-sm text-slate-900">{new Date(profile.createdAt).toLocaleDateString()}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Roles</dt><dd className="mt-1 text-sm text-slate-900">{profile.roles.join(', ')}</dd></div></dl></CardContent></Card></section></main>;
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
  const [courseSearch, setCourseSearch] = useState('');
  const [submittedCourseSearch, setSubmittedCourseSearch] = useState('');
  const [courseStatus, setCourseStatus] = useState('');
  const [coursePage, setCoursePage] = useState(1);
  const coursesQuery = useQuery({ queryKey: ['adminCourses', submittedCourseSearch, courseStatus, coursePage], queryFn: () => listAdminCourses({ q: submittedCourseSearch, status: courseStatus, page: coursePage }) });
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const mutation = useMutation({ mutationFn: createCourse, onSuccess: async (course) => {
    await queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
    await navigate(`/admin/courses/${course.id}`);
  } });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(getCourseInput(event.currentTarget));
  }
  function submitCourseSearch(event: FormEvent) { event.preventDefault(); setCoursePage(1); setSubmittedCourseSearch(courseSearch.trim()); }
  return <main className="min-h-screen bg-slate-50"><PageHeader eyebrow="Admin · Courses" title="Course management"><Button asChild variant="outline"><Link to="/admin">Admin home</Link></Button></PageHeader><section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_340px]">
    <div><div className="mb-5 flex items-end justify-between"><div><h2 className="text-xl font-semibold text-slate-950">All courses</h2><p className="mt-1 text-sm text-slate-600">Drafts stay private until they are published.</p></div></div>
      <form onSubmit={submitCourseSearch} className="mb-4 flex flex-wrap gap-2"><input aria-label="Search course management" placeholder="Search title or slug" value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} className="min-h-10 min-w-48 flex-1 rounded-lg border border-slate-300 px-3 text-sm"/><select aria-label="Filter course status" value={courseStatus} onChange={(event) => { setCoursePage(1); setCourseStatus(event.target.value); }} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm"><option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select><Button type="submit">Search</Button></form>
      {coursesQuery.isPending && <LoadingMessage />}{coursesQuery.isError && <ErrorNotice error={coursesQuery.error} />}
      <div className="space-y-3">{coursesQuery.data?.items.map((course) => <Card key={course.id}><CardContent className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-semibold text-slate-950">{course.title}</p><p className="mt-1 text-sm text-slate-600">/{course.slug} · <span className="capitalize">{course.status}</span></p></div><Button asChild size="sm" variant="outline"><Link to={`/admin/courses/${course.id}`}>Edit course</Link></Button></CardContent></Card>)}</div>
      {!coursesQuery.isPending && coursesQuery.data?.items.length === 0 && <Card><CardContent className="p-5 text-sm text-slate-600">No courses match these filters.</CardContent></Card>}
      {coursesQuery.data && <div className="flex items-center justify-between py-3 text-sm text-slate-600"><span>Page {coursePage} of {Math.max(1, Math.ceil(coursesQuery.data.total / coursesQuery.data.pageSize))} · {coursesQuery.data.total} courses</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={coursePage <= 1} onClick={() => setCoursePage(coursePage - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={coursePage >= Math.ceil(coursesQuery.data.total / coursesQuery.data.pageSize)} onClick={() => setCoursePage(coursePage + 1)}>Next</Button></div></div>}
    </div>
    <Card className="h-fit"><CardHeader><CardTitle>Create a course</CardTitle><CardDescription>New courses start as private drafts.</CardDescription></CardHeader><CardContent><form className="space-y-4" onSubmit={submit}><FormInput label="Title" name="title" required onChange={(event) => { if (!slugEdited) setSlug(event.currentTarget.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 180)); }} /><FormInput label="Slug" name="slug" value={slug} required onChange={(event) => { setSlug(event.currentTarget.value); setSlugEdited(true); }} /><FormTextarea label="Description" name="description" /><input type="hidden" name="certificateEnabled" value="false" /><input type="hidden" name="quizEnabled" value="false" /><input type="hidden" name="quizRequired" value="false" /><input type="hidden" name="quizPassPercent" value="70" />{mutation.isError && <ErrorNotice error={mutation.error} />}<Button className="w-full" type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Creating…' : 'Create draft'}</Button></form></CardContent></Card>
  </section></main>;
}

export function CourseEditorPage() {
  return <AdminGate><CourseEditor /></AdminGate>;
}

function CourseEditor() {
  const { courseId = '' } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const courseQuery = useQuery({ queryKey: ['adminCourse', courseId], queryFn: () => getAdminCourse(courseId), enabled: Boolean(courseId) });
  const [actionError, setActionError] = useState<unknown>(null);
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
  function submitMetadata(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateMutation.mutate(getCourseInput(event.currentTarget));
  }
  return <main className="min-h-screen bg-slate-50"><PageHeader eyebrow="Admin · Course builder" title={course.title}><Button asChild variant="outline"><Link to="/admin/courses">All courses</Link></Button></PageHeader><section className="mx-auto max-w-5xl space-y-8 px-5 py-10 sm:px-8">
    {(actionError || updateMutation.isError || statusMutation.isError || deleteMutation.isError) && <ErrorNotice error={actionError ?? updateMutation.error ?? statusMutation.error ?? deleteMutation.error} />}
    <Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle>Course settings</CardTitle><CardDescription>Course status: <span className="font-semibold capitalize">{course.status}</span>. Content can be edited while it is a draft.</CardDescription></div><div className="flex flex-wrap gap-2">{course.status === 'draft' && <Button onClick={() => statusMutation.mutate('published')} disabled={statusMutation.isPending}>Publish</Button>}{course.status === 'published' && <Button variant="outline" onClick={() => statusMutation.mutate('draft')} disabled={statusMutation.isPending}>Unpublish</Button>}{course.status !== 'archived' && <Button variant="outline" onClick={() => statusMutation.mutate('archived')} disabled={statusMutation.isPending}>Archive</Button>}{course.status === 'archived' && <Button variant="outline" onClick={() => statusMutation.mutate('draft')} disabled={statusMutation.isPending}>Restore as draft</Button>}{course.status === 'draft' && <Button variant="ghost" onClick={() => { if (window.confirm('Delete this draft and its outline?')) deleteMutation.mutate(); }} disabled={deleteMutation.isPending}>Delete draft</Button>}</div></div></CardHeader><CardContent><form key={`${course.id}-${course.updatedAt}`} className="grid gap-4 md:grid-cols-2" onSubmit={submitMetadata}><FormInput label="Course title" name="title" defaultValue={course.title} required /><FormInput label="URL slug" name="slug" defaultValue={course.slug} required /><div className="md:col-span-2"><FormTextarea label="Description" name="description" defaultValue={course.description} rows={4} /></div><FormInput label="Quiz pass percentage" name="quizPassPercent" type="number" defaultValue={course.quizPassPercent} required /><FormInput label="Video completion threshold (%)" name="videoCompletionPercent" type="number" defaultValue={course.videoCompletionPercent} required /><label className="block space-y-1.5 text-sm font-medium text-slate-800">Text lesson completion<select name="textCompletionMode" defaultValue={course.textCompletionMode} className="min-h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal"><option value="manual">Learner marks complete</option><option value="on_open">Complete when opened</option></select></label><div className="space-y-3 pt-2"><FormCheckbox label="Enable certificate on course completion" name="certificateEnabled" defaultChecked={course.certificateEnabled} /><FormCheckbox label="Enable a course quiz" name="quizEnabled" defaultChecked={course.quizEnabled} /><FormCheckbox label="Require passing the quiz to complete" name="quizRequired" defaultChecked={course.quizRequired} /></div><div className="md:col-span-2"><Button type="submit" disabled={!editable || updateMutation.isPending}>{updateMutation.isPending ? 'Saving…' : 'Save settings'}</Button></div></form></CardContent></Card>
    {course.quizEnabled && <QuizBuilder courseId={course.id} editable={editable} />}
    <Card><CardHeader><CardTitle>Course outline</CardTitle><CardDescription>Add modules and VIDEO, PDF, or TEXT lesson records. Reorder using the arrows.</CardDescription></CardHeader><CardContent className="space-y-5">{course.modules.map((module, index) => <ModuleEditor key={`${module.id}-${module.updatedAt}`} course={course} module={module} moduleIndex={index} canEdit={editable} onError={setActionError} onChanged={invalidate} />)}{editable && <CreateModuleForm courseId={course.id} onError={setActionError} onChanged={invalidate} />}{course.modules.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600">Add a module to start building the course.</p>}</CardContent></Card>
  </section></main>;
}

function blankQuizQuestion(): QuizQuestionDraft {
  return { prompt: '', type: 'single_choice', points: 1, options: [{ label: '', isCorrect: true }, { label: '', isCorrect: false }] };
}

function QuizBuilder({ courseId, editable }: { courseId: string; editable: boolean }) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['adminQuiz', courseId], queryFn: () => getAdminQuiz(courseId) });
  const [draft, setDraft] = useState<QuizDraft>({ title: 'Course quiz', description: null, questions: [blankQuizQuestion()] });
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
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['adminQuiz', courseId] }),
      queryClient.invalidateQueries({ queryKey: ['adminCourse', courseId] }),
    ]);
  } });
  const locked = !editable || Boolean(query.data?.editingLocked);
  function updateQuestion(questionIndex: number, update: Partial<QuizQuestionDraft>) {
    setDraft((current) => ({ ...current, questions: current.questions.map((question, index) => index === questionIndex ? { ...question, ...update } : question) }));
  }
  function setQuestionType(questionIndex: number, type: QuizQuestionType) {
    const question = draft.questions[questionIndex];
    if (!question) return;
    updateQuestion(questionIndex, {
      type,
      options: type === 'true_false'
        ? [{ label: 'True', isCorrect: true }, { label: 'False', isCorrect: false }]
        : question.options.length >= 2 ? question.options : [{ label: '', isCorrect: true }, { label: '', isCorrect: false }],
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
    save.mutate(draft);
  }
  if (query.isPending) return <Card><CardContent className="p-5 text-sm text-slate-600">Loading quiz builder…</CardContent></Card>;
  if (query.isError) return <ErrorNotice error={query.error} />;
  return <Card><CardHeader><CardTitle>Course quiz</CardTitle><CardDescription>{query.data.editingLocked ? 'This quiz is locked because learners have submitted attempts; scores retain the original answer key.' : 'Add single choice, multiple choice, and true/false questions. Correct answers stay private from learners until submission.'}</CardDescription></CardHeader><CardContent><form className="space-y-5" onSubmit={saveDraft}>
    <FormInput label="Quiz title" name="quizTitle" value={draft.title} required disabled={locked} onChange={(event) => setDraft((current) => ({ ...current, title: event.currentTarget.value }))} />
    <label className="block space-y-1.5 text-sm font-medium text-slate-800">Description<textarea value={draft.description ?? ''} onChange={(event) => setDraft((current) => ({ ...current, description: event.currentTarget.value || null }))} rows={2} disabled={locked} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal disabled:bg-slate-100" /></label>
    {draft.questions.map((question, questionIndex) => <section key={questionIndex} className="space-y-3 rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-900">Question {questionIndex + 1}</h3><Button type="button" size="sm" variant="ghost" disabled={locked || draft.questions.length <= 1} onClick={() => setDraft((current) => ({ ...current, questions: current.questions.filter((_, index) => index !== questionIndex) }))}>Remove</Button></div>
      <label className="block space-y-1.5 text-sm font-medium text-slate-800">Question prompt<textarea value={question.prompt} onChange={(event) => updateQuestion(questionIndex, { prompt: event.currentTarget.value })} required minLength={2} maxLength={5000} rows={2} disabled={locked} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal" /></label>
      <div className="grid gap-3 sm:grid-cols-2"><label className="block space-y-1.5 text-sm font-medium text-slate-800">Question type<select value={question.type} disabled={locked} onChange={(event) => setQuestionType(questionIndex, event.currentTarget.value as QuizQuestionType)} className="min-h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal disabled:bg-slate-100"><option value="single_choice">Single choice</option><option value="multiple_choice">Multiple choice</option><option value="true_false">True / False</option></select></label><FormInput label="Points" name={`points-${questionIndex}`} type="number" defaultValue={question.points} required disabled={locked} onChange={(event) => updateQuestion(questionIndex, { points: Number(event.currentTarget.value) })} /></div>
      <fieldset disabled={locked} className="space-y-2"><legend className="text-sm font-medium text-slate-800">Options · mark the correct {question.type === 'multiple_choice' ? 'answers' : 'answer'}</legend>{question.options.map((option, optionIndex) => <div key={optionIndex} className="flex items-center gap-2"><input aria-label={`Option ${optionIndex + 1} correct`} type={question.type === 'multiple_choice' ? 'checkbox' : 'radio'} name={`correct-${questionIndex}`} checked={option.isCorrect} onChange={(event) => updateOption(questionIndex, optionIndex, { isCorrect: event.currentTarget.checked })} className="size-4 accent-sky-700" /><input aria-label={`Option ${optionIndex + 1}`} value={option.label} readOnly={question.type === 'true_false'} onChange={(event) => updateOption(questionIndex, optionIndex, { label: event.currentTarget.value })} placeholder={`Option ${optionIndex + 1}`} required minLength={1} maxLength={500} className="min-h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm" />{question.type !== 'true_false' && <Button type="button" size="sm" variant="ghost" disabled={question.options.length <= 2} onClick={() => updateQuestion(questionIndex, { options: question.options.filter((_, index) => index !== optionIndex) })}>Remove</Button>}</div>)}{question.type !== 'true_false' && <Button type="button" size="sm" variant="outline" disabled={question.options.length >= 8 || locked} onClick={() => updateQuestion(questionIndex, { options: [...question.options, { label: '', isCorrect: false }] })}>Add option</Button>}</fieldset>
    </section>)}
    <div className="flex flex-wrap gap-3"><Button type="button" variant="outline" disabled={locked || draft.questions.length >= 100} onClick={() => setDraft((current) => ({ ...current, questions: [...current.questions, blankQuizQuestion()] }))}>Add question</Button><Button type="submit" disabled={locked || save.isPending}>{save.isPending ? 'Saving quiz…' : 'Save quiz'}</Button></div>
    {save.isError && <ErrorNotice error={save.error} />}
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
  return <section className="rounded-xl border border-slate-200 p-4 sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Module {moduleIndex + 1}</p><h3 className="mt-1 font-semibold text-slate-950">{module.title}</h3></div><div className="flex gap-2"><Button type="button" size="sm" variant="outline" disabled={!canEdit || moduleIndex === 0 || reorder.isPending} aria-label="Move module up" onClick={() => move(-1)}>↑</Button><Button type="button" size="sm" variant="outline" disabled={!canEdit || moduleIndex === course.modules.length - 1 || reorder.isPending} aria-label="Move module down" onClick={() => move(1)}>↓</Button></div></div>
    {canEdit && <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={submit}><FormInput label="Module title" name="title" defaultValue={module.title} required /><FormInput label="Description" name="description" defaultValue={module.description ?? ''} /><div className="flex items-end gap-2"><Button size="sm" type="submit" disabled={update.isPending}>Save</Button><Button type="button" size="sm" variant="ghost" onClick={() => { if (window.confirm('Delete this module and its lessons?')) remove.mutate(); }}>Delete</Button></div></form>}
    <div className="mt-5 space-y-3">{module.lessons.map((lesson, index) => <div key={lesson.id} className="rounded-lg bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-slate-900">{lesson.title}</p><p className="mt-1 text-xs text-slate-500">{lesson.type} · {lesson.required ? 'Required' : 'Optional'}</p></div><div className="flex gap-1"><Button type="button" size="sm" variant="ghost" disabled={!canEdit || index === 0} aria-label="Move lesson up" onClick={() => { const ids = module.lessons.map((item) => item.id); [ids[index - 1], ids[index]] = [ids[index]!, ids[index - 1]!]; reorderLessons(course.id, module.id, ids).then(onChanged).catch(onError); }}>↑</Button><Button type="button" size="sm" variant="ghost" disabled={!canEdit || index === module.lessons.length - 1} aria-label="Move lesson down" onClick={() => { const ids = module.lessons.map((item) => item.id); [ids[index], ids[index + 1]] = [ids[index + 1]!, ids[index]!]; reorderLessons(course.id, module.id, ids).then(onChanged).catch(onError); }}>↓</Button></div></div>{canEdit && <details className="mt-2"><summary className="cursor-pointer text-xs font-medium text-sky-800">Edit lesson</summary><LessonEditor courseId={course.id} moduleId={module.id} lesson={lesson} onError={onError} onChanged={onChanged} /></details>}</div>)}</div>
    {canEdit && <CreateLessonForm courseId={course.id} moduleId={module.id} onError={onError} onChanged={onChanged} />}
  </section>;
}

function CreateModuleForm({ courseId, onError, onChanged }: { courseId: string; onError: (error: unknown) => void; onChanged: () => Promise<void> }) {
  const mutation = useMutation({ mutationFn: (input: ModuleInput) => createModule(courseId, input), onSuccess: onChanged, onError });
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; mutation.mutate(getModuleInput(form), { onSuccess: () => form.reset() }); }
  return <form className="grid gap-3 rounded-xl border border-dashed border-slate-300 p-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={submit}><FormInput label="New module title" name="title" required /><FormInput label="Description" name="description" /><Button type="submit" disabled={mutation.isPending}>Add module</Button>{mutation.isError && <div className="md:col-span-3"><ErrorNotice error={mutation.error} /></div>}</form>;
}

function CreateLessonForm({ courseId, moduleId, onError, onChanged }: { courseId: string; moduleId: string; onError: (error: unknown) => void; onChanged: () => Promise<void> }) {
  const [lessonType, setLessonType] = useState<LessonInput['type']>('VIDEO');
  const mutation = useMutation({ mutationFn: (input: LessonInput) => createLesson(courseId, moduleId, input), onSuccess: async () => { setLessonType('VIDEO'); await onChanged(); }, onError });
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; mutation.mutate(getLessonInput(form), { onSuccess: () => form.reset() }); }
  return <form className="mt-4 grid gap-3 rounded-xl border border-dashed border-slate-300 p-4 md:grid-cols-2" onSubmit={submit}><FormInput label="New lesson title" name="title" required /><label className="block space-y-1.5 text-sm font-medium text-slate-800">Lesson type<select name="type" value={lessonType} onChange={(event) => setLessonType(event.currentTarget.value as LessonInput['type'])} className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="VIDEO">Video</option><option value="PDF">PDF</option><option value="TEXT">Text</option></select></label><FormTextarea label="Lesson description" name="description" rows={2} />{lessonType === 'TEXT' && <FormTextarea label="Text lesson content" name="content" rows={3} />}<FormCheckbox label="Required for course completion" name="required" defaultChecked /><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Adding…' : 'Add lesson'}</Button>{mutation.isError && <div className="md:col-span-2"><ErrorNotice error={mutation.error} /></div>}</form>;
}

function LessonEditor({ courseId, moduleId, lesson, onError, onChanged }: {
  courseId: string; moduleId: string; lesson: CourseModuleRecord['lessons'][number]; onError: (error: unknown) => void; onChanged: () => Promise<void>;
}) {
  const update = useMutation({ mutationFn: (input: LessonInput) => updateLesson(courseId, moduleId, lesson.id, input), onSuccess: onChanged, onError });
  const remove = useMutation({ mutationFn: () => deleteLesson(courseId, moduleId, lesson.id), onSuccess: onChanged, onError });
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); update.mutate(getLessonInput(event.currentTarget)); }
  return <div><form key={`${lesson.id}-${lesson.updatedAt}`} className="mt-3 grid gap-3 md:grid-cols-2" onSubmit={submit}><FormInput label="Lesson title" name="title" defaultValue={lesson.title} required /><label className="block space-y-1.5 text-sm font-medium text-slate-800">Lesson type<select name="type" defaultValue={lesson.type} className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="VIDEO">Video</option><option value="PDF">PDF</option><option value="TEXT">Text</option></select></label><FormTextarea label="Lesson description" name="description" defaultValue={lesson.description} rows={2} />{lesson.type === 'TEXT' && <FormTextarea label="Text lesson content" name="content" defaultValue={lesson.content} rows={4} />}<FormCheckbox label="Required for course completion" name="required" defaultChecked={lesson.required} /><div className="flex items-end gap-2"><Button size="sm" type="submit" disabled={update.isPending}>Save lesson</Button><Button size="sm" type="button" variant="ghost" onClick={() => { if (window.confirm('Delete this lesson?')) remove.mutate(); }}>Delete</Button></div>{(update.isError || remove.isError) && <div className="md:col-span-2"><ErrorNotice error={update.error ?? remove.error} /></div>}</form>{lesson.type !== 'TEXT' && <MediaUploadPanel lesson={lesson} />}</div>;
}

function MediaUploadPanel({ lesson }: { lesson: CourseModuleRecord['lessons'][number] }) {
  const queryClient = useQueryClient();
  const mediaQuery = useQuery({
    queryKey: ['adminLessonMedia', lesson.id],
    queryFn: () => listLessonMedia(lesson.id),
    refetchInterval: (query) => query.state.data?.some((media) => media.status === 'uploading' || media.status === 'processing') ? 2500 : false,
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<unknown>(null);
  const retryMutation = useMutation({ mutationFn: retryMediaProcessing, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['adminLessonMedia', lesson.id] }); } });

  async function uploadFile(file: File) {
    setUploading(true);
    setProgress(0);
    setUploadError(null);
    let mediaId: string | undefined;
    try {
      const contentType = mimeTypeForFile(file.name);
      const started = await startMediaUpload({ lessonId: lesson.id, fileName: file.name, contentType, sizeBytes: file.size });
      mediaId = started.media.id;
      const totalParts = Math.ceil(file.size / started.partSizeBytes);
      let nextPart = 0;
      let transferred = 0;
      const uploadPart = async () => {
        while (true) {
          const index = nextPart++;
          if (index >= totalParts) return;
          const blob = file.slice(index * started.partSizeBytes, Math.min(file.size, (index + 1) * started.partSizeBytes));
          let sent = false;
          for (let attempt = 0; attempt < 3 && !sent; attempt += 1) {
            try {
              const part = await getMediaUploadPartUrl(mediaId!, index + 1);
              const response = await fetch(part.url, { method: 'PUT', body: blob });
              sent = response.ok;
            } catch {
              if (attempt === 2) throw new Error(`Part ${index + 1} could not be uploaded. Please retry.`);
            }
            if (!sent && attempt === 2) throw new Error(`Part ${index + 1} could not be uploaded. Please retry.`);
          }
          transferred += blob.size;
          setProgress(Math.round((transferred / file.size) * 100));
        }
      };
      await Promise.all(Array.from({ length: Math.min(3, totalParts) }, () => uploadPart()));
      await completeMediaUpload(mediaId);
      await queryClient.invalidateQueries({ queryKey: ['adminLessonMedia', lesson.id] });
    } catch (error) {
      setUploadError(error);
      if (mediaId) await abortMediaUpload(mediaId).catch(() => undefined);
      await queryClient.invalidateQueries({ queryKey: ['adminLessonMedia', lesson.id] });
    } finally {
      setUploading(false);
    }
  }

  const accept = lesson.type === 'VIDEO' ? 'video/mp4,video/quicktime,video/webm,video/x-matroska,.mp4,.m4v,.mov,.webm,.mkv' : 'application/pdf,.pdf';
  const statusLabel: Record<MediaAssetSummary['status'], string> = { uploading: 'Uploading', processing: 'Processing', ready: 'Ready', failed: 'Failed', aborted: 'Aborted' };
  return <section className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4"><div><h4 className="text-sm font-semibold text-slate-950">Lesson media</h4><p className="mt-1 text-xs text-slate-600">Files upload directly to private object storage. Media is available to enrolled learners after processing.</p></div>
    <label className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 hover:bg-slate-50">{uploading ? 'Uploading…' : lesson.type === 'VIDEO' ? 'Upload video' : 'Upload PDF'}<input className="sr-only" type="file" accept={accept} disabled={uploading} onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void uploadFile(file); event.currentTarget.value = ''; }} /></label>
    {uploading && <div><div className="mb-1 flex justify-between text-xs text-slate-600"><span>Direct upload progress</span><span>{progress}%</span></div><progress className="h-2 w-full accent-sky-700" max={100} value={progress} /></div>}
    {Boolean(uploadError) && <ErrorNotice error={uploadError} />}{mediaQuery.isError && <ErrorNotice error={mediaQuery.error} />}{retryMutation.isError && <ErrorNotice error={retryMutation.error} />}
    <div className="space-y-2">{mediaQuery.data?.map((media) => <div key={media.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900">{media.originalFileName}</p><p className="text-xs text-slate-500">{statusLabel[media.status]} · {(media.sourceSizeBytes / (1024 * 1024)).toFixed(1)} MB{media.durationSeconds ? ` · ${Math.floor(media.durationSeconds / 60)}:${String(media.durationSeconds % 60).padStart(2, '0')}` : ''}</p>{media.errorCode && <p className="text-xs text-red-700">{media.errorCode}</p>}</div>{media.status === 'failed' && <Button size="sm" variant="outline" disabled={retryMutation.isPending} onClick={() => retryMutation.mutate(media.id)}>Retry processing</Button>}</div>)}</div>
  </section>;
}

function mimeTypeForFile(fileName: string) {
  const extension = fileName.toLowerCase().split('.').pop();
  const types: Record<string, string> = { pdf: 'application/pdf', mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', mkv: 'video/x-matroska' };
  return types[extension ?? ''] ?? 'application/octet-stream';
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireLearner } from "@/lib/learner";
import { getEnrolledLesson } from "@/lib/course-player";
import LessonContent from "@/components/learning/LessonContent";
import { completeLesson, startLesson } from "@/app/(learner)/learning-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lesson", robots: { index: false, follow: false } };

export default async function LessonPage({ params, searchParams }: { params: Promise<{ courseSlug: string; lessonSlug: string }>; searchParams: Promise<{ progress?: string }> }) {
  const learner = await requireLearner();
  const { courseSlug, lessonSlug } = await params;
  const entry = await getEnrolledLesson(learner.id, courseSlug, lessonSlug);
  if (!entry) notFound();
  const { course, module, lesson, previous, next } = entry;
  const query = await searchParams;
  const allLessons = course.modules.flatMap((item) => item.lessons);
  const index = allLessons.findIndex((item) => item.id === lesson.id);
  const statusMessage = query.progress === "saved" ? "Lesson marked complete." : query.progress === "started" ? "Progress saved. You can return to this lesson later." : "";
  return <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8">
    <nav aria-label="Course breadcrumb" className="text-sm text-slate-600"><Link className="underline" href="/dashboard">Dashboard</Link><span aria-hidden="true"> / </span><Link className="underline" href={`/learn/${course.slug}`}>{course.title}</Link><span aria-hidden="true"> / </span><span>{module.title}</span></nav>
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
        <p className="text-sm font-semibold text-navy-800">{module.title} · Lesson {index + 1} of {allLessons.length} · {lesson.minutes} min · Version {course.version_number}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{lesson.title}</h1>
        <p className="mt-3 text-sm text-gold-900">Internal pilot draft — pending subject-matter review.</p>
        {statusMessage && <p role="status" className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">{statusMessage}</p>}
        <LessonContent blocks={lesson.blocks} />
        <section className="mt-10 border-t border-slate-200 pt-6" aria-label="Lesson progress">
          <p className="text-sm text-slate-600">Current status: <strong className="capitalize">{lesson.status.replaceAll("_", " ")}</strong>. Progress is tied to your account and this course version.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {lesson.status !== "completed" && <form action={completeLesson}><input type="hidden" name="courseSlug" value={course.slug} /><input type="hidden" name="lessonId" value={lesson.id} /><button className="rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white">Mark lesson complete</button></form>}
            {lesson.status === "not_started" && <form action={startLesson}><input type="hidden" name="courseSlug" value={course.slug} /><input type="hidden" name="lessonId" value={lesson.id} /><button className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-800">Save as in progress</button></form>}
          </div>
        </section>
        <nav aria-label="Lesson navigation" className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
          {previous ? <Link className="font-semibold text-navy-900 underline" href={`/learn/${course.slug}/${previous.lesson.slug}`}>← Previous: {previous.lesson.title}</Link> : <span />}
          {next ? <Link className="ml-auto font-semibold text-navy-900 underline" href={`/learn/${course.slug}/${next.lesson.slug}`}>Next: {next.lesson.title} →</Link> : <Link className="ml-auto font-semibold text-navy-900 underline" href={`/learn/${course.slug}`}>Back to course outline →</Link>}
        </nav>
      </article>
      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4"><h2 className="font-bold">Course lessons</h2><ol className="mt-3 space-y-1">{course.modules.map((courseModule) => <li key={courseModule.id}><p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">{courseModule.title}</p><ol className="mt-1 space-y-1">{courseModule.lessons.map((item) => <li key={item.id}><Link aria-current={item.id === lesson.id ? "page" : undefined} className={`block rounded-lg px-2.5 py-2 text-sm ${item.id === lesson.id ? "bg-navy-50 font-bold text-navy-950" : "text-slate-700 hover:bg-slate-50"}`} href={`/learn/${course.slug}/${item.slug}`}><span aria-hidden="true">{item.status === "completed" ? "✓ " : item.status === "in_progress" ? "◷ " : "○ "}</span>{item.title}</Link></li>)}</ol></li>)}</ol></aside>
    </div>
  </main>;
}

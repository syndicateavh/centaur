import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireLearner } from "@/lib/learner";
import { getEnrolledCourse } from "@/lib/course-player";
import { getActiveCourseCertificate } from "@/lib/certificates";
import LearningPath from "@/components/learning/LearningPath";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Course player", robots: { index: false, follow: false } };

export default async function CoursePlayerPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const learner = await requireLearner();
  const { courseSlug } = await params;
  const course = await getEnrolledCourse(learner.id, courseSlug);
  if (!course) notFound();
  const certificate = await getActiveCourseCertificate(learner.id, course.course_id);
  const percent = course.totalLessons ? Math.round(course.completedLessons / course.totalLessons * 100) : 0;
  const estimatedMinutes = course.estimated_minutes ?? 0;
  const lessons = course.modules.flatMap((module) => module.lessons);
  const lessonMinutes = lessons.reduce((total, lesson) => total + lesson.minutes, 0);
  const firstOpen = lessons.find((lesson) => lesson.status === "in_progress") ?? lessons.find((lesson) => lesson.status !== "completed") ?? lessons[0];
  const isDraftPreview = course.is_sandbox && course.course_status === "draft";
  return <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8">
    <p className="text-sm font-semibold text-navy-800"><Link href="/dashboard" className="underline">Learner dashboard</Link> / Course</p>
    <div className="mt-5 rounded-2xl border border-gold-300 bg-gold-50 p-5 sm:p-7">
      <p className="text-xs font-extrabold uppercase tracking-widest text-gold-900">{isDraftPreview ? "Local draft preview · not approved for learners" : `Approved learning path · version ${course.version_number}`}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{course.title}</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-700">{course.overview}</p>
      {isDraftPreview && <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-950">This is a local sandbox preview. Content is not approved for learners and cannot issue a certificate.</p>}
      <p className="mt-3 text-sm text-slate-600">{estimatedMinutes > 0 ? `About ${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m total: ${Math.floor(lessonMinutes / 60)}h ${lessonMinutes % 60}m lesson pages plus ${course.independent_practice_minutes}m for offline workbook practice.` : "Course time estimate has not been added yet."} Content review: {course.review_status.replaceAll("_", " ")}{course.review_date ? ` · Reviewed ${new Date(course.review_date).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "UTC" })}` : ""}.</p>
    </div>
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="progress-heading">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="progress-heading" className="text-lg font-bold">Lesson completion checklist</h2><p className="text-sm font-semibold text-slate-700">{course.completedLessons} of {course.totalLessons} lessons Â· {percent}%</p></div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Course lesson completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div className="h-full rounded-full bg-navy-800 transition-all" style={{ width: `${percent}%` }} /></div>
      {certificate ? <div className="mt-3 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-950"><p className="font-semibold">Your course-completion certificate is ready.</p><p className="mt-1">Certificate ID: {certificate.public_id}</p><div className="mt-3 flex flex-wrap gap-4"><a className="font-bold underline" href={`/api/certificates/${certificate.id}/pdf`}>Download certificate PDF</a><Link className="font-bold underline" href={`/certificates/verify?id=${certificate.public_id}`}>Open public verification</Link></div></div> : course.enrollment_status === "completed" ? <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">Course requirements are recorded as complete. A certificate is issued only when the course and assessment have approved publication status.</p> : <p className="mt-3 text-sm text-slate-600">Complete each lesson and pass the final assessment to record course completion.</p>}
      {course.totalLessons === 0 && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-950">Lessons are not available in this course version yet. Return to your dashboard to see other learning options.</p>}
      {firstOpen && <p className="mt-4"><Link className="inline-flex min-h-11 items-center rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white" href={`/learn/${course.slug}/${firstOpen.slug}`}>{course.completedLessons ? "Resume learning" : "Start first lesson"}</Link></p>}
    </section>
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="space-y-8">
        <LearningPath course={course} />
      </div>
      <aside className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Learning objectives</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">{course.learning_objectives.map((objective, i) => <li key={i}>{String(objective)}</li>)}</ul></section>
        <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Practice workbook</h2><p className="mt-2 text-sm leading-6 text-slate-600">A fictional case packet and offline note-writing worksheet. No learner answers are uploaded.</p><a className="mt-3 inline-flex rounded-lg border border-navy-900 px-3 py-2 text-sm font-bold text-navy-950" href="/worksheets/kyc-aml-riverstone-workbook-v1.md" download>Download workbook</a></section>
        <details className="rounded-xl border border-gold-200 bg-gold-50 p-5"><summary className="cursor-pointer font-bold text-gold-950">Fictional case: {course.case_packet.title}</summary><p className="mt-3 text-xs leading-5 text-gold-950">{course.case_packet.notice}</p><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">{course.case_packet.facts.map((fact, index) => <li key={`${index}-${fact}`}>{fact}</li>)}</ul><h3 className="mt-4 font-bold text-gold-950">Practice questions</h3><ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">{course.case_packet.questions.map((question, index) => <li key={`${index}-${question}`}>{question}</li>)}</ol></details>
        <details className="rounded-xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer font-bold">Glossary</summary><dl className="mt-4 space-y-4">{course.glossary.map(({ term, definition }) => <div key={term}><dt className="text-sm font-bold">{term}</dt><dd className="mt-1 text-sm leading-6 text-slate-600">{definition}</dd></div>)}</dl></details>
        <details className="rounded-xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer font-bold">Official references</summary><ul className="mt-4 space-y-4">{course.content_sources.map((source) => <li key={source.url}><a className="text-sm font-semibold text-navy-900 underline" href={source.url} target="_blank" rel="noreferrer">{source.title}</a><p className="mt-1 text-xs leading-5 text-slate-600">Accessed {source.accessed}. {source.note}</p></li>)}</ul></details>
      </aside>
    </div>
  </main>;
}

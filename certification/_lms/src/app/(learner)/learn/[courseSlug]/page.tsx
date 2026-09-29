import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireLearner } from "@/lib/learner";
import { getEnrolledCourse } from "@/lib/course-player";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Course player", robots: { index: false, follow: false } };

function assessmentHref(courseSlug: string, assessmentSlug: string) {
  return `/learn/${courseSlug}/assessment/${assessmentSlug}`;
}

export default async function CoursePlayerPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const learner = await requireLearner();
  const { courseSlug } = await params;
  const course = await getEnrolledCourse(learner.id, courseSlug);
  if (!course) notFound();
  const percent = course.totalLessons ? Math.round(course.completedLessons / course.totalLessons * 100) : 0;
  const estimatedMinutes = course.estimated_minutes ?? 0;
  const lessons = course.modules.flatMap((module) => module.lessons);
  const firstOpen = lessons.find((lesson) => lesson.status === "in_progress") ?? lessons.find((lesson) => lesson.status !== "completed") ?? lessons[0];
  const finalAssessment = course.assessments.find((assessment) => assessment.kind === "final");
  return <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8">
    <p className="text-sm font-semibold text-navy-800"><Link href="/dashboard" className="underline">Learner dashboard</Link> / Course</p>
    <div className="mt-5 rounded-2xl border border-gold-300 bg-gold-50 p-5 sm:p-7">
      <p className="text-xs font-extrabold uppercase tracking-widest text-gold-900">Internal pilot · reviewer approval pending · version {course.version_number}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{course.title}</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-700">{course.overview}</p>
      <p className="mt-3 text-sm text-slate-600">About {Math.floor(estimatedMinutes / 60)}h {estimatedMinutes % 60}m · Text-first · Draft source snapshot {course.review_date ? new Date(course.review_date).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "UTC" }) : "not recorded"}</p>
    </div>
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="progress-heading">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="progress-heading" className="text-lg font-bold">Lesson completion checklist</h2><p className="text-sm font-semibold text-slate-700">{course.completedLessons} of {course.totalLessons} lessons · {percent}%</p></div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Course lesson completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div className="h-full rounded-full bg-navy-800 transition-all" style={{ width: `${percent}%` }} /></div>
      {course.enrollment_status === "completed" ? <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">Course requirements are complete. Certificate issuance is a later phase and no certificate has been issued.</p> : <p className="mt-3 text-sm text-slate-600">Complete each lesson and pass the final assessment to record course completion.</p>}
      {firstOpen && <p className="mt-4"><Link className="inline-flex rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white" href={`/learn/${course.slug}/${firstOpen.slug}`}>{course.completedLessons ? "Resume learning" : "Start first lesson"}</Link></p>}
    </section>
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="space-y-8">
        <section aria-labelledby="curriculum-heading"><h2 id="curriculum-heading" className="text-2xl font-bold">Course outline</h2><ol className="mt-4 space-y-4">{course.modules.map((module) => <li key={module.id} className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-bold">{module.title}</h3><p className="mt-1 text-sm text-slate-600">{module.summary}</p><ol className="mt-4 divide-y divide-slate-100">{module.lessons.map((lesson) => <li key={lesson.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><Link className="font-semibold text-navy-900 underline decoration-navy-300 underline-offset-4" href={`/learn/${course.slug}/${lesson.slug}`}>{lesson.title}</Link><p className="mt-1 text-xs text-slate-500">{lesson.minutes} min · {lesson.status.replaceAll("_", " ")}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${lesson.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{lesson.status === "completed" ? "Complete" : lesson.status === "in_progress" ? "In progress" : "Not started"}</span></li>)}</ol></li>)}</ol></section>
        <section aria-labelledby="checks-heading" className="rounded-xl border border-slate-200 bg-white p-5"><h2 id="checks-heading" className="text-xl font-bold">Module knowledge checks</h2><p className="mt-2 text-sm leading-6 text-slate-600">Optional practice checks follow each module. You can retry them, and submitted responses include explanations. They do not count toward final course completion.</p><ul className="mt-4 space-y-3">{course.assessments.filter((assessment) => assessment.kind === "knowledge_check").map((assessment) => {
          const courseModule = course.modules.find((item) => item.slug === assessment.moduleSlug);
          const unlocked = Boolean(courseModule?.lessons.length && courseModule.lessons.every((lesson) => lesson.status === "completed"));
          const inProgress = assessment.latestStatus === "in_progress";
          const available = unlocked && (inProgress || assessment.attempts < assessment.maxAttempts);
          return <li key={assessment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4"><div><h3 className="font-semibold">{assessment.title}</h3><p className="mt-1 text-xs text-slate-600">{assessment.questionCount} questions · {assessment.attempts}/{assessment.maxAttempts} attempts · {assessment.latestStatus === "submitted" ? `Latest score ${assessment.latestScore}%` : assessment.latestStatus === "in_progress" ? "Attempt in progress" : unlocked ? "Ready" : "Complete this module to unlock"}</p></div>{available ? <Link className="rounded-lg border border-navy-900 px-3 py-2 text-sm font-bold text-navy-950" href={assessmentHref(course.slug, assessment.slug)}>{inProgress ? "Resume" : assessment.attempts ? "Retry" : "Start check"}</Link> : assessment.attempts ? <Link className="text-sm font-semibold text-navy-900 underline" href={assessmentHref(course.slug, assessment.slug)}>View feedback</Link> : <span className="text-xs text-slate-500">Locked</span>}</li>;
        })}</ul></section>
        {finalAssessment && <section aria-labelledby="final-heading" className="rounded-xl border border-navy-200 bg-white p-5"><h2 id="final-heading" className="text-xl font-bold">Final assessment</h2><p className="mt-2 text-sm leading-6 text-slate-600">{finalAssessment.questionCount} questions · {finalAssessment.passPercent}% to pass · up to {finalAssessment.maxAttempts} attempts · no timer. Final results provide objective-level feedback without exposing correct answers.</p><p className="mt-2 text-xs font-semibold text-amber-900">Assessment v1 is a local draft pending subject-matter review.</p><p className="mt-4">{finalAssessment.latestPassed ? <Link className="font-semibold text-emerald-800 underline" href={assessmentHref(course.slug, finalAssessment.slug)}>View passing result · {finalAssessment.latestScore}%</Link> : finalAssessment.latestStatus === "in_progress" ? <Link className="inline-flex rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white" href={assessmentHref(course.slug, finalAssessment.slug)}>Resume final assessment</Link> : finalAssessment.latestStatus === "submitted" ? <Link className="inline-flex rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white" href={assessmentHref(course.slug, finalAssessment.slug)}>Review result{course.completedLessons === course.totalLessons && finalAssessment.attempts < finalAssessment.maxAttempts ? " or retry" : ""}</Link> : course.completedLessons === course.totalLessons ? <Link className="inline-flex rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white" href={assessmentHref(course.slug, finalAssessment.slug)}>Start final assessment</Link> : <span className="text-sm text-slate-500">Complete all {course.totalLessons} lessons to unlock.</span>}</p></section>}
      </div>
      <aside className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Learning objectives</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">{course.learning_objectives.map((objective, i) => <li key={i}>{String(objective)}</li>)}</ul></section>
        <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Practice workbook</h2><p className="mt-2 text-sm leading-6 text-slate-600">A fictional case packet and offline note-writing worksheet. No learner answers are uploaded.</p><a className="mt-3 inline-flex rounded-lg border border-navy-900 px-3 py-2 text-sm font-bold text-navy-950" href="/worksheets/kyc-aml-riverstone-workbook-v1.md" download>Download workbook</a></section>
        <details className="rounded-xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer font-bold">Glossary</summary><dl className="mt-4 space-y-4">{course.glossary.map(({ term, definition }) => <div key={term}><dt className="text-sm font-bold">{term}</dt><dd className="mt-1 text-sm leading-6 text-slate-600">{definition}</dd></div>)}</dl></details>
        <details className="rounded-xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer font-bold">Official references</summary><ul className="mt-4 space-y-4">{course.content_sources.map((source) => <li key={source.url}><a className="text-sm font-semibold text-navy-900 underline" href={source.url} target="_blank" rel="noreferrer">{source.title}</a><p className="mt-1 text-xs leading-5 text-slate-600">Accessed {source.accessed}. {source.note}</p></li>)}</ul></details>
      </aside>
    </div>
  </main>;
}

import Link from "next/link";
import type { PlayerAssessment, PlayerCourse, PlayerModule } from "@/lib/course-player";

function lessonStatus(status: PlayerModule["lessons"][number]["status"]) {
  if (status === "completed") return "Complete";
  if (status === "in_progress") return "In progress";
  return "Not started";
}

function knowledgeCheckAction(assessment: PlayerAssessment, unlocked: boolean) {
  if (!unlocked) return "Complete this module to unlock";
  if (assessment.latestStatus === "in_progress") return "Resume check";
  if (assessment.latestStatus === "submitted" && assessment.attempts >= assessment.maxAttempts) return "Review feedback";
  if (assessment.latestStatus === "submitted") return "Review feedback or retry";
  return assessment.attempts ? "Retry check" : "Start check";
}

function finalAssessmentAction(course: PlayerCourse, assessment: PlayerAssessment) {
  if (assessment.latestPassed) return `Passed · ${assessment.latestScore}%`;
  if (assessment.latestStatus === "in_progress") return "Resume final assessment";
  if (assessment.latestStatus === "submitted") return "Review result";
  if (course.totalLessons > 0 && course.completedLessons === course.totalLessons) return "Start final assessment";
  return `Complete all ${course.totalLessons} lessons to unlock`;
}

export default function LearningPath({ course }: { course: PlayerCourse }) {
  const knowledgeChecks = course.assessments.filter((assessment) => assessment.kind === "knowledge_check");
  const finalAssessment = course.assessments.find((assessment) => assessment.kind === "final");
  const lessonNumber = new Map(course.modules.flatMap((module) => module.lessons).map((lesson, index) => [lesson.id, index + 1]));

  return <section aria-labelledby="curriculum-heading">
    <h2 id="curriculum-heading" className="text-2xl font-bold">Your learning path</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">Recommended sequence: work through the modules in order. Each module ends with an optional practice check; the final assessment unlocks after all lessons are complete.</p>
    {course.modules.length ? <ol className="mt-4 space-y-4">{course.modules.map((module, moduleIndex) => {
      const check = knowledgeChecks.find((assessment) => assessment.moduleSlug === module.slug);
      const moduleComplete = module.lessons.length > 0 && module.lessons.every((lesson) => lesson.status === "completed");
      const checkInProgress = check?.latestStatus === "in_progress";
      const checkCanStart = moduleComplete && check && (checkInProgress || check.attempts < check.maxAttempts);

      return <li id={`module-${module.slug}`} key={module.id} className="scroll-mt-32 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-wide text-navy-800">Module {moduleIndex + 1} of {course.modules.length}</p><h3 className="mt-1 text-lg font-bold">{module.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{module.summary}</p></div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${moduleComplete ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-700"}`}>{moduleComplete ? "Module complete" : `${module.lessons.filter((lesson) => lesson.status === "completed").length} of ${module.lessons.length} lessons`}</span>
        </div>
        {module.lessons.length ? <ol className="mt-4 divide-y divide-slate-100 border-y border-slate-100">{module.lessons.map((lesson) => <li key={lesson.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0"><Link className="font-semibold text-navy-900 underline decoration-navy-300 underline-offset-4" href={`/learn/${course.slug}/${lesson.slug}`}>{lesson.title}</Link><p className="mt-1 text-xs text-slate-500">Lesson {lessonNumber.get(lesson.id)} of {course.totalLessons} · {lesson.minutes} min</p></div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${lesson.status === "completed" ? "bg-emerald-100 text-emerald-800" : lesson.status === "in_progress" ? "bg-navy-50 text-navy-900" : "bg-slate-100 text-slate-700"}`}>{lessonStatus(lesson.status)}</span>
        </li>)}</ol> : <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">Lessons have not been added to this module yet.</p>}
        {check && <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-indigo-900">Optional practice checkpoint · {check.questionCount} questions</p><h4 className="mt-1 font-bold text-indigo-950">{check.title}</h4><p className="mt-1 text-sm text-indigo-950">{check.latestStatus === "submitted" ? `Latest score: ${check.latestScore}%` : checkInProgress ? "Your answers are saved in an unfinished attempt." : "Try these questions after completing the module lessons."} · {check.attempts} of {check.maxAttempts} attempts used</p></div>
            {checkCanStart ? <Link className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-indigo-900 px-3 py-2 text-sm font-bold text-indigo-950" href={`/learn/${course.slug}/assessment/${check.slug}`}>{knowledgeCheckAction(check, moduleComplete)}</Link> : check.attempts > 0 ? <Link className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-indigo-900 px-3 py-2 text-sm font-bold text-indigo-950" href={`/learn/${course.slug}/assessment/${check.slug}`}>{knowledgeCheckAction(check, moduleComplete)}</Link> : <span className="text-sm font-semibold text-slate-600">{knowledgeCheckAction(check, moduleComplete)}</span>}
          </div>
        </div>}
      </li>;
    })}</ol> : <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">No learner lessons are available for this course version yet.</p>}
    {finalAssessment && <div id="final-assessment" className="mt-5 scroll-mt-32 rounded-xl border-2 border-navy-200 bg-white p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-navy-800">Course completion assessment</p><h3 className="mt-1 text-lg font-bold">{finalAssessment.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{finalAssessment.questionCount} questions · pass score {finalAssessment.passPercent}% · up to {finalAssessment.maxAttempts} attempts. All lessons must be complete; knowledge checks are optional.</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-700" role="status" aria-live="polite">{finalAssessment.latestPassed ? `Passed · ${finalAssessment.latestScore}%` : finalAssessment.latestStatus === "in_progress" ? "Attempt in progress" : finalAssessment.latestStatus === "submitted" ? `Latest score: ${finalAssessment.latestScore}%` : course.totalLessons > 0 && course.completedLessons === course.totalLessons ? "Ready to start" : `${course.completedLessons} of ${course.totalLessons} lessons complete`}</p>
        {finalAssessment.latestPassed || finalAssessment.latestStatus === "in_progress" || finalAssessment.latestStatus === "submitted" || (course.totalLessons > 0 && course.completedLessons === course.totalLessons)
          ? <Link className="inline-flex min-h-11 items-center rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white" href={`/learn/${course.slug}/assessment/${finalAssessment.slug}`}>{finalAssessmentAction(course, finalAssessment)}</Link>
          : <span className="text-sm font-semibold text-slate-500">Complete the lesson path to unlock</span>}
      </div>
    </div>}
  </section>;
}

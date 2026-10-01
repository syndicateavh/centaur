import type { Metadata } from "next";
import Link from "next/link";
import { requireLearner } from "@/lib/learner";
import { getLearnerDashboardData } from "@/lib/learner-dashboard";
import { enrollInCourse } from "@/app/(auth)/actions";
import { submitPilotFeedback } from "@/app/(learner)/pilot-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My learning", robots: { index: false, follow: false } };

const feedbackCategories = [
  ["unclear_instruction", "Instructions"], ["content_gap", "Missing content"], ["assessment", "Assessment"],
  ["accessibility", "Accessibility"], ["mobile", "Mobile use"], ["technical", "Technical issue"], ["other", "Other"],
] as const;

function effort(minutes: number | null) {
  if (minutes === null || minutes <= 0) return "Not estimated yet";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return [hours ? `${hours} hr${hours === 1 ? "" : "s"}` : "", remainder ? `${remainder} min` : ""]
    .filter(Boolean).join(" ");
}

function dateLabel(value: Date | string | null) {
  return value ? new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "UTC" }) : "Not set";
}

function assessmentLabel(course: {
  final_assessment_slug: string | null;
  final_latest_passed: boolean | null;
  final_latest_status: string | null;
  final_latest_score: number | string | null;
  final_attempts: number | null;
  final_max_attempts: number | null;
  completed_lessons: number;
  total_lessons: number;
  status: string;
}) {
  if (!course.final_assessment_slug) return "No final assessment is attached to this version";
  if (course.final_latest_passed) return `Passed Â· ${Number(course.final_latest_score ?? 0)}%`;
  if (course.final_latest_status === "in_progress") return "In progress Â· resume your saved attempt";
  if (course.final_max_attempts !== null && (course.final_attempts ?? 0) >= course.final_max_attempts) return "Attempt limit reached";
  if (course.status === "completed") return "Requirements recorded complete";
  if (course.total_lessons > 0 && course.completed_lessons === course.total_lessons) return "Ready to start";
  return "Unlocks after the required lessons";
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ enrollment?: string; feedback?: string }> }) {
  const learner = await requireLearner();
  const [{ available, enrolled }, params] = await Promise.all([
    getLearnerDashboardData(learner.id),
    searchParams,
  ]);
  const activeCount = enrolled.filter((course) => course.status === "active").length;
  const completedCount = enrolled.filter((course) => course.status === "completed").length;
  const certificateCount = enrolled.filter((course) => Boolean(course.certificate_id)).length;

  return <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-10">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-navy-800">Your student dashboard</p>
        <h1 className="mt-1 break-words text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Welcome, {learner.name}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Pick up where you left off, check your course progress, or explore an available learning path.</p>
      </div>
      <Link href="/account#support" className="inline-flex min-h-11 w-fit items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-navy-950 hover:bg-slate-50">Get learner support</Link>
    </header>

    {(params.enrollment === "complete" || params.feedback === "submitted") && <p role="status" className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">{params.enrollment === "complete" ? "Enrollment is active. Your course is listed below." : "Thank you. Your feedback was recorded for the pilot review."}</p>}
    {(params.enrollment === "unavailable" || params.feedback === "already-submitted") && <p role={params.enrollment === "unavailable" ? "alert" : "status"} className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">{params.enrollment === "unavailable" ? "That course could not be opened. It may have closed or require a pilot invitation. Check the course details or contact learner support." : "Feedback for this course has already been submitted."}</p>}

    <section aria-label="Learning summary" className="mt-7 grid gap-3 sm:grid-cols-3">
      {[{ label: "In progress", value: activeCount }, { label: "Completed", value: completedCount }, { label: "Certificates", value: certificateCount }].map((item) =>
        <div key={item.label} className="rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
          <p className="text-sm font-medium text-slate-600">{item.label}</p><p className="mt-1 text-2xl font-bold tabular-nums text-navy-950">{item.value}</p>
        </div>)}
    </section>

    <section id="your-courses" className="mt-10 scroll-mt-32" aria-labelledby="your-courses-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-navy-800">Continue</p><h2 id="your-courses-heading" className="mt-1 text-2xl font-bold tracking-tight">Your courses</h2></div>
        {enrolled.length > 0 && <p className="text-sm text-slate-600">{enrolled.length} course{enrolled.length === 1 ? "" : "s"}</p>}
      </div>

      {enrolled.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-8">
        <h3 className="text-lg font-bold">Your learning list is ready for a first course</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">When you enroll, your lessons, assessment status, and certificate will appear here. Check the available courses below or browse proposed learning tracks.</p>
        {available.length === 0 && <Link href="/courses" className="button-primary mt-5 inline-flex min-h-11 items-center rounded-lg px-4 py-2.5 text-sm font-bold">Explore proposed tracks</Link>}
      </div> : <ul className="mt-4 grid gap-4 lg:grid-cols-2">
        {enrolled.map((course) => {
          const percent = course.total_lessons ? Math.round(course.completed_lessons / course.total_lessons * 100) : 0;
          const finalHref = course.final_assessment_slug ? `/learn/${course.slug}/assessment/${course.final_assessment_slug}` : null;
          const isAssessmentInProgress = course.final_latest_status === "in_progress";
          const canRetryFinal = course.final_max_attempts !== null && (course.final_attempts ?? 0) < course.final_max_attempts;
          const canStartFinal = course.status === "active" && course.total_lessons > 0 && course.completed_lessons === course.total_lessons && !course.final_latest_passed && canRetryFinal;
          const primaryHref = isAssessmentInProgress && finalHref ? finalHref : course.next_lesson_slug ? `/learn/${course.slug}/${course.next_lesson_slug}` : canStartFinal && finalHref ? finalHref : `/learn/${course.slug}`;
          const primaryLabel = isAssessmentInProgress ? "Resume assessment" : course.next_lesson_slug ? (course.next_lesson_status === "in_progress" || course.completed_lessons > 0 ? "Continue learning" : "Start learning") : canStartFinal ? "Start final assessment" : "Open course outline";

          return <li key={`${course.course_id}-${course.course_version_id}`} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0"><h3 className="break-words text-lg font-bold text-slate-950">{course.title}</h3><p className="mt-1 text-xs text-slate-500">Enrolled {dateLabel(course.enrolled_at)}</p></div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${course.status === "completed" ? "bg-emerald-100 text-emerald-900" : course.status === "cancelled" ? "bg-slate-100 text-slate-700" : "bg-navy-50 text-navy-900"}`}>{course.status === "active" ? "In progress" : course.status === "completed" ? "Completed" : "Cancelled"}</span>
            </div>

            {course.total_lessons > 0 ? <div className="mt-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="font-semibold">Lesson progress</span><span className="tabular-nums text-slate-600">{course.completed_lessons} of {course.total_lessons} Â· {percent}%</span></div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${course.title} lesson progress`} aria-valuetext={`${course.completed_lessons} of ${course.total_lessons} lessons complete`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div className="h-full rounded-full bg-navy-800 transition-[width]" style={{ width: `${percent}%` }} /></div>
              {course.next_lesson_title && course.status === "active" && <p className="mt-3 break-words text-sm text-slate-600"><span className="font-semibold text-slate-800">Next:</span> {course.next_lesson_title}</p>}
            </div> : <p className="mt-5 rounded-lg bg-slate-50 p-3 text-sm leading-5 text-slate-600">This enrollment does not have learner lessons yet. Open the course outline or browse available courses for a complete learning path.</p>}

            <p className="mt-4 text-sm"><span className="font-semibold">Final assessment:</span> <span className="text-slate-600">{assessmentLabel(course)}</span></p>
            {course.certificate_id && course.public_id && <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-semibold text-emerald-950">Your certificate is ready</p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold"><a className="text-navy-900 underline" href={`/api/certificates/${course.certificate_id}/pdf`}>Download certificate</a><Link className="text-navy-900 underline" href={`/certificates/verify?id=${course.public_id}`}>View verification</Link></div>
            </div>}
            {course.status === "completed" && !course.certificate_id && <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm leading-5 text-emerald-950">Course requirements are recorded complete. A certificate is available only when the same course version and assessment have approved publication status.</p>}

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
              {course.status !== "cancelled" ? <><Link href={primaryHref} className="button-primary inline-flex min-h-11 items-center rounded-lg px-4 py-2.5 text-sm font-bold">{primaryLabel}</Link>
                <Link href={`/learn/${course.slug}`} className="inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-semibold text-navy-900 underline underline-offset-2">Course outline</Link></>
                : <Link href="/courses" className="inline-flex min-h-11 items-center font-semibold text-navy-900 underline">Browse other courses</Link>}
            </div>

            {process.env.LMS_CONTROLLED_PILOT === "true" && !course.feedback_submitted && course.status !== "cancelled" && <details className="mt-4 border-t border-slate-100 pt-4">
              <summary className="min-h-11 cursor-pointer py-2 text-sm font-bold text-navy-900">Share optional pilot feedback</summary>
              <p className="mt-2 text-xs leading-5 text-slate-600">Your feedback is attached to your account for the pilot team. Do not include passwords, payment details, or personal banking/customer information.</p>
              <form action={submitPilotFeedback} className="mt-3 space-y-3"><input type="hidden" name="courseId" value={course.course_id} />
                <label className="block text-sm font-semibold">Overall experience<select name="overall" required className="form-input"><option value="">Choose 1â€“5</option>{[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score}</option>)}</select></label>
                <label className="block text-sm font-semibold">Instructions were clear<select name="clarity" required className="form-input"><option value="">Choose 1â€“5</option>{[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score}</option>)}</select></label>
                <label className="block text-sm font-semibold">I feel more confident about this topic (optional)<select name="confidence" className="form-input"><option value="">Skip</option>{[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score}</option>)}</select></label>
                <fieldset><legend className="text-sm font-semibold">What needs improvement? (optional)</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{feedbackCategories.map(([value, label]) => <label key={value} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="categories" value={value} className="size-4 accent-navy-800" />{label}</label>)}</div></fieldset>
                <label className="block text-sm font-semibold">Anything else? (optional)<textarea name="comment" maxLength={2000} rows={3} className="form-input w-full" /></label>
                <button className="min-h-11 rounded-lg border border-navy-900 px-4 py-2 text-sm font-bold">Send feedback</button>
              </form>
            </details>}
          </li>;
        })}
      </ul>}
    </section>

    <section id="available-courses" className="mt-11 scroll-mt-32" aria-labelledby="available-courses-heading">
      <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-navy-800">Find your next step</p><h2 id="available-courses-heading" className="mt-1 text-2xl font-bold tracking-tight">Available courses</h2></div>
      {available.length === 0 ? <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm leading-6 text-slate-600">There are no additional courses open for enrollment right now.</p><Link href="/courses" className="mt-3 inline-flex min-h-11 items-center font-semibold text-navy-900 underline underline-offset-2">Browse proposed learning tracks</Link>
      </div> : <ul className="mt-4 grid gap-4 lg:grid-cols-2">{available.map((course) => <li key={course.id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="min-w-0 break-words text-lg font-bold">{course.title}</h3>{course.is_sandbox && <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-950">Local preview</span>}</div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{course.summary}</p>
        {course.is_sandbox && <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-950">This is an internal draft preview. It has not been approved for learners and cannot issue a certificate.</p>}
        {!course.is_sandbox && <p className="mt-3 text-xs font-semibold text-slate-600">Content review: {course.review_status === "approved" ? "Approved" : course.review_status.replaceAll("_", " ")} Â· Review date: {dateLabel(course.review_date)}</p>}
        <dl className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
          <div><dt className="font-semibold text-slate-800">Estimated effort</dt><dd className="mt-1 text-slate-600">{effort(course.estimated_minutes)}{course.independent_practice_minutes ? `, including ${course.independent_practice_minutes} min of offline practice` : ""}</dd></div>
          <div><dt className="font-semibold text-slate-800">Prerequisites</dt><dd className="mt-1 text-slate-600">No prerequisite requirement is recorded for this course version.</dd></div>
          <div><dt className="font-semibold text-slate-800">Learning material</dt><dd className="mt-1 text-slate-600">{course.lesson_count} lesson{course.lesson_count === 1 ? "" : "s"}</dd></div>
          <div><dt className="font-semibold text-slate-800">Final assessment</dt><dd className="mt-1 text-slate-600">{course.final_pass_percent === null ? "Not configured" : `Pass ${Number(course.final_pass_percent)}% Â· up to ${course.final_max_attempts ?? "â€”"} attempts`}</dd></div>
        </dl>
        {course.learning_objectives.length > 0 && <details className="mt-4 rounded-lg border border-slate-200 px-4">
          <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold">What youâ€™ll learn</summary>
          <ul className="list-disc space-y-2 pb-4 pl-5 text-sm leading-5 text-slate-600">{course.learning_objectives.map((objective, index) => <li key={`${index}-${objective}`}>{objective}</li>)}</ul>
        </details>}
        <p className="mt-4 text-xs leading-5 text-slate-600">On an approved course, complete the required lessons and pass the final assessment to qualify for a Centaur course-completion certificate. It is not a government, regulator, bank, or employer credential and does not guarantee employment.</p>
        <form action={enrollInCourse} className="mt-5"><input type="hidden" name="courseId" value={course.id} /><button className="button-primary inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold sm:w-auto">{course.is_sandbox ? "Open local preview" : "Enroll for free"}</button></form>
      </li>)}</ul>}
    </section>

    <p className="mt-8 text-sm text-slate-600">Need to update your details or contact support? <Link href="/account" className="font-semibold text-navy-900 underline">Manage your account</Link>.</p>
  </main>;
}

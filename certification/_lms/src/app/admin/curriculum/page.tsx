import Link from "next/link";
import { notFound } from "next/navigation";
import { getDatabasePool } from "@/lib/db";
import { requireCourseEditor } from "@/lib/learner";

export const dynamic = "force-dynamic";

type PilotReview = {
  title: string; slug: string; version_id: string; version_number: number; version_status: string;
  review_status: string; review_date: string | null; reviewer_name: string | null;
  estimated_minutes: number; independent_practice_minutes: number;
  objectives: string[]; sources: { title: string; url: string; accessed: string; note: string }[];
  case_packet: { title: string; notice: string; facts: string[]; questions: string[] };
  module_count: number; lesson_count: number;
};
type ReviewModule = { title: string; summary: string; lesson_title: string; content: { minutes?: number; blocks?: { type: string; text?: string; title?: string; items?: string[] }[] } };
type ReviewAssessment = { id: string; slug: string; title: string; version_number: number; status: string; review_status: string; review_date: string | null; reviewer_name: string | null; pass_percent: string | number | null; rules: { kind: string; max_attempts: number; time_limit_minutes: number | null; objective_blueprint: { objective: string; count: number }[] } };
type ReviewQuestion = { assessment_id: string; position: number; prompt: { text: string; objective: string; lesson_slug: string }; choices: { id: string; text: string }[]; answer_key: { choice_id: string }; explanation: { text: string } };
type AssessmentReviewRecord = { assessment_id: string; assessment_version_number: number; reviewer_name: string; decision: string; notes: string; reviewed_at: Date };

export default async function LocalCurriculumReviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  await requireCourseEditor();
  const result = await getDatabasePool().query<PilotReview>(`SELECT c.title, c.slug, v.version_number,
      v.status AS version_status, v.review_status, v.review_date::text, v.reviewer_name,
      v.estimated_minutes, v.independent_practice_minutes,
      v.id AS version_id, v.learning_objectives AS objectives, v.content_sources AS sources, v.case_packet,
      (SELECT count(*)::int FROM lms.modules m WHERE m.course_version_id=v.id) AS module_count,
      (SELECT count(*)::int FROM lms.modules m JOIN lms.lessons l ON l.module_id=m.id WHERE m.course_version_id=v.id) AS lesson_count
    FROM lms.courses c JOIN lms.course_versions v ON v.id=c.current_version_id
    WHERE c.slug='kyc-aml-operations-pilot' AND c.is_sandbox=TRUE LIMIT 1`);
  const pilot = result.rows[0];
  const curriculum = pilot ? await getDatabasePool().query<ReviewModule>(`SELECT m.title, m.summary, l.title AS lesson_title, l.content
    FROM lms.modules m JOIN lms.lessons l ON l.module_id=m.id
    WHERE m.course_version_id=$1 ORDER BY m.position,l.position`, [pilot.version_id]) : null;
  const assessmentsResult = pilot ? await getDatabasePool().query<ReviewAssessment>(`SELECT id,slug,title,version_number,status,review_status,review_date::text,reviewer_name,pass_percent,rules
    FROM lms.assessments WHERE course_version_id=$1 ORDER BY slug`, [pilot.version_id]) : null;
  const assessmentIds = assessmentsResult?.rows.map((item) => item.id) ?? [];
  const questionsResult = assessmentIds.length ? await getDatabasePool().query<ReviewQuestion>(`SELECT assessment_id,position,prompt,choices,answer_key,explanation
    FROM lms.assessment_questions WHERE assessment_id=ANY($1::uuid[]) ORDER BY assessment_id,position`, [assessmentIds]) : null;
  const reviewRecords = assessmentIds.length ? await getDatabasePool().query<AssessmentReviewRecord>(`SELECT assessment_id,assessment_version_number,reviewer_name,decision,notes,reviewed_at
    FROM lms.assessment_reviews WHERE assessment_id=ANY($1::uuid[]) ORDER BY reviewed_at DESC`, [assessmentIds]) : null;
  return <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy-800"><Link href="/admin" className="underline">Local admin</Link> / Curriculum review</p>
    <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Pilot curriculum review</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">This local-only page helps a qualified reviewer inspect the current draft and its references. It cannot approve a course or change publication state.</p>
    {!pilot ? <p className="mt-6 rounded-xl border border-gold-200 bg-gold-50 p-5 text-sm">No pilot curriculum is seeded. Run <code>npm run db:seed:pilot</code> in the local development environment.</p> : <>
      <section className="mt-7 rounded-xl border border-gold-300 bg-gold-50 p-5"><p className="text-xs font-extrabold uppercase tracking-widest text-gold-900">{pilot.review_status.replaceAll("_", " ")} · version {pilot.version_number} · {pilot.version_status}</p><h2 className="mt-2 text-2xl font-bold">{pilot.title}</h2><p className="mt-2 text-sm text-slate-700">{pilot.module_count} modules · {pilot.lesson_count} lessons · {pilot.estimated_minutes} estimated minutes including {pilot.independent_practice_minutes} minutes of offline workbook practice · draft record {pilot.review_date ?? "not dated"} · reviewer {pilot.reviewer_name ?? "not assigned"}</p></section>
      <section className="mt-7 rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-bold">Reviewer checklist</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700"><li>☐ Confirm every legal/regulatory statement against current official material and note the effective date and scope.</li><li>☐ Check that customer due diligence, beneficial ownership, PEP/screening, ongoing review, record keeping, and confidentiality wording matches applicable requirements.</li><li>☐ Confirm examples are fictional, do not contain real customer data, and avoid teaching unsupported decision rules.</li><li>☐ Review learning objectives, sequence, practice prompts, workbook answers, readability, and accessibility.</li><li>☐ Record reviewer name, review date, corrections, and the approved source set in the content record before publication.</li></ul><p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">Approval must be recorded by the authorized content owner through a controlled release process. This preview is not a signoff record.</p></section>
      <section className="mt-7 rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-bold">Learning objectives</h2><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">{pilot.objectives.map((objective, index) => <li key={index}>{objective}</li>)}</ol></section>
      <section className="mt-7 rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-bold">Lesson content preview</h2><div className="mt-4 space-y-5">{curriculum?.rows.map((lesson, index) => <article key={`${lesson.lesson_title}-${index}`} className="rounded-lg border border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-wide text-navy-800">{lesson.title}</p><h3 className="mt-1 text-lg font-bold">{lesson.lesson_title}</h3><p className="text-xs text-slate-500">{lesson.content.minutes ?? 0} minutes</p><div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">{lesson.content.blocks?.map((block, blockIndex) => <div key={blockIndex}>{block.title && <h4 className="font-bold text-slate-950">{block.title}</h4>}{block.text && <p>{block.text}</p>}{block.items && <ul className="list-disc space-y-1 pl-5">{block.items.map((item) => <li key={item}>{item}</li>)}</ul>}</div>)}</div></article>)}</div></section>
      <section className="mt-7 rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-bold">Fictional case packet</h2><p className="mt-2 text-sm text-slate-600">{pilot.case_packet.notice}</p><ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">{pilot.case_packet.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul><h3 className="mt-5 font-bold">Review prompts</h3><ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">{pilot.case_packet.questions.map((question) => <li key={question}>{question}</li>)}</ol><a className="mt-5 inline-flex font-semibold text-navy-900 underline" href="/worksheets/kyc-aml-riverstone-workbook-v1.md" download>Download learner workbook</a></section>
      <section className="mt-7 rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-bold">Assessment blueprint and reviewer preview</h2><p className="mt-2 text-sm leading-6 text-slate-600">Correct options are visible on this development-only review page. Learner assessment pages omit answer keys; final results do not disclose them.</p><div className="mt-4 space-y-5">{assessmentsResult?.rows.map((assessment) => {
        const questions = questionsResult?.rows.filter((question) => question.assessment_id === assessment.id) ?? [];
        const records = reviewRecords?.rows.filter((record) => record.assessment_id === assessment.id) ?? [];
        return <article key={assessment.id} className="rounded-lg border border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-wide text-amber-900">{assessment.review_status} · {assessment.status} · v{assessment.version_number}</p><h3 className="mt-1 text-lg font-bold">{assessment.title}</h3><p className="mt-1 text-sm text-slate-600">{questions.length} questions · pass {assessment.pass_percent == null ? "practice" : `${assessment.pass_percent}%`} · max {assessment.rules.max_attempts} attempts · {assessment.rules.time_limit_minutes ? `${assessment.rules.time_limit_minutes} minute timer` : "untimed"}</p><p className="mt-2 text-xs text-slate-600">Blueprint: {assessment.rules.objective_blueprint.map((item) => `${item.objective}: ${item.count}`).join(" · ")}</p><ol className="mt-4 space-y-4">{questions.map((question) => <li key={question.position} className="border-t border-slate-100 pt-3"><p className="font-semibold">{question.position}. {question.prompt.text}</p><ul className="mt-2 list-[lower-alpha] space-y-1 pl-6 text-sm text-slate-700">{question.choices.map((choice) => <li key={choice.id} className={choice.id === question.answer_key.choice_id ? "font-bold text-emerald-800" : ""}>{choice.text}{choice.id === question.answer_key.choice_id ? " (key)" : ""}</li>)}</ul><p className="mt-2 text-xs leading-5 text-slate-600">{question.prompt.objective} · lesson {question.prompt.lesson_slug} · {question.explanation.text}</p></li>)}</ol>{records.length ? <div className="mt-4 border-t border-slate-200 pt-3"><h4 className="font-semibold">Review record</h4>{records.map((record) => <p key={`${record.reviewer_name}-${record.reviewed_at.toISOString()}`} className="mt-2 text-sm">{record.decision} by {record.reviewer_name} on {record.reviewed_at.toLocaleDateString()} — {record.notes}</p>)}</div> : <p className="mt-4 text-xs font-semibold text-amber-900">No subject-matter approval is recorded.</p>}</article>;
      })}</div></section>
      <section className="mt-7 rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-bold">Source register</h2><ul className="mt-4 space-y-5">{pilot.sources.map((source) => <li key={source.url}><a className="font-semibold text-navy-900 underline" href={source.url} target="_blank" rel="noreferrer">{source.title}</a><p className="mt-1 text-xs leading-5 text-slate-600">Accessed {source.accessed}. {source.note}</p></li>)}</ul></section>
    </>}
  </main>;
}

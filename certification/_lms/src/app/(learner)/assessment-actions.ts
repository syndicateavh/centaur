"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireLearner } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";
import { calculateCourseCompletion } from "@/lib/course-completion";
import { issueCertificateForCompletedEnrollment } from "@/lib/certificates";

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
const attemptIdSchema = z.string().uuid();

function assessmentUrl(courseSlug: string, assessmentSlug: string, query = "") {
  return `/learn/${courseSlug}/assessment/${assessmentSlug}${query}`;
}

export async function startAssessment(formData: FormData) {
  const learner = await requireLearner();
  const courseSlug = slugSchema.parse(formData.get("courseSlug"));
  const assessmentSlug = slugSchema.parse(formData.get("assessmentSlug"));
  const localDraftPreview = process.env.NODE_ENV === "development";
  const attemptId = await withLearnerTransaction(learner.id, async (client) => {
    const result = await client.query<{ course_id: string; course_version_id: string; enrollment_status: string; assessment_id: string; assessment_version: number; assessment_status: string; review_status: string; rules: { kind: string; module_slug: string | null; max_attempts: number; question_count: number } }>(`SELECT c.id AS course_id,e.course_version_id,e.status AS enrollment_status,
        a.id AS assessment_id,a.version_number AS assessment_version,a.status AS assessment_status,a.review_status,a.rules
      FROM lms.enrollments e JOIN lms.courses c ON c.id=e.course_id
      JOIN lms.course_versions v ON v.id=e.course_version_id AND v.course_id=c.id
      JOIN lms.assessments a ON a.course_version_id=v.id
      WHERE e.user_id=$1 AND e.status='active' AND c.slug=$2 AND a.slug=$3
        AND a.version_number=(SELECT max(a2.version_number) FROM lms.assessments a2 WHERE a2.course_version_id=v.id AND a2.slug=a.slug)
        AND ((c.status IN ('published','archived') AND v.status IN ('published','retired') AND a.status IN ('published','retired') AND a.review_status='approved')
          OR ($4::boolean AND c.is_sandbox=TRUE AND c.status='draft' AND v.status='draft' AND a.status='draft'))
      FOR UPDATE OF e`, [learner.id, courseSlug, assessmentSlug, localDraftPreview]);
    const assessment = result.rows[0];
    if (!assessment) return null;
    let required: { total: number; complete: number } | undefined;
    if (assessment.rules.kind === "final") {
      const lessons = await client.query<{ total: number; complete: number }>(`SELECT count(l.id)::int AS total,
          count(l.id) FILTER (WHERE p.status='completed')::int AS complete
        FROM lms.modules m JOIN lms.lessons l ON l.module_id=m.id
        LEFT JOIN lms.lesson_progress p ON p.lesson_id=l.id AND p.user_id=$1
        WHERE m.course_version_id=$2 AND (l.published=TRUE OR $3::boolean)`, [learner.id, assessment.course_version_id, localDraftPreview]);
      required = lessons.rows[0];
    } else if (assessment.rules.module_slug) {
      const lessons = await client.query<{ total: number; complete: number }>(`SELECT count(l.id)::int AS total,
          count(l.id) FILTER (WHERE p.status='completed')::int AS complete
        FROM lms.modules m JOIN lms.lessons l ON l.module_id=m.id
        LEFT JOIN lms.lesson_progress p ON p.lesson_id=l.id AND p.user_id=$1
        WHERE m.course_version_id=$2 AND m.slug=$3 AND (l.published=TRUE OR $4::boolean)`, [learner.id, assessment.course_version_id, assessment.rules.module_slug, localDraftPreview]);
      required = lessons.rows[0];
    }
    if (required && (!required.total || required.complete !== required.total)) return "locked";
    const latest = await client.query<{ id: string; status: string; passed: boolean | null }>(`SELECT id,status,passed FROM lms.assessment_attempts
      WHERE user_id=$1 AND assessment_id=$2 ORDER BY attempt_number DESC LIMIT 1`, [learner.id, assessment.assessment_id]);
    if (assessment.rules.kind === "final") {
      const passed = await client.query('SELECT 1 FROM lms.assessment_attempts WHERE user_id=$1 AND assessment_id=$2 AND passed=TRUE LIMIT 1', [learner.id, assessment.assessment_id]);
      if (passed.rowCount) return "passed";
    }
    if (latest.rows[0]?.status === "in_progress") return latest.rows[0].id;
    const count = await client.query<{ total: number }>('SELECT count(*)::int AS total FROM lms.assessment_attempts WHERE user_id=$1 AND assessment_id=$2', [learner.id, assessment.assessment_id]);
    if (count.rows[0].total >= assessment.rules.max_attempts) return "exhausted";
    const questions = await client.query<{ total: number }>('SELECT count(*)::int AS total FROM lms.assessment_questions WHERE assessment_id=$1', [assessment.assessment_id]);
    if (questions.rows[0].total !== assessment.rules.question_count) return "invalid";
    const created = await client.query<{ id: string }>(`INSERT INTO lms.assessment_attempts
      (user_id,assessment_id,attempt_number,status,course_version_id,assessment_version_number)
      VALUES ($1,$2,$3,'in_progress',$4,$5) RETURNING id`, [learner.id, assessment.assessment_id, count.rows[0].total + 1, assessment.course_version_id, assessment.assessment_version]);
    return created.rows[0].id;
  });
  if (!attemptId) redirect("/dashboard");
  if (attemptId === "locked") redirect(`${assessmentUrl(courseSlug, assessmentSlug)}?state=lessons-required`);
  if (attemptId === "passed") redirect(`${assessmentUrl(courseSlug, assessmentSlug)}?state=already-passed`);
  if (attemptId === "exhausted") redirect(`${assessmentUrl(courseSlug, assessmentSlug)}?state=attempt-limit`);
  if (attemptId === "invalid") redirect(`${assessmentUrl(courseSlug, assessmentSlug)}?state=unavailable`);
  redirect(assessmentUrl(courseSlug, assessmentSlug, `?attempt=${attemptId}`));
}

export async function submitAssessment(formData: FormData) {
  const learner = await requireLearner();
  const courseSlug = slugSchema.parse(formData.get("courseSlug"));
  const attemptId = attemptIdSchema.parse(formData.get("attemptId"));
  const localDraftPreview = process.env.NODE_ENV === "development";
  const submitted = await withLearnerTransaction(learner.id, async (client) => {
    const attemptResult = await client.query<{ id: string; course_id: string; course_slug: string; course_version_id: string; assessment_id: string; assessment_slug: string; assessment_version: number; assessment_status: string; review_status: string; attempt_number: number; attempt_status: string; rules: { kind: string; question_count: number }; pass_percent: string | number | null }>(`SELECT aa.id,c.id AS course_id,c.slug AS course_slug,e.course_version_id,a.id AS assessment_id,a.slug AS assessment_slug,
        a.version_number AS assessment_version,a.status AS assessment_status,a.review_status,aa.attempt_number,aa.status AS attempt_status,a.rules,a.pass_percent
      FROM lms.assessment_attempts aa JOIN lms.assessments a ON a.id=aa.assessment_id
      JOIN lms.enrollments e ON e.user_id=aa.user_id AND e.course_version_id=a.course_version_id
      JOIN lms.courses c ON c.id=e.course_id
      JOIN lms.course_versions v ON v.id=e.course_version_id AND v.course_id=e.course_id
      WHERE aa.user_id=$1 AND aa.id=$2 AND c.slug=$3 AND aa.course_version_id=e.course_version_id
        AND aa.assessment_version_number=a.version_number
        AND ((c.status IN ('published','archived') AND v.status IN ('published','retired') AND a.status IN ('published','retired') AND a.review_status='approved')
          OR ($4::boolean AND c.is_sandbox=TRUE AND c.status='draft' AND v.status='draft' AND a.status='draft'))
      FOR UPDATE OF aa`, [learner.id, attemptId, courseSlug, localDraftPreview]);
    const attempt = attemptResult.rows[0];
    if (!attempt) return null;
    if (attempt.attempt_status !== "in_progress") return { ...attempt, complete: false };
    const questions = await client.query<{ id: string; choices: { id: string; text: string }[]; answer_key: { choice_id: string }; prompt: { objective: string; lesson_slug: string }; explanation: { text: string } }>(`SELECT id,choices,answer_key,prompt,explanation FROM lms.assessment_questions WHERE assessment_id=$1 ORDER BY position`, [attempt.assessment_id]);
    if (!questions.rowCount || questions.rowCount !== attempt.rules.question_count) return { ...attempt, invalid: true };
    const answers: Record<string, string> = {};
    for (const question of questions.rows) {
      const value = formData.get(`q-${question.id}`);
      if (typeof value !== "string" || !question.choices.some((choice) => choice.id === value)) return { ...attempt, invalid: true };
      answers[question.id] = value;
    }
    const correctByObjective = new Map<string, { correct: number; total: number; lessons: string[] }>();
    const formativeItems: { question_id: string; choice_id: string; correct_choice_id: string; correct: boolean; explanation: string }[] = [];
    let correct = 0;
    for (const question of questions.rows) {
      const right = answers[question.id] === question.answer_key.choice_id;
      if (right) correct++;
      const objective = question.prompt.objective;
      const record = correctByObjective.get(objective) ?? { correct: 0, total: 0, lessons: [] };
      record.total++;
      if (right) record.correct++;
      if (!record.lessons.includes(question.prompt.lesson_slug)) record.lessons.push(question.prompt.lesson_slug);
      correctByObjective.set(objective, record);
      if (attempt.rules.kind === "knowledge_check") {
        formativeItems.push({ question_id: question.id, choice_id: answers[question.id], correct_choice_id: question.answer_key.choice_id,
          correct: right, explanation: question.explanation.text ?? "Review the related lesson." });
      }
    }
    const score = Math.round(correct * 100 / questions.rowCount);
    const passed = attempt.pass_percent == null ? false : score >= Number(attempt.pass_percent);
    const feedback = {
      topics: [...correctByObjective.entries()].map(([objective, value]) => ({ objective, ...value })),
      ...(attempt.rules.kind === "knowledge_check" ? { items: formativeItems } : {}),
    };
    await client.query(`UPDATE lms.assessment_attempts SET status='submitted',answers=$2::jsonb,score_percent=$3,passed=$4,
      feedback=$5::jsonb,submitted_at=now() WHERE id=$1`, [attempt.id, JSON.stringify(answers), score, passed, JSON.stringify(feedback)]);
    let certificate: { id: string; public_id: string } | null = null;
    if (attempt.rules.kind === "final" && passed) {
      const courseCompleted = await calculateCourseCompletion(client, learner.id, attempt.course_id, attempt.course_version_id);
      if (courseCompleted) certificate = await issueCertificateForCompletedEnrollment(client, learner.id, attempt.course_id, attempt.course_version_id);
    }
    return { ...attempt, certificateIssued: Boolean(certificate), submitted: true };
  });
  if (!submitted) redirect("/dashboard");
  revalidatePath(`/learn/${courseSlug}`);
  revalidatePath("/dashboard");
  if ("invalid" in submitted && submitted.invalid) redirect(assessmentUrl(courseSlug, submitted.assessment_slug, `?state=invalid-answers`));
  redirect(assessmentUrl(courseSlug, submitted.assessment_slug, `?attempt=${attemptId}`));
}

export async function saveAssessmentAnswers(formData: FormData) {
  const learner = await requireLearner();
  const courseSlug = slugSchema.parse(formData.get("courseSlug"));
  const attemptId = attemptIdSchema.parse(formData.get("attemptId"));
  const localDraftPreview = process.env.NODE_ENV === "development";
  const saved = await withLearnerTransaction(learner.id, async (client) => {
    const attempt = await client.query<{ assessment_id: string; assessment_slug: string; status: string }>(`SELECT aa.assessment_id,a.slug AS assessment_slug,aa.status
      FROM lms.assessment_attempts aa JOIN lms.assessments a ON a.id=aa.assessment_id
      JOIN lms.enrollments e ON e.user_id=aa.user_id AND e.course_version_id=aa.course_version_id
      JOIN lms.courses c ON c.id=e.course_id JOIN lms.course_versions v ON v.id=e.course_version_id
      WHERE aa.id=$1 AND aa.user_id=$2 AND c.slug=$3 AND aa.assessment_version_number=a.version_number
        AND ((c.status IN ('published','archived') AND v.status IN ('published','retired') AND a.status IN ('published','retired') AND a.review_status='approved')
          OR ($4::boolean AND c.is_sandbox=TRUE AND c.status='draft' AND v.status='draft' AND a.status='draft'))
      FOR UPDATE OF aa`, [attemptId, learner.id, courseSlug, localDraftPreview]);
    if (!attempt.rowCount || attempt.rows[0].status !== "in_progress") return null;
    const questions = await client.query<{ id: string; choices: { id: string }[] }>('SELECT id,choices FROM lms.assessment_questions WHERE assessment_id=$1', [attempt.rows[0].assessment_id]);
    const answers: Record<string, string> = {};
    for (const question of questions.rows) {
      const value = formData.get(`q-${question.id}`);
      if (value == null) continue;
      if (typeof value !== "string" || !question.choices.some((choice) => choice.id === value)) return null;
      answers[question.id] = value;
    }
    await client.query('UPDATE lms.assessment_attempts SET answers=$2::jsonb WHERE id=$1', [attemptId, JSON.stringify(answers)]);
    return attempt.rows[0].assessment_slug;
  });
  if (!saved) redirect("/dashboard?assessment=unavailable");
  revalidatePath(`/learn/${courseSlug}/assessment/${saved}`);
  redirect(assessmentUrl(courseSlug, saved, `?attempt=${attemptId}&state=progress-saved`));
}

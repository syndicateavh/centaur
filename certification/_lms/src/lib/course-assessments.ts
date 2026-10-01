import "server-only";
import { withLearnerTransaction } from "@/lib/learner-db";

type Rules = { kind: "knowledge_check" | "final"; module_slug: string | null; max_attempts: number; time_limit_minutes: number | null; question_count: number; objective_blueprint: { objective: string; count: number }[]; feedback: string };
type Question = { id: string; position: number; text: string; objective: string; lesson_slug: string; choices: { id: string; text: string }[] };
type Attempt = { id: string; attempt_number: number; status: "in_progress" | "submitted" | "abandoned"; score_percent: string | number | null; passed: boolean | null; answers: Record<string, string>; feedback: { topics?: { objective: string; total: number; correct: number; lessons?: string[] }[]; items?: { question_id: string; choice_id: string; correct_choice_id: string; correct: boolean; explanation: string }[] }; started_at: Date; submitted_at: Date | null; course_version_id: string; assessment_version_number: number };
type AttemptSummary = { id: string; attempt_number: number; assessment_version_number: number; status: string; score_percent: string | number | null; passed: boolean | null; started_at: Date; submitted_at: Date | null };

export type AssessmentView = {
  courseSlug: string; courseTitle: string; courseId: string; versionId: string; versionNumber: number;
  courseStatus: string; courseIsSandbox: boolean; versionStatus: string;
  enrollmentStatus: string; assessmentId: string; slug: string; title: string; version: number;
  reviewStatus: string; reviewDate: string | null; passPercent: number | null; rules: Rules;
  questions: Question[]; completedRequiredLessons: number; requiredLessons: number;
  attemptCount: number; attempt: Attempt | null; attemptHistory: AttemptSummary[];
  formativeResults: { questionId: string; prompt: string; selected: string | null; correctChoice: string; explanation: string; correct: boolean }[];
  nextLesson: { slug: string; title: string; moduleTitle: string } | null;
};

export async function getAssessmentView(learnerId: string, courseSlug: string, assessmentSlug: string, requestedAttemptId?: string): Promise<AssessmentView | null> {
  return withLearnerTransaction(learnerId, async (client) => {
    const localPreview = process.env.NODE_ENV === "development";
    const assessmentResult = await client.query<{ course_id: string; course_slug: string; course_title: string; course_status: string; course_is_sandbox: boolean; version_status: string; version_id: string; version_number: number; enrollment_status: string; assessment_id: string; assessment_slug: string; title: string; assessment_version: number; status: string; review_status: string; review_date: string | null; pass_percent: string | number | null; rules: Rules }>(`SELECT c.id AS course_id,c.slug AS course_slug,c.title AS course_title,c.status AS course_status,c.is_sandbox AS course_is_sandbox,v.status AS version_status,v.id AS version_id,v.version_number,e.status AS enrollment_status,
        a.id AS assessment_id,a.slug AS assessment_slug,a.title,a.version_number AS assessment_version,a.status,a.review_status,a.review_date::text,a.pass_percent,a.rules
      FROM lms.enrollments e JOIN lms.courses c ON c.id=e.course_id
      JOIN lms.course_versions v ON v.id=e.course_version_id AND v.course_id=c.id
      JOIN lms.assessments a ON a.course_version_id=v.id
      WHERE e.user_id=$1 AND e.status IN ('active','completed') AND c.slug=$2 AND a.slug=$3
        AND (($5::uuid IS NULL AND a.version_number=(SELECT max(a2.version_number) FROM lms.assessments a2 WHERE a2.course_version_id=v.id AND a2.slug=a.slug))
          OR ($5::uuid IS NOT NULL AND EXISTS (SELECT 1 FROM lms.assessment_attempts requested WHERE requested.id=$5 AND requested.user_id=$1 AND requested.assessment_id=a.id)))
        AND ((a.status IN ('published','retired') AND a.review_status='approved' AND v.status IN ('published','retired') AND c.status IN ('published','archived'))
          OR ($4::boolean AND c.is_sandbox=TRUE AND c.status='draft' AND v.status='draft' AND a.status='draft'))`,
    [learnerId, courseSlug, assessmentSlug, localPreview, requestedAttemptId ?? null]);
    const assessment = assessmentResult.rows[0];
    if (!assessment) return null;
    let nextLesson: AssessmentView["nextLesson"] = null;
    if (assessment.rules.module_slug) {
      const next = await client.query<{ slug: string; title: string; module_title: string }>(`SELECT l.slug,l.title,m.title AS module_title
        FROM lms.modules current_module
        JOIN lms.modules m ON m.course_version_id=current_module.course_version_id AND m.position>current_module.position
        JOIN lms.lessons l ON l.module_id=m.id
        WHERE current_module.course_version_id=$1 AND current_module.slug=$2 AND (l.published=TRUE OR $3::boolean)
        ORDER BY m.position,l.position LIMIT 1`, [assessment.version_id, assessment.rules.module_slug, localPreview]);
      if (next.rows[0]) nextLesson = { slug: next.rows[0].slug, title: next.rows[0].title, moduleTitle: next.rows[0].module_title };
    }
    const questionsResult = await client.query<{ id: string; position: number; prompt: { text: string; objective: string; lesson_slug: string }; choices: { id: string; text: string }[] }>(`SELECT id,position,prompt,choices FROM lms.assessment_questions WHERE assessment_id=$1 ORDER BY position`, [assessment.assessment_id]);
    const questions: Question[] = questionsResult.rows.map((question) => ({ id: question.id, position: question.position, text: question.prompt.text, objective: question.prompt.objective, lesson_slug: question.prompt.lesson_slug, choices: question.choices }));
    let required;
    if (assessment.rules.module_slug) {
      required = await client.query<{ total: number; complete: number }>(`SELECT count(l.id)::int AS total,
          count(l.id) FILTER (WHERE p.status='completed')::int AS complete
        FROM lms.modules m JOIN lms.lessons l ON l.module_id=m.id
        LEFT JOIN lms.lesson_progress p ON p.lesson_id=l.id AND p.user_id=$1
        WHERE m.course_version_id=$2 AND m.slug=$3 AND (l.published=TRUE OR $4::boolean)`, [learnerId, assessment.version_id, assessment.rules.module_slug, localPreview]);
    } else {
      required = await client.query<{ total: number; complete: number }>(`SELECT count(l.id)::int AS total,
          count(l.id) FILTER (WHERE p.status='completed')::int AS complete
        FROM lms.modules m JOIN lms.lessons l ON l.module_id=m.id
        LEFT JOIN lms.lesson_progress p ON p.lesson_id=l.id AND p.user_id=$1
        WHERE m.course_version_id=$2 AND (l.published=TRUE OR $3::boolean)`, [learnerId, assessment.version_id, localPreview]);
    }
    const attempts = await client.query<{ total: number }>('SELECT count(*)::int AS total FROM lms.assessment_attempts WHERE user_id=$1 AND assessment_id=$2', [learnerId, assessment.assessment_id]);
    const history = await client.query<AttemptSummary>(`SELECT aa.id,aa.attempt_number,aa.assessment_version_number,aa.status,aa.score_percent,aa.passed,aa.started_at,aa.submitted_at
      FROM lms.assessment_attempts aa JOIN lms.assessments a ON a.id=aa.assessment_id
      WHERE aa.user_id=$1 AND a.course_version_id=$2 AND a.slug=$3 ORDER BY aa.assessment_version_number DESC,aa.attempt_number DESC`, [learnerId, assessment.version_id, assessment.assessment_slug]);
    let attemptResult;
    if (requestedAttemptId) {
      attemptResult = await client.query<Attempt>(`SELECT id,attempt_number,status,score_percent,passed,answers,feedback,started_at,submitted_at,course_version_id,assessment_version_number
        FROM lms.assessment_attempts WHERE user_id=$1 AND assessment_id=$2 AND id=$3
          AND course_version_id=$4 AND assessment_version_number=$5`, [learnerId, assessment.assessment_id, requestedAttemptId, assessment.version_id, assessment.assessment_version]);
    } else {
      attemptResult = await client.query<Attempt>(`SELECT id,attempt_number,status,score_percent,passed,answers,feedback,started_at,submitted_at,course_version_id,assessment_version_number
        FROM lms.assessment_attempts WHERE user_id=$1 AND assessment_id=$2 ORDER BY attempt_number DESC LIMIT 1`, [learnerId, assessment.assessment_id]);
    }
    const attempt = attemptResult.rows[0] ?? null;
    let formativeResults: AssessmentView["formativeResults"] = [];
    if (attempt?.status === "submitted" && assessment.rules.kind === "knowledge_check") {
      const graded = await client.query<{ id: string; prompt: { text: string }; choices: { id: string; text: string }[]; answer_key: { choice_id: string }; explanation: { text: string } }>(`SELECT id,prompt,choices,answer_key,explanation FROM lms.assessment_questions WHERE assessment_id=$1 ORDER BY position`, [assessment.assessment_id]);
      formativeResults = graded.rows.map((question) => ({ questionId: question.id, prompt: question.prompt.text,
        selected: attempt.answers[question.id] ?? null, correctChoice: question.answer_key.choice_id,
        explanation: question.explanation.text, correct: attempt.answers[question.id] === question.answer_key.choice_id }));
    }
    return {
      courseSlug: assessment.course_slug, courseTitle: assessment.course_title, courseId: assessment.course_id,
      courseStatus: assessment.course_status, courseIsSandbox: assessment.course_is_sandbox, versionStatus: assessment.version_status,
      versionId: assessment.version_id, versionNumber: assessment.version_number, enrollmentStatus: assessment.enrollment_status,
      assessmentId: assessment.assessment_id, slug: assessment.assessment_slug, title: assessment.title,
      version: assessment.assessment_version, reviewStatus: assessment.review_status, reviewDate: assessment.review_date,
      passPercent: assessment.pass_percent == null ? null : Number(assessment.pass_percent), rules: assessment.rules,
      questions, completedRequiredLessons: required.rows[0]?.complete ?? 0, requiredLessons: required.rows[0]?.total ?? 0,
      attemptCount: attempts.rows[0]?.total ?? 0, attempt, attemptHistory: history.rows, formativeResults,
      nextLesson,
    };
  });
}

import "server-only";
import { withLearnerTransaction } from "@/lib/learner-db";

export type LessonBlock =
  | { type: "lead" | "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list" | "takeaways"; items: string[] }
  | { type: "activity"; title: string; text: string }
  | { type: "callout"; title: string; text: string };

type CourseRow = {
  course_id: string; slug: string; title: string; summary: string; overview: string; enrollment_status: string;
  version_id: string; version_number: number; estimated_minutes: number | null;
  review_status: string; review_date: string | Date | null; reviewer_name: string | null;
  learning_objectives: string[];
  glossary: { term: string; definition: string }[];
  content_sources: { title: string; url: string; accessed: string; note: string }[];
  case_packet: { title: string; notice: string; facts: string[]; questions: string[] };
};
export type PlayerLesson = {
  id: string; slug: string; title: string; position: number; minutes: number; status: "not_started" | "in_progress" | "completed"; blocks: LessonBlock[];
};
export type PlayerModule = { id: string; slug: string; title: string; summary: string; position: number; lessons: PlayerLesson[] };
export type PlayerAssessment = { id: string; slug: string; title: string; kind: "knowledge_check" | "final"; moduleSlug: string | null; questionCount: number; passPercent: number | null; maxAttempts: number; attempts: number; latestStatus: string | null; latestPassed: boolean | null; latestScore: number | null; reviewStatus: string };
export type PlayerCourse = CourseRow & { modules: PlayerModule[]; assessments: PlayerAssessment[]; totalLessons: number; completedLessons: number };

function localDraftAccess() {
  return process.env.NODE_ENV === "development";
}

async function loadCourse(learnerId: string, courseSlug: string) {
  return withLearnerTransaction(learnerId, async (client) => {
    const result = await client.query<CourseRow>(`SELECT c.id AS course_id, c.slug, c.title, c.summary,e.status AS enrollment_status,
        v.overview, v.id AS version_id, v.version_number, v.estimated_minutes, v.review_status,
        v.review_date, v.reviewer_name, v.learning_objectives, v.glossary, v.content_sources, v.case_packet
      FROM lms.enrollments e
      JOIN lms.courses c ON c.id=e.course_id
      JOIN lms.course_versions v ON v.id=e.course_version_id AND v.course_id=c.id
      WHERE e.user_id=$1 AND e.status IN ('active','completed') AND c.slug=$2
        AND (c.status='published' OR ($3::boolean AND c.is_sandbox AND c.status='draft'))
        AND (v.status='published' OR ($3::boolean AND c.is_sandbox AND v.status='draft'))`,
    [learnerId, courseSlug, localDraftAccess()]);
    return result.rows[0] ?? null;
  });
}

export async function getEnrolledCourse(learnerId: string, courseSlug: string): Promise<PlayerCourse | null> {
  const course = await loadCourse(learnerId, courseSlug);
  if (!course) return null;
  return withLearnerTransaction(learnerId, async (client) => {
    const result = await client.query<{ id: string; module_slug: string; module_title: string; module_summary: string; module_position: number; lesson_slug: string; lesson_title: string; lesson_position: number; lesson_id: string; content: { blocks?: LessonBlock[]; minutes?: number }; progress_status: PlayerLesson["status"] | null }>(`
      SELECT m.id, m.slug AS module_slug, m.title AS module_title, m.summary AS module_summary,
        m.position AS module_position, l.id AS lesson_id, l.slug AS lesson_slug, l.title AS lesson_title,
        l.position AS lesson_position, l.content, p.status AS progress_status
      FROM lms.modules m JOIN lms.lessons l ON l.module_id=m.id
      LEFT JOIN lms.lesson_progress p ON p.lesson_id=l.id AND p.user_id=$1
      WHERE m.course_version_id=$2 AND (l.published=TRUE OR $3::boolean)
      ORDER BY m.position, l.position`, [learnerId, course.version_id, localDraftAccess()]);
    const assessmentsResult = await client.query<{ id: string; slug: string; title: string; rules: { kind: PlayerAssessment["kind"]; module_slug: string | null; max_attempts: number; question_count: number }; pass_percent: string | number | null; attempts: number; latest_status: string | null; latest_passed: boolean | null; latest_score: string | number | null; review_status: string }>(`SELECT a.id,a.slug,a.title,a.rules,a.pass_percent,a.review_status,
        (SELECT count(*)::int FROM lms.assessment_attempts aa WHERE aa.assessment_id=a.id AND aa.user_id=$1) AS attempts,
        latest.status AS latest_status,latest.passed AS latest_passed,latest.score_percent AS latest_score
      FROM lms.assessments a
      LEFT JOIN LATERAL (SELECT status,passed,score_percent FROM lms.assessment_attempts aa
        WHERE aa.assessment_id=a.id AND aa.user_id=$1 ORDER BY attempt_number DESC LIMIT 1) latest ON TRUE
      WHERE a.course_version_id=$2 AND a.version_number=(SELECT max(a2.version_number) FROM lms.assessments a2 WHERE a2.course_version_id=a.course_version_id AND a2.slug=a.slug)
        AND (a.status='published' OR ($3::boolean AND a.status='draft')) ORDER BY a.slug`,
    [learnerId, course.version_id, localDraftAccess()]);
    const modules = new Map<string, PlayerModule>();
    for (const row of result.rows) {
      let courseModule = modules.get(row.id);
      if (!courseModule) {
        courseModule = { id: row.id, slug: row.module_slug, title: row.module_title, summary: row.module_summary, position: row.module_position, lessons: [] };
        modules.set(row.id, courseModule);
      }
      courseModule.lessons.push({ id: row.lesson_id, slug: row.lesson_slug, title: row.lesson_title, position: row.lesson_position,
        minutes: row.content?.minutes ?? 10, status: row.progress_status ?? "not_started", blocks: row.content?.blocks ?? [] });
    }
    const moduleList = [...modules.values()];
    const lessons = moduleList.flatMap((module) => module.lessons);
    const assessments = assessmentsResult.rows.map((assessment) => ({ id: assessment.id, slug: assessment.slug, title: assessment.title,
      kind: assessment.rules.kind, moduleSlug: assessment.rules.module_slug, questionCount: assessment.rules.question_count,
      passPercent: assessment.pass_percent == null ? null : Number(assessment.pass_percent), maxAttempts: assessment.rules.max_attempts,
      attempts: assessment.attempts, latestStatus: assessment.latest_status, latestPassed: assessment.latest_passed,
      latestScore: assessment.latest_score == null ? null : Number(assessment.latest_score), reviewStatus: assessment.review_status }));
    return { ...course, modules: moduleList, assessments, totalLessons: lessons.length, completedLessons: lessons.filter((item) => item.status === "completed").length };
  });
}

export async function getEnrolledLesson(learnerId: string, courseSlug: string, lessonSlug: string) {
  const course = await getEnrolledCourse(learnerId, courseSlug);
  if (!course) return null;
  const entries = course.modules.flatMap((module) => module.lessons.map((lesson) => ({ module, lesson })));
  const index = entries.findIndex((entry) => entry.lesson.slug === lessonSlug);
  if (index < 0) return null;
  return { course, ...entries[index], previous: entries[index - 1] ?? null, next: entries[index + 1] ?? null };
}

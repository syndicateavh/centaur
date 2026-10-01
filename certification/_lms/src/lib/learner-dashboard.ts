import "server-only";
import { withLearnerTransaction } from "@/lib/learner-db";

export async function getLearnerDashboardData(learnerId: string) {
  const allowDraftPreview = process.env.NODE_ENV === "development";
  return withLearnerTransaction(learnerId, async (client) => {
    const available = await client.query<{
      id: string;
      slug: string;
      title: string;
      summary: string;
      is_sandbox: boolean;
      review_status: string;
      review_date: Date | string | null;
      estimated_minutes: number | null;
      independent_practice_minutes: number;
      learning_objectives: string[];
      lesson_count: number;
      final_pass_percent: number | string | null;
      final_max_attempts: number | null;
    }>(`SELECT c.id,c.slug,c.title,c.summary,c.is_sandbox,v.review_status,v.review_date,
        v.estimated_minutes,v.independent_practice_minutes,v.learning_objectives,
        (SELECT count(*)::int FROM lms.modules m JOIN lms.lessons l ON l.module_id=m.id
          WHERE m.course_version_id=v.id AND (l.published=TRUE OR $2::boolean)) AS lesson_count,
        final_assessment.pass_percent AS final_pass_percent,final_assessment.max_attempts AS final_max_attempts
      FROM lms.courses c JOIN lms.course_versions v ON v.id=c.current_version_id AND v.course_id=c.id
      LEFT JOIN LATERAL (
        SELECT a.pass_percent,(a.rules->>'max_attempts')::int AS max_attempts
        FROM lms.assessments a
        WHERE a.course_version_id=v.id AND a.rules->>'kind'='final'
          AND (a.status IN ('published','retired') OR ($2::boolean AND a.status='draft'))
          AND a.version_number=(SELECT max(a2.version_number) FROM lms.assessments a2
            WHERE a2.course_version_id=a.course_version_id AND a2.slug=a.slug)
        ORDER BY a.slug LIMIT 1
      ) final_assessment ON TRUE
      WHERE ((c.status='published' AND v.status='published' AND v.review_status='approved' AND c.is_sandbox=FALSE)
          OR ($2::boolean AND c.status='draft' AND v.status='draft' AND c.is_sandbox=TRUE))
        AND NOT EXISTS (SELECT 1 FROM lms.enrollments e WHERE e.user_id=$1 AND e.course_id=c.id)
      ORDER BY c.title`, [learnerId, allowDraftPreview]);

    const enrolled = await client.query<{
      course_id: string;
      course_version_id: string;
      slug: string;
      title: string;
      status: string;
      enrolled_at: Date;
      total_lessons: number;
      completed_lessons: number;
      next_lesson_slug: string | null;
      next_lesson_title: string | null;
      next_lesson_status: string | null;
      final_assessment_slug: string | null;
      final_assessment_title: string | null;
      final_pass_percent: number | string | null;
      final_max_attempts: number | null;
      final_attempts: number | null;
      final_latest_status: string | null;
      final_latest_passed: boolean | null;
      final_latest_score: number | string | null;
      certificate_id: string | null;
      public_id: string | null;
      feedback_submitted: boolean;
    }>(`SELECT e.course_id,e.course_version_id,c.slug,c.title,e.status,e.enrolled_at,
        COALESCE(progress.total_lessons,0)::int AS total_lessons,
        COALESCE(progress.completed_lessons,0)::int AS completed_lessons,
        next_lesson.slug AS next_lesson_slug,next_lesson.title AS next_lesson_title,next_lesson.progress_status AS next_lesson_status,
        final_assessment.slug AS final_assessment_slug,final_assessment.title AS final_assessment_title,
        final_assessment.pass_percent AS final_pass_percent,final_assessment.max_attempts AS final_max_attempts,
        COALESCE(final_assessment.attempts,0)::int AS final_attempts,final_assessment.latest_status AS final_latest_status,
        final_assessment.latest_passed AS final_latest_passed,final_assessment.latest_score AS final_latest_score,
        cert.id AS certificate_id,cert.public_id,
        EXISTS(SELECT 1 FROM lms.pilot_feedback f WHERE f.user_id=e.user_id AND f.course_id=e.course_id) AS feedback_submitted
      FROM lms.enrollments e JOIN lms.courses c ON c.id=e.course_id
      LEFT JOIN LATERAL (
        SELECT count(*)::int AS total_lessons,
          count(*) FILTER (WHERE p.status='completed')::int AS completed_lessons
        FROM lms.modules m JOIN lms.lessons l ON l.module_id=m.id
        LEFT JOIN lms.lesson_progress p ON p.lesson_id=l.id AND p.user_id=e.user_id
        WHERE m.course_version_id=e.course_version_id AND (l.published=TRUE OR $2::boolean)
      ) progress ON TRUE
      LEFT JOIN LATERAL (
        SELECT l.slug,l.title,p.status AS progress_status
        FROM lms.modules m JOIN lms.lessons l ON l.module_id=m.id
        LEFT JOIN lms.lesson_progress p ON p.lesson_id=l.id AND p.user_id=e.user_id
        WHERE m.course_version_id=e.course_version_id AND (l.published=TRUE OR $2::boolean)
          AND COALESCE(p.status,'not_started')<>'completed'
        ORDER BY (p.status='in_progress') DESC,m.position,l.position LIMIT 1
      ) next_lesson ON TRUE
      LEFT JOIN LATERAL (
        SELECT a.slug,a.title,a.pass_percent,(a.rules->>'max_attempts')::int AS max_attempts,
          (SELECT count(*)::int FROM lms.assessment_attempts aa WHERE aa.assessment_id=a.id AND aa.user_id=e.user_id) AS attempts,
          latest.status AS latest_status,latest.passed AS latest_passed,latest.score_percent AS latest_score
        FROM lms.assessments a
        LEFT JOIN LATERAL (
          SELECT aa.status,aa.passed,aa.score_percent FROM lms.assessment_attempts aa
          WHERE aa.assessment_id=a.id AND aa.user_id=e.user_id ORDER BY aa.attempt_number DESC LIMIT 1
        ) latest ON TRUE
        WHERE a.course_version_id=e.course_version_id AND a.rules->>'kind'='final'
          AND (a.status IN ('published','retired') OR ($2::boolean AND a.status='draft'))
          AND a.version_number=(SELECT max(a2.version_number) FROM lms.assessments a2
            WHERE a2.course_version_id=a.course_version_id AND a2.slug=a.slug)
        ORDER BY a.slug LIMIT 1
      ) final_assessment ON TRUE
      LEFT JOIN lms.certificates cert ON cert.user_id=e.user_id AND cert.course_id=e.course_id
        AND cert.course_version_id=e.course_version_id AND cert.status='active'
      WHERE e.user_id=$1 ORDER BY e.enrolled_at DESC`, [learnerId, allowDraftPreview]);

    return { available: available.rows, enrolled: enrolled.rows };
  });
}

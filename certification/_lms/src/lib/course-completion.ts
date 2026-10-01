import "server-only";
import type { PoolClient } from "pg";

/** Record completion only from the learner's pinned course version and server-graded final result. */
export async function calculateCourseCompletion(client: PoolClient, learnerId: string, courseId: string, versionId: string) {
  const localDraftPreview = process.env.NODE_ENV === "development";
  const result = await client.query<{ enrollment_id: string }>(`SELECT e.id AS enrollment_id
    FROM lms.enrollments e
    JOIN lms.courses c ON c.id=e.course_id
    JOIN lms.course_versions v ON v.id=e.course_version_id AND v.course_id=e.course_id
    WHERE e.user_id=$1 AND e.course_id=$2 AND e.course_version_id=$3 AND e.status IN ('active','completed')
      AND EXISTS (SELECT 1 FROM lms.lessons l JOIN lms.modules m ON m.id=l.module_id
        WHERE m.course_version_id=v.id AND (l.published=TRUE OR ($4::boolean AND c.is_sandbox=TRUE)))
      AND NOT EXISTS (SELECT 1 FROM lms.lessons l JOIN lms.modules m ON m.id=l.module_id
        LEFT JOIN lms.lesson_progress p ON p.lesson_id=l.id AND p.user_id=e.user_id
        WHERE m.course_version_id=v.id AND (l.published=TRUE OR ($4::boolean AND c.is_sandbox=TRUE))
          AND COALESCE(p.status,'not_started') <> 'completed')
      AND EXISTS (SELECT 1 FROM lms.assessments a JOIN lms.assessment_attempts aa ON aa.assessment_id=a.id
        WHERE a.course_version_id=v.id AND a.rules->>'kind'='final'
          AND a.version_number=(SELECT max(a2.version_number) FROM lms.assessments a2 WHERE a2.course_version_id=v.id AND a2.slug=a.slug)
          AND ((a.status IN ('published','retired') AND a.review_status='approved') OR ($4::boolean AND c.is_sandbox=TRUE AND a.status='draft'))
          AND aa.user_id=e.user_id
          AND aa.course_version_id=v.id AND aa.assessment_version_number=a.version_number
          AND aa.status='submitted' AND aa.passed=TRUE)
      AND ((c.status IN ('published','archived') AND v.status IN ('published','retired') AND v.review_status='approved')
        OR ($4::boolean AND c.is_sandbox=TRUE AND c.status='draft' AND v.status='draft'))
    FOR UPDATE OF e` , [learnerId, courseId, versionId, localDraftPreview]);
  if (!result.rowCount) return false;
  await client.query(`UPDATE lms.enrollments SET status='completed', completed_at=COALESCE(completed_at,now())
    WHERE id=$1 AND user_id=$2 AND course_version_id=$3 AND status='active'`, [result.rows[0].enrollment_id, learnerId, versionId]);
  return true;
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireLearner } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";
import { calculateCourseCompletion } from "@/lib/course-completion";

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);

async function updateLessonProgress(formData: FormData, status: "in_progress" | "completed") {
  const learner = await requireLearner();
  const courseSlug = slugSchema.parse(formData.get("courseSlug"));
  const lessonId = z.string().uuid().parse(formData.get("lessonId"));
  const allowed = process.env.NODE_ENV === "development";
  const updated = await withLearnerTransaction(learner.id, async (client) => {
    const result = await client.query<{ course_id: string; course_version_id: string; course_slug: string; lesson_slug: string }>(`SELECT c.id AS course_id,v.id AS course_version_id,c.slug AS course_slug,l.slug AS lesson_slug
      FROM lms.enrollments e JOIN lms.courses c ON c.id=e.course_id
      JOIN lms.course_versions v ON v.id=e.course_version_id AND v.course_id=c.id
      JOIN lms.modules m ON m.course_version_id=v.id JOIN lms.lessons l ON l.module_id=m.id
      WHERE e.user_id=$1 AND e.status='active' AND c.slug=$2 AND l.id=$3
        AND (c.status='published' OR ($4::boolean AND c.is_sandbox AND c.status='draft'))
        AND (v.status='published' OR ($4::boolean AND c.is_sandbox AND v.status='draft'))
        AND (l.published=TRUE OR $4::boolean)`, [learner.id, courseSlug, lessonId, allowed]);
    if (!result.rowCount) return null;
    if (status === "completed") {
      await client.query(`INSERT INTO lms.lesson_progress (user_id, lesson_id, status, started_at, completed_at)
        VALUES ($1,$2,'completed',now(),now()) ON CONFLICT (user_id, lesson_id) DO UPDATE
        SET status='completed', started_at=COALESCE(lms.lesson_progress.started_at,now()),
            completed_at=COALESCE(lms.lesson_progress.completed_at,now()), updated_at=now()`, [learner.id, lessonId]);
    } else {
      await client.query(`INSERT INTO lms.lesson_progress (user_id, lesson_id, status, started_at)
        VALUES ($1,$2,'in_progress',now()) ON CONFLICT (user_id, lesson_id) DO UPDATE
        SET status=CASE WHEN lms.lesson_progress.status='completed' THEN 'completed' ELSE 'in_progress' END,
            started_at=COALESCE(lms.lesson_progress.started_at,now()), updated_at=now()`, [learner.id, lessonId]);
    }
    if (status === "completed") await calculateCourseCompletion(client, learner.id, result.rows[0].course_id, result.rows[0].course_version_id);
    return result.rows[0];
  });
  if (!updated) redirect("/dashboard");
  revalidatePath(`/learn/${courseSlug}`);
  revalidatePath(`/learn/${courseSlug}/${updated.lesson_slug}`);
  redirect(`/learn/${courseSlug}/${updated.lesson_slug}?progress=${status === "completed" ? "saved" : "started"}`);
}

export async function startLesson(formData: FormData) { await updateLessonProgress(formData, "in_progress"); }
export async function completeLesson(formData: FormData) { await updateLessonProgress(formData, "completed"); }

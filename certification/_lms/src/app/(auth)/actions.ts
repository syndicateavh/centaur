"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireLearner } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";

const profileSchema = z.string().trim().min(1).max(100);

export async function updateProfile(formData: FormData) {
  const learner = await requireLearner();
  const displayName = profileSchema.parse(formData.get("displayName"));
  await withLearnerTransaction(learner.id, async (client) => {
    await client.query("UPDATE lms.profiles SET display_name = $2, updated_at = now() WHERE user_id = $1", [learner.id, displayName]);
    await client.query("UPDATE lms.\"user\" SET name = $2, \"updatedAt\" = now() WHERE id = $1", [learner.id, displayName]);
  });
  revalidatePath("/account");
  redirect("/account?saved=1");
}

export async function requestAccountDeletion(formData: FormData) {
  const learner = await requireLearner();
  if (formData.get("confirmDeletion") !== "on") throw new Error("Confirm the account deletion request first.");
  await withLearnerTransaction(learner.id, async (client) => {
    await client.query(`INSERT INTO lms.account_deletion_requests (user_id)
      VALUES ($1) ON CONFLICT (user_id) WHERE status IN ('pending', 'processing') DO NOTHING`, [learner.id]);
    await client.query(`INSERT INTO lms.audit_events (actor_user_id, action, target_type, target_id, details)
      VALUES ($1, 'account.deletion_requested', 'account', $1, '{}'::jsonb)`, [learner.id]);
  });
  revalidatePath("/account");
  redirect("/account?deletion=requested");
}

export async function enrollInLocalSandbox(formData: FormData) {
  const learner = await requireLearner();
  const courseId = z.string().uuid().parse(formData.get("courseId"));
  const inserted = await withLearnerTransaction(learner.id, async (client) => {
    const course = await client.query<{ id: string; current_version_id: string }>(`SELECT id, current_version_id FROM lms.courses
      WHERE id = $1 AND current_version_id IS NOT NULL
      AND (status = 'published' OR (status = 'draft' AND is_sandbox = TRUE AND $2 = 'development'))
      AND (is_sandbox = false OR $2 = 'development')`, [courseId, process.env.NODE_ENV]);
    if (!course.rowCount) return false;
    const result = await client.query(`INSERT INTO lms.enrollments (user_id, course_id, course_version_id)
      VALUES ($1, $2, $3) ON CONFLICT (user_id, course_id) DO NOTHING`, [learner.id, course.rows[0].id, course.rows[0].current_version_id]);
    if (result.rowCount) await client.query(`INSERT INTO lms.audit_events (actor_user_id, action, target_type, target_id, details)
      VALUES ($1, 'enrollment.created', 'course', $2, '{}'::jsonb)`, [learner.id, courseId]);
    return true;
  });
  revalidatePath("/dashboard");
  redirect(inserted ? "/dashboard?enrollment=complete" : "/dashboard?enrollment=unavailable");
}

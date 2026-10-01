"use server";

import { createHmac } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";

export async function invitePilotLearner(formData:FormData) {
  const admin=await requireAdmin();
  const input=z.object({courseId:z.string().uuid(),email:z.email().trim().toLowerCase(),days:z.coerce.number().int().min(1).max(90)}).parse({courseId:formData.get("courseId"),email:formData.get("email"),days:formData.get("days")});
  const secret=process.env.BETTER_AUTH_SECRET;
  if(!secret||secret.length<32)redirect("/admin/pilot?state=secret-required");
  const fingerprint=createHmac("sha256",secret).update(input.email).digest("hex").toUpperCase();
  const created=await withLearnerTransaction(admin.id,async(client)=>{
    const course=await client.query("SELECT 1 FROM lms.courses c JOIN lms.course_versions v ON v.id=c.current_version_id WHERE c.id=$1 AND c.is_sandbox=FALSE AND c.status='published' AND v.status='published' AND v.review_status='approved'",[input.courseId]);
    if(!course.rowCount)return false;
    const expiry=new Date(Date.now()+input.days*24*60*60*1000);
    const result=await client.query(`INSERT INTO lms.pilot_course_invites(course_id,email_fingerprint,invited_by,expires_at)
      VALUES($1,$2,$3,$4) ON CONFLICT(course_id,email_fingerprint) DO UPDATE SET expires_at=EXCLUDED.expires_at
      WHERE lms.pilot_course_invites.redeemed_at IS NULL RETURNING id`,[input.courseId,fingerprint,admin.id,expiry]);
    if(!result.rowCount)return false;
    await client.query(`INSERT INTO lms.audit_events(actor_user_id,action,target_type,target_id,details)
      VALUES($1,'pilot.invite_created','course',$2,$3::jsonb)`,[admin.id,input.courseId,JSON.stringify({expires_at:expiry.toISOString()})]);
    return true;
  });
  if(!created)redirect("/admin/pilot?state=course-unavailable-or-invite-used");
  revalidatePath("/admin/pilot");
  redirect("/admin/pilot?invited=1");
}

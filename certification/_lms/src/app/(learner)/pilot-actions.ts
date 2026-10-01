"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireLearner } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";

const category=z.enum(["unclear_instruction","content_gap","assessment","accessibility","mobile","technical","other"]);

export async function submitPilotFeedback(formData:FormData) {
  const learner=await requireLearner();
  const input=z.object({courseId:z.string().uuid(),overall:z.coerce.number().int().min(1).max(5),clarity:z.coerce.number().int().min(1).max(5),confidence:z.preprocess((value)=>value===""?null:value,z.coerce.number().int().min(1).max(5).nullable()),categories:z.array(category).max(5),comment:z.string().trim().max(2000)}).parse({
    courseId:formData.get("courseId"),overall:formData.get("overall"),clarity:formData.get("clarity"),confidence:formData.get("confidence"),categories:formData.getAll("categories"),comment:formData.get("comment")??"",
  });
  const saved=await withLearnerTransaction(learner.id,async(client)=>{
    const enrolled=await client.query("SELECT 1 FROM lms.enrollments WHERE user_id=$1 AND course_id=$2",[learner.id,input.courseId]);
    if(!enrolled.rowCount)return false;
    const result=await client.query(`INSERT INTO lms.pilot_feedback(user_id,course_id,overall_rating,instruction_clarity,confidence_after,issue_categories,comment)
      VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(user_id,course_id) DO NOTHING`,[learner.id,input.courseId,input.overall,input.clarity,input.confidence,input.categories,input.comment]);
    return Boolean(result.rowCount);
  });
  revalidatePath("/dashboard");
  redirect(saved?"/dashboard?feedback=submitted":"/dashboard?feedback=already-submitted");
}

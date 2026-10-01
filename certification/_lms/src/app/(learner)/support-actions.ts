"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireLearner } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";

export async function submitSupportRequest(formData: FormData) {
  const learner = await requireLearner("/account");
  const input = z.object({subject:z.string().trim().min(4).max(200),message:z.string().trim().min(10).max(5000)})
    .parse({subject:formData.get("subject"),message:formData.get("message")});
  const created = await withLearnerTransaction(learner.id,async (client) => {
    const recent = await client.query<{total:number}>("SELECT count(*)::int AS total FROM lms.support_requests WHERE user_id=$1 AND created_at>now()-interval '1 hour'",[learner.id]);
    if(recent.rows[0].total>=5)return false;
    const request = await client.query<{id:string}>("INSERT INTO lms.support_requests(user_id,subject,message) VALUES($1,$2,$3) RETURNING id",[learner.id,input.subject,input.message]);
    await client.query(`INSERT INTO lms.audit_events(actor_user_id,action,target_type,target_id,details)
      VALUES($1,'support.request_submitted','support_request',$2,'{}'::jsonb)`,[learner.id,request.rows[0].id]);
    return true;
  });
  if(!created)redirect("/account?support=rate-limited");
  revalidatePath("/account");
  redirect("/account?support=created");
}

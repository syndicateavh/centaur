"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSupportStaff } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";

export async function updateSupportRequest(formData: FormData) {
  const staff = await requireSupportStaff();
  const parsed = z.object({requestId:z.string().uuid(),status:z.enum(["open","in_progress","resolved","closed"]),adminNote:z.string().trim().max(5000)})
    .safeParse({requestId:formData.get("requestId"),status:formData.get("status"),adminNote:formData.get("adminNote") ?? ""});
  if (!parsed.success) return;
  await withLearnerTransaction(staff.id,async (client) => {
    const current = await client.query<{status:string}>("SELECT status FROM lms.support_requests WHERE id=$1 FOR UPDATE",[parsed.data.requestId]);
    if (!current.rowCount) return;
    await client.query(`UPDATE lms.support_requests SET status=$2,admin_note=$3,assigned_admin_id=$4,updated_at=now(),
      resolved_at=CASE WHEN $2 IN ('resolved','closed') THEN COALESCE(resolved_at,now()) ELSE NULL END WHERE id=$1`,
    [parsed.data.requestId,parsed.data.status,parsed.data.adminNote || null,staff.id]);
    await client.query(`INSERT INTO lms.audit_events(actor_user_id,action,target_type,target_id,details)
      VALUES($1,'support.request_updated','support_request',$2,$3::jsonb)`,[staff.id,parsed.data.requestId,JSON.stringify({previous_status:current.rows[0].status,status:parsed.data.status})]);
  });
  revalidatePath("/admin/support");
}

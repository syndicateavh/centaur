"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";
import { reissueCertificate } from "@/lib/certificates";

const formSchema = z.object({ certificateId: z.string().uuid(), reason: z.string().trim().min(10).max(1000) });

export async function revokeCertificate(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = formSchema.safeParse({ certificateId: formData.get("certificateId"), reason: formData.get("reason") });
  if (!parsed.success) return;
  await withLearnerTransaction(admin.id, async (client) => {
    const current = await client.query<{ id: string; status: string }>("SELECT id,status FROM lms.certificates WHERE id=$1 FOR UPDATE", [parsed.data.certificateId]);
    if (current.rows[0]?.status !== "active") return;
    await client.query(`UPDATE lms.certificates SET status='revoked',revoked_at=now(),revocation_reason=$2,revoked_by=$3 WHERE id=$1`, [parsed.data.certificateId, parsed.data.reason, admin.id]);
    await client.query(`INSERT INTO lms.audit_events (actor_user_id,action,target_type,target_id,details)
      VALUES ($1,'certificate.revoked','certificate',$2,$3::jsonb)`, [admin.id, parsed.data.certificateId, JSON.stringify({ reason: parsed.data.reason })]);
  });
  revalidatePath("/admin/certificates");
}

export async function reissueRevokedCertificate(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = formSchema.safeParse({ certificateId: formData.get("certificateId"), reason: formData.get("reason") });
  if (!parsed.success) return;
  await withLearnerTransaction(admin.id, async (client) => reissueCertificate(client, admin.id, parsed.data.certificateId, parsed.data.reason));
  revalidatePath("/admin/certificates");
}

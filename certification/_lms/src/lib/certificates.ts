import "server-only";
import { randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import { withLearnerTransaction } from "@/lib/learner-db";

type IssuedCertificate = { id: string; public_id: string };

export async function getActiveCourseCertificate(userId: string, courseId: string) {
  return withLearnerTransaction(userId, async (client) => {
    const result = await client.query<{ id: string; public_id: string; issued_at: Date }>(`SELECT id,public_id,issued_at FROM lms.certificates
      WHERE user_id=$1 AND course_id=$2 AND status='active' ORDER BY issued_at DESC LIMIT 1`, [userId, courseId]);
    return result.rows[0] ?? null;
  });
}

async function approvedCompletion(client: PoolClient, userId: string, courseId: string, versionId: string) {
  const eligible = await client.query<{ course_title: string; version_number: number; recipient_name: string }>(
    "SELECT * FROM lms.certificate_issue_eligibility($1,$2,$3)", [userId, courseId, versionId]);
  return eligible.rows[0] ?? null;
}

export async function issueCertificateForCompletedEnrollment(client: PoolClient, userId: string, courseId: string, versionId: string) {
  const eligibility = await approvedCompletion(client, userId, courseId, versionId);
  if (!eligibility) return null;
  const publicId = `CTC-${randomBytes(16).toString("hex").toUpperCase()}`;
  const inserted = await client.query<IssuedCertificate>(`INSERT INTO lms.certificates
    (public_id,user_id,course_id,course_version_id,course_title_snapshot,recipient_name_snapshot,public_holder_name)
    VALUES ($1,$2,$3,$4,$5,$6,FALSE)
    ON CONFLICT DO NOTHING
    RETURNING id,public_id`, [publicId, userId, courseId, versionId, eligibility.course_title, eligibility.recipient_name]);
  if (inserted.rows[0]) {
    await client.query(`INSERT INTO lms.audit_events (actor_user_id,action,target_type,target_id,details)
      VALUES ($1,'certificate.issued','certificate',$2,$3::jsonb)`, [userId, inserted.rows[0].id, JSON.stringify({ public_id: inserted.rows[0].public_id, course_version_id: versionId })]);
    return inserted.rows[0];
  }
  const existing = await client.query<IssuedCertificate>(`SELECT id,public_id FROM lms.certificates
    WHERE user_id=$1 AND course_id=$2 AND course_version_id=$3 AND status='active'`, [userId, courseId, versionId]);
  return existing.rows[0] ?? null;
}

export async function reissueCertificate(client: PoolClient, adminId: string, oldCertificateId: string, reason: string) {
  const oldResult = await client.query<{ user_id: string; course_id: string; course_version_id: string; status: string }>(`SELECT user_id,course_id,course_version_id,status
    FROM lms.certificates WHERE id=$1 FOR UPDATE`, [oldCertificateId]);
  const oldCertificate = oldResult.rows[0];
  if (!oldCertificate || oldCertificate.status !== "revoked") return null;
  const alreadyReissued = await client.query("SELECT 1 FROM lms.certificates WHERE reissued_from_certificate_id=$1", [oldCertificateId]);
  if (alreadyReissued.rowCount) return null;
  const eligibility = await approvedCompletion(client, oldCertificate.user_id, oldCertificate.course_id, oldCertificate.course_version_id);
  if (!eligibility) return null;
  const publicId = `CTC-${randomBytes(16).toString("hex").toUpperCase()}`;
  const inserted = await client.query<IssuedCertificate>(`INSERT INTO lms.certificates
    (public_id,user_id,course_id,course_version_id,course_title_snapshot,recipient_name_snapshot,public_holder_name,reissue_reason,reissued_from_certificate_id)
    VALUES ($1,$2,$3,$4,$5,$6,FALSE,$7,$8) RETURNING id,public_id`,
  [publicId, oldCertificate.user_id, oldCertificate.course_id, oldCertificate.course_version_id, eligibility.course_title, eligibility.recipient_name, reason, oldCertificateId]);
  await client.query(`INSERT INTO lms.audit_events (actor_user_id,action,target_type,target_id,details)
    VALUES ($1,'certificate.reissued','certificate',$2,$3::jsonb)`, [adminId, inserted.rows[0].id, JSON.stringify({ previous_certificate_id: oldCertificateId, public_id: publicId, reason })]);
  return inserted.rows[0];
}

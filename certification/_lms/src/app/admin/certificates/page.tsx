import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";
import { reissueRevokedCertificate, revokeCertificate } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Certificate administration", robots: { index: false, follow: false } };

type CertificateRow = {
  id: string; public_id: string; recipient_name_snapshot: string; course_title_snapshot: string;
  status: "active" | "revoked"; issued_at: Date; revoked_at: Date | null; revocation_reason: string | null;
  reissue_reason: string | null; reissued_from_certificate_id: string | null; has_reissue: boolean;
};

function ReasonField() {
  return <label className="block text-xs font-semibold text-slate-700">Reason (required, at least 10 characters)<textarea required minLength={10} maxLength={1000} name="reason" rows={2} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>;
}

export default async function AdminCertificatesPage() {
  const admin = await requireAdmin();
  const certificates = await withLearnerTransaction(admin.id, async (client) => {
    const result = await client.query<CertificateRow>(`SELECT id,public_id,recipient_name_snapshot,course_title_snapshot,status,issued_at,revoked_at,
        revocation_reason,reissue_reason,reissued_from_certificate_id,
        EXISTS (SELECT 1 FROM lms.certificates newer WHERE newer.reissued_from_certificate_id=cert.id) AS has_reissue
      FROM lms.certificates cert ORDER BY issued_at DESC LIMIT 100`);
    return result.rows;
  });
  return <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy-800"><Link href="/admin" className="underline">Admin</Link> / Certificates</p>
    <h1 className="mt-2 text-3xl font-bold tracking-tight">Certificate administration</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Issuance is automatic after server-validated completion of an approved, published course. Revocation and reissue require a reason and create an audit record. Reissue is available only while the learner still satisfies the current published course requirements.</p>
    <section className="mt-7 space-y-4" aria-label="Recent certificates">
      {certificates.length ? certificates.map((certificate) => <article key={certificate.id} className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{certificate.status} · {certificate.public_id}</p><h2 className="mt-1 text-lg font-bold">{certificate.course_title_snapshot}</h2><p className="mt-1 text-sm text-slate-600">{certificate.recipient_name_snapshot} · issued {certificate.issued_at.toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "UTC" })}</p>{certificate.revoked_at && <p className="mt-2 text-sm text-rose-800">Revoked {certificate.revoked_at.toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "UTC" })}: {certificate.revocation_reason}</p>}{certificate.reissue_reason && <p className="mt-2 text-sm text-slate-600">Reissue reason: {certificate.reissue_reason}</p>}</div><Link className="text-sm font-semibold text-navy-900 underline" href={`/certificates/verify?id=${certificate.public_id}`}>Public record</Link></div>
        {certificate.status === "active" ? <form action={revokeCertificate} className="mt-4 grid gap-3 rounded-lg bg-rose-50 p-4 sm:grid-cols-[1fr_auto] sm:items-end"><input type="hidden" name="certificateId" value={certificate.id} /><ReasonField /><button className="rounded-lg bg-rose-800 px-4 py-2.5 text-sm font-bold text-white">Revoke certificate</button></form> : certificate.has_reissue ? <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">This certificate has already been reissued. Manage the newer certificate separately.</p> : <form action={reissueRevokedCertificate} className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-end"><input type="hidden" name="certificateId" value={certificate.id} /><ReasonField /><button className="rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white">Reissue if eligible</button></form>}
      </article>) : <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No certificates have been issued.</p>}
    </section>
  </main>;
}

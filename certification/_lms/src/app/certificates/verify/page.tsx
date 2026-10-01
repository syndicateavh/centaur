import type { Metadata } from "next";
import { z } from "zod";
import { getDatabasePool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Certificate verification",
  description: "Check the status and public details of a Centaur Careers course-completion certificate.",
  robots: { index: false, follow: false },
};

const publicIdSchema = z.string().regex(/^CTC-[A-F0-9]{32}$/);
type PublicCertificate = {
  public_id: string; course_title: string; course_version: number; issuer_name: string;
  credential_description: string; issued_at: Date; status: "active" | "revoked"; holder_name: string | null;
};

export default async function VerifyCertificatePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const candidate = typeof id === "string" ? id.trim().toUpperCase() : "";
  let certificate: PublicCertificate | null = null;
  let searched = false;
  if (candidate) {
    searched = true;
    const parsedId = publicIdSchema.safeParse(candidate);
    if (parsedId.success) {
      const result = await getDatabasePool().query<PublicCertificate>("SELECT * FROM lms.verify_certificate($1)", [parsedId.data]);
      certificate = result.rows[0] ?? null;
    }
  }
  return <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
    <div className="mx-auto max-w-3xl text-center">
      <span aria-hidden="true" className="mx-auto grid size-14 place-items-center rounded-2xl bg-navy-100 text-2xl text-navy-950">✓</span>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-navy-800">Public certificate record</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Certificate verification</h1>
      <p className="mt-5 text-base leading-7 text-slate-600">Enter the certificate ID printed on the document or scan its QR code to check the current status.</p>
    </div>
    <section className="mx-auto mt-9 max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8" aria-labelledby="lookup-heading">
      <h2 id="lookup-heading" className="text-xl font-bold">Check a certificate</h2>
      <form method="get" action="/certificates/verify" className="mt-5">
        <label htmlFor="certificate-id" className="block text-sm font-bold text-slate-800">Certificate ID</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row"><input id="certificate-id" name="id" type="text" required maxLength={36} pattern="CTC-[A-Fa-f0-9]{32}" aria-describedby="certificate-id-help" defaultValue={candidate} placeholder="CTC- followed by 32 characters" className="form-input w-full rounded-xl uppercase" /><button type="submit" className="shrink-0 rounded-xl bg-navy-900 px-5 py-3 text-sm font-bold text-white">Check certificate</button></div>
        <p id="certificate-id-help" className="mt-2 text-xs text-slate-600">Enter CTC- followed by 32 letters or numbers.</p>
      </form>
      {searched && !certificate && <p role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">No certificate was found for that ID. Check the characters and try again.</p>}
      {certificate && <article className={`mt-5 rounded-xl border p-5 ${certificate.status === "active" ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`} aria-live="polite">
        <p className={`text-xs font-extrabold uppercase tracking-[0.16em] ${certificate.status === "active" ? "text-emerald-900" : "text-rose-900"}`}>{certificate.status === "active" ? "Active certificate" : "Revoked certificate"}</p>
        <h3 className="mt-2 text-xl font-bold">{certificate.credential_description}</h3>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="font-semibold text-slate-600">Course</dt><dd className="mt-1 font-bold text-slate-950">{certificate.course_title} · version {certificate.course_version}</dd></div><div><dt className="font-semibold text-slate-600">Issued by</dt><dd className="mt-1 font-bold text-slate-950">{certificate.issuer_name}</dd></div><div><dt className="font-semibold text-slate-600">Issue date</dt><dd className="mt-1 font-bold text-slate-950">{new Date(certificate.issued_at).toLocaleDateString("en-IN", { dateStyle: "long", timeZone: "UTC" })}</dd></div><div><dt className="font-semibold text-slate-600">Certificate ID</dt><dd className="mt-1 break-all font-mono text-xs text-slate-900">{certificate.public_id}</dd></div>{certificate.holder_name && <div className="sm:col-span-2"><dt className="font-semibold text-slate-600">Holder</dt><dd className="mt-1 font-bold text-slate-950">{certificate.holder_name}</dd></div>}</dl>
      </article>}
      <p className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">This public lookup shows only the certificate ID, course, issuer, issue date, current status, and holder name when public display is enabled. It does not reveal account email, assessment answers, or learner profile records.</p>
    </section>
  </main>;
}

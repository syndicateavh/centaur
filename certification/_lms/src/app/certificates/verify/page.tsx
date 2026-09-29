import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Certificate Verification Preview",
  description: "Preview of the planned public verification page for future Centaur course-completion certificates.",
  ...(process.env.LMS_PUBLIC_URL ? { alternates: { canonical: "/certificates/verify" } } : {}),
  robots: { index: true, follow: true },
};

export default function VerifyCertificatePage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <span aria-hidden="true" className="mx-auto grid size-14 place-items-center rounded-2xl bg-navy-100 text-2xl text-navy-950">✓</span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-navy-800">Planned service · preview only</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Certificate verification</h1>
        <p className="mt-5 text-base leading-7 text-slate-600">A public lookup may be introduced if Centaur approves certificate issuance. No certificates have been issued by this preview, and this page does not verify a credential.</p>
      </div>
      <section className="mx-auto mt-9 max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8" aria-labelledby="lookup-heading">
        <h2 id="lookup-heading" className="text-xl font-bold">Lookup is not available yet</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">The form below is a non-functional preview. Do not enter a real certificate ID or personal information.</p>
        <label htmlFor="certificate-id" className="mt-6 block text-sm font-bold text-slate-800">Certificate ID</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input id="certificate-id" type="text" disabled placeholder="Verification will open after certificate approval" className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-600 placeholder:text-slate-500 disabled:cursor-not-allowed" />
          <button type="button" disabled aria-disabled="true" className="shrink-0 cursor-not-allowed rounded-xl bg-slate-300 px-5 py-3 text-sm font-bold text-slate-600">Check certificate</button>
        </div>
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">If enabled, verification will show only approved certificate details, such as course, issue date, issuer, and status. It will not show account email, assessment answers, or learner records.</p>
      </section>
      <p className="mt-7 text-center text-sm text-slate-600">Learn what a future award would mean in the <Link href="/faq#certificate-scope" className="font-bold text-navy-900 underline">certificate scope FAQ</Link>.</p>
    </main>
  );
}

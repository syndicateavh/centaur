import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQs and Certificate Scope",
  description: "Answers about Centaur's proposed free banking learning tracks, enrollment timing, and what a future course-completion certificate would mean.",
  ...(process.env.LMS_PUBLIC_URL ? { alternates: { canonical: "/faq" } } : {}),
  robots: { index: true, follow: true },
};

const questions = [
  { question: "Are these courses available now?", answer: process.env.NODE_ENV === "development" ? "A local KYC/AML Operations sandbox preview is available after creating and verifying an account. The six public catalogue tracks remain proposals. The sandbox is unreviewed and cannot issue a certificate." : "No. The six tracks on this site are proposals for a separate learning platform. Syllabi and learner terms are still under review, and enrollment is not open." },
  { question: "Will the learning be free?", answer: process.env.NODE_ENV === "development" ? "The local sandbox preview does not collect payment or card details. The proposed public offer and course terms still need product-owner approval." : "The initiative is planned as free learning. The product owner still needs to approve the offer and course terms before enrollment opens. This preview does not collect payment or card details." },
  { question: "How long will a course take, and how will it be taught?", answer: "Study time, prerequisites, and delivery format have not been approved. Each course page marks these details as pending rather than estimating them." },
  { question: "Can I sign up or start a course?", answer: process.env.NODE_ENV === "development" ? "Yes, in the local development preview: create and verify an account, then choose the KYC/AML Operations sandbox from your learner dashboard. Verification messages appear in the local mail preview. This is not public enrollment." : "Not yet. Public registration and enrollment are not open. The local development preview is separate from this public site." },
  { question: "Is the proposed free learning part of the paid Financial Operations Masterclass?", answer: "No. The proposed free tracks are a separate initiative. The paid Financial Operations Masterclass remains a separate Centaur Careers offer with its own content and terms." },
  { question: "Will I receive a certificate?", answer: "A course-completion certificate is issued only for an approved, published course after the server confirms every required lesson and a passing final assessment for your enrolled course version. The current KYC/AML pilot remains a local draft, so it cannot issue a certificate." },
  { question: "What would a Centaur certificate qualify me to do?", answer: "A future Centaur course-completion certificate would document learning under stated course rules. It would not be a bank, government, regulator, or employer credential, would not authorize regulated work, and would not guarantee a job or placement." },
  { question: "Will a certificate be publicly verifiable?", answer: "Issued certificates have a non-sequential ID and QR link to a public status page. The page shows the course, issuer, issue date, status, and holder name only when public display has been approved. It never shows account email or assessment answers." },
  { question: "Who can I contact about LMS support?", answer: "A learner-support contact and response process have not been selected. See the help page for the current project status and general Centaur Careers enquiry route." },
];

export default function FaqPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy-800">Questions and clear answers</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">FAQs about the learning proposal</h1>
        <p className="mt-5 text-base leading-7 text-slate-600">This page describes a product under development. It does not promise that a course, assessment, or certificate is currently available.</p>
      </div>
      <section id="certificate-scope" className="mt-9 scroll-mt-28 rounded-2xl border border-gold-200 bg-gold-50 p-5 sm:p-7" aria-labelledby="certificate-scope-heading">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-gold-900">Credential scope</p>
        <h2 id="certificate-scope-heading" className="mt-2 text-2xl font-bold">A proposed learning certificate is not a job or industry licence</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">If approved, a Centaur certificate would record completion of a specified educational course under published requirements. It would not be issued by a bank, government, regulator, or employer, and would not guarantee employment, placement, or authority to perform regulated work.</p>
        <Link href="/certificates/verify" className="mt-4 inline-flex rounded-sm text-sm font-extrabold text-navy-900 hover:underline">Verify a certificate <span aria-hidden="true" className="ml-2">→</span></Link>
      </section>
      <div className="mt-9 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5 sm:px-7">
        {questions.map(({ question, answer }, index) => (
          <details key={question} className="group py-5" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-5 rounded-sm text-left text-base font-bold text-slate-900 marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-600 [&::-webkit-details-marker]:hidden">
              {question}<span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-navy-50 text-lg leading-none text-navy-900 transition group-open:rotate-45">+</span>
            </summary>
            <p className="max-w-3xl pt-3 pr-8 text-sm leading-6 text-slate-600">{answer}</p>
          </details>
        ))}
      </div>
      <p className="mt-7 text-sm leading-6 text-slate-600">Have a question about the proposal? Visit <Link className="font-bold text-navy-900 underline" href="/help">Help and updates</Link>.</p>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import LearnerNavigation from "@/components/learning/LearnerNavigation";
import { getCurrentLearner } from "@/lib/learner";

export const metadata: Metadata = {
  title: "Help and Project Updates",
  description: "Current support and availability information for the Centaur Learning platform proposal.",
  ...(process.env.LMS_PUBLIC_URL ? { alternates: { canonical: "/help" } } : {}),
  robots: { index: true, follow: true },
};

export default async function HelpPage() {
  const learner = await getCurrentLearner();
  return (
    <>
    {learner && <LearnerNavigation name={learner.name} />}
    <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy-800">Help and status</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Weâ€™re preparing the learning platform</h1>
        <p className="mt-5 text-base leading-7 text-slate-600">{learner ? "For help with your account or enrolled course, send a private request to the learner support team." : "Enrollment and learner support are not open publicly yet. Course content and learner terms are still being reviewed."}</p>
      </div>
      <div className="mt-9 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8" aria-labelledby="platform-status">
          <span aria-hidden="true" className="grid size-11 place-items-center rounded-xl bg-gold-50 text-xl text-gold-900">i</span>
          <h2 id="platform-status" className="mt-5 text-xl font-bold">Current platform status</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li className="flex gap-2"><span aria-hidden="true" className="font-bold text-navy-800">âœ“</span> Public descriptions of six proposed role areas are available.</li>
            <li className="flex gap-2"><span aria-hidden="true" className="font-bold text-gold-800">â—‹</span> Final syllabi, eligibility, and course schedules are pending review.</li>
            <li className="flex gap-2"><span aria-hidden="true" className="font-bold text-gold-800">â—‹</span> Public enrollment and course delivery are not open. The current draft course is not eligible to issue certificates.</li>
          </ul>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8" aria-labelledby="support-status">
          <span aria-hidden="true" className="grid size-11 place-items-center rounded-xl bg-navy-50 text-xl text-navy-900">?</span>
          <h2 id="support-status" className="mt-5 text-xl font-bold">Support contact</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{learner ? "Use your account page to submit a private support request and review its status." : "A public LMS support contact is not available yet. For general Centaur Careers questions, use the main website contact page; it is not an LMS enrollment or learner-support channel."}</p>
          {learner ? <Link href="/account#support" className="mt-5 inline-flex min-h-11 items-center rounded-sm text-sm font-extrabold text-navy-900 hover:underline">Contact learner support</Link> : <a href="https://centaurcareers.in/contact/" className="mt-5 inline-flex min-h-11 items-center rounded-sm text-sm font-extrabold text-navy-900 hover:underline">General Centaur Careers contact <span aria-hidden="true" className="ml-2">→</span></a>}
        </section>
      </div>
      <div className="mt-8 rounded-2xl bg-navy-950 p-6 text-white sm:p-8">
        <h2 className="text-xl font-bold">Want to follow the proposal?</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-navy-50/80">There is no mailing-list form on this preview. Check the course catalogue and FAQs for published changes after the free offer and learner terms are approved.</p>
        <div className="mt-5 flex flex-wrap gap-3"><Link href="/courses" className="rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-navy-950 hover:bg-navy-50">Browse proposed tracks</Link><Link href="/faq" className="rounded-xl border border-white/30 px-4 py-3 text-sm font-bold text-white hover:bg-white/10">Read FAQs</Link></div>
      </div>
    </main>
    </>
  );
}

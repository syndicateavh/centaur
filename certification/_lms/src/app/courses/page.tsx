import type { Metadata } from "next";
import CourseCatalog from "@/components/CourseCatalog";
import { courseTracks } from "@/data/courses";

export const metadata: Metadata = {
  title: "Proposed Banking and Finance Learning Tracks",
  description: "Browse proposed Centaur learning tracks in KYC and AML, retail banking, payments, investment banking operations, finance and credit, and FinTech operations.",
  ...(process.env.LMS_PUBLIC_URL ? { alternates: { canonical: "/courses" } } : {}),
  robots: { index: true, follow: true },
};

export default function CoursesPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy-800">Course catalogue · proposals</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Explore banking role pathways</h1>
        <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">Browse six topic areas being considered for a free learning platform. These are proposed tracks, not published courses; enrollment is not open.</p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-navy-50 px-3.5 py-2 font-bold text-navy-950">6 proposed tracks</span>
        <span className="rounded-full bg-gold-50 px-3.5 py-2 font-bold text-gold-950">Syllabi pending approval</span>
        <span className="rounded-full bg-slate-100 px-3.5 py-2 font-bold text-slate-700">No enrollment yet</span>
      </div>
      <div className="mt-9"><CourseCatalog courses={courseTracks} /></div>
      <aside className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="course-catalog-note">
        <h2 id="course-catalog-note" className="font-bold text-slate-900">Before any track opens</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Centaur will publish the approved syllabus, expected study effort, prerequisites, teaching format, assessment rules, and certificate scope before accepting learners. The free proposal is separate from the paid Financial Operations Masterclass.</p>
      </aside>
    </main>
  );
}

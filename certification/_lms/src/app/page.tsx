import type { Metadata } from "next";
import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import SectionHeading from "@/components/SectionHeading";
import { courseTracks } from "@/data/courses";

export const metadata: Metadata = {
  title: "Free Banking Operations Learning Tracks | Centaur",
  description: "Explore six proposed free learning tracks for banking and financial operations roles. Course details and enrollment are still under review.",
  ...(process.env.LMS_PUBLIC_URL ? { alternates: { canonical: "/" } } : {}),
  robots: { index: true, follow: true },
};

const steps = [
  { number: "01", title: "Choose a role area", text: "Explore the proposed tracks and find a banking operations area that interests you." },
  { number: "02", title: "Learn the workflows", text: "Planned lessons will introduce job-relevant concepts through clear explanations and practice." },
  { number: "03", title: "Show what you learned", text: "Assessment and course-completion rules will be published before any course opens." },
];

export default function Home() {
  return (
    <main id="main-content" className="flex-1">
      <section className="overflow-hidden bg-navy-950 text-white">
        <div className="hero-grid relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:px-10 lg:py-24">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-navy-100">
              <span aria-hidden="true" className="size-2 rounded-full bg-gold-400" /> Proposed free learning initiative
            </span>
            <h1 className="mt-7 max-w-3xl font-editorial text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Build your understanding of <span className="text-navy-200">banking operations.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-navy-50/85 sm:text-lg sm:leading-8">
              Explore practical learning paths for the work behind banking and financial services. Six role areas are being shaped into a separate, proposed free learning platform.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/courses" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-navy-950 transition hover:-translate-y-0.5 hover:bg-navy-50">
                Explore proposed tracks <span aria-hidden="true">→</span>
              </Link>
              <Link href="/faq#certificate-scope" className="inline-flex min-h-12 items-center rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                Understand certificate scope
              </Link>
            </div>
            <p className="mt-5 text-sm font-medium text-navy-100/75">Enrollment is not open. Course content, schedules, and certificate rules are pending review.</p>
          </div>

          <div className="mx-auto w-full max-w-lg">
            <div className="rounded-[1.75rem] border border-white/15 bg-navy-900/95 p-5 shadow-2xl shadow-black/20 sm:p-7">
              <div className="flex items-center justify-between border-b border-white/15 pb-5">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-navy-200">Learning roadmap</p><p className="mt-1 text-lg font-bold">Your next role, in focus</p></div>
                <span aria-hidden="true" className="grid size-11 place-items-center rounded-2xl bg-gold-400 text-xl font-black text-navy-950">↗</span>
              </div>
              <ol className="mt-5 space-y-3">
                {steps.map((step, index) => (
                  <li key={step.number} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${index === 0 ? "bg-gold-300 text-navy-950" : "bg-white/10 text-navy-100"}`}>{step.number}</span>
                    <div><h2 className="font-bold">{step.title}</h2><p className="mt-1 text-sm leading-5 text-navy-50/70">{step.text}</p></div>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-center text-xs font-semibold text-navy-100/60">Proposed learner journey · details to be confirmed</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-3 sm:p-7">
          <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-lg text-navy-900" aria-hidden="true">01</span><div><p className="font-bold">Six proposed role areas</p><p className="mt-1 text-sm leading-5 text-slate-600">From payments and KYC to capital markets operations.</p></div></div>
          <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-50 text-lg text-gold-900" aria-hidden="true">₹</span><div><p className="font-bold">Planned as free to learn</p><p className="mt-1 text-sm leading-5 text-slate-600">No payment or card details are collected in this preview.</p></div></div>
          <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-lg text-slate-800" aria-hidden="true">✓</span><div><p className="font-bold">Clear certificate boundaries</p><p className="mt-1 text-sm leading-5 text-slate-600">Award wording and completion criteria will be decided before launch.</p></div></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Find your area" title="Explore the proposed tracks" description="These role pathways are topic proposals, not available courses. Open a track to see its current outline and what still needs approval." />
          <Link href="/courses" className="rounded-sm pb-1 text-sm font-extrabold text-navy-900 hover:underline">View all six tracks <span aria-hidden="true">→</span></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courseTracks.slice(0, 3).map((course) => <CourseCard key={course.slug} course={course} compact showImage={false} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-8 rounded-[1.75rem] bg-[#f1f3f6] p-6 sm:p-9 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14 lg:p-12">
          <SectionHeading eyebrow="What this is" title="Practical learning, with the terms made clear" description="The platform is being planned as a separate free learning initiative. It will not reuse the paid program's terms or guarantees." />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5"><h2 className="font-bold">Learn about the work</h2><p className="mt-2 text-sm leading-6 text-slate-600">Proposed material introduces processes, vocabulary, controls, and role expectations in banking operations.</p></div>
            <div className="rounded-2xl bg-white p-5"><h2 className="font-bold">No job promises</h2><p className="mt-2 text-sm leading-6 text-slate-600">Learning or completing a future course will not guarantee a job, placement, or regulated authorization.</p></div>
            <div className="rounded-2xl bg-white p-5"><h2 className="font-bold">Separate from the paid masterclass</h2><p className="mt-2 text-sm leading-6 text-slate-600">The Financial Operations Masterclass remains a separate Centaur Careers offer with its own terms.</p></div>
            <div className="rounded-2xl bg-white p-5"><h2 className="font-bold">Details before enrollment</h2><p className="mt-2 text-sm leading-6 text-slate-600">Course format, study time, assessment rules, and support details are not published until approved.</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-6 pt-8 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-navy-900/15 bg-white p-6 sm:flex-row sm:items-center sm:p-8">
          <div><h2 className="text-xl font-bold">Want to understand the proposal?</h2><p className="mt-2 text-sm leading-6 text-slate-600">Read the FAQs, or check back after the course plans are approved.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/faq" className="button-secondary rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold">Read FAQs</Link><Link href="/help" className="button-primary rounded-xl px-4 py-3 text-sm font-bold">Help and updates</Link></div>
        </div>
      </section>
    </main>
  );
}

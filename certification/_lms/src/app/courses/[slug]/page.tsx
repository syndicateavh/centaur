import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { courseTracks, getCourseTrack } from "@/data/courses";
import { getCourseImage } from "@/data/courseImages";

type CoursePageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return courseTracks.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseTrack(slug);
  if (!course) return { title: "Track not found", robots: { index: false, follow: false } };
  return {
    title: `${course.title} Learning Track`,
    description: course.description,
    ...(process.env.LMS_PUBLIC_URL ? { alternates: { canonical: `/courses/${course.slug}` } } : {}),
    robots: { index: true, follow: true },
  };
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourseTrack(slug);
  if (!course) notFound();

  return (
    <main id="main-content" className="flex-1">
      <section className="bg-navy-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <nav aria-label="Breadcrumb" className="text-sm font-semibold text-navy-100/80"><Link className="hover:text-white hover:underline" href="/courses">Proposed tracks</Link><span aria-hidden="true" className="px-2">/</span><span aria-current="page">{course.title}</span></nav>
          <div className="mt-9 grid gap-9 lg:grid-cols-[1fr_18rem] lg:items-end">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-navy-100">{course.category}</span><span className="rounded-full bg-gold-300 px-3 py-1.5 text-xs font-extrabold text-navy-950">Planned · not open</span></div>
              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">{course.title}</h1>
              <p className="mt-5 text-base leading-7 text-navy-50/85 sm:text-lg sm:leading-8">{course.description}</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06]">
              <div className="relative aspect-[3/2]">
                <Image src={getCourseImage(course.slug)} alt={`${course.title} learning`} fill sizes="(max-width: 1023px) 100vw, 352px" className="object-cover" priority />
              </div>
              <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-100/70">Current availability</p>
              <p className="mt-2 text-lg font-bold">Course proposal</p>
              <p className="mt-2 text-sm leading-6 text-navy-50/75">Enrollment is closed while the syllabus and learner requirements are reviewed.</p>
              <span aria-disabled="true" className="mt-5 inline-flex w-full cursor-not-allowed justify-center rounded-xl bg-white/15 px-4 py-3 text-sm font-bold text-white/65">Enrollment not open</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-10 lg:py-14">
        <div className="space-y-8">
          <section aria-labelledby="track-overview">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-navy-800">Track outline · draft</p>
            <h2 id="track-overview" className="mt-3 text-2xl font-bold">What this pathway may cover</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">These focus areas are planning topics. They are not a final lesson sequence or a promise that course material is available.</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {course.focusAreas.map((area, index) => (
                <li key={area} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold leading-6 text-slate-800"><span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-lg bg-navy-50 text-xs font-extrabold text-navy-900">0{index + 1}</span>{area}</li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="roles-heading">
            <h2 id="roles-heading" className="text-2xl font-bold">Roles this area relates to</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Potential entry-level role examples, not job placement outcomes.</p>
            <ul className="mt-4 flex flex-wrap gap-2">{course.intendedRoles.map((role) => <li key={role} className="rounded-full border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700">{role}</li>)}</ul>
          </section>
          <section aria-labelledby="credential-heading" className="rounded-2xl border border-gold-200 bg-gold-50/70 p-5 sm:p-6">
            <h2 id="credential-heading" className="text-xl font-bold text-slate-950">Certificate and completion rules are not set</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">If this course is approved, Centaur expects to define a course-completion certificate and its requirements. Exact wording, assessments, pass criteria, retakes, and issue rules still need approval. It would be an educational completion award, not a government, regulator, bank, or employer credential.</p>
            <Link href="/faq#certificate-scope" className="mt-4 inline-flex rounded-sm text-sm font-extrabold text-navy-900 hover:underline">Read certificate scope FAQs <span aria-hidden="true" className="ml-2">→</span></Link>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="details-heading">
          <h2 id="details-heading" className="text-lg font-bold">Course details</h2>
          <dl className="mt-4 divide-y divide-slate-200 text-sm">
            <div className="py-3"><dt className="font-semibold text-slate-500">Price</dt><dd className="mt-1 font-bold text-slate-900">Planned as free · pending approval</dd></div>
            <div className="py-3"><dt className="font-semibold text-slate-500">Study effort</dt><dd className="mt-1 text-slate-800">To be confirmed</dd></div>
            <div className="py-3"><dt className="font-semibold text-slate-500">Format</dt><dd className="mt-1 text-slate-800">To be confirmed</dd></div>
            <div className="py-3"><dt className="font-semibold text-slate-500">Prerequisites</dt><dd className="mt-1 text-slate-800">To be confirmed</dd></div>
            <div className="py-3"><dt className="font-semibold text-slate-500">Enrollment</dt><dd className="mt-1 font-bold text-gold-800">Not open</dd></div>
          </dl>
          <p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">No payment information or real learner registration is collected by this preview.</p>
        </aside>
      </section>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><Link href="/courses" className="inline-flex rounded-sm text-sm font-bold text-navy-900 hover:underline">← Back to all proposed tracks</Link></div>
    </main>
  );
}

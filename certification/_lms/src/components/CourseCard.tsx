import Link from "next/link";
import Image from "next/image";
import type { CourseTrack } from "@/data/courses";
import { getCourseImage } from "@/data/courseImages";

export default function CourseCard({ course, compact = false }: { course: CourseTrack; compact?: boolean }) {
  return (
    <article className="course-card group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-lg">
      <div className="relative -mx-6 -mt-6 mb-5 aspect-[3/2] overflow-hidden rounded-t-2xl bg-navy-100">
        <Image src={getCourseImage(course.slug)} alt={`${course.title} learning`} fill sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw" className="object-cover transition duration-300 group-hover:scale-[1.02]" />
      </div>
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-bold text-navy-900">{course.category}</span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold-200 bg-gold-50 px-2.5 py-1 text-xs font-semibold text-gold-900">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold-600" />
          Planned
        </span>
      </div>
      <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
        <Link href={`/courses/${course.slug}`} className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none">
          {course.title}
        </Link>
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{course.description}</p>
      {!compact && (
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Potential roles</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{course.intendedRoles.join(" · ")}</p>
        </div>
      )}
      <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-navy-900">
        View proposed track <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
      </span>
    </article>
  );
}

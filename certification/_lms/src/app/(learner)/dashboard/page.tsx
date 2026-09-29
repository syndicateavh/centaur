import type { Metadata } from "next";
import Link from "next/link";
import { requireLearner } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";
import { enrollInLocalSandbox } from "@/app/(auth)/actions";
import SignOutButton from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Learner dashboard", robots: { index: false, follow: false } };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ enrollment?: string }> }) {
  const learner = await requireLearner();
  const data = await withLearnerTransaction(learner.id, async (client) => {
    const courses = await client.query<{ id: string; slug: string; title: string; summary: string; status: string; review_status: string | null }>(`SELECT c.id, c.slug, c.title, c.summary, c.status, v.review_status FROM lms.courses c
      JOIN lms.course_versions v ON v.id=c.current_version_id
      WHERE c.current_version_id IS NOT NULL AND (c.status='published' OR (c.status='draft' AND c.is_sandbox=TRUE AND $1='development'))
        AND (c.is_sandbox=FALSE OR $1='development') ORDER BY c.title`, [process.env.NODE_ENV]);
    const enrolled = await client.query<{ course_id: string; slug: string; title: string; status: string; enrolled_at: Date }>(`SELECT e.course_id, c.slug, c.title, e.status, e.enrolled_at
      FROM lms.enrollments e JOIN lms.courses c ON c.id=e.course_id WHERE e.user_id=$1 ORDER BY e.enrolled_at DESC`, [learner.id]);
    return { courses, enrolled };
  });
  const { courses, enrolled } = data;
  const params = await searchParams;
  return <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-navy-800">Learner area</p><h1 className="mt-2 text-3xl font-bold">Welcome, {learner.name}</h1></div><SignOutButton /></div>
    {params.enrollment === "complete" && <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm">Enrollment is active. Repeated enrollments are safely ignored.</p>}
    {params.enrollment === "unavailable" && <p role="alert" className="mt-4 rounded-lg bg-gold-50 p-3 text-sm">That course is not available for enrollment.</p>}
    <section className="mt-8"><h2 className="text-xl font-bold">Your courses</h2>{enrolled.rowCount ? <ul className="mt-4 grid gap-3 md:grid-cols-2">{enrolled.rows.map((row) => <li key={row.course_id} className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-bold">{row.title}</h3><p className="mt-1 text-sm text-slate-600">Status: {row.status} · Joined {new Date(row.enrolled_at).toLocaleDateString()}</p>{row.status !== "cancelled" && <Link className="mt-4 inline-flex rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white" href={`/learn/${row.slug}`}>Open course</Link>}</li>)}</ul> : <p className="mt-3 text-sm text-slate-600">You have not enrolled in a course yet.</p>}</section>
    <section className="mt-9"><h2 className="text-xl font-bold">Available for internal enrollment</h2><p className="mt-1 text-sm text-slate-600">Draft courses below are local review previews. They are not public offers and have not been approved for release.</p>
      {courses.rows.length ? <ul className="mt-4 grid gap-3 md:grid-cols-2">{courses.rows.map((course) => <li key={course.id} className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-bold">{course.title}</h3><p className="mt-2 text-sm text-slate-600">{course.summary}</p>{course.review_status === "pending" && <p className="mt-3 text-xs font-bold uppercase tracking-wide text-gold-900">Internal draft · reviewer approval pending</p>}<form action={enrollInLocalSandbox} className="mt-4"><input type="hidden" name="courseId" value={course.id} /><button className="rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white">Enroll for local preview</button></form></li>)}</ul> : <p className="mt-3 text-sm text-slate-600">No courses are open for enrollment.</p>}</section>
    <p className="mt-8 text-sm"><Link href="/account" className="text-navy-800 underline">Manage account</Link></p>
  </main>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "LMS operations", robots: { index: false, follow: false } };

type Overview = {enrollments:number;active:number;completed:number;open_support:number;failed_mail:number;active_certificates:number;revoked_certificates:number;scheduled:number};
type EnrollmentRow = {course_title:string;status:string;version_number:number;enrolled_at:Date;completed_at:Date|null};
type MailFailure = {message_type:string;error_code:string|null;attempted_at:Date};
type AuditRow = {action:string;target_type:string;target_id:string|null;created_at:Date};

export default async function AdminOperationsPage() {
  const admin = await requireAdmin();
  const data = await withLearnerTransaction(admin.id,async (client) => {
    const [overview,enrollments,mail,audit] = await Promise.all([
      client.query<Overview>(`SELECT
        (SELECT count(*)::int FROM lms.enrollments) AS enrollments,
        (SELECT count(*)::int FROM lms.enrollments WHERE status='active') AS active,
        (SELECT count(*)::int FROM lms.enrollments WHERE status='completed') AS completed,
        (SELECT count(*)::int FROM lms.support_requests WHERE status IN ('open','in_progress')) AS open_support,
        (SELECT count(*)::int FROM lms.mail_delivery_attempts WHERE status='failed' AND attempted_at>now()-interval '30 days') AS failed_mail,
        (SELECT count(*)::int FROM lms.certificates WHERE status='active') AS active_certificates,
        (SELECT count(*)::int FROM lms.certificates WHERE status='revoked') AS revoked_certificates,
        (SELECT count(*)::int FROM lms.course_versions WHERE status='draft' AND scheduled_publish_at IS NOT NULL) AS scheduled`),
      client.query<EnrollmentRow>(`SELECT c.title AS course_title,e.status,v.version_number,e.enrolled_at,e.completed_at FROM lms.enrollments e
        JOIN lms.courses c ON c.id=e.course_id JOIN lms.course_versions v ON v.id=e.course_version_id
        ORDER BY e.enrolled_at DESC LIMIT 30`),
      client.query<MailFailure>(`SELECT message_type,error_code,attempted_at FROM lms.mail_delivery_attempts
        WHERE status='failed' ORDER BY attempted_at DESC LIMIT 20`),
      client.query<AuditRow>(`SELECT action,target_type,target_id,created_at FROM lms.audit_events ORDER BY created_at DESC LIMIT 30`),
    ]);
    return {overview:overview.rows[0],enrollments:enrollments.rows,mail:mail.rows,audit:audit.rows};
  });
  const count = data.overview;
  return <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy-800">Protected administration</p><h1 className="mt-2 text-3xl font-bold tracking-tight">LMS operations</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Operational records for enrollment, learner support, scheduled publication, mail delivery, and certificate status. Access is limited to LMS administrators; support request details are available on the support queue.</p>
    <nav aria-label="Operations" className="mt-6 flex flex-wrap gap-3 text-sm font-bold"><Link className="rounded-lg bg-navy-900 px-4 py-2.5 text-white" href="/admin/courses">Course operations</Link><Link className="rounded-lg border border-navy-900 px-4 py-2.5 text-navy-950" href="/admin/pilot">Controlled pilot</Link><Link className="rounded-lg border border-navy-900 px-4 py-2.5 text-navy-950" href="/admin/support">Support queue ({count.open_support} open)</Link><Link className="rounded-lg border border-navy-900 px-4 py-2.5 text-navy-950" href="/admin/certificates">Certificates ({count.active_certificates} active)</Link><Link className="rounded-lg border border-navy-900 px-4 py-2.5 text-navy-950" href="/admin/mail-delivery">Mail delivery ({count.failed_mail} failed, 30 days)</Link></nav>
    <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Operational totals">{[
      ["Enrollments",count.enrollments],["Active learners",count.active],["Completed courses",count.completed],["Scheduled publications",count.scheduled],
      ["Open support",count.open_support],["Failed mail · 30 days",count.failed_mail],["Active certificates",count.active_certificates],["Revoked certificates",count.revoked_certificates],
    ].map(([label,value])=><article key={label} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-600">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></article>)}</section>
    <section className="mt-9 rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-bold">Recent enrollments and completion</h2>{data.enrollments.length?<div className="table-scroll mt-4 rounded-lg" role="region" aria-label="Recent enrollments table; scroll horizontally to view all columns" tabIndex={0}><table className="w-full min-w-[38rem] text-left text-sm"><caption className="sr-only">Recent learner enrollments, course versions, status, and completion dates</caption><thead><tr className="border-b text-xs uppercase text-slate-600"><th scope="col" className="py-2">Course</th><th scope="col">Version</th><th scope="col">Status</th><th scope="col">Enrolled</th><th scope="col">Completed</th></tr></thead><tbody>{data.enrollments.map((item,index)=><tr key={`${item.course_title}-${item.enrolled_at.toISOString()}-${index}`} className="border-b last:border-0"><td className="py-3 font-semibold">{item.course_title}</td><td>{item.version_number}</td><td>{item.status}</td><td>{item.enrolled_at.toLocaleDateString("en-IN",{timeZone:"UTC"})}</td><td>{item.completed_at?.toLocaleDateString("en-IN",{timeZone:"UTC"})??"—"}</td></tr>)}</tbody></table></div>:<p className="mt-3 text-sm text-slate-600">No enrollments yet.</p>}</section>
    <div className="mt-8 grid gap-8 lg:grid-cols-2"><section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-bold">Recent mail delivery failures</h2>{data.mail.length?<ul className="mt-3 space-y-3">{data.mail.map((item,index)=><li key={`${item.attempted_at.toISOString()}-${index}`} className="border-t pt-3 text-sm"><span className="font-semibold">{item.message_type.replaceAll("_"," ")}</span><span className="ml-2 text-rose-800">{item.error_code??"delivery failed"}</span><time className="mt-1 block text-xs text-slate-500">{item.attempted_at.toLocaleString("en-IN",{timeZone:"UTC"})}</time></li>)}</ul>:<p className="mt-3 text-sm text-slate-600">No delivery failures recorded.</p>}</section>
      <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-bold">Recent audit activity</h2>{data.audit.length?<ol className="mt-3 space-y-3">{data.audit.map((item,index)=><li key={`${item.created_at.toISOString()}-${index}`} className="border-t pt-3 text-sm"><span className="font-semibold">{item.action.replaceAll("_"," ")}</span><span className="ml-2 text-slate-600">{item.target_type} · {item.target_id??"record"}</span><time className="mt-1 block text-xs text-slate-500">{item.created_at.toLocaleString("en-IN",{timeZone:"UTC"})}</time></li>)}</ol>:<p className="mt-3 text-sm text-slate-600">No audit activity recorded.</p>}</section></div>
  </main>;
}

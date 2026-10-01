import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";
import { requireSupportStaff } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";
import { updateSupportRequest } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Learner support queue", robots: { index: false, follow: false } };

type SupportRow = {id:string;subject:string;message:string;status:string;created_at:Date;updated_at:Date;admin_note:string|null;learner_name:string;learner_email:string};
const pageSize = 50;

export default async function AdminSupportPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const staff = await requireSupportStaff();
  const params = await searchParams;
  const q = z.string().trim().max(100).catch("").parse(params.q ?? "");
  const status = z.enum(["all", "open", "in_progress", "resolved", "closed"]).catch("all").parse(params.status ?? "all");
  const requestedPage = z.coerce.number().int().min(1).catch(1).parse(params.page ?? "1");
  const data = await withLearnerTransaction(staff.id, async (client) => {
    const values = [q, status];
    const filter = `($1='' OR s.subject ILIKE '%'||$1||'%' OR s.message ILIKE '%'||$1||'%' OR u.email ILIKE '%'||$1||'%' OR COALESCE(p.display_name,u.name) ILIKE '%'||$1||'%')
      AND ($2='all' OR s.status=$2)`;
    const count = await client.query<{total:number}>(`SELECT count(*)::int AS total FROM lms.support_requests s JOIN lms."user" u ON u.id=s.user_id LEFT JOIN lms.profiles p ON p.user_id=s.user_id WHERE ${filter}`, values);
    const total = count.rows[0]?.total ?? 0;
    const totalPages = Math.max(1,Math.ceil(total/pageSize));
    const page = Math.min(requestedPage,totalPages);
    const result = await client.query<SupportRow>(`SELECT s.id,s.subject,s.message,s.status,s.created_at,s.updated_at,s.admin_note,
        COALESCE(p.display_name,u.name) AS learner_name,u.email AS learner_email
      FROM lms.support_requests s JOIN lms."user" u ON u.id=s.user_id LEFT JOIN lms.profiles p ON p.user_id=s.user_id
      WHERE ${filter}
      ORDER BY CASE WHEN s.status='open' THEN 0 WHEN s.status='in_progress' THEN 1 WHEN s.status='resolved' THEN 2 ELSE 3 END,s.created_at DESC
      LIMIT $3 OFFSET $4`, [...values, pageSize, (page - 1) * pageSize]);
    return { rows: result.rows, total };
  });
  const totalPages = Math.max(1, Math.ceil(data.total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const pageHref = (target: number) => `/admin/support?${new URLSearchParams({q,status,page:String(target)})}`;

  return <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy-800"><Link href="/admin" className="underline">Admin workspace</Link> / Support queue</p>
    <h1 className="mt-2 text-3xl font-bold tracking-tight">Learner support</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Requests are visible to support staff and administrators. Handle personal information carefully, keep notes factual, and do not ask learners to send passwords or real bank/customer data.</p>

    <form method="get" className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end">
      <label className="text-sm font-semibold">Search subject, message, learner name, or email<input name="q" value={q} maxLength={100} className="form-input mt-1 w-full" /></label>
      <label className="text-sm font-semibold">Status<select name="status" value={status} className="form-input mt-1"><option value="all">All statuses</option><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></label>
      <button className="min-h-11 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white">Filter requests</button>
    </form>
    <p className="mt-3 text-sm text-slate-600">{data.total} request{data.total === 1 ? "" : "s"} Â· page {page} of {totalPages}</p>

    <section className="mt-4 space-y-4" aria-label="Support requests">{data.rows.length ? data.rows.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.status.replaceAll("_"," ")} Â· {item.created_at.toLocaleString("en-IN",{timeZone:"UTC"})}</p><h2 className="mt-1 text-lg font-bold">{item.subject}</h2><p className="mt-1 text-sm text-slate-600">{item.learner_name} Â· {item.learner_email}</p></div><span className="text-xs text-slate-500">Updated {item.updated_at.toLocaleDateString("en-IN",{timeZone:"UTC"})}</span></div>
      <p className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-6">{item.message}</p>
      <form action={updateSupportRequest} className="mt-4 grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-[12rem_1fr_auto] sm:items-end"><input type="hidden" name="requestId" value={item.id} /><label className="text-xs font-semibold">Status<select name="status" defaultValue={item.status} className="form-input mt-1"><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></label><label className="text-xs font-semibold">Internal note<textarea name="adminNote" defaultValue={item.admin_note ?? ""} maxLength={5000} rows={2} className="form-input mt-1 w-full" /></label><button className="min-h-11 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white">Save update</button></form>
    </article>) : <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">{data.total ? "No requests are on this page." : "No support requests match these filters."}</p>}</section>
    {totalPages > 1 && <nav aria-label="Support queue pages" className="mt-6 flex items-center justify-between gap-3"><Link aria-disabled={page <= 1} className={`inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-semibold ${page <= 1 ? "pointer-events-none border-slate-200 text-slate-400" : "border-slate-300 text-navy-900"}`} href={pageHref(Math.max(1,page-1))}>Previous</Link><span className="text-sm text-slate-600">Page {page} of {totalPages}</span><Link aria-disabled={page >= totalPages} className={`inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-semibold ${page >= totalPages ? "pointer-events-none border-slate-200 text-slate-400" : "border-slate-300 text-navy-900"}`} href={pageHref(Math.min(totalPages,page+1))}>Next</Link></nav>}
  </main>;
}

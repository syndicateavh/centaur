import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";
import { requireAdmin } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Audit history", robots: { index: false, follow: false } };

type AuditRow = { action:string; target_type:string; target_id:string|null; created_at:Date; actor_name:string };
const pageSize = 50;
const day = z.iso.date().catch("");

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<{ q?:string; target?:string; from?:string; to?:string; page?:string }> }) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const q = z.string().trim().max(100).catch("").parse(params.q ?? "");
  const target = z.string().trim().max(60).catch("").parse(params.target ?? "");
  const from = day.parse(params.from ?? "");
  const to = day.parse(params.to ?? "");
  const requestedPage = z.coerce.number().int().min(1).catch(1).parse(params.page ?? "1");
  const data = await withLearnerTransaction(admin.id, async (client) => {
    const filters = `($1='' OR ae.action ILIKE '%'||$1||'%' OR ae.target_type ILIKE '%'||$1||'%' OR COALESCE(ae.target_id,'') ILIKE '%'||$1||'%')
      AND ($2='' OR ae.target_type=$2) AND ($3::date IS NULL OR ae.created_at >= $3::date) AND ($4::date IS NULL OR ae.created_at < $4::date + INTERVAL '1 day')`;
    const values = [q,target,from || null,to || null];
    const count = await client.query<{total:number}>(`SELECT count(*)::int AS total FROM lms.audit_events ae WHERE ${filters}`,values);
    const total = count.rows[0]?.total ?? 0;
    const totalPages = Math.max(1,Math.ceil(total/pageSize));
    const page = Math.min(requestedPage,totalPages);
    const rows = await client.query<AuditRow>(`SELECT ae.action,ae.target_type,ae.target_id,ae.created_at,
        COALESCE(p.display_name,u.name,'Former staff account') AS actor_name
      FROM lms.audit_events ae LEFT JOIN lms."user" u ON u.id=ae.actor_user_id LEFT JOIN lms.profiles p ON p.user_id=ae.actor_user_id
      WHERE ${filters} ORDER BY ae.created_at DESC,ae.id DESC LIMIT $5 OFFSET $6`,[...values,pageSize,(page-1)*pageSize]);
    return {total,totalPages,page,rows:rows.rows};
  });
  const pageHref = (page:number) => `/admin/audit?${new URLSearchParams({q,target,from,to,page:String(page)})}`;

  return <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy-800"><Link href="/admin" className="underline">Admin workspace</Link> / Audit history</p>
    <h1 className="mt-2 text-3xl font-bold tracking-tight">Audit history</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Administrative actions are append-only. Search action names and record references; personal details and event payloads are omitted from this view.</p>
    <form method="get" className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem_10rem_10rem_auto] lg:items-end">
      <label className="text-sm font-semibold">Search action or record<input name="q" value={q} maxLength={100} className="form-input mt-1 w-full" /></label>
      <label className="text-sm font-semibold">Record type<input name="target" value={target} maxLength={60} className="form-input mt-1 w-full" placeholder="course_version" /></label>
      <label className="text-sm font-semibold">From<input name="from" type="date" value={from} className="form-input mt-1 w-full" /></label>
      <label className="text-sm font-semibold">To<input name="to" type="date" value={to} className="form-input mt-1 w-full" /></label>
      <button className="min-h-11 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white">Filter history</button>
    </form>
    <p className="mt-3 text-sm text-slate-600">{data.total} event{data.total===1?"":"s"} · page {data.page} of {data.totalPages}</p>
    {data.rows.length ? <ol className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">{data.rows.map((event,index)=><li key={`${event.created_at.toISOString()}-${event.action}-${index}`} className="flex flex-wrap justify-between gap-2 p-4"><div><p className="font-semibold">{event.action.replaceAll("_"," ")}</p><p className="mt-1 text-sm text-slate-600">{event.target_type.replaceAll("_"," ")} · {event.target_id ? `record ${event.target_id}` : "record"} · {event.actor_name}</p></div><time className="text-xs text-slate-500">{event.created_at.toLocaleString("en-IN",{timeZone:"UTC"})} UTC</time></li>)}</ol> : <p className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No audit events match these filters.</p>}
    {data.totalPages>1 && <nav aria-label="Audit history pages" className="mt-6 flex items-center justify-between gap-3"><Link aria-disabled={data.page<=1} className={`inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-semibold ${data.page<=1?"pointer-events-none border-slate-200 text-slate-400":"border-slate-300 text-navy-900"}`} href={pageHref(Math.max(1,data.page-1))}>Previous</Link><span className="text-sm text-slate-600">Page {data.page} of {data.totalPages}</span><Link aria-disabled={data.page>=data.totalPages} className={`inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-semibold ${data.page>=data.totalPages?"pointer-events-none border-slate-200 text-slate-400":"border-slate-300 text-navy-900"}`} href={pageHref(Math.min(data.totalPages,data.page+1))}>Next</Link></nav>}
  </main>;
}

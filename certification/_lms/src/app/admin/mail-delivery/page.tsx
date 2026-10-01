import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mail delivery status", robots: { index: false, follow: false } };

type MailRow = {message_type:string;error_code:string|null;attempted_at:Date};

export default async function MailDeliveryPage() {
  const admin = await requireAdmin();
  const rows = await withLearnerTransaction(admin.id,async (client) => {
    const result = await client.query<MailRow>("SELECT message_type,error_code,attempted_at FROM lms.mail_delivery_attempts WHERE status='failed' ORDER BY attempted_at DESC LIMIT 200");
    return result.rows;
  });
  return <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-navy-800"><Link href="/admin/operations" className="underline">Operations</Link> / Mail delivery</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Mail delivery failures</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">This page stores only message type, a keyed recipient fingerprint, safe transport error code, and timestamp. It does not store email addresses or action links. Check the approved internal SMTP relay when failures appear.</p>
    {rows.length?<ol className="mt-7 space-y-3">{rows.map((row,index)=><li key={`${row.attempted_at.toISOString()}-${index}`} className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold">{row.message_type.replaceAll("_"," ")} · {row.error_code??"delivery failed"}</p><p className="mt-1 text-xs text-slate-600">{row.attempted_at.toLocaleString("en-IN",{timeZone:"UTC"})}</p></li>)}</ol>:<p className="mt-7 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No failed delivery attempts are recorded.</p>}
  </main>;
}

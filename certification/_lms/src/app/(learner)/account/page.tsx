import type { Metadata } from "next";
import { requireLearner } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";
import { requestAccountDeletion, updateProfile } from "@/app/(auth)/actions";
import { submitSupportRequest } from "@/app/(learner)/support-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Account settings", robots: { index: false, follow: false } };
export default async function AccountPage({ searchParams }: { searchParams: Promise<{ saved?: string; deletion?: string; support?: string }> }) {
  const learner = await requireLearner("/account");
  const params = await searchParams;
  const profile = await withLearnerTransaction(learner.id, async (client) => {
    const result = await client.query<{ display_name: string }>("SELECT display_name FROM lms.profiles WHERE user_id = $1", [learner.id]);
    return result.rows[0]?.display_name ?? learner.name;
  });
  const requests = await withLearnerTransaction(learner.id, async (client) => client.query<{ status: string }>("SELECT status FROM lms.account_deletion_requests WHERE user_id = $1 ORDER BY requested_at DESC LIMIT 1", [learner.id]));
  const supportRequests = await withLearnerTransaction(learner.id, async (client) => client.query<{ id:string; subject:string; status:string; created_at:Date; updated_at:Date }>("SELECT id,subject,status,created_at,updated_at FROM lms.support_requests WHERE user_id=$1 ORDER BY created_at DESC LIMIT 10",[learner.id]));
  return <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8">
    <p className="text-sm font-semibold text-navy-800">Student area</p><h1 className="mt-1 break-words text-3xl font-bold tracking-tight">Account settings</h1><p className="mt-2 break-all text-sm text-slate-600">Signed in as {learner.email}</p>
    {params.saved && <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm">Profile updated.</p>}
    <section id="profile" className="mt-7 scroll-mt-32 rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-bold">Profile</h2><form action={updateProfile} className="mt-4"><label className="block text-sm font-semibold">Display name<input className="form-input" name="displayName" defaultValue={profile} maxLength={100} required /></label><button className="mt-4 min-h-11 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white">Save profile</button></form></section>
    <section id="support" className="mt-7 scroll-mt-32 rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-bold">Learner support</h2><p className="mt-2 text-sm leading-6 text-slate-600">Send an account or course question to the internal support team. Do not include passwords, payment details, or real bank/customer information.</p>
      {params.support === "created" && <p role="status" className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm">Your support request has been recorded.</p>}{params.support === "rate-limited" && <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm">You have submitted several requests recently. Try again later or update one of your open requests.</p>}
      <form action={submitSupportRequest} className="mt-4 space-y-3"><label className="block text-sm font-semibold">Subject<input className="form-input mt-1" name="subject" minLength={4} maxLength={200} required /></label><label className="block text-sm font-semibold">How can we help?<textarea className="form-input mt-1 min-h-32" name="message" minLength={10} maxLength={5000} required /></label><button className="min-h-11 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white">Submit support request</button></form>
      <h3 className="mt-6 font-bold">Recent requests</h3>{supportRequests.rows.length ? <ul className="mt-2 divide-y divide-slate-100">{supportRequests.rows.map((item) => <li key={item.id} className="py-3 text-sm"><span className="font-semibold">{item.subject}</span><span className="ml-2 text-slate-600">· {item.status.replaceAll("_"," ")} · {new Date(item.updated_at).toLocaleDateString()}</span></li>)}</ul> : <p className="mt-2 text-sm text-slate-600">No support requests yet.</p>}
    </section>
    <section id="account-deletion" className="mt-7 scroll-mt-32 rounded-xl border border-gold-200 bg-gold-50 p-5"><h2 className="font-bold">Request account deletion</h2><p className="mt-2 text-sm leading-6">This records a request for an administrator to review and process. It does not immediately erase your account or any legally required records.</p>
      {params.deletion && <p role="status" className="mt-3 text-sm font-semibold">Your request has been recorded.</p>}
      {requests.rows[0] && <p className="mt-2 text-sm">Latest request status: {requests.rows[0].status}</p>}
      <form action={requestAccountDeletion} className="mt-4"><label className="flex gap-3 text-sm"><input name="confirmDeletion" type="checkbox" required className="mt-1 accent-navy-800" />I understand this creates a deletion request for review.</label><button className="mt-4 rounded-lg border border-gold-900 px-4 py-2.5 text-sm font-bold text-gold-950">Submit request</button></form>
    </section>
  </main>;
}

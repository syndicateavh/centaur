import type { Metadata } from "next";
import { requireLearner } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";
import { requestAccountDeletion, updateProfile } from "@/app/(auth)/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Account settings", robots: { index: false, follow: false } };
export default async function AccountPage({ searchParams }: { searchParams: Promise<{ saved?: string; deletion?: string }> }) {
  const learner = await requireLearner("/account");
  const params = await searchParams;
  const profile = await withLearnerTransaction(learner.id, async (client) => {
    const result = await client.query<{ display_name: string }>("SELECT display_name FROM lms.profiles WHERE user_id = $1", [learner.id]);
    return result.rows[0]?.display_name ?? learner.name;
  });
  const requests = await withLearnerTransaction(learner.id, async (client) => client.query<{ status: string }>("SELECT status FROM lms.account_deletion_requests WHERE user_id = $1 ORDER BY requested_at DESC LIMIT 1", [learner.id]));
  return <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8">
    <h1 className="text-3xl font-bold">Account settings</h1><p className="mt-2 text-sm text-slate-600">Signed in as {learner.email}</p>
    {params.saved && <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm">Profile updated.</p>}
    <form action={updateProfile} className="mt-7 rounded-xl border border-slate-200 bg-white p-5"><label className="block text-sm font-semibold">Display name<input className="form-input" name="displayName" defaultValue={profile} maxLength={100} required /></label><button className="mt-4 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white">Save profile</button></form>
    <section className="mt-7 rounded-xl border border-gold-200 bg-gold-50 p-5"><h2 className="font-bold">Request account deletion</h2><p className="mt-2 text-sm leading-6">This records a request for an administrator to review and process. It does not immediately erase your account or any legally required records.</p>
      {params.deletion && <p role="status" className="mt-3 text-sm font-semibold">Your request has been recorded.</p>}
      {requests.rows[0] && <p className="mt-2 text-sm">Latest request status: {requests.rows[0].status}</p>}
      <form action={requestAccountDeletion} className="mt-4"><label className="flex gap-3 text-sm"><input name="confirmDeletion" type="checkbox" required className="mt-1 accent-navy-800" />I understand this creates a deletion request for review.</label><button className="mt-4 rounded-lg border border-gold-900 px-4 py-2.5 text-sm font-bold text-gold-950">Submit request</button></form>
    </section>
  </main>;
}

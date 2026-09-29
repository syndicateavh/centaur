import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy notice draft' };

export default function PrivacyPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-wider text-gold-800">Draft for development testing</p>
      <h1 className="mt-3 text-3xl font-bold">Privacy notice draft</h1>
      <p className="mt-5 leading-7 text-slate-700">This learning platform is not approved for real learner registration. Registration is closed by default. During development, the app will use a Centaur-controlled PostgreSQL database for fictitious test accounts and learning records. No third-party learner-data APIs or payment/card details are used by this LMS.</p>
      <p className="mt-4 leading-7 text-slate-700">A signed-in test user can request account deletion from the account page. The request is recorded for an administrator to review; submitting it does not instantly erase records. Retention, deletion and support procedures must be approved before real learners are invited.</p>
      <p className="mt-4 leading-7 text-slate-700">The production privacy notice, data region, retention period and support contact are pending product-owner approval. Do not enter real personal information during development testing.</p>
    </main>
  );
}

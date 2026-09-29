import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Learning terms draft' };

export default function TermsPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-wider text-gold-800">Draft for development testing</p>
      <h1 className="mt-3 text-3xl font-bold">Learning terms draft</h1>
      <p className="mt-5 leading-7 text-slate-700">This LMS is a separate proposed learning product. Any available course in the local development database is fictional test content. Enrolling in a test course does not involve payment or grant a certificate.</p>
      <p className="mt-4 leading-7 text-slate-700">Banking and financial operations material is educational. It is not a bank, government, regulator or employer credential, does not authorize regulated work and does not guarantee a job. The paid Financial Operations Masterclass and its terms are separate.</p>
      <p className="mt-4 leading-7 text-slate-700">Course-completion and certificate rules, learner support, privacy and account-deletion procedures require owner approval before a real learner launch.</p>
    </main>
  );
}

"use client";

import Link from "next/link";

export default function LearnerError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main-content" className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-5 py-16 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-900">Student area</p>
    <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">We couldn’t load this learning page</h1>
    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Your saved course data is unchanged. Try again, or return to your dashboard.</p>
    <div className="mt-6 flex flex-wrap gap-3">
      <button type="button" onClick={() => reset()} className="button-primary min-h-11 rounded-xl px-4 py-3 text-sm font-bold">Try again</button>
      <Link href="/dashboard" className="button-secondary min-h-11 rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold">Go to dashboard</Link>
    </div>
  </main>;
}

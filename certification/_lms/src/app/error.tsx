"use client";

import Link from "next/link";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-5 py-20 sm:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-800">Something went wrong</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">This page could not be loaded</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Try loading the page again. If the problem continues, return to the public course catalogue.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => reset()} className="button-primary rounded-xl px-4 py-3 text-sm font-bold">Try again</button>
        <Link href="/courses" className="button-secondary rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold">Browse proposed tracks</Link>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-5 py-20 sm:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy-800">404 · Page not found</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">That learning page isn’t here</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">The address may have changed, or the proposed track may not be part of this preview.</p>
      <Link href="/courses" className="button-primary mt-6 rounded-xl px-4 py-3 text-sm font-bold">Browse proposed tracks</Link>
    </main>
  );
}

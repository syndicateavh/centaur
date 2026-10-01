import Link from "next/link";

export default function LearnerNotFound() {
  return <main id="main-content" className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-5 py-16 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy-800">Student area</p>
    <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">This course page isn’t available</h1>
    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">The course may have changed, or your enrollment may not include this version.</p>
    <Link href="/dashboard" className="button-primary mt-6 min-h-11 rounded-xl px-4 py-3 text-sm font-bold">Return to your dashboard</Link>
  </main>;
}

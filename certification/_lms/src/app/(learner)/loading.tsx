export default function LearnerLoading() {
  return <main id="main-content" aria-busy="true" aria-label="Loading your learning area" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
    <div className="animate-pulse">
      <div className="h-3 w-28 rounded bg-slate-200" />
      <div className="mt-3 h-9 w-64 max-w-full rounded bg-slate-200" />
      <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-100" />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {[0, 1].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="h-5 w-2/3 rounded bg-slate-200" />
          <div className="mt-4 h-3 w-full rounded bg-slate-100" />
          <div className="mt-3 h-3 w-4/5 rounded bg-slate-100" />
          <div className="mt-6 h-10 w-32 rounded-lg bg-slate-200" />
        </div>)}
      </div>
    </div>
  </main>;
}

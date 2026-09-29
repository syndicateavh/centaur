export default function CoursesLoading() {
  return (
    <main id="main-content" aria-busy="true" aria-label="Loading proposed courses" className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-12 max-w-xl animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-6 max-w-2xl animate-pulse rounded bg-slate-200" />
      <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} aria-hidden="true" className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
            <div className="h-6 w-28 rounded bg-slate-100" /><div className="mt-7 h-7 w-3/4 rounded bg-slate-100" /><div className="mt-4 h-4 rounded bg-slate-100" /><div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <p className="sr-only" role="status">Loading proposed learning tracks…</p>
    </main>
  );
}

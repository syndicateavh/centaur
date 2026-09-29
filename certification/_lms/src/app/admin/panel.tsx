"use client";

import { useCallback, useState } from "react";
import type { LocalAdminHealth } from "@/lib/db";

function StatusChip({ value }: { value: string }) {
  const ready = value === "ready" || value === "connected";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ready ? "bg-emerald-100 text-emerald-800" : "bg-gold-100 text-gold-900"}`}>{value}</span>;
}

export default function AdminHealthPanel({ initialHealth }: { initialHealth: LocalAdminHealth }) {
  const [health, setHealth] = useState<LocalAdminHealth>(initialHealth);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadHealth = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/health", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok && response.status !== 503) throw new Error("The local health endpoint could not be reached.");
      setError("");
      setHealth(payload as LocalAdminHealth);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Health check failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  function refresh() {
    setLoading(true);
    void loadHealth();
  }

  return (
    <section className="mt-8" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{loading ? "Checking local services…" : health ? `Last checked ${new Date(health.checkedAt).toISOString()}` : "Health check unavailable"}</p>
        <button type="button" onClick={refresh} disabled={loading} className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-900 disabled:opacity-50">Refresh checks</button>
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
      {health && <>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-slate-600">Next.js app</p><div className="mt-3 flex items-center justify-between gap-2"><StatusChip value={health.app.status} /><span className="text-xs text-slate-500">Node {health.app.nodeVersion}</span></div></article>
          <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-slate-600">PostgreSQL</p><div className="mt-3 flex items-center justify-between gap-2"><StatusChip value={health.database.status} /><span className="truncate text-xs text-slate-500">{health.database.name ?? "local DB"}</span></div>{health.database.message && <p className="mt-3 text-xs leading-5 text-gold-900">{health.database.message}</p>}</article>
          <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-slate-600">Schema migrations</p><div className="mt-3 flex items-center justify-between gap-2"><StatusChip value={health.migrations.status} /><span className="text-xs text-slate-500">{health.migrations.applied ?? "—"} applied</span></div>{health.migrations.pending !== null && <p className="mt-2 text-xs text-slate-500">{health.migrations.pending} pending</p>}</article>
          <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-slate-600">Course records</p><p className="mt-3 text-2xl font-bold text-slate-900">{health.courses.total ?? "—"}</p><p className="mt-1 text-xs text-slate-500">Draft {health.courses.draft ?? "—"} · Published {health.courses.published ?? "—"} · Archived {health.courses.archived ?? "—"}</p></article>
        </div>
        <article className="mt-4 rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Local configuration</h2><ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2"><li>Database connection string: {health.setup.databaseUrl ? "configured" : "missing"}</li><li>Development environment: {health.setup.localEnvironment ? "active" : "inactive"}</li></ul></article>
      </>}
      <p className="mt-5 text-xs leading-5 text-slate-500">The panel never displays database credentials. It is a local diagnostic screen, not the protected course administration area planned for a later phase.</p>
    </section>
  );
}

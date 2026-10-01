import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import AdminHealthPanel from "@/app/admin/panel";
import { readLocalAdminHealth } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Local service health", robots: { index: false, follow: false } };

export default async function LocalAdminPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const health = await readLocalAdminHealth();
  return <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:py-14">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">Local development only</p>
    <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Platform health</h1>
    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Read-only checks for this app and its internal PostgreSQL database. This route is separate from operational administration and is disabled outside development.</p>
    <AdminHealthPanel initialHealth={health} />
    <p className="mt-6 text-sm"><Link className="font-semibold text-navy-800 underline" href="/admin">Return to the admin workspace</Link></p>
  </main>;
}

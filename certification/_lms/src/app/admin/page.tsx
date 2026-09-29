import { notFound } from "next/navigation";
import AdminHealthPanel from "./panel";
import { readLocalAdminHealth } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LocalAdminPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const health = await readLocalAdminHealth();
  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy-800">Local development only</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Platform health</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Read-only checks for this app and its internal PostgreSQL database. This route is disabled outside the development environment.
      </p>
      <AdminHealthPanel initialHealth={health} />
      <p className="mt-6 text-sm"><Link className="font-semibold text-navy-800 underline" href="/admin/mail">Open local auth mail previews</Link></p>
      <p className="mt-3 text-sm"><Link className="font-semibold text-navy-800 underline" href="/admin/curriculum">Review the KYC/AML pilot curriculum</Link></p>
    </main>
  );
}

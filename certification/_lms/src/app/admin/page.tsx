import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminStaff } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin workspace", robots: { index: false, follow: false } };

type AdminOverview = { draft_versions: number; pending_reviews: number; open_support: number; failed_mail: number; active_certificates: number; audit_events: number };
type EditorOverview = { draft_versions: number; pending_reviews: number };
type SupportOverview = { open_support: number; in_progress_support: number };

export default async function AdminWorkspacePage() {
  const staff = await requireAdminStaff();
  const isAdmin = staff.roles.includes("admin");
  const isEditor = staff.roles.includes("course_editor");
  const isSupport = staff.roles.includes("support");
  const metrics = await withLearnerTransaction(staff.id, async (client) => {
    if (isAdmin) {
      const result = await client.query<AdminOverview>(`SELECT
        (SELECT count(*)::int FROM lms.course_versions WHERE status='draft') AS draft_versions,
        (SELECT count(*)::int FROM lms.course_versions WHERE status='draft' AND review_status IN ('pending','changes_requested')) AS pending_reviews,
        (SELECT count(*)::int FROM lms.support_requests WHERE status='open') AS open_support,
        (SELECT count(*)::int FROM lms.mail_delivery_attempts WHERE status='failed' AND attempted_at>now()-interval '30 days') AS failed_mail,
        (SELECT count(*)::int FROM lms.certificates WHERE status='active') AS active_certificates,
        (SELECT count(*)::int FROM lms.audit_events WHERE created_at>now()-interval '30 days') AS audit_events`);
      return { kind: "admin" as const, ...result.rows[0] };
    }
    if (isEditor) {
      const result = await client.query<EditorOverview>(`SELECT count(*) FILTER (WHERE status='draft')::int AS draft_versions,
        count(*) FILTER (WHERE status='draft' AND review_status IN ('pending','changes_requested'))::int AS pending_reviews
        FROM lms.course_versions`);
      return { kind: "editor" as const, ...result.rows[0] };
    }
    const result = await client.query<SupportOverview>(`SELECT count(*) FILTER (WHERE status='open')::int AS open_support,
      count(*) FILTER (WHERE status='in_progress')::int AS in_progress_support FROM lms.support_requests`);
    return { kind: "support" as const, ...result.rows[0] };
  });

  const cards = [
    ...(isEditor ? [{ href: "/admin/courses", title: "Courses and review", description: "Prepare course versions, inspect review status, and see release checks." }] : []),
    ...(isAdmin ? [
      { href: "/admin/operations", title: "Operations and audit", description: "Review enrollments, completions, audit activity, and platform operations." },
      { href: "/admin/audit", title: "Audit history", description: "Filter recent staff actions by record, action, and date." },
      { href: "/admin/certificates", title: "Certificates", description: "Inspect issued credentials and record reasoned revocation or reissue actions." },
      { href: "/admin/mail-delivery", title: "Mail delivery", description: "Review safe delivery-failure metadata and troubleshoot the configured relay." },
      { href: "/admin/pilot", title: "Controlled pilot", description: "Manage invitations for approved courses and review privacy-limited cohort feedback." },
    ] : []),
    ...(isSupport ? [{ href: "/admin/support", title: "Learner support", description: "Review learner requests, update their status, and leave internal notes." }] : []),
  ];

  return <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy-800">Protected administration</p>
    <h1 className="mt-2 break-words text-3xl font-bold tracking-tight sm:text-4xl">Welcome to the admin workspace</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Your tools are based on your assigned staff roles. Learner records are shown only on the pages needed to handle their work.</p>

    {metrics.kind === "admin" && <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Admin overview">
      {[ ["Draft course versions", metrics.draft_versions], ["Awaiting review or changes", metrics.pending_reviews], ["Open support requests", metrics.open_support], ["Failed mail attempts · 30 days", metrics.failed_mail], ["Active certificates", metrics.active_certificates], ["Audit events · 30 days", metrics.audit_events] ].map(([label, value]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-600">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums text-navy-950">{value}</p></article>)}
    </section>}
    {metrics.kind === "editor" && <section className="mt-7 grid gap-3 sm:grid-cols-2" aria-label="Course editor overview">{[["Draft versions", metrics.draft_versions], ["Awaiting review or changes", metrics.pending_reviews]].map(([label, value]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-600">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums text-navy-950">{value}</p></article>)}</section>}
    {metrics.kind === "support" && <section className="mt-7 grid gap-3 sm:grid-cols-2" aria-label="Support queue overview">{[["Open requests", metrics.open_support], ["In progress", metrics.in_progress_support]].map(([label, value]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-600">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums text-navy-950">{value}</p></article>)}</section>}

    <section className="mt-9" aria-labelledby="admin-tools-heading"><h2 id="admin-tools-heading" className="text-xl font-bold">Your admin tools</h2><ul className="mt-4 grid gap-4 md:grid-cols-2">{cards.map((card) => <li key={card.href} className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-bold">{card.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p><Link className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-navy-900 px-4 py-2.5 text-sm font-bold text-navy-950" href={card.href}>Open {card.title.toLowerCase()}</Link></li>)}</ul></section>

    {process.env.NODE_ENV === "development" && (isAdmin || isEditor) && <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5"><p className="text-xs font-bold uppercase tracking-wide text-amber-950">Local development tools</p><h2 className="mt-1 text-lg font-bold text-amber-950">Development-only diagnostics</h2><p className="mt-2 text-sm leading-6 text-amber-950">These pages inspect local services and one-time auth mail previews. They are separate from learner and content operations and are not available in production.</p><div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">{isAdmin && <><Link className="underline" href="/admin/local">Local service health</Link><Link className="underline" href="/admin/mail">Local auth mail previews</Link></>}{isEditor && <Link className="underline" href="/admin/curriculum">Read-only curriculum preview</Link>}</div></section>}
  </main>;
}

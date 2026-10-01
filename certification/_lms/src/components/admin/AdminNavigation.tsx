"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminWorkspaceRole } from "@/lib/learner";
import SignOutButton from "@/components/auth/SignOutButton";

type AdminLink = { href: string; label: string; roles: AdminWorkspaceRole[]; localOnly?: boolean };

const adminLinks: AdminLink[] = [
  { href: "/admin", label: "Workspace", roles: ["admin", "course_editor", "support"] },
  { href: "/admin/courses", label: "Courses and review", roles: ["admin", "course_editor"] },
  { href: "/admin/operations", label: "Operations", roles: ["admin"] },
  { href: "/admin/audit", label: "Audit history", roles: ["admin"] },
  { href: "/admin/support", label: "Learner support", roles: ["admin", "support"] },
  { href: "/admin/mail-delivery", label: "Mail delivery", roles: ["admin"] },
  { href: "/admin/certificates", label: "Certificates", roles: ["admin"] },
  { href: "/admin/pilot", label: "Controlled pilot", roles: ["admin"] },
  { href: "/admin/curriculum", label: "Local curriculum preview", roles: ["admin", "course_editor"], localOnly: true },
  { href: "/admin/local", label: "Local service health", roles: ["admin"], localOnly: true },
  { href: "/admin/mail", label: "Local auth mail previews", roles: ["admin"], localOnly: true },
];

export default function AdminNavigation({ name, roles, localDevelopment }: { name: string | null; roles: AdminWorkspaceRole[]; localDevelopment: boolean }) {
  const pathname = usePathname() ?? "";
  const roleSet = new Set(roles);
  const links = adminLinks.filter((link) => link.roles.some((role) => roleSet.has(role)) && (!link.localOnly || localDevelopment));
  return <header className="border-b border-slate-200 bg-white">
    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
      <div className="flex items-center justify-between gap-3"><Link href="/admin" className="font-bold text-navy-950">Admin workspace</Link><span className="text-xs text-slate-500 lg:hidden">{name?.trim() || "Staff"}</span></div>
      <nav aria-label="Administration navigation" className="-mx-4 flex min-w-0 gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
        {links.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm font-semibold ${active ? "bg-navy-50 text-navy-950" : "text-slate-700 hover:bg-navy-50 hover:text-navy-950"}`}>{link.label}</Link>;
        })}
      </nav>
      <div className="hidden items-center gap-3 lg:flex"><span className="text-xs text-slate-500">{name?.trim() || "Staff"}</span><SignOutButton /></div>
      <div className="lg:hidden"><SignOutButton /></div>
    </div>
  </header>;
}

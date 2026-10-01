"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/auth/SignOutButton";

const links = [
  { href: "/dashboard", label: "My learning", matches: (path: string) => path === "/dashboard" || path.startsWith("/learn/") },
  { href: "/courses", label: "Explore courses", matches: (path: string) => path === "/courses" || path.startsWith("/courses/") },
  { href: "/account", label: "Account", matches: (path: string) => path === "/account" },
  { href: "/help", label: "Help", matches: (path: string) => path === "/help" || path.startsWith("/help/") },
];

export default function LearnerNavigation({ name }: { name: string | null }) {
  const pathname = usePathname();
  const displayName = name?.trim() || "Learner";
  return <div className="border-b border-slate-200 bg-white">
    <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
      <p className="hidden shrink-0 text-sm font-semibold text-slate-600 md:block">Student area <span className="text-slate-400" aria-hidden="true">/</span> <span className="text-navy-950">{displayName}</span></p>
      <nav aria-label="Student navigation" className="-mx-4 flex min-w-0 gap-1 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
        {links.map((link) => {
          const active = link.matches(pathname ?? "");
          return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm font-semibold transition-colors ${active ? "bg-navy-50 text-navy-950" : "text-slate-700 hover:bg-slate-50 hover:text-navy-950"}`}>
            {link.label}
          </Link>;
        })}
      </nav>
      <div className="flex shrink-0 items-center justify-between gap-3 md:justify-end">
        <span className="text-xs font-medium text-slate-500 md:hidden">Signed in as {displayName}</span>
        <SignOutButton />
      </div>
    </div>
  </div>;
}

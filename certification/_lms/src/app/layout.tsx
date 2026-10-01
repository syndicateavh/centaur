import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: process.env.LMS_PUBLIC_URL ? new URL(process.env.LMS_PUBLIC_URL) : undefined,
  title: { default: "Centaur Learning", template: "%s | Centaur Learning" },
  description: "Explore proposed free learning paths for banking and financial operations roles from Centaur Careers.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <div className="border-b border-navy-950/10 bg-navy-950 px-4 py-2 text-center text-xs font-semibold tracking-wide text-white sm:text-sm">
          A proposed free learning initiative from Centaur Careers <span className="hidden sm:inline">· Enrollment is not open yet</span>
        </div>
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
          <nav aria-label="Main navigation" className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8 lg:px-10">
            <Link href="/" aria-label="Centaur Learning home" className="inline-flex items-center gap-2 rounded-sm text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-700">
              <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-navy-950/10 sm:size-12">
                <Image src="/brand/centaur-careers-logo.jpg" alt="Centaur Careers" width={1440} height={1435} sizes="48px" className="size-full object-cover" priority />
              </span>
              <span className="leading-tight"><span className="block text-sm font-extrabold tracking-tight sm:text-base">Centaur Careers</span><span className="block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Learning</span></span>
            </Link>
            <div className="-mx-4 flex w-[calc(100%+2rem)] min-w-0 flex-nowrap items-center justify-start gap-1 overflow-x-auto px-4 pb-1 text-sm font-semibold text-slate-700 sm:mx-0 sm:w-auto sm:flex-wrap sm:justify-end sm:gap-x-5 sm:gap-y-2 sm:overflow-visible sm:px-0 sm:pb-0">
              <Link href="/courses" className="nav-link inline-flex min-h-11 shrink-0 items-center px-2">Explore tracks</Link>
              <Link href="/faq" className="nav-link inline-flex min-h-11 shrink-0 items-center px-2">FAQs</Link>
              <Link href="/certificates/verify" className="nav-link inline-flex min-h-11 shrink-0 items-center px-2">Verify certificate</Link>
              <Link href="/sign-in" className="nav-link inline-flex min-h-11 shrink-0 items-center px-2">Sign in</Link>
              <Link href="/sign-up" className="nav-link inline-flex min-h-11 shrink-0 items-center px-2">Create account</Link>
              <Link href="/help" className="button-primary inline-flex min-h-11 shrink-0 items-center rounded-lg px-4 py-2.5 text-sm">Help</Link>
              {process.env.NODE_ENV === "development" && <Link href="/admin" className="nav-link inline-flex min-h-11 shrink-0 items-center px-2">Local admin</Link>}
            </div>
          </nav>
        </header>
        {children}
        <footer className="mt-20 border-t border-slate-200 bg-[#f2f4f7]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr] lg:px-10">
            <div>
              <Link href="/" aria-label="Centaur Learning home" className="inline-flex items-center gap-3 text-lg font-extrabold tracking-tight text-navy-950">
                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-navy-950/10"><Image src="/brand/centaur-careers-logo.jpg" alt="" width={1440} height={1435} sizes="40px" className="size-full object-cover" /></span>
                <span>Centaur Learning</span>
              </Link>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">A separate proposed learning platform for practical banking and financial operations foundations.</p>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Explore</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link className="footer-link" href="/courses">Proposed learning tracks</Link></li>
                <li><Link className="footer-link" href="/faq">FAQs and certificate scope</Link></li>
                <li><Link className="footer-link" href="/certificates/verify">Certificate verification</Link></li>
                <li><Link className="footer-link" href="/help">Help and updates</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Important information</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link className="footer-link" href="/privacy">Privacy draft</Link></li>
                <li><Link className="footer-link" href="/terms">Terms draft</Link></li>
              </ul>
              <p className="mt-4 text-xs leading-5 text-slate-500">Educational content only. A Centaur course-completion certificate is not a bank, government, regulator, or employer credential and does not guarantee employment.</p>
            </div>
          </div>
          <div className="border-t border-slate-200 px-5 py-4 text-center text-xs text-slate-500">
            The paid Financial Operations Masterclass is a separate offer from these proposed free learning tracks.
          </div>
        </footer>
      </body>
    </html>
  );
}

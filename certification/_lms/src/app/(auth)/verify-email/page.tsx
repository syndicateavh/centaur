import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import { isAuthEnabled } from "@/lib/auth";

export const metadata: Metadata = { title: "Verify your email", robots: { index: false, follow: false } };
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  return <main id="main-content" className="flex flex-1 flex-col items-center gap-5 px-5 py-12 sm:py-16">{isAuthEnabled() ? <>{status === "verified" && <p role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">Email verified. You can sign in now.</p>}<AuthForm kind="verify" /></> : <p className="mx-auto max-w-lg rounded-xl bg-white p-8">Email verification is not enabled for this environment.</p>}<Link href="/sign-in" className="text-sm text-navy-800 underline">Return to sign in</Link></main>;
}

import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";
import { isAuthEnabled } from "@/lib/auth";
export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function ConfirmResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <main id="main-content" className="flex flex-1 items-start px-5 py-12 sm:justify-center sm:py-16">{isAuthEnabled() ? <AuthForm kind="reset" token={token ?? ""} /> : <p className="mx-auto max-w-lg rounded-xl bg-white p-8">Password reset is not enabled for this environment.</p>}</main>;
}

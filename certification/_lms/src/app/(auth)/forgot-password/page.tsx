import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";
import { isAuthEnabled } from "@/lib/auth";
export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default function ForgotPasswordPage() { return <main id="main-content" className="flex flex-1 items-start px-5 py-12 sm:justify-center sm:py-16">{isAuthEnabled() ? <AuthForm kind="forgot" /> : <p className="mx-auto max-w-lg rounded-xl bg-white p-8">Password reset is not enabled for this environment.</p>}</main>; }

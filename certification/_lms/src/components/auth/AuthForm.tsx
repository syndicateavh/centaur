"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { PRIVACY_NOTICE_VERSION, TERMS_VERSION } from "@/lib/auth-versions";

type FormKind = "sign-up" | "sign-in" | "verify" | "forgot" | "reset";

export default function AuthForm({ kind, token = "", returnTo = "/dashboard" }: { kind: FormKind; token?: string; returnTo?: "/dashboard" | "/account" }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();
  const heading = { "sign-up": "Create your learner account", "sign-in": "Sign in", verify: "Verify your email", forgot: "Reset your password", reset: "Choose a new password" }[kind];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setMessage(""); setBusy(true);
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    try {
      if (kind === "sign-up") {
        if (!accepted) throw new Error("Please accept the privacy notice and terms to continue.");
        const result = await authClient.signUp.email({
          name: String(data.get("name") ?? ""), email, password,
          privacyAccepted: true, termsAccepted: true,
          privacyNoticeVersion: PRIVACY_NOTICE_VERSION, termsVersion: TERMS_VERSION,
          callbackURL: "/verify-email?status=verified",
        });
        if (result.error) throw new Error(result.error.message ?? "Account creation failed.");
        setMessage("If the account can be created, a verification email is ready. In local development, open Local admin → Mail previews.");
      } else if (kind === "sign-in") {
        const result = await authClient.signIn.email({ email, password, callbackURL: returnTo });
        if (result.error) throw new Error("Sign-in failed. Check your details and verify your email address.");
        router.push(returnTo);
        router.refresh();
      } else if (kind === "verify") {
        const result = await authClient.sendVerificationEmail({ email, callbackURL: "/verify-email?status=verified" });
        if (result.error) throw new Error("We could not send the message. Please wait and try again.");
        setMessage("If an account needs verification, a message is ready. Check your inbox or local mail previews.");
      } else if (kind === "forgot") {
        const result = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password/confirm" });
        if (result.error) throw new Error("We could not process the request. Please wait and try again.");
        setMessage("If an account exists for that address, password-reset instructions are ready.");
      } else {
        if (!token) throw new Error("This reset link is missing or invalid. Request a new one.");
        const result = await authClient.resetPassword({ newPassword: password, token });
        if (result.error) throw new Error("This reset link may have expired. Request a new one.");
        setMessage("Password updated. You can now sign in.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The request failed. Please try again.");
    } finally { setBusy(false); }
  }

  return <section className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <h1 className="text-2xl font-bold tracking-tight text-slate-950">{heading}</h1>
    <p className="mt-2 text-sm leading-6 text-slate-600">Internal development flow for the proposed Centaur Learning platform.</p>
    <form className="mt-6 space-y-4" onSubmit={submit} aria-busy={busy}>
      {kind === "sign-up" && <label className="block text-sm font-semibold">Full name<input required name="name" maxLength={100} autoComplete="name" className="form-input" /></label>}
      {(kind !== "reset") && <label className="block text-sm font-semibold">Email address<input required type="email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="form-input" /></label>}
      {(kind === "sign-up" || kind === "sign-in" || kind === "reset") && <label className="block text-sm font-semibold">{kind === "reset" ? "New password" : "Password"}<input required type="password" name="password" minLength={15} maxLength={128} autoComplete={kind === "sign-in" ? "current-password" : "new-password"} aria-describedby="password-help" className="form-input" /><span id="password-help" className="mt-1 block text-xs font-normal text-slate-600">Use at least 15 characters.</span></label>}
      {kind === "sign-up" && <label className="flex items-start gap-3 text-sm leading-6 text-slate-700"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 size-4 accent-navy-800" /><span>I agree to the <Link className="text-navy-800 underline" href="/privacy">privacy notice</Link> and <Link className="text-navy-800 underline" href="/terms">terms</Link>.</span></label>}
      {error && <p role="alert" aria-live="assertive" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}
      {message && <p role="status" aria-live="polite" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-950">{message}</p>}
      <button disabled={busy || (kind === "sign-up" && !accepted)} className="w-full rounded-lg bg-navy-900 px-4 py-3 font-bold text-white hover:bg-navy-800 disabled:opacity-50">{busy ? "Please wait…" : heading}</button>
    </form>
    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-navy-800">{kind !== "sign-in" && <Link href="/sign-in">Sign in</Link>}{kind !== "sign-up" && <Link href="/sign-up">Create account</Link>}{kind !== "forgot" && kind !== "reset" && <Link href="/forgot-password">Forgot password?</Link>}{kind !== "verify" && <Link href="/verify-email">Resend verification</Link>}</div>
  </section>;
}

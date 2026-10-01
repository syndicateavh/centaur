"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function signOut() {
    setBusy(true);
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  }
  return <button type="button" onClick={() => void signOut()} disabled={busy} aria-busy={busy} className="inline-flex min-h-11 items-center text-sm font-semibold text-navy-800 underline disabled:opacity-60">{busy ? "Signing out…" : "Sign out"}</button>;
}

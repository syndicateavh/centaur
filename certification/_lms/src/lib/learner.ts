import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth, isAuthEnabled } from "@/lib/auth";
import { withLearnerTransaction } from "@/lib/learner-db";

export type AccountRole = "learner" | "admin" | "course_editor" | "support";

export async function getCurrentIdentity() {
  if (!isAuthEnabled()) return null;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !session.user.emailVerified) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    emailVerified: session.user.emailVerified,
  };
}

export async function hasAccountRole(userId: string, role: AccountRole) {
  return withLearnerTransaction(userId, async (client) => {
    const result = await client.query("SELECT 1 FROM lms.user_roles WHERE user_id = $1 AND role = $2", [userId, role]);
    return result.rowCount === 1;
  });
}

export async function getCurrentLearner() {
  const identity = await getCurrentIdentity();
  if (!identity || !(await hasAccountRole(identity.id, "learner"))) return null;
  return identity;
}

export async function requireLearner(nextPath: "/dashboard" | "/account" = "/dashboard") {
  const learner = await getCurrentLearner();
  if (!learner) redirect(isAuthEnabled() ? `/sign-in?next=${encodeURIComponent(nextPath)}` : "/sign-in?disabled=1");
  return learner;
}

export async function requireRole(role: AccountRole) {
  const identity = await getCurrentIdentity();
  if (!identity) redirect(isAuthEnabled() ? "/sign-in" : "/sign-in?disabled=1");
  if (!(await hasAccountRole(identity.id, role))) notFound();
  return identity;
}

export async function requireAdmin() {
  return requireRole("admin");
}

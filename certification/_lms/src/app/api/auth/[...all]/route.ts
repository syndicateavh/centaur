import { toNextJsHandler } from "better-auth/next-js";
import { auth, isAuthEnabled } from "@/lib/auth";

const handlers = toNextJsHandler(auth);

function disabled() {
  return Response.json({ message: "Learner accounts are not enabled in this environment." }, { status: 404, headers: { "Cache-Control": "no-store" } });
}

export const GET = (request: Request) => isAuthEnabled() ? handlers.GET(request) : disabled();
export const POST = (request: Request) => isAuthEnabled() ? handlers.POST(request) : disabled();

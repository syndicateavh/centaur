import { NextResponse } from "next/server";
import { readLocalAdminHealth } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const health = await readLocalAdminHealth();
  const status = health.database.status === "unavailable" ? 503 : 200;
  return NextResponse.json(health, { status, headers: { "Cache-Control": "no-store" } });
}

import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** Manual DB wake/ping for free-tier Neon compute. */
export async function POST() {
  const { error } = await requireAdminApi();
  if (error) return error;

  const started = Date.now();
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return NextResponse.json({
      ok: true,
      latencyMs: Date.now() - started,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "DB ping failed";
    return NextResponse.json(
      { ok: false, error: message, latencyMs: Date.now() - started },
      { status: 503 },
    );
  }
}

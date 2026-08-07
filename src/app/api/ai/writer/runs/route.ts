import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { listWriterRuns } from "@/ai/writer";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || "30");

  const runs = await listWriterRuns(Number.isFinite(limit) ? limit : 30);
  return NextResponse.json({ success: true, runs });
}

import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { listPlannerClusters } from "@/ai/planner";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || "50");
  const clusters = await listPlannerClusters(Number.isFinite(limit) ? limit : 50);
  return NextResponse.json({ success: true, clusters });
}

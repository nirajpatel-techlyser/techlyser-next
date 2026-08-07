import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { getContentPlanById } from "@/ai/planner";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await context.params;
  const plan = await getContentPlanById(id);
  if (!plan) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    planId: plan.id,
    horizon: plan.horizon,
    linkMap: plan.linkMap,
  });
}

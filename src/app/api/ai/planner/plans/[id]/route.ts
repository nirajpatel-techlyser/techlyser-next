import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { activateContentPlan, getContentPlanById } from "@/ai/planner";

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
  return NextResponse.json({ success: true, plan });
}

export async function POST(request: Request, context: RouteContext) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { action?: string };

  if (body.action !== "activate") {
    return NextResponse.json(
      { success: false, error: "Unsupported action" },
      { status: 400 },
    );
  }

  try {
    const plan = await activateContentPlan(id);
    return NextResponse.json({ success: true, plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Activate failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

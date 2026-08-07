import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { generateContentPlans } from "@/ai/planner";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      opportunityLimit?: number;
      maxClusters?: number;
      maxSupportingPerCluster?: number;
      locale?: string;
    };

    const report = await generateContentPlans({
      opportunityLimit: body.opportunityLimit,
      maxClusters: body.maxClusters,
      maxSupportingPerCluster: body.maxSupportingPerCluster,
      locale: body.locale,
    });

    return NextResponse.json({ success: true, report });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Planner failed";
    console.error("[api.ai.planner.generate]", err);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

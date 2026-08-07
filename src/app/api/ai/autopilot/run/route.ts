import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { runDailyAutopilot } from "@/ai/autopilot";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      dryRun?: boolean;
      refreshMarket?: boolean;
    };
    const report = await runDailyAutopilot({
      dryRun: body.dryRun,
      refreshMarket: body.refreshMarket,
    });
    return NextResponse.json({ success: true, report });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Autopilot failed";
    console.error("[api.ai.autopilot.run]", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

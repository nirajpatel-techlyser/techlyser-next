import { NextResponse } from "next/server";
import { runDailyAutopilot } from "@/ai/autopilot";

export const runtime = "nodejs";
export const maxDuration = 300;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV === "development";
  }
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/**
 * Daily autopilot cron endpoint.
 * Vercel Cron sends Authorization: Bearer CRON_SECRET when CRON_SECRET is set.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Cron always respects once-per-day (env default true).
    const report = await runDailyAutopilot({ oncePerDay: true });
    return NextResponse.json({ success: true, report });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Autopilot failed";
    console.error("[cron.daily-blog]", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}

import { NextResponse } from "next/server";
import { runDailyAutopilot } from "@/ai/autopilot";

export const runtime = "nodejs";
export const maxDuration = 300;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";

  // Preferred: CRON_SECRET (Vercel sends Authorization: Bearer <CRON_SECRET>)
  if (secret) {
    return auth === `Bearer ${secret}`;
  }

  // Local/dev without secret
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // Production fallback when CRON_SECRET was never set — still allow Vercel Cron
  // invocations. Set CRON_SECRET in Vercel env for proper security.
  if (isVercelCron) {
    console.warn(
      "[cron.daily-blog] CRON_SECRET is missing. Allowing x-vercel-cron request. Set CRON_SECRET in Vercel.",
    );
    return true;
  }

  return false;
}

/**
 * Daily autopilot cron endpoint.
 * Vercel Cron sends Authorization: Bearer CRON_SECRET when CRON_SECRET is set.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    console.error("[cron.daily-blog] Unauthorized cron request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Cron: write-first. Skip slow market research so Vercel never times out
    // before a DRAFT is saved. Admin button still refreshes market signals.
    const report = await runDailyAutopilot({
      oncePerDay: true,
      refreshMarket: false,
    });
    console.info("[cron.daily-blog] result", {
      skipped: report.skipped,
      skipReason: report.skipReason,
      slug: report.slug,
      blogId: report.blogId,
      status: report.steps.done?.detail,
    });
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

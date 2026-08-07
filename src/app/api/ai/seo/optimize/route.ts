import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { optimizeSeoAndGeo, seoOptimizeInputSchema } from "@/ai/seo";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = await request.json();
    const input = seoOptimizeInputSchema.parse(body);
    const report = await optimizeSeoAndGeo(input);
    return NextResponse.json({ success: true, report });
  } catch (err) {
    const message = err instanceof Error ? err.message : "SEO/GEO failed";
    console.error("[api.ai.seo.optimize]", err);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

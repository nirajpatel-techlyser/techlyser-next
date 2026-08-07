import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { getSeoGeoRun } from "@/ai/seo";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await context.params;
  const run = await getSeoGeoRun(id);
  if (!run) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, run });
}

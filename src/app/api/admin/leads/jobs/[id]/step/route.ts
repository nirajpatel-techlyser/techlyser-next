import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { cancelResearchJob, stepResearchJob } from "@/leads/research";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { cancel?: boolean };
  if (body.cancel) {
    await cancelResearchJob(id);
    return NextResponse.json({ jobId: id, status: "CANCELLED", done: true });
  }
  const result = await stepResearchJob(id);
  if ("error" in result && result.status === 404) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  return NextResponse.json(result);
}

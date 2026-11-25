import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import {
  cancelDiscoveryJob,
  stepDiscoveryJob,
} from "@/lib/business-discovery/discover";

export const runtime = "nodejs";
/** Hobby plan max is 60s — keep Overpass attempts short so this finishes with a JSON error. */
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
    await cancelDiscoveryJob(id);
    return NextResponse.json({ jobId: id, status: "CANCELLED", done: true });
  }

  const result = await stepDiscoveryJob(id);
  if ("error" in result && result.status === 404) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  return NextResponse.json(result);
}

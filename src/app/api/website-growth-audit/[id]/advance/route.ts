import { NextResponse } from "next/server";
import { advanceWebsiteAudit } from "@/website-audit";

type Ctx = { params: Promise<{ id: string }> };

export const maxDuration = 60;

export async function POST(_request: Request, context: Ctx) {
  const { id } = await context.params;
  try {
    const result = await advanceWebsiteAudit(id);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Advance failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

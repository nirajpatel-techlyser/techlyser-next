import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { generateArticleDraft, writerInputSchema } from "@/ai/writer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = await request.json();
    const input = writerInputSchema.parse(body);
    const report = await generateArticleDraft(input);

    return NextResponse.json({ success: true, report });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Writer failed";
    console.error("[api.ai.writer.generate]", err);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

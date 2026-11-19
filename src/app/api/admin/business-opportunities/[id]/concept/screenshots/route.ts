import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { getLatestConcept } from "@/lib/business-website-generator/generate-concept";
import { captureConceptScreenshots } from "@/lib/business-website-generator/screenshots";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;

  const concept = await getLatestConcept(id);
  if (!concept || concept.generationStatus !== "READY") {
    return NextResponse.json(
      { error: "Generate a READY concept before capturing screenshots." },
      { status: 400 },
    );
  }

  try {
    const shots = await captureConceptScreenshots(concept.id);
    return NextResponse.json({
      ...shots,
      note: "Screenshots captured from the rendered concept preview.",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Screenshot capture failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

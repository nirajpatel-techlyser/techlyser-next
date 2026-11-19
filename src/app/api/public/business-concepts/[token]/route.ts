import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyConceptPreviewToken } from "@/lib/business-website-generator/preview-token";

export const runtime = "nodejs";

/** Public HTML for thum.io screenshots — token must be valid and unexpired. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const conceptId = verifyConceptPreviewToken(decodeURIComponent(token));
  if (!conceptId) {
    return new NextResponse("Preview expired or invalid.", { status: 401 });
  }

  const concept = await prisma.businessWebsiteConcept.findUnique({
    where: { id: conceptId },
    select: { generatedHtml: true, generationStatus: true },
  });
  if (!concept?.generatedHtml) {
    return new NextResponse("Concept not found.", { status: 404 });
  }

  return new NextResponse(concept.generatedHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

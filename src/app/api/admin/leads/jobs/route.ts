import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { createResearchJob } from "@/leads/research";
import { googleCseConfigured } from "@/leads/providers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { session, error } = await requireAdminApi();
  if (error) return error;
  const body = (await request.json().catch(() => null)) as {
    country?: string;
    city?: string;
    niche?: string;
    keywords?: string;
    limit?: number;
    shopifyOnly?: boolean;
    minScore?: number;
    domains?: string;
  } | null;
  if (!body?.country || !body.niche?.trim()) {
    return NextResponse.json({ error: "Country and niche are required." }, { status: 400 });
  }
  try {
    const job = await createResearchJob({
      country: body.country,
      city: body.city,
      niche: body.niche.trim(),
      keywords: body.keywords?.trim() || body.niche.trim(),
      limit: Number(body.limit) || 10,
      shopifyOnly: body.shopifyOnly !== false,
      minScore: Number(body.minScore) || 50,
      domains: (body.domains || "").split(/\s+/).filter(Boolean),
      userId: session?.user?.email || null,
    });
    return NextResponse.json({ job, searchConfigured: googleCseConfigured() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start research.";
    return NextResponse.json({ error: message, searchConfigured: googleCseConfigured() }, { status: 400 });
  }
}

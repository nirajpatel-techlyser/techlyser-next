import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { createDiscoveryJob } from "@/lib/business-discovery/discover";
import { listDiscoveryProviders } from "@/lib/business-discovery/providers/registry";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { session, error } = await requireAdminApi();
  if (error) return error;

  const body = (await request.json().catch(() => null)) as {
    countryCode?: string;
    cities?: string[];
    categories?: string[];
    radiusKm?: number;
    resultLimit?: number;
    websiteFilter?: "any" | "no_website_listed" | "unverified";
    requireEmail?: boolean;
    requirePhone?: boolean;
    provider?: string;
  } | null;

  if (!body?.countryCode) {
    return NextResponse.json({ error: "Country is required." }, { status: 400 });
  }

  try {
    const job = await createDiscoveryJob({
      countryCode: body.countryCode,
      cities: body.cities || [],
      categories: body.categories || [],
      radiusKm: body.radiusKm,
      resultLimit: body.resultLimit,
      websiteFilter: body.websiteFilter,
      requireEmail: body.requireEmail,
      requirePhone: body.requirePhone,
      provider: body.provider,
      userId: session?.user?.email || null,
    });
    return NextResponse.json({
      job,
      providers: listDiscoveryProviders(),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not start discovery.";
    return NextResponse.json(
      { error: message, providers: listDiscoveryProviders() },
      { status: 400 },
    );
  }
}

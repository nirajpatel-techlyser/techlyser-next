import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  assertAuditStartAllowed,
  assertClaimAllowed,
  hashIp,
  normalizeAuditUrl,
} from "@/website-audit";

const bodySchema = z.object({
  url: z.string().min(3).max(500),
  email: z.string().email(),
  name: z.string().max(120).optional().nullable(),
  companyName: z.string().max(160).optional().nullable(),
  consent: z.literal(true),
  marketingConsent: z.boolean().optional(),
  website: z.string().optional(), // honeypot
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = bodySchema.parse(json);
    if (body.website) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const ipHash = hashIp(ip);
    await assertAuditStartAllowed(ipHash);
    await assertClaimAllowed(body.email);

    const normalized = await normalizeAuditUrl(body.url);
    const email = body.email.toLowerCase().trim();

    const lead = await prisma.websiteAuditLead.create({
      data: {
        email,
        name: body.name?.trim() || null,
        companyName: body.companyName?.trim() || null,
        websiteUrl: body.url.trim(),
        marketingConsent: Boolean(body.marketingConsent),
        consentAt: new Date(),
      },
    });

    const audit = await prisma.websiteAudit.create({
      data: {
        websiteUrl: body.url.trim(),
        normalizedUrl: normalized.normalizedUrl,
        status: "PENDING",
        requestIpHash: ipHash,
        leadId: lead.id,
        jobs: {
          create: {
            status: "QUEUED",
            step: "queued",
            progress: 0,
          },
        },
      },
      select: { id: true, status: true, normalizedUrl: true },
    });

    return NextResponse.json({
      success: true,
      auditId: audit.id,
      status: audit.status,
      normalizedUrl: audit.normalizedUrl,
      email,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start audit";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

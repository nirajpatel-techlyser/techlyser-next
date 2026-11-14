import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  assertAuditStartAllowed,
  hashIp,
  normalizeAuditUrl,
} from "@/website-audit";

const bodySchema = z.object({
  url: z.string().min(3).max(500),
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

    const normalized = await normalizeAuditUrl(body.url);
    const audit = await prisma.websiteAudit.create({
      data: {
        websiteUrl: body.url.trim(),
        normalizedUrl: normalized.normalizedUrl,
        status: "PENDING",
        requestIpHash: ipHash,
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
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start audit";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  assertClaimAllowed,
  completeAuditWithEmail,
} from "@/website-audit";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional().nullable(),
  companyName: z.string().max(160).optional().nullable(),
  consent: z.literal(true),
  marketingConsent: z.boolean().optional(),
  website: z.string().optional(), // honeypot
});

export const maxDuration = 120;

export async function POST(request: Request, context: Ctx) {
  const { id } = await context.params;
  try {
    const json = await request.json();
    const body = bodySchema.parse(json);
    if (body.website) {
      return NextResponse.json({ success: true, skipped: true });
    }
    await assertClaimAllowed(body.email);
    const result = await completeAuditWithEmail({
      auditId: id,
      email: body.email,
      name: body.name,
      companyName: body.companyName,
      marketingConsent: body.marketingConsent,
    });
    if (result.emailSent === false) {
      return NextResponse.json({
        success: true,
        ...result,
        warning:
          result.emailError ||
          "Report was saved, but email delivery failed. Please try again or contact Techlyser.",
      });
    }
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send report";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

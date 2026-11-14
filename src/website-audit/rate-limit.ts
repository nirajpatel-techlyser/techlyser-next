import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export function hashIp(ip: string | null | undefined) {
  const value = (ip || "unknown").trim() || "unknown";
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export async function assertAuditStartAllowed(ipHash: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.websiteAudit.count({
    where: { requestIpHash: ipHash, createdAt: { gte: since } },
  });
  if (count >= 5) {
    throw new Error("Rate limit reached. Please try again in about an hour.");
  }
}

export async function assertClaimAllowed(email: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.websiteAuditLead.count({
    where: { email: email.toLowerCase(), createdAt: { gte: since } },
  });
  if (count >= 8) {
    throw new Error("Too many report requests for this email. Please try later.");
  }
}

import { PrismaClient } from "@prisma/client";
import { normalizeAuthEnv } from "@/lib/env";

normalizeAuthEnv();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * Dev servers keep a global PrismaClient across HMR. After schema changes,
 * that stale instance lacks new model delegates (opportunity, aiWriterRun, …).
 * Recreate when required AI models are missing.
 */
function hasAiModels(client: PrismaClient) {
  const c = client as PrismaClient & {
    opportunity?: unknown;
    contentPlan?: unknown;
    aiWriterRun?: unknown;
    aiSeoGeoRun?: unknown;
    researchItem?: unknown;
  };
  return Boolean(
    c.opportunity &&
      c.contentPlan &&
      c.aiWriterRun &&
      c.aiSeoGeoRun &&
      c.researchItem,
  );
}

function getPrismaClient() {
  const existing = globalForPrisma.prisma;
  if (existing && hasAiModels(existing)) {
    return existing;
  }

  if (existing) {
    void existing.$disconnect().catch(() => undefined);
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrismaClient();

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

// Reuse one client per serverless isolate (prod + dev).
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;

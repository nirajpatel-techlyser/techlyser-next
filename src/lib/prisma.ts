import { PrismaClient } from "@prisma/client";

function normalizeDatabaseUrl() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return;

  // Vercel/env UIs often keep wrapping quotes as part of the value.
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    process.env.DATABASE_URL = raw.slice(1, -1);
  }
}

normalizeDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

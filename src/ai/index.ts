/**
 * Techlyser AI Growth Operating System
 *
 * Lightweight barrel only — types + metadata.
 * Import engines from their own paths (`@/ai/research`, `@/ai/writer`, …)
 * so Admin UI never eagerly loads Prisma-backed source registries.
 */

export * from "./types";
export { AI_GROWTH_OS } from "./meta";

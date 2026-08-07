/**
 * Memory Layer — contracts only (Phase 1).
 *
 * Responsibility:
 * - Durable brand facts, ICP, offers, disallowed claims
 * - Short-term run context for agent steps
 * - Future: vector store refs (Supabase pgvector) without leaking PII
 */

export type MemoryScope = "brand" | "run" | "topic" | "user";

export type MemoryRecord = {
  id: string;
  scope: MemoryScope;
  key: string;
  value: string;
  metadata?: Record<string, unknown>;
};

export function createMemoryService() {
  return {
    async remember(_record: Omit<MemoryRecord, "id">): Promise<MemoryRecord> {
      throw new Error("Memory service not implemented (Phase 1 architecture only).");
    },
    async recall(_query: {
      scope: MemoryScope;
      key?: string;
      limit?: number;
    }): Promise<MemoryRecord[]> {
      throw new Error("Memory service not implemented (Phase 1 architecture only).");
    },
  };
}

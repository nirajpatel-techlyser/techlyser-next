/**
 * Shared AI utilities — pure helpers only (Phase 1).
 * Keep side-effect free so Server Components and agents can share them.
 */

export function slugifyAiKey(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

export function assertPhaseCapability(phaseRequired: number, currentPhase = 1): void {
  if (currentPhase < phaseRequired) {
    throw new Error(
      `AI Growth OS capability requires phase ${phaseRequired}; currently in phase ${currentPhase}.`,
    );
  }
}

export function truncateForContext(text: string, maxChars = 4000): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars - 1)}…`;
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GeneratePlansButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate() {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/ai/planner/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityLimit: 40,
          maxClusters: 8,
          maxSupportingPerCluster: 4,
        }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        report?: {
          itemCount: number;
          clusterIds: string[];
          linkEdgeCount: number;
        };
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Generate failed");
      }

      setMessage(
        `Created ${payload.report?.clusterIds.length || 0} clusters, ${payload.report?.itemCount || 0} plan items, ${payload.report?.linkEdgeCount || 0} link edges.`,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generate failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onGenerate}
        disabled={loading}
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Generating plans…" : "Generate plans from opportunities"}
      </button>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ActivatePlanButton({ planId }: { planId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onActivate() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/ai/planner/plans/${planId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate" }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
      };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Activate failed");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Activate failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onActivate}
        disabled={loading}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
      >
        {loading ? "Activating…" : "Activate plan"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

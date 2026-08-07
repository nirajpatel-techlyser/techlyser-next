"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RunAutopilotButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onRun() {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/ai/autopilot/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        report?: {
          skipped?: boolean;
          skipReason?: string;
          blogId?: string;
          slug?: string;
          steps?: Record<string, { ok: boolean; detail?: string }>;
        };
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Autopilot failed");
      }

      const r = payload.report;
      if (r?.skipped) {
        setMessage(`Skipped: ${r.skipReason || "unknown"}`);
      } else {
        setMessage(
          `Draft created: ${r?.slug || "—"} · ${r?.steps?.done?.detail || "done"}`,
        );
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Autopilot failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onRun}
        disabled={loading}
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Running autopilot…" : "Run daily autopilot now"}
      </button>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LEAD_MARKETS } from "@/leads/markets";

export default function DiscoverForm({ searchConfigured }: { searchConfigured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setProgress("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/leads/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country: form.get("country"),
        city: form.get("city"),
        niche: form.get("niche"),
        keywords: form.get("keywords"),
        limit: Number(form.get("limit") || 10),
        minScore: Number(form.get("minScore") || 50),
        shopifyOnly: form.get("shopifyOnly") === "on",
        domains: form.get("domains"),
      }),
    });
    const payload = (await response.json()) as { error?: string; job?: { id: string } };
    if (!response.ok || !payload.job) {
      setError(payload.error || "Research could not start.");
      setBusy(false);
      return;
    }
    let done = false;
    let failed = false;
    for (let attempt = 0; attempt < 15 && !done; attempt += 1) {
      const step = await fetch(`/api/admin/leads/jobs/${payload.job.id}/step`, { method: "POST" });
      const state = (await step.json()) as {
        done?: boolean;
        cursor?: number;
        total?: number;
        error?: string;
        errorMessage?: string | null;
      };
      if (!step.ok) {
        failed = true;
        setError(state.error || "Research step failed.");
        break;
      }
      setProgress(
        state.total
          ? `Checked ${state.cursor || 0} of ${state.total}${state.errorMessage ? `. Last error: ${state.errorMessage}` : ""}`
          : "Working…",
      );
      done = Boolean(state.done);
    }
    if (!done && !failed) {
      setError("Research paused before every site was checked. Saved leads are kept. Start the same URLs again to continue new domains.");
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <label className="text-sm text-slate-700">
        Target country
        <select name="country" required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">
          {LEAD_MARKETS.map((market) => (
            <option key={market.id} value={market.id}>
              {market.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-slate-700">
        City or region (optional)
        <input name="city" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="text-sm text-slate-700">
        Niche
        <input name="niche" required placeholder="fashion, beauty, home" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="text-sm text-slate-700">
        Keywords
        <input name="keywords" placeholder="shopify plus slow theme" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="text-sm text-slate-700">
        Maximum leads
        <input name="limit" type="number" min={1} max={25} defaultValue={10} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="text-sm text-slate-700">
        Minimum score
        <input name="minScore" type="number" min={0} max={100} defaultValue={50} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
        <input name="shopifyOnly" type="checkbox" defaultChecked />
        Only keep stores with a public Shopify signal as qualified. Others are saved as disqualified.
      </label>
      <label className="text-sm text-slate-700 md:col-span-2">
        Store URLs or domains, one per line
        <textarea
          name="domains"
          rows={4}
          placeholder={"brand.com\nhttps://another-store.com"}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      {!searchConfigured ? (
        <p className="md:col-span-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Google Custom Search is not configured. Paste store URLs to research real sites. The tool will not invent leads.
        </p>
      ) : null}
      {error ? <p className="md:col-span-2 text-sm text-red-700">{error}</p> : null}
      {progress ? <p className="md:col-span-2 text-sm text-slate-600">{progress}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 md:col-span-2 md:w-fit"
      >
        {busy ? "Researching…" : "Start research"}
      </button>
    </form>
  );
}

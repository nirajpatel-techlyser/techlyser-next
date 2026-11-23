"use client";

import Link from "next/link";
import { useState } from "react";
import RunAutopilotButton from "@/components/admin/ai/RunAutopilotButton";

type Flags = {
  analytics: boolean;
  siteSettingsDb: boolean;
  cronAutopilot: boolean;
};

function FlagPill({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        on ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800"
      }`}
    >
      {label}: {on ? "ON (uses CU)" : "OFF (saves CU)"}
    </span>
  );
}

export default function ComputeSaverPanel({ flags }: { flags: Flags }) {
  const [dbMessage, setDbMessage] = useState("");
  const [dbBusy, setDbBusy] = useState(false);

  async function testDb() {
    setDbBusy(true);
    setDbMessage("Testing database…");
    try {
      const response = await fetch("/api/admin/compute/db-ping", {
        method: "POST",
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        latencyMs?: number;
      };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "DB ping failed");
      }
      setDbMessage(`DB OK in ${payload.latencyMs ?? "?"}ms (this woke Neon once).`);
    } catch (err) {
      setDbMessage(err instanceof Error ? err.message : "DB ping failed");
    } finally {
      setDbBusy(false);
    }
  }

  return (
    <section
      id="compute-saver"
      className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        Compute saver (Neon free CU)
      </h2>
      <p className="mt-1 max-w-3xl text-sm text-slate-600">
        Auto jobs that used to wake the database on every visitor / cron are
        off. Run things only when you click — that keeps CU-hours low.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <FlagPill on={flags.analytics} label="Visitor analytics" />
        <FlagPill on={flags.siteSettingsDb} label="Settings DB on every page" />
        <FlagPill on={flags.cronAutopilot} label="Daily cron autopilot" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Manual: create AI blog draft
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Replaces daily cron. Uses DB + AI only when you run it.
          </p>
          <div className="mt-3">
            <RunAutopilotButton />
          </div>
          <Link
            href="/admin/ai/autopilot"
            className="mt-2 inline-block text-xs font-semibold text-primary underline"
          >
            Open Autopilot history
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Manual: business lead Discover
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            OSM search + save leads — only when you submit the form.
          </p>
          <Link
            href="/admin/business-opportunities/discover"
            className="mt-3 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Open Discover
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Manual: Shopify store research
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Lead research job — starts only from the Start research button.
          </p>
          <Link
            href="/admin/lead-generation"
            className="mt-3 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800"
          >
            Open Shopify leads
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Manual: DB ping / wake Neon
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Use before Discover if compute was sleeping. Quota must not be
            exceeded.
          </p>
          <button
            type="button"
            disabled={dbBusy}
            onClick={testDb}
            className="mt-3 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 disabled:opacity-60"
          >
            {dbBusy ? "Pinging…" : "Test database"}
          </button>
          {dbMessage ? (
            <p className="mt-2 text-xs text-slate-600">{dbMessage}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
        <p className="font-semibold text-slate-900">Turn features ON (Vercel env)</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <code>ENABLE_DB_ANALYTICS=true</code> and{" "}
            <code>NEXT_PUBLIC_ENABLE_DB_ANALYTICS=true</code> — visitor
            pageviews
          </li>
          <li>
            <code>ENABLE_DB_SITE_SETTINGS=true</code> — theme/social from DB on
            every public page
          </li>
          <li>
            <code>ENABLE_CRON_AUTOPILOT=true</code> — restore daily cron (also
            re-add cron in <code>vercel.json</code>)
          </li>
        </ul>
        <p className="mt-2">
          Until Neon quota resets / you upgrade, Discover and other DB actions
          will still fail with quota errors — that is Neon billing, not these
          buttons.
        </p>
      </div>
    </section>
  );
}

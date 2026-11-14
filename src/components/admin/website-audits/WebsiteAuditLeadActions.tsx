"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "DISQUALIFIED"] as const;

export default function WebsiteAuditLeadActions({
  leadId,
  status,
  notes,
}: {
  leadId: string;
  status: string;
  notes: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/website-audits/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: form.get("status"),
        notes: form.get("notes"),
      }),
    });
    setBusy(false);
    setMessage(response.ok ? "Saved." : "Could not save.");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <label className="block text-sm text-slate-700">
        Lead status
        <select
          name="status"
          defaultValue={status}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
        >
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm text-slate-700">
        Notes
        <textarea
          name="notes"
          defaultValue={notes}
          rows={4}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save"}
      </button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}

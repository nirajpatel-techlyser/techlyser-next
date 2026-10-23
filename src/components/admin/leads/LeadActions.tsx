"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  "DISCOVERED",
  "NEEDS_REVIEW",
  "QUALIFIED",
  "DISQUALIFIED",
  "CONTACTED",
  "REPLIED",
  "CONVERTED",
] as const;

export default function LeadActions({
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
    const response = await fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: form.get("status"),
        notes: form.get("notes"),
        suppress: form.get("suppress") === "on",
      }),
    });
    setBusy(false);
    setMessage(response.ok ? "Saved." : "Could not save.");
    router.refresh();
  }

  async function drafts() {
    setBusy(true);
    const response = await fetch(`/api/admin/leads/${leadId}/outreach`, { method: "POST" });
    setBusy(false);
    setMessage(response.ok ? "Drafts saved. Nothing was sent." : "Could not draft outreach.");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <label className="block text-sm text-slate-700">
        Status
        <select name="status" defaultValue={status} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm text-slate-700">
        Notes
        <textarea name="notes" defaultValue={notes} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input name="suppress" type="checkbox" />
        Do not research this domain again
      </label>
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Save
        </button>
        <button type="button" disabled={busy} onClick={drafts} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">
          Save outreach drafts
        </button>
      </div>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}

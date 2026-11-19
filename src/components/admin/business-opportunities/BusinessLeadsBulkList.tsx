"use client";

import { useMemo, useState } from "react";
import OpportunityLeadActions from "@/components/admin/business-opportunities/OpportunityLeadActions";

export type BulkLeadRow = {
  id: string;
  businessName: string;
  category: string;
  city: string;
  countryName: string;
  address: string | null;
  phone: string | null;
  websiteUrl: string | null;
  websiteStatus: string;
  leadStatus: string;
  publicEmail: string | null;
  sourceUrl: string | null;
  proposalStatus: string | null;
  outreachLabel: string | null;
};

type BulkPayloadItem = {
  id: string;
  businessName: string;
  whatsappUrl: string | null;
  mailtoUrl: string | null;
  publicListingUrl: string;
  skipWhatsApp?: string;
  skipEmail?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function statusMessage(parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function BusinessLeadsBulkList({ leads }: { leads: BulkLeadRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const allIds = useMemo(() => leads.map((l) => l.id), [leads]);
  const allSelected = allIds.length > 0 && selected.size === allIds.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === allIds.length ? new Set() : new Set(allIds),
    );
  }

  async function fetchBulkPayload() {
    const ids = Array.from(selected);
    const response = await fetch(
      "/api/admin/business-opportunities/bulk-outreach",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      },
    );
    const payload = (await response.json()) as {
      error?: string;
      items?: BulkPayloadItem[];
      note?: string;
    };
    if (!response.ok || !payload.items) {
      throw new Error(payload.error || "Could not prepare outreach.");
    }
    return payload.items;
  }

  async function openLinksSequentially(
    urls: string[],
    label: string,
  ): Promise<number> {
    let opened = 0;
    for (let i = 0; i < urls.length; i++) {
      const win = window.open(urls[i], "_blank", "noopener,noreferrer");
      if (win) opened += 1;
      setMessage(
        statusMessage([
          `${label}: opened ${opened}/${urls.length}`,
          !win && "(popup blocked - allow popups for this site)",
        ]),
      );
      if (i < urls.length - 1) await sleep(700);
    }
    return opened;
  }

  async function sendWhatsApp() {
    if (selected.size === 0) {
      setMessage("Tick at least one lead first.");
      return;
    }
    setBusy(true);
    setMessage("Preparing WhatsApp messages + share links...");
    try {
      const items = await fetchBulkPayload();
      const ready = items.filter((i) => i.whatsappUrl);
      const skipped = items.filter((i) => !i.whatsappUrl);
      if (ready.length === 0) {
        setMessage(
          statusMessage([
            "No WhatsApp numbers on selected leads.",
            skipped[0]?.skipWhatsApp,
          ]),
        );
        return;
      }
      const opened = await openLinksSequentially(
        ready.map((i) => i.whatsappUrl as string),
        "WhatsApp",
      );
      const chatWord = opened === 1 ? "chat" : "chats";
      setMessage(
        statusMessage([
          `WhatsApp: opened ${opened} ${chatWord} with concept links.`,
          skipped.length > 0 && `Skipped ${skipped.length} without phone.`,
          opened < ready.length &&
            "Allow popups if some windows were blocked.",
        ]),
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "WhatsApp bulk failed.");
    } finally {
      setBusy(false);
    }
  }

  async function sendEmail() {
    if (selected.size === 0) {
      setMessage("Tick at least one lead first.");
      return;
    }
    setBusy(true);
    setMessage("Preparing email drafts + share links...");
    try {
      const items = await fetchBulkPayload();
      const ready = items.filter((i) => i.mailtoUrl);
      const skipped = items.filter((i) => !i.mailtoUrl);
      if (ready.length === 0) {
        setMessage(
          statusMessage([
            "No public emails on selected leads.",
            skipped[0]?.skipEmail,
          ]),
        );
        return;
      }
      const opened = await openLinksSequentially(
        ready.map((i) => i.mailtoUrl as string),
        "Email",
      );
      const draftWord = opened === 1 ? "draft" : "drafts";
      setMessage(
        statusMessage([
          `Email: opened ${opened} ${draftWord} with concept links.`,
          skipped.length > 0 && `Skipped ${skipped.length} without email.`,
          opened < ready.length &&
            "Allow popups if some windows were blocked.",
        ]),
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Email bulk failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="h-4 w-4 rounded border-slate-300"
          />
          Select all ({selected.size}/{leads.length})
        </label>
        <button
          type="button"
          disabled={busy || selected.size === 0}
          onClick={sendWhatsApp}
          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Working..." : "Send WhatsApp"}
        </button>
        <button
          type="button"
          disabled={busy || selected.size === 0}
          onClick={sendEmail}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Working..." : "Send email"}
        </button>
        <p className="text-xs text-slate-500">
          Opens WhatsApp / mail with each lead public concept link (confirm send
          in the app).
        </p>
      </div>

      {message ? (
        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      ) : null}

      {leads.map((lead) => (
        <article
          key={lead.id}
          className={`rounded-xl border p-4 ${
            selected.has(lead.id)
              ? "border-emerald-300 bg-emerald-50/40"
              : "border-slate-200"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex gap-3">
              <input
                type="checkbox"
                checked={selected.has(lead.id)}
                onChange={() => toggle(lead.id)}
                className="mt-1 h-4 w-4 rounded border-slate-300"
                aria-label={`Select ${lead.businessName}`}
              />
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {lead.businessName}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {lead.category} · {lead.city}, {lead.countryName}
                </p>
                {lead.address ? (
                  <p className="mt-1 text-xs text-slate-500">{lead.address}</p>
                ) : null}
                <p className="mt-2 text-xs text-slate-600">
                  Website: {lead.websiteStatus}
                  {lead.websiteUrl ? (
                    <>
                      {" "}
                      ·{" "}
                      <a
                        href={lead.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {lead.websiteUrl}
                      </a>
                    </>
                  ) : null}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Phone: {lead.phone || "-"} · Email:{" "}
                  {lead.publicEmail || "-"} · Status: {lead.leadStatus}
                </p>
                {lead.sourceUrl ? (
                  <p className="mt-1 text-xs">
                    <a
                      href={lead.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-500 underline"
                    >
                      Source listing
                    </a>
                  </p>
                ) : null}
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>PDF: {lead.proposalStatus || "not generated"}</p>
              <p className="mt-1">
                Email: {lead.outreachLabel || "no draft"}
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <OpportunityLeadActions
              businessId={lead.id}
              businessName={lead.businessName}
              publicEmail={lead.publicEmail}
              phone={lead.phone}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

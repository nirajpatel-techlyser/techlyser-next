"use client";

import { useState } from "react";
import Link from "next/link";

type DraftPayload = {
  id?: string | null;
  recipientEmail: string;
  senderEmail: string;
  subject: string;
  emailBody: string;
  whatsappBody?: string | null;
  publicListingUrl?: string | null;
};

export default function OpportunityLeadActions({
  businessId,
  businessName,
  publicEmail,
  phone,
}: {
  businessId: string;
  businessName: string;
  publicEmail: string | null;
  phone?: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [panel, setPanel] = useState<"none" | "email">("none");
  const [draft, setDraft] = useState<DraftPayload | null>(null);
  const [manualEmail, setManualEmail] = useState(publicEmail || "");
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  async function ensureShareUrl() {
    const response = await fetch(
      `/api/admin/business-opportunities/${businessId}/public-listing`,
    );
    const payload = (await response.json()) as {
      error?: string;
      url?: string;
    };
    if (!response.ok || !payload.url) {
      throw new Error(payload.error || "Could not create share link.");
    }
    setShareUrl(payload.url);
    return payload.url;
  }

  async function copyShareLink() {
    setBusy(true);
    setMessage("");
    try {
      const url = shareUrl || (await ensureShareUrl());
      await navigator.clipboard.writeText(url);
      setMessage("Share link copied.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Copy failed.");
    } finally {
      setBusy(false);
    }
  }

  async function openShareLink() {
    setBusy(true);
    setMessage("");
    try {
      const url = shareUrl || (await ensureShareUrl());
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not open link.");
    } finally {
      setBusy(false);
    }
  }

  async function copyWhatsAppText() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/admin/business-opportunities/${businessId}/outreach-draft`,
      );
      const payload = (await response.json()) as {
        error?: string;
        draft?: DraftPayload;
        publicListingUrl?: string;
      };
      if (!response.ok || !payload.draft) {
        throw new Error(payload.error || "Could not load WhatsApp draft.");
      }
      if (payload.publicListingUrl) setShareUrl(payload.publicListingUrl);
      const text =
        payload.draft.whatsappBody ||
        `Website concept for ${businessName}: ${payload.publicListingUrl || ""}`;
      await navigator.clipboard.writeText(text);
      setMessage("WhatsApp message copied.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Copy failed.");
    } finally {
      setBusy(false);
    }
  }

  async function loadDraftPanel() {
    setBusy(true);
    setMessage("");
    const response = await fetch(
      `/api/admin/business-opportunities/${businessId}/outreach-draft`,
    );
    const payload = (await response.json()) as {
      error?: string;
      draft?: DraftPayload;
      publicListingUrl?: string;
    };
    setBusy(false);
    if (!response.ok) {
      setMessage(payload.error || "Could not load draft.");
      return;
    }
    setDraft(payload.draft || null);
    if (payload.publicListingUrl) setShareUrl(payload.publicListingUrl);
    if (payload.draft?.recipientEmail) setManualEmail(payload.draft.recipientEmail);
    setPanel("email");
  }

  async function saveDraft() {
    setBusy(true);
    setMessage("");
    const response = await fetch(
      `/api/admin/business-opportunities/${businessId}/outreach-draft`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: manualEmail.trim() || null }),
      },
    );
    const payload = (await response.json()) as {
      error?: string;
      note?: string;
      outreach?: DraftPayload;
      draft?: DraftPayload;
    };
    setBusy(false);
    if (payload.outreach) setDraft(payload.outreach);
    else if (payload.draft) setDraft(payload.draft);
    setMessage(
      payload.note ||
        payload.error ||
        "Draft prepared. Email was not sent.",
    );
    setPanel("email");
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={copyShareLink}
          className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
        >
          Copy share link
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={openShareLink}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        >
          Open public page
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={copyWhatsAppText}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        >
          Copy WhatsApp text
        </button>
        <Link
          href={`/admin/business-opportunities/concepts/${businessId}`}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
        >
          Website studio
        </Link>
        <a
          href={`/api/admin/business-opportunities/${businessId}/proposal-pdf`}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50"
        >
          PDF (optional)
        </a>
        <button
          type="button"
          disabled={busy}
          onClick={loadDraftPanel}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
        >
          Email draft
        </button>
      </div>

      {shareUrl ? (
        <p className="truncate text-[11px] text-emerald-700" title={shareUrl}>
          Share: {shareUrl}
        </p>
      ) : null}

      <p className="text-[11px] text-slate-500">
        {phone ? `Phone ${phone}` : "No phone"}
        {publicEmail ? ` · email ${publicEmail}` : " · no public email (common on OSM)"}
        {" · "}
        {businessName}
      </p>

      {panel === "email" && draft ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Email draft (not sent)</p>
          <label className="mt-2 block">
            Recipient email
            <input
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
              placeholder="owner@example.com"
            />
          </label>
          <p className="mt-2">
            <span className="text-slate-500">Subject:</span> {draft.subject}
          </p>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-2 text-[11px]">
            {draft.emailBody}
          </pre>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={saveDraft}
              className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white"
            >
              Save email body
            </button>
            <button
              type="button"
              className="text-xs underline"
              onClick={() => setPanel("none")}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {message ? <p className="text-xs text-slate-600">{message}</p> : null}
    </div>
  );
}

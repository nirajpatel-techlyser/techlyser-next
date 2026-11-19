"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ConceptPayload = {
  id: string;
  conceptTitle: string;
  generatedHtml: string;
  generationStatus: string;
  previewScreenshotUrl?: string | null;
};

export default function ConceptStudio({
  businessId,
  businessName,
  initialConcept,
  initialPreviewPath,
}: {
  businessId: string;
  businessName: string;
  initialConcept: ConceptPayload | null;
  initialPreviewPath: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [concept, setConcept] = useState(initialConcept);
  const [previewPath, setPreviewPath] = useState(initialPreviewPath);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [desktopShot, setDesktopShot] = useState<string | null>(
    initialConcept?.previewScreenshotUrl || null,
  );

  async function loadShareUrl() {
    const response = await fetch(
      `/api/admin/business-opportunities/${businessId}/public-listing`,
    );
    const payload = (await response.json()) as { url?: string };
    if (payload.url) setShareUrl(payload.url);
    return payload.url || null;
  }

  useEffect(() => {
    if (initialConcept) void loadShareUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount when concept exists
  }, [businessId, initialConcept?.id]);

  async function copyShareLink() {
    setBusy(true);
    setMessage("");
    try {
      const url = shareUrl || (await loadShareUrl());
      if (!url) throw new Error("Share link not ready yet.");
      await navigator.clipboard.writeText(url);
      setMessage("Share link copied.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Copy failed.");
    } finally {
      setBusy(false);
    }
  }

  async function generateConcept() {
    setBusy(true);
    setMessage("Generating design + collecting images…");
    const response = await fetch(
      `/api/admin/business-opportunities/${businessId}/concept`,
      { method: "POST" },
    );
    const payload = (await response.json()) as {
      error?: string;
      note?: string;
      concept?: ConceptPayload;
      previewPath?: string;
      publicListingUrl?: string;
    };
    setBusy(false);
    if (!response.ok || !payload.concept) {
      setMessage(payload.error || "Concept generation failed.");
      return;
    }
    setConcept(payload.concept);
    setPreviewPath(payload.previewPath || null);
    if (payload.publicListingUrl) setShareUrl(payload.publicListingUrl);
    else void loadShareUrl();
    setMessage(payload.note || "Concept ready. Share the public link.");
  }

  async function captureShots() {
    setBusy(true);
    setMessage("Capturing screenshots (public URL required)…");
    const response = await fetch(
      `/api/admin/business-opportunities/${businessId}/concept/screenshots`,
      { method: "POST" },
    );
    const payload = (await response.json()) as {
      error?: string;
      note?: string;
      skipped?: string;
      desktopUrl?: string;
      mobileUrl?: string;
    };
    setBusy(false);
    if (!response.ok) {
      setMessage(payload.error || "Screenshot capture failed.");
      return;
    }
    if (payload.desktopUrl) setDesktopShot(payload.desktopUrl);
    setMessage(
      payload.skipped ||
        payload.note ||
        "Screenshots captured. PDF already draws the business landing page from listing data.",
    );
  }

  async function generatePdf() {
    setBusy(true);
    setMessage("Exporting Website Studio design into PDF…");
    const response = await fetch(
      `/api/admin/business-opportunities/${businessId}/proposal`,
      { method: "POST" },
    );
    const payload = (await response.json()) as {
      error?: string;
      note?: string;
      usedStudioHtml?: boolean;
    };
    setBusy(false);
    setMessage(payload.error || payload.note || "PDF done.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{businessName}</h2>
          <p className="mt-1 text-sm text-slate-600">
            Status: {concept?.generationStatus || "Not generated"}
            {concept ? ` · ${concept.conceptTitle}` : ""}
          </p>
        </div>
        <Link
          href="/admin/business-opportunities/leads"
          className="text-sm font-semibold text-slate-600 underline"
        >
          Back to leads
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={generateConcept}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {concept ? "Regenerate Design" : "Generate Website Design"}
        </button>
        <button
          type="button"
          disabled={busy || !concept}
          onClick={copyShareLink}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Copy share link
        </button>
        {shareUrl ? (
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold"
          >
            Open public page
          </a>
        ) : null}
        <button
          type="button"
          disabled={busy || !concept}
          onClick={captureShots}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          Capture Screenshots
        </button>
        <button
          type="button"
          disabled={busy || !concept}
          onClick={generatePdf}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-60"
        >
          Generate PDF (optional)
        </button>
        <a
          href={`/api/admin/business-opportunities/${businessId}/proposal-pdf`}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
        >
          Download PDF
        </a>
      </div>

      {shareUrl ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Share URL:{" "}
          <a href={shareUrl} target="_blank" rel="noreferrer" className="underline">
            {shareUrl}
          </a>
        </p>
      ) : null}

      {message ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </p>
      ) : null}

      {concept?.generatedHtml ? (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                device === "desktop"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Desktop preview
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                device === "mobile"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Mobile preview
            </button>
            {previewPath ? (
              <a
                href={previewPath}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
              >
                Full-page preview
              </a>
            ) : null}
          </div>
          <div className="flex justify-center overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-4">
            <iframe
              title={`${businessName} concept`}
              srcDoc={concept.generatedHtml}
              className={`bg-white shadow-sm ${
                device === "mobile"
                  ? "h-[720px] w-[390px] rounded-[28px]"
                  : "h-[720px] w-full max-w-5xl rounded-xl"
              }`}
            />
          </div>
          {desktopShot ? (
            <p className="text-xs text-slate-500">
              Latest desktop screenshot stored for PDF embedding.
            </p>
          ) : null}
        </section>
      ) : (
        <p className="text-sm text-slate-600">
          Generate a website design to preview the category-specific landing
          page here.
        </p>
      )}
    </div>
  );
}

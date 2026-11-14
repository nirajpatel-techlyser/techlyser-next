"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import AuditEmailModal, {
  type AuditEmailPayload,
} from "@/components/website-audit/AuditEmailModal";

export default function WebsiteAuditStrip() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    setError("");
    setModalOpen(true);
  }

  async function onConfirmEmail(payload: AuditEmailPayload) {
    const trimmed = url.trim();
    if (!trimmed) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/website-growth-audit/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmed,
          email: payload.email,
          name: payload.name,
          consent: true,
        }),
      });
      const data = (await response.json()) as {
        success?: boolean;
        auditId?: string;
        error?: string;
      };
      if (!response.ok || !data.auditId) {
        throw new Error(data.error || "Could not start audit");
      }
      setModalOpen(false);
      router.push(`/website-growth-audit?id=${encodeURIComponent(data.auditId)}`);
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Could not start audit");
    }
  }

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-3xl px-4 py-3.5 sm:px-6 sm:py-4">
        <form
          onSubmit={onSubmit}
          className="mx-auto flex w-full max-w-2xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-3"
        >
          <p className="shrink-0 text-center text-sm font-bold tracking-tight text-slate-900 sm:text-left sm:text-base">
            Get Free Website Audit
          </p>
          <input
            type="text"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="w-full min-w-0 rounded-[5px] border border-slate-900 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary sm:max-w-xs"
            aria-label="Website URL to audit"
          />
          <button
            type="submit"
            disabled={busy}
            className="btn-brand inline-flex shrink-0 items-center justify-center gap-2 rounded-[5px] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Check My Site
          </button>
        </form>
        {error ? (
          <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-red-600">{error}</p>
        ) : null}
      </div>

      <AuditEmailModal
        open={modalOpen}
        websiteUrl={url.trim() || "your website"}
        busy={busy}
        onClose={() => {
          if (!busy) setModalOpen(false);
        }}
        onConfirm={onConfirmEmail}
      />
    </div>
  );
}

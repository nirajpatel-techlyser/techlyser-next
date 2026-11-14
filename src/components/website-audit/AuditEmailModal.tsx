"use client";

import { FormEvent, useState } from "react";
import { Loader2, X } from "lucide-react";

export type AuditEmailPayload = {
  email: string;
  name?: string;
  consent: true;
};

export default function AuditEmailModal({
  open,
  websiteUrl,
  busy,
  onClose,
  onConfirm,
}: {
  open: boolean;
  websiteUrl: string;
  busy?: boolean;
  onClose: () => void;
  onConfirm: (payload: AuditEmailPayload) => void | Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);

  if (!open) return null;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!consent) return;
    await onConfirm({
      email: email.trim(),
      name: name.trim() || undefined,
      consent: true,
    });
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-email-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="audit-email-title" className="text-lg font-bold text-slate-900">
              Where should we send your report?
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Enter your email to start the audit for{" "}
              <span className="font-medium text-slate-900">{websiteUrl}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Business email"
            className="w-full rounded-[5px] border border-slate-900/80 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            className="w-full rounded-[5px] border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary"
          />
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
            />
            <span>
              I agree to receive my requested website audit report from Techlyser.
            </span>
          </label>
          <button
            type="submit"
            disabled={busy || !consent}
            className="btn-brand inline-flex w-full items-center justify-center gap-2 rounded-[5px] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Start Analysis
          </button>
        </form>
      </div>
    </div>
  );
}

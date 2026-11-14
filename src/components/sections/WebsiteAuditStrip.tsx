"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import Container from "@/components/ui/Container";

export default function WebsiteAuditStrip() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    setBusy(true);
    router.push(
      `/website-growth-audit?url=${encodeURIComponent(trimmed)}`,
    );
  }

  return (
    <div className="border-b border-slate-200 bg-white shadow-[0_8px_24px_-16px_rgba(0,0,0,0.35)]">
      <Container>
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:py-4"
        >
          <p className="shrink-0 text-sm font-bold tracking-tight text-slate-900 sm:text-base">
            Get Free Website Audit
          </p>
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full rounded-[5px] border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary"
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
          </div>
        </form>
      </Container>
    </div>
  );
}

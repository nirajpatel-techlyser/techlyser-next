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
    <div className="border-b border-white/10 bg-primary/15">
      <Container>
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:py-3.5"
        >
          <p className="shrink-0 text-sm font-semibold text-hero-fg sm:max-w-55 lg:max-w-none">
            Free Website Growth Audit
            <span className="mt-0.5 block text-xs font-normal text-hero-fg-muted sm:inline sm:mt-0 sm:ml-2">
              Paste your site URL — any platform.
            </span>
          </p>
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full rounded-[5px] border border-white/15 bg-black/25 px-3 py-2.5 text-sm text-hero-fg outline-none placeholder:text-hero-fg-muted focus:border-primary"
              aria-label="Website URL to audit"
            />
            <button
              type="submit"
              disabled={busy}
              className="btn-brand inline-flex shrink-0 items-center justify-center gap-2 rounded-[5px] px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
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

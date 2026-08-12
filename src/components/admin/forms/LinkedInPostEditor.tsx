"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import TiptapEditor from "@/components/admin/editor/TiptapEditor";

function htmlToPlainText(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type Props = {
  label: string;
  hint: string;
  value: string;
  onChange: (html: string) => void;
};

export default function LinkedInPostEditor({
  label,
  hint,
  value,
  onChange,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function copyPlainText() {
    const text = htmlToPlainText(value || "");
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </h3>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>
        <button
          type="button"
          onClick={copyPlainText}
          disabled={!value?.replace(/<[^>]+>/g, "").trim()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy for LinkedIn
            </>
          )}
        </button>
      </div>
      <div className="mt-4">
        <TiptapEditor value={value} onChange={onChange} />
      </div>
    </div>
  );
}

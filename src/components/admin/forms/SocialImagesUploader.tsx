"use client";

import { ChangeEvent, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import CoverImage from "@/components/media/CoverImage";

const MAX_SOCIAL_IMAGES = 6;

type SocialImagesUploaderProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
};

export default function SocialImagesUploader({
  value,
  onChange,
  max = MAX_SOCIAL_IMAGES,
}: SocialImagesUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlDraft, setUrlDraft] = useState("");

  async function uploadOne(file: File): Promise<string> {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      throw new Error(data.error || "Upload failed");
    }
    return data.url;
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    const room = max - value.length;
    if (room <= 0) {
      setError(`Maximum ${max} social images.`);
      return;
    }

    const accepted = files.filter((file) => file.type.startsWith("image/"));
    if (accepted.length === 0) {
      setError("Only image files are allowed.");
      return;
    }
    if (accepted.length < files.length) {
      setError("Only image files are allowed. Non-image files were skipped.");
    } else {
      setError("");
    }

    const batch = accepted.slice(0, room);
    setUploading(true);
    try {
      // Accumulate locally so multi-select does not lose earlier files to a stale React value.
      const next = [...value];
      for (const file of batch) {
        const url = await uploadOne(file);
        next.push(url);
        onChange(next.slice(0, max));
      }
      if (accepted.length > room) {
        setError(`Maximum ${max} social images. Extra files were skipped.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= value.length) return;
    const copy = [...value];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    onChange(copy);
  }

  function addUrl() {
    const url = urlDraft.trim();
    if (!url) return;
    if (value.length >= max) {
      setError(`Maximum ${max} social images.`);
      return;
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") {
        setError("Use an https image URL.");
        return;
      }
    } catch {
      setError("Invalid image URL.");
      return;
    }
    setError("");
    onChange([...value, url].slice(0, max));
    setUrlDraft("");
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Order is preserved on Instagram carousel, Facebook, and LinkedIn (1 → {max}).
        Website blog still uses Featured Image only. Google Business uses Featured Image.
      </p>

      {value.length > 0 ? (
        <ul className="space-y-3">
          {value.map((url, index) => (
            <li
              key={`${url}-${index}`}
              className="overflow-hidden rounded-2xl border border-slate-200"
            >
              <div className="relative aspect-video bg-slate-100">
                <CoverImage
                  src={url}
                  alt={`Social image ${index + 1}`}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-slate-700 shadow"
                  aria-label={`Remove social image ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-2">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="text-xs font-semibold text-slate-700 disabled:opacity-40"
                >
                  Move up
                </button>
                <button
                  type="button"
                  disabled={index === value.length - 1}
                  onClick={() => move(index, 1)}
                  className="text-xs font-semibold text-slate-700 disabled:opacity-40"
                >
                  Move down
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {value.length < max ? (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-primary hover:bg-primary/5">
          <Upload className="h-6 w-6 text-primary" />
          <p className="mt-3 text-sm font-medium text-slate-800">
            {uploading ? "Uploading…" : "Add social images"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {value.length}/{max} · PNG, JPG, WEBP up to 8MB
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            multiple
            onChange={handleFile}
            disabled={uploading}
          />
          {uploading ? (
            <Loader2 className="mt-3 h-4 w-4 animate-spin text-slate-600" />
          ) : null}
        </label>
      ) : null}

      {value.length < max ? (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="Or paste https image URL"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
          />
          <button
            type="button"
            onClick={addUrl}
            className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Add
          </button>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

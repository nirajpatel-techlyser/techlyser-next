"use client";

import Image from "next/image";
import { ChangeEvent, DragEvent, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

type ImageUploaderProps = {
  value?: string | null;
  onChange: (url: string | null) => void;
};

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  async function uploadFile(file: File) {
    setUploading(true);
    setError("");
    setProgress(20);

    try {
      const body = new FormData();
      body.append("file", file);

      setProgress(55);
      const response = await fetch("/api/upload", {
        method: "POST",
        body,
      });
      setProgress(85);

      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.url);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await uploadFile(file);
  }

  async function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (uploading) return;
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    await uploadFile(file);
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200">
          <div className="relative aspect-video bg-slate-100">
            <Image
              src={value}
              alt="Featured"
              fill
              unoptimized={
                value.startsWith("http://") || value.startsWith("https://")
              }
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-slate-700 shadow"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition ${
            dragging
              ? "border-primary bg-primary/10"
              : "border-slate-300 bg-slate-50 hover:border-primary hover:bg-primary/5"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="h-6 w-6 text-primary" />
          <p className="mt-3 text-sm font-medium text-slate-800">
            Drag & drop or click to upload
          </p>
          <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP up to 8MB</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
      )}

      {uploading ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading…
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      <input
        type="url"
        placeholder="Or paste image URL"
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
      />
    </div>
  );
}

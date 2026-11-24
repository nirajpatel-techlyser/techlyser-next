"use client";

import { useState, useTransition } from "react";
import { Moon } from "lucide-react";
import { updateSiteTheme } from "@/actions/settings";
import type { SiteThemeMode } from "@/lib/theme";

type ThemeSettingsFormProps = {
  initialTheme: SiteThemeMode;
};

export default function ThemeSettingsForm({
  initialTheme,
}: ThemeSettingsFormProps) {
  const [theme, setTheme] = useState<SiteThemeMode>(
    initialTheme === "DARK" ? "DARK" : "DARK",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function ensureDark() {
    setError("");
    setMessage("");
    setTheme("DARK");

    startTransition(async () => {
      const result = await updateSiteTheme("DARK");
      if (!result.success) {
        setError(result.error || "Could not save theme.");
        setTheme(initialTheme === "DARK" ? "DARK" : "DARK");
        return;
      }
      setMessage("Dark theme is locked on for the public site.");
    });
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        disabled={pending}
        onClick={ensureDark}
        className="w-full rounded-2xl border border-primary bg-primary/5 p-5 text-left shadow-sm ring-2 ring-primary/20 disabled:opacity-60 sm:max-w-md"
      >
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-primary p-2 text-white">
            <Moon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-slate-900">Dark theme</p>
            <p className="mt-1 text-sm text-slate-600">
              Public site stays dark (black background, white logo, orange
              accents). Light mode is disabled — it inverted the logo orange
              into blue.
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary">
          {theme === "DARK" ? "Active" : "Click to set dark"}
        </p>
      </button>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}
    </div>
  );
}

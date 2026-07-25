"use client";

import { useState, useTransition } from "react";
import { Moon, Sun } from "lucide-react";
import { updateSiteTheme } from "@/actions/settings";
import type { SiteThemeMode } from "@/lib/theme";

type ThemeSettingsFormProps = {
  initialTheme: SiteThemeMode;
};

const options: Array<{
  value: SiteThemeMode;
  label: string;
  description: string;
  icon: typeof Moon;
}> = [
  {
    value: "DARK",
    label: "Dark theme",
    description: "Black background, white headings, orange highlights.",
    icon: Moon,
  },
  {
    value: "LIGHT",
    label: "Light theme",
    description: "White background, black headings, orange highlights.",
    icon: Sun,
  },
];

export default function ThemeSettingsForm({
  initialTheme,
}: ThemeSettingsFormProps) {
  const [theme, setTheme] = useState<SiteThemeMode>(initialTheme);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSelect(next: SiteThemeMode) {
    setError("");
    setMessage("");
    setTheme(next);

    startTransition(async () => {
      const result = await updateSiteTheme(next);
      if (!result.success) {
        setError(result.error || "Could not save theme.");
        setTheme(initialTheme);
        return;
      }
      setMessage(
        next === "DARK"
          ? "Dark theme is live on the public site."
          : "Light theme is live on the public site.",
      );
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {options.map(({ value, label, description, icon: Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              disabled={pending}
              onClick={() => onSelect(value)}
              className={`rounded-2xl border p-5 text-left transition disabled:opacity-60 ${
                active
                  ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-xl p-2 ${
                    active
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{label}</p>
                  <p className="mt-1 text-sm text-slate-600">{description}</p>
                </div>
              </div>
              {active ? (
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary">
                  Active
                </p>
              ) : null}
            </button>
          );
        })}
      </div>

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
      <p className="text-sm text-slate-500">
        This controls the overall public website look. Section-wise colors can be
        refined later.
      </p>
    </div>
  );
}

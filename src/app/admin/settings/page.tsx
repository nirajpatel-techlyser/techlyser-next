import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import ThemeSettingsForm from "@/components/admin/forms/ThemeSettingsForm";
import SocialLinksForm from "@/components/admin/forms/SocialLinksForm";
import ComputeSaverPanel from "@/components/admin/ComputeSaverPanel";
import { getRuntimeFlagSnapshot } from "@/lib/runtime-flags";

export default async function AdminSettingsPage() {
  // Admin intentionally loads from DB when available (manual page open).
  const settings = await getSiteSettings({ fromDb: true });
  const flags = getRuntimeFlagSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Site Settings
        </h1>
        <p className="mt-2 text-slate-600">
          Control public website theme and social profile links from the backend.
          Auto DB wakes are off by default — use{" "}
          <Link href="#compute-saver" className="font-semibold text-primary underline">
            Compute saver
          </Link>{" "}
          to run jobs only when you need them.
        </p>
      </div>

      <ComputeSaverPanel flags={flags} />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Website Theme</h2>
        <p className="mt-1 text-sm text-slate-500">
          Dark = black background + white headings. Light = white background +
          black headings. Highlighter stays orange in both.
          {flags.siteSettingsDb
            ? " Public site reads these from DB."
            : " Public site uses code defaults until ENABLE_DB_SITE_SETTINGS=true (saves CU)."}
        </p>
        <div className="mt-6">
          <ThemeSettingsForm initialTheme={settings.theme} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Social Links</h2>
        <p className="mt-1 text-sm text-slate-500">
          These icons appear in the bottom CTA section. Leave blank to hide an
          icon. Hover color is orange.
        </p>
        <div className="mt-6">
          <SocialLinksForm
            initialValues={{
              whatsappUrl: settings.whatsappUrl,
              facebookUrl: settings.facebookUrl,
              googleUrl: settings.googleUrl,
              instagramUrl: settings.instagramUrl,
              linkedinUrl: settings.linkedinUrl,
            }}
          />
        </div>
      </section>
    </div>
  );
}

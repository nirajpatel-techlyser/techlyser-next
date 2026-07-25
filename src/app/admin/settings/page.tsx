import { getSiteSettings } from "@/lib/settings";
import ThemeSettingsForm from "@/components/admin/forms/ThemeSettingsForm";
import SocialLinksForm from "@/components/admin/forms/SocialLinksForm";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Site Settings
        </h1>
        <p className="mt-2 text-slate-600">
          Control public website theme and social profile links from the backend.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Website Theme</h2>
        <p className="mt-1 text-sm text-slate-500">
          Dark = black background + white headings. Light = white background +
          black headings. Highlighter stays orange in both.
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

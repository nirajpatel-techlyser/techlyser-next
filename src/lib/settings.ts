import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SITE_THEME, type SiteThemeMode } from "@/lib/theme";
import { isDbSiteSettingsEnabled } from "@/lib/runtime-flags";

export type SocialLinks = {
  whatsappUrl: string;
  facebookUrl: string;
  googleUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
};

export type PublicSiteSettings = {
  theme: SiteThemeMode;
} & SocialLinks;

const DEFAULTS: PublicSiteSettings = {
  theme: DEFAULT_SITE_THEME,
  whatsappUrl: "https://wa.me/919203708608",
  facebookUrl: "",
  googleUrl: "https://g.page/r/CWYl15UAeeS3EAE/review",
  instagramUrl: "",
  linkedinUrl: "",
};

function normalizeUrl(value: string | null | undefined) {
  return (value || "").trim();
}

async function loadSiteSettingsFromDb(): Promise<PublicSiteSettings> {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: {
      theme: true,
      whatsappUrl: true,
      facebookUrl: true,
      googleUrl: true,
      instagramUrl: true,
      linkedinUrl: true,
    },
  });

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: { id: "default", theme: DEFAULT_SITE_THEME },
      select: {
        theme: true,
        whatsappUrl: true,
        facebookUrl: true,
        googleUrl: true,
        instagramUrl: true,
        linkedinUrl: true,
      },
    });
  }

  return {
    theme: settings.theme as SiteThemeMode,
    whatsappUrl: normalizeUrl(settings.whatsappUrl) || DEFAULTS.whatsappUrl,
    facebookUrl: normalizeUrl(settings.facebookUrl),
    googleUrl: normalizeUrl(settings.googleUrl) || DEFAULTS.googleUrl,
    instagramUrl: normalizeUrl(settings.instagramUrl),
    linkedinUrl: normalizeUrl(settings.linkedinUrl),
  };
}

/**
 * Public pages: defaults only unless ENABLE_DB_SITE_SETTINGS=true.
 * Admin can force DB read via { fromDb: true }.
 */
export const getSiteSettings = cache(
  async (options?: { fromDb?: boolean }): Promise<PublicSiteSettings> => {
    const fromDb = Boolean(options?.fromDb) || isDbSiteSettingsEnabled();
    if (!fromDb) return DEFAULTS;

    try {
      return await loadSiteSettingsFromDb();
    } catch (error) {
      console.error("Failed to load site settings:", error);
      return DEFAULTS;
    }
  },
);

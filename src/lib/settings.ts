import { prisma } from "@/lib/prisma";
import { DEFAULT_SITE_THEME, type SiteThemeMode } from "@/lib/theme";

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
  whatsappUrl: "",
  facebookUrl: "",
  googleUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
};

function normalizeUrl(value: string | null | undefined) {
  return (value || "").trim();
}

export async function getSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      create: { id: "default", theme: DEFAULT_SITE_THEME },
      update: {},
      select: {
        theme: true,
        whatsappUrl: true,
        facebookUrl: true,
        googleUrl: true,
        instagramUrl: true,
        linkedinUrl: true,
      },
    });

    return {
      theme: settings.theme as SiteThemeMode,
      whatsappUrl: normalizeUrl(settings.whatsappUrl),
      facebookUrl: normalizeUrl(settings.facebookUrl),
      googleUrl: normalizeUrl(settings.googleUrl),
      instagramUrl: normalizeUrl(settings.instagramUrl),
      linkedinUrl: normalizeUrl(settings.linkedinUrl),
    };
  } catch (error) {
    console.error("Failed to load site settings:", error);
    return DEFAULTS;
  }
}

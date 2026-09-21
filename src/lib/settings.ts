import { cache } from "react";
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
  whatsappUrl: "https://wa.me/919753808608",
  facebookUrl: "",
  googleUrl: "https://g.page/r/CWYl15UAeeS3EAE/review",
  instagramUrl: "",
  linkedinUrl: "",
};

function normalizeUrl(value: string | null | undefined) {
  return (value || "").trim();
}

/**
 * Request-deduped settings. Prefer findUnique over upsert to avoid writes
 * on every public page load.
 */
export const getSiteSettings = cache(
  async (): Promise<PublicSiteSettings> => {
    try {
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
        whatsappUrl:
          normalizeUrl(settings.whatsappUrl) || DEFAULTS.whatsappUrl,
        facebookUrl: normalizeUrl(settings.facebookUrl),
        googleUrl: normalizeUrl(settings.googleUrl) || DEFAULTS.googleUrl,
        instagramUrl: normalizeUrl(settings.instagramUrl),
        linkedinUrl: normalizeUrl(settings.linkedinUrl),
      };
    } catch (error) {
      console.error("Failed to load site settings:", error);
      return DEFAULTS;
    }
  },
);

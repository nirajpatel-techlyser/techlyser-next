"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SITE_THEMES, type SiteThemeMode } from "@/lib/theme";

const themeSchema = z.enum(SITE_THEMES);

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) =>
      value === "" ||
      /^https?:\/\//i.test(value) ||
      /^wa\.me\//i.test(value) ||
      /^mailto:/i.test(value),
    "Enter a valid URL (https://...)",
  );

const socialLinksSchema = z.object({
  whatsappUrl: optionalUrl,
  facebookUrl: optionalUrl,
  googleUrl: optionalUrl,
  instagramUrl: optionalUrl,
  linkedinUrl: optionalUrl,
});

export type SocialLinksInput = z.infer<typeof socialLinksSchema>;

function normalizeSocialUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^wa\.me\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export async function updateSiteTheme(theme: SiteThemeMode) {
  const session = await auth();
  if (!session?.user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = themeSchema.safeParse(theme);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid theme" };
  }

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", theme: parsed.data },
    update: { theme: parsed.data },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return { success: true as const, theme: parsed.data };
}

export async function updateSocialLinks(raw: SocialLinksInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = socialLinksSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message || "Invalid social links",
    };
  }

  const data = {
    whatsappUrl: normalizeSocialUrl(parsed.data.whatsappUrl),
    facebookUrl: normalizeSocialUrl(parsed.data.facebookUrl),
    googleUrl: normalizeSocialUrl(parsed.data.googleUrl),
    instagramUrl: normalizeSocialUrl(parsed.data.instagramUrl),
    linkedinUrl: normalizeSocialUrl(parsed.data.linkedinUrl),
  };

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", theme: "DARK", ...data },
    update: data,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return { success: true as const };
}

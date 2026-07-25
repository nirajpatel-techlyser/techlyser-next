export const SITE_THEMES = ["DARK", "LIGHT"] as const;

export type SiteThemeMode = (typeof SITE_THEMES)[number];

export const DEFAULT_SITE_THEME: SiteThemeMode = "DARK";

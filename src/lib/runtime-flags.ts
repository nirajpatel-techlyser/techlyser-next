/**
 * Free-tier / Neon CU controls.
 * Default OFF for anything that auto-wakes the database on every visitor or cron.
 * Flip env vars in Vercel when you intentionally want them on.
 */

function flag(name: string, defaultEnabled = false) {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) return defaultEnabled;
  if (["1", "true", "yes", "on"].includes(raw)) return true;
  if (["0", "false", "no", "off"].includes(raw)) return false;
  return defaultEnabled;
}

/** Visitor pageview / Blog.views writes. Default OFF to save CU-hours. */
export function isDbAnalyticsEnabled() {
  return flag("ENABLE_DB_ANALYTICS", false);
}

/**
 * Public layout loads SiteSettings from DB. Default OFF — uses code defaults
 * (WhatsApp, theme) so every pageview does not wake Neon.
 */
export function isDbSiteSettingsEnabled() {
  return flag("ENABLE_DB_SITE_SETTINGS", false);
}

/** Vercel Cron → daily autopilot. Default OFF; run manually from Admin. */
export function isCronAutopilotEnabled() {
  return flag("ENABLE_CRON_AUTOPILOT", false);
}

export function getRuntimeFlagSnapshot() {
  return {
    analytics: isDbAnalyticsEnabled(),
    siteSettingsDb: isDbSiteSettingsEnabled(),
    cronAutopilot: isCronAutopilotEnabled(),
  };
}

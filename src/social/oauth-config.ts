import type { SocialPlatform } from "@/social/types";

export function appBaseUrl() {
  const raw = process.env.AUTH_URL || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function redirectUri(path: string) {
  return `${appBaseUrl()}${path}`;
}

export function oauthConfigured(platform: SocialPlatform) {
  if (platform === "LINKEDIN") {
    return Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
  }
  if (platform === "GOOGLE_BUSINESS") {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
  return Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
}

export function linkedInAuthorizeUrl(state: string) {
  const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env.LINKEDIN_CLIENT_ID || "");
  url.searchParams.set("redirect_uri", redirectUri("/api/social/linkedin/callback"));
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "openid profile w_member_social");
  return url.toString();
}

export function metaAuthorizeUrl(state: string) {
  const url = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  url.searchParams.set("client_id", process.env.META_APP_ID || "");
  url.searchParams.set("redirect_uri", redirectUri("/api/social/meta/callback"));
  url.searchParams.set("state", state);
  url.searchParams.set(
    "scope",
    [
      "pages_show_list",
      "pages_manage_posts",
      "pages_read_engagement",
      "instagram_basic",
      "instagram_content_publish",
      "business_management",
    ].join(","),
  );
  return url.toString();
}

export function googleAuthorizeUrl(state: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID || "");
  url.searchParams.set("redirect_uri", redirectUri("/api/social/google/callback"));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("scope", "https://www.googleapis.com/auth/business.manage");
  url.searchParams.set("state", state);
  return url.toString();
}

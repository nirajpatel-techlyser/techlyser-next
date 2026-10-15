import { expectOk, socialFetch } from "@/social/http";
import { redirectUri } from "@/social/oauth-config";
import { SocialPublishError } from "@/social/errors";
import { upsertSocialAccount } from "@/social/store";

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
};

function expiry(seconds?: number) {
  if (!seconds) return null;
  return new Date(Date.now() + seconds * 1000);
}

async function formToken(url: string, body: URLSearchParams, label: string) {
  const response = await socialFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  await expectOk(response, label);
  return (await response.json()) as TokenResponse;
}

export async function connectLinkedIn(code: string, userId: string) {
  const token = await formToken(
    "https://www.linkedin.com/oauth/v2/accessToken",
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri("/api/social/linkedin/callback"),
      client_id: process.env.LINKEDIN_CLIENT_ID || "",
      client_secret: process.env.LINKEDIN_CLIENT_SECRET || "",
    }),
    "LinkedIn",
  );
  if (!token.access_token) {
    throw new SocialPublishError("AUTH", "LinkedIn did not return an access token. Try connecting again.");
  }
  const profileRes = await socialFetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  await expectOk(profileRes, "LinkedIn");
  const profile = (await profileRes.json()) as { sub?: string; name?: string };
  if (!profile.sub) {
    throw new SocialPublishError("AUTH", "LinkedIn did not return a profile. Try connecting again.");
  }
  const page = await findLinkedInPage(token.access_token);
  await upsertSocialAccount({
    platform: "LINKEDIN",
    label: page ? `${profile.name || "LinkedIn"} + ${page.name}` : profile.name || "LinkedIn member",
    externalAccountId: profile.sub,
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: expiry(token.expires_in),
    scopes: token.scope || "openid profile w_member_social w_organization_social",
    metadata: {
      personUrn: `urn:li:person:${profile.sub}`,
      ...(page ? { organizationUrn: page.urn, organizationName: page.name } : {}),
    },
    connectedByUserId: userId,
  });
}

const LINKEDIN_HEADERS = {
  "X-Restli-Protocol-Version": "2.0.0",
  "LinkedIn-Version": "202511",
};

async function findLinkedInPage(accessToken: string) {
  const response = await socialFetch(
    "https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...LINKEDIN_HEADERS,
      },
    },
  );
  if (!response.ok) return null;
  const data = (await response.json()) as { elements?: { organization?: string }[] };
  const urns = (data.elements || [])
    .map((row) => row.organization)
    .filter((urn): urn is string => Boolean(urn));
  let chosen: { urn: string; name: string } | null = null;
  for (const urn of urns.slice(0, 8)) {
    const id = urn.split(":").pop();
    if (!id) continue;
    const org = await socialFetch(`https://api.linkedin.com/rest/organizations/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...LINKEDIN_HEADERS,
      },
    });
    const body = org.ok ? ((await org.json()) as { localizedName?: string }) : {};
    const name = body.localizedName || "";
    if (/techlyser/i.test(name)) {
      chosen = { urn, name };
      break;
    }
  }
  return chosen;
}

type MetaPage = {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string; username?: string };
};

export async function connectMeta(code: string, userId: string) {
  const shortLived = await socialFetch("https://graph.facebook.com/v21.0/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.META_APP_ID || "",
      client_secret: process.env.META_APP_SECRET || "",
      redirect_uri: redirectUri("/api/social/meta/callback"),
      code,
    }),
  });
  await expectOk(shortLived, "Facebook");
  const shortToken = (await shortLived.json()) as TokenResponse;
  if (!shortToken.access_token) {
    throw new SocialPublishError("AUTH", "Facebook did not return an access token. Try connecting again.");
  }
  const longLived = await socialFetch("https://graph.facebook.com/v21.0/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: process.env.META_APP_ID || "",
      client_secret: process.env.META_APP_SECRET || "",
      fb_exchange_token: shortToken.access_token,
    }),
  });
  await expectOk(longLived, "Facebook");
  const userToken = (await longLived.json()) as TokenResponse;
  const access = userToken.access_token || shortToken.access_token;
  const pagesRes = await socialFetch(
    "https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}",
    { headers: { Authorization: `Bearer ${access}` } },
  );
  await expectOk(pagesRes, "Facebook");
  const pages = ((await pagesRes.json()) as { data?: MetaPage[] }).data || [];
  if (pages.length === 0) {
    throw new SocialPublishError(
      "PERMISSION",
      "No Facebook Page was shared. Reconnect and choose the Techlyser Page.",
    );
  }
  const page = pages.find((item) => /techlyser/i.test(item.name)) || pages[0];
  await upsertSocialAccount({
    platform: "FACEBOOK",
    label: page.name,
    externalAccountId: page.id,
    accessToken: page.access_token,
    expiresAt: expiry(userToken.expires_in),
    scopes: "pages_manage_posts,pages_show_list",
    metadata: { pageId: page.id },
    connectedByUserId: userId,
  });
  if (page.instagram_business_account?.id) {
    await upsertSocialAccount({
      platform: "INSTAGRAM",
      label: page.instagram_business_account.username
        ? `@${page.instagram_business_account.username}`
        : `${page.name} Instagram`,
      externalAccountId: page.instagram_business_account.id,
      accessToken: page.access_token,
      expiresAt: expiry(userToken.expires_in),
      scopes: "instagram_content_publish,instagram_basic",
      metadata: { igUserId: page.instagram_business_account.id, pageId: page.id },
      connectedByUserId: userId,
    });
  }
}

type GoogleAccount = { name: string; accountName?: string };
type GoogleLocation = { name: string; title?: string };

export async function connectGoogleBusiness(code: string, userId: string) {
  const token = await formToken(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: redirectUri("/api/social/google/callback"),
      grant_type: "authorization_code",
    }),
    "Google Business Profile",
  );
  if (!token.access_token) {
    throw new SocialPublishError(
      "AUTH",
      "Google did not return an access token. Try connecting again.",
    );
  }
  const accountsRes = await socialFetch(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    { headers: { Authorization: `Bearer ${token.access_token}` } },
  );
  await expectOk(accountsRes, "Google Business Profile");
  const accounts = ((await accountsRes.json()) as { accounts?: GoogleAccount[] }).accounts || [];
  const account = accounts[0];
  if (!account?.name) {
    throw new SocialPublishError(
      "PERMISSION",
      "No Google Business Profile account was found for this Google login.",
    );
  }
  const locationsRes = await socialFetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title&pageSize=10`,
    { headers: { Authorization: `Bearer ${token.access_token}` } },
  );
  await expectOk(locationsRes, "Google Business Profile");
  const locations = ((await locationsRes.json()) as { locations?: GoogleLocation[] }).locations || [];
  const location = locations.find((item) => /techlyser/i.test(item.title || "")) || locations[0];
  if (!location?.name) {
    throw new SocialPublishError(
      "CONFIG",
      "No Google Business location was found. Confirm the profile is verified, then reconnect.",
    );
  }
  const locationName = location.name.startsWith("accounts/")
    ? location.name
    : `${account.name}/${location.name}`;
  await upsertSocialAccount({
    platform: "GOOGLE_BUSINESS",
    label: location.title || "Google Business Profile",
    externalAccountId: locationName,
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: expiry(token.expires_in),
    scopes: "https://www.googleapis.com/auth/business.manage",
    metadata: { locationName, accountName: account.name },
    connectedByUserId: userId,
  });
}

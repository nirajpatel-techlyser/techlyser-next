import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { SocialPublishError } from "@/social/errors";
import { socialTokenEncryptionReady } from "@/social/crypto";
import { oauthConfigured } from "@/social/oauth-config";
import { createOAuthState, OAUTH_STATE_COOKIE, verifyOAuthState } from "@/social/oauth-state";
import type { SocialPlatform } from "@/social/types";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function accountsRedirect(params: Record<string, string>) {
  const url = new URL("/admin/social/accounts", process.env.AUTH_URL || "http://localhost:3000");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function beginSocialConnect(input: {
  platform: SocialPlatform | "META";
  configured: SocialPlatform;
  authorizeUrl: (state: string) => string;
}) {
  const { session, error } = await requireAdminApi();
  if (error || !session?.user?.id) return error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "EDITOR") {
    return NextResponse.json({ error: "Only an admin can connect social accounts." }, { status: 403 });
  }
  if (!socialTokenEncryptionReady()) {
    return accountsRedirect({ error: "Set SOCIAL_TOKEN_SECRET before connecting accounts." });
  }
  if (!oauthConfigured(input.configured)) {
    return accountsRedirect({ error: "This platform app is not configured yet." });
  }
  const state = createOAuthState({ platform: input.platform, userId: session.user.id });
  const response = NextResponse.redirect(input.authorizeUrl(state));
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
}

export async function finishSocialConnect(input: {
  request: Request;
  platform: SocialPlatform | "META";
  connect: (code: string, userId: string) => Promise<void>;
}) {
  const { session, error } = await requireAdminApi();
  if (error || !session?.user?.id) {
    return accountsRedirect({ error: "Sign in again, then reconnect the account." });
  }
  if (session.user.role === "EDITOR") {
    return accountsRedirect({ error: "Only an admin can connect social accounts." });
  }
  const url = new URL(input.request.url);
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const jar = await cookies();
  const cookie = jar.get(OAUTH_STATE_COOKIE)?.value || "";
  if (!code || !state || !cookie || !safeEqual(state, cookie)) {
    return accountsRedirect({ error: "The connection attempt expired. Try again." });
  }
  const verified = verifyOAuthState(state);
  if (!verified || verified.platform !== input.platform || verified.userId !== session.user.id) {
    return accountsRedirect({ error: "The connection attempt could not be verified. Try again." });
  }
  try {
    await input.connect(code, session.user.id);
    return accountsRedirect({ connected: input.platform.toLowerCase() });
  } catch (caught) {
    const message =
      caught instanceof SocialPublishError
        ? caught.message
        : "The account could not be connected. Try again.";
    console.error("[social] oauth callback failed", { platform: input.platform });
    return accountsRedirect({ error: message });
  }
}

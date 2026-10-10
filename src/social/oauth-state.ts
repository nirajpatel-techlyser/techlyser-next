import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { SocialPlatform } from "@/social/types";

type StatePayload = {
  platform: SocialPlatform | "META";
  nonce: string;
  exp: number;
  userId: string;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not configured");
  return value;
}

export function createOAuthState(input: {
  platform: SocialPlatform | "META";
  userId: string;
}) {
  const payload: StatePayload = {
    platform: input.platform,
    nonce: randomBytes(16).toString("hex"),
    exp: Date.now() + 10 * 60 * 1000,
    userId: input.userId,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verifyOAuthState(token: string, expectedNonce?: string) {
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let payload: StatePayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as StatePayload;
  } catch {
    return null;
  }
  if (!payload.exp || payload.exp < Date.now()) return null;
  if (!payload.userId || !payload.nonce) return null;
  if (expectedNonce && payload.nonce !== expectedNonce) return null;
  return payload;
}

export const OAUTH_STATE_COOKIE = "tl_social_oauth";

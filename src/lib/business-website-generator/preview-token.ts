import { createHmac, timingSafeEqual } from "crypto";

function secret() {
  const value = process.env.AUTH_SECRET?.trim();
  if (!value) throw new Error("AUTH_SECRET is not configured");
  return value;
}

/** Short-lived signed token for public concept HTML preview (thum.io). */
export function signConceptPreviewToken(conceptId: string, ttlSeconds = 60 * 30) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const body = `${conceptId}.${exp}`;
  const mac = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verifyConceptPreviewToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [conceptId, expRaw, mac] = parts;
  const exp = Number(expRaw);
  if (!conceptId || !Number.isFinite(exp)) return null;
  if (exp < Math.floor(Date.now() / 1000)) return null;
  const body = `${conceptId}.${expRaw}`;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return conceptId;
}

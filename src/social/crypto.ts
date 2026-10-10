import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const VERSION = "v1";

function key() {
  const secret = process.env.SOCIAL_TOKEN_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SOCIAL_TOKEN_SECRET is not configured");
  }
  return scryptSync(secret, "techlyser-social-token", 32);
}

export function socialTokenEncryptionReady() {
  return Boolean(process.env.SOCIAL_TOKEN_SECRET && process.env.SOCIAL_TOKEN_SECRET.length >= 16);
}

export function encryptSecret(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(":");
}

export function decryptSecret(payload: string) {
  const [version, iv, tag, data] = payload.split(":");
  if (version !== VERSION || !iv || !tag || !data) {
    throw new Error("Unrecognized token payload");
  }
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  const plain = Buffer.concat([
    decipher.update(Buffer.from(data, "base64url")),
    decipher.final(),
  ]);
  return plain.toString("utf8");
}

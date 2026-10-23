import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.internal",
]);

function ipv4Blocked(ip: string) {
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return true;
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function ipv6Blocked(ip: string) {
  const value = ip.toLowerCase();
  return (
    value === "::1" ||
    value.startsWith("fc") ||
    value.startsWith("fd") ||
    value.startsWith("fe80") ||
    value.startsWith("::ffff:127.") ||
    value.startsWith("::ffff:10.") ||
    value.startsWith("::ffff:192.168.")
  );
}

export function isBlockedIp(ip: string) {
  if (ip.includes(":")) return ipv6Blocked(ip);
  return ipv4Blocked(ip);
}

export async function assertPublicHttpUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("URL is not valid.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs can be researched.");
  }
  if (url.username || url.password) {
    throw new Error("URLs with credentials are blocked.");
  }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("That host is not allowed.");
  }
  if (isIP(host)) {
    if (isBlockedIp(host)) throw new Error("Private network addresses are blocked.");
    return url;
  }
  const resolved = await lookup(host, { all: true });
  if (resolved.length === 0 || resolved.some((row) => isBlockedIp(row.address))) {
    throw new Error("That host resolves to a blocked address.");
  }
  return url;
}

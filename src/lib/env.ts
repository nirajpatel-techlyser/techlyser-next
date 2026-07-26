/** Strip wrapping quotes that Vercel/env UIs sometimes store as part of the value. */
export function stripEnvQuotes(value: string | undefined | null): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

/** Normalize auth-related env vars once at module load. */
export function normalizeAuthEnv() {
  const secret = stripEnvQuotes(process.env.AUTH_SECRET);
  if (secret) process.env.AUTH_SECRET = secret;

  const authUrl = stripEnvQuotes(process.env.AUTH_URL);
  if (authUrl) process.env.AUTH_URL = authUrl;

  const nextAuthUrl = stripEnvQuotes(process.env.NEXTAUTH_URL);
  if (nextAuthUrl) process.env.NEXTAUTH_URL = nextAuthUrl;

  const dbUrl = stripEnvQuotes(process.env.DATABASE_URL);
  if (dbUrl) process.env.DATABASE_URL = dbUrl;
}

export function getAuthSecret(): string | undefined {
  return stripEnvQuotes(process.env.AUTH_SECRET);
}

import { mapHttpFailure, mapUnknownFailure, SocialPublishError } from "@/social/errors";

export async function socialFetch(url: string, init: RequestInit = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    throw mapUnknownFailure("The platform", error);
  } finally {
    clearTimeout(timer);
  }
}

export async function readErrorBody(response: Response) {
  try {
    return (await response.text()).slice(0, 500);
  } catch {
    return "";
  }
}

export async function expectOk(response: Response, platformLabel: string) {
  if (response.ok) return;
  const body = await readErrorBody(response);
  throw mapHttpFailure(platformLabel, response.status, body);
}

export async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withTransientRetry<T>(
  platformLabel: string,
  fn: () => Promise<T>,
) {
  let last: SocialPublishError | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      const mapped = mapUnknownFailure(platformLabel, error);
      last = mapped;
      if (!mapped.retryable || attempt === 2) throw mapped;
      await sleep(Math.min(8000, 1000 * 2 ** attempt));
    }
  }
  throw last || new SocialPublishError("UNKNOWN", `${platformLabel} publishing failed.`);
}

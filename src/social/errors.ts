export type SocialErrorCode =
  | "AUTH"
  | "PERMISSION"
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "NETWORK"
  | "PLATFORM_TEMPORARY"
  | "INVALID_CONTENT"
  | "INVALID_IMAGE"
  | "DISCONNECTED"
  | "CONFIG"
  | "UNKNOWN";

const RETRYABLE = new Set<SocialErrorCode>([
  "RATE_LIMIT",
  "TIMEOUT",
  "NETWORK",
  "PLATFORM_TEMPORARY",
]);

export class SocialPublishError extends Error {
  code: SocialErrorCode;
  detail: string;
  retryable: boolean;

  constructor(code: SocialErrorCode, message: string, detail = "") {
    super(message);
    this.code = code;
    this.detail = detail.slice(0, 500);
    this.retryable = RETRYABLE.has(code);
  }
}

export function isRetryableCode(code: string | null | undefined) {
  return RETRYABLE.has((code || "") as SocialErrorCode);
}

export function mapHttpFailure(platformLabel: string, status: number, body: string) {
  const detail = body.replace(/\s+/g, " ").slice(0, 500);
  if (status === 401 || status === 403) {
    return new SocialPublishError(
      "AUTH",
      `${platformLabel} authorization has expired. Reconnect ${platformLabel}.`,
      detail,
    );
  }
  if (status === 429) {
    return new SocialPublishError(
      "RATE_LIMIT",
      `${platformLabel} is rate limiting requests. Wait a minute, then retry ${platformLabel}.`,
      detail,
    );
  }
  if (status === 408 || status === 504) {
    return new SocialPublishError(
      "TIMEOUT",
      `${platformLabel} took too long to respond. Retry ${platformLabel}.`,
      detail,
    );
  }
  if (status >= 500) {
    return new SocialPublishError(
      "PLATFORM_TEMPORARY",
      `${platformLabel} had a temporary error. Retry ${platformLabel}.`,
      detail,
    );
  }
  if (status === 400 && /image|media|photo/i.test(body)) {
    return new SocialPublishError(
      "INVALID_IMAGE",
      `${platformLabel} rejected the image. Upload a public https image and try again.`,
      detail,
    );
  }
  return new SocialPublishError(
    "INVALID_CONTENT",
    `${platformLabel} rejected this post. Check the caption and image, then retry ${platformLabel}.`,
    detail,
  );
}

export function mapUnknownFailure(platformLabel: string, error: unknown) {
  if (error instanceof SocialPublishError) return error;
  const detail = error instanceof Error ? error.message : "unknown";
  if (/abort|timeout/i.test(detail)) {
    return new SocialPublishError(
      "TIMEOUT",
      `${platformLabel} took too long to respond. Retry ${platformLabel}.`,
      detail,
    );
  }
  if (/fetch|network|enotfound|econnreset/i.test(detail)) {
    return new SocialPublishError(
      "NETWORK",
      `${platformLabel} could not be reached. Retry ${platformLabel}.`,
      detail,
    );
  }
  return new SocialPublishError(
    "UNKNOWN",
    `${platformLabel} publishing failed. Retry ${platformLabel} or reconnect the account.`,
    detail,
  );
}

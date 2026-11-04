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
  partial?: {
    externalPostId: string;
    publishedUrl: string | null;
    secondaryExternalPostId?: string | null;
    secondaryPublishedUrl?: string | null;
  };

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

function looksLikeGoogleApiDisabled(body: string) {
  return /SERVICE_DISABLED|accessNotConfigured|has not been used|API has not been enabled|not been activated/i.test(
    body,
  );
}

function looksLikeGoogleQuota(body: string) {
  return /RESOURCE_EXHAUSTED|Quota exceeded|quotaMetric|rateLimitExceeded/i.test(body);
}

function looksLikeGooglePermission(body: string) {
  return /PERMISSION_DENIED|insufficientPermissions|ACCESS_TOKEN_SCOPE_INSUFFICIENT|Business Profile API access/i.test(
    body,
  );
}

export function mapHttpFailure(platformLabel: string, status: number, body: string) {
  const detail = body.replace(/\s+/g, " ").slice(0, 500);
  const isGoogle = /google business/i.test(platformLabel);

  if (isGoogle && (looksLikeGoogleApiDisabled(detail) || (status === 403 && looksLikeGoogleApiDisabled(detail)))) {
    return new SocialPublishError(
      "CONFIG",
      "Enable My Business Account Management, Business Information, and Google My Business APIs in Google Cloud, wait a few minutes, then reconnect.",
      detail,
    );
  }
  if (isGoogle && (status === 403 || status === 401) && looksLikeGooglePermission(detail)) {
    return new SocialPublishError(
      "PERMISSION",
      "Google has not approved Business Profile API access for this Cloud project yet. Request access, then reconnect.",
      detail,
    );
  }

  if (status === 401 || status === 403) {
    return new SocialPublishError(
      "AUTH",
      `${platformLabel} authorization has expired. Reconnect ${platformLabel}.`,
      detail,
    );
  }
  if (status === 429 || (isGoogle && looksLikeGoogleQuota(detail))) {
    return new SocialPublishError(
      "RATE_LIMIT",
      isGoogle
        ? "Google Business Profile quota/rate limit hit. Wait 2–5 minutes, confirm the 3 My Business APIs are enabled with quota, then Connect once."
        : `${platformLabel} is rate limiting requests. Wait a minute, then retry ${platformLabel}.`,
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

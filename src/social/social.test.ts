import assert from "node:assert/strict";
import test from "node:test";
import { buildSocialCaption } from "@/social/content";
import { encryptSecret, decryptSecret } from "@/social/crypto";
import { mapHttpFailure } from "@/social/errors";
import { planPublishingActions } from "@/social/idempotency";
import { instagramPublisher } from "@/social/publishers/meta";
import { createOAuthState, verifyOAuthState } from "@/social/oauth-state";
import { rollupAttemptStatus } from "@/social/status";
import type { WebsitePostSource } from "@/social/types";
import { evaluatePublish } from "@/social/validate";

process.env.AUTH_SECRET = "test-auth-secret-value";
process.env.SOCIAL_TOKEN_SECRET = "test-social-token-secret";

const post: WebsitePostSource = {
  blogId: "blog_1",
  title: "Shopify speed for Indian D2C brands",
  slug: "shopify-speed",
  excerpt: "A slow theme costs more than another app.",
  content: "<p>Measure the theme before adding apps.</p>",
  featuredImage: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  tags: ["Shopify", "CRO"],
  linkedinPersonalPost: "",
  linkedinPagePost: "<p>Founders should fix theme speed before buying another app.</p>",
  websiteStatus: "PUBLISHED",
};

test("captions keep paragraphs, decode entities, and end with the article line", () => {
  const linkedin = buildSocialCaption(
    {
      ...post,
      linkedinPagePost:
        "<p>Founders should fix theme speed before buying another app.</p><p>It&#39;s a rebuild decision.</p>",
    },
    "LINKEDIN",
  );
  const instagram = buildSocialCaption(post, "INSTAGRAM");
  assert.match(linkedin.caption, /theme speed/);
  assert.match(linkedin.caption, /It's a rebuild decision/);
  assert.match(linkedin.caption, /\n\n/);
  assert.match(
    linkedin.caption,
    /View full article here - https:\/\/techlyser.com\/shopify-speed$/,
  );
  assert.doesNotMatch(linkedin.caption, /&#39;/);
  assert.ok(instagram.hashtags.includes("#shopify"));
  assert.equal(instagram.imageUrl, post.featuredImage);
});

test("publish is blocked without approval, image, or a connection", () => {
  const missingImage = evaluatePublish({
    websitePublished: true,
    approved: true,
    hasContent: true,
    featuredImage: null,
    selected: ["INSTAGRAM"],
    connected: ["INSTAGRAM"],
  });
  assert.equal(missingImage.ok, false);
  assert.match(missingImage.reasons.join(" "), /https image/);

  const unapproved = evaluatePublish({
    websitePublished: true,
    approved: false,
    hasContent: true,
    featuredImage: post.featuredImage,
    selected: ["LINKEDIN"],
    connected: ["LINKEDIN"],
  });
  assert.match(unapproved.reasons.join(" "), /Approve/);

  const disconnected = evaluatePublish({
    websitePublished: true,
    approved: true,
    hasContent: true,
    featuredImage: post.featuredImage,
    selected: ["FACEBOOK"],
    connected: [],
  });
  assert.match(disconnected.reasons.join(" "), /Connect/);
});

test("instagram validate rejects a missing image", () => {
  const caption = buildSocialCaption({ ...post, featuredImage: null }, "INSTAGRAM");
  assert.match(instagramPublisher.validate(caption) || "", /https image/);
});

test("a second click skips platforms already published for this version", () => {
  const caption = buildSocialCaption(post, "LINKEDIN");
  const actions = planPublishingActions(
    [{ platform: "LINKEDIN", status: "PUBLISHED", contentHash: caption.contentHash }],
    [{ platform: "LINKEDIN", contentHash: caption.contentHash }],
  );
  assert.equal(actions[0]?.action, "skip_published");
});

test("partial failure rolls up without treating successes as failed", () => {
  assert.equal(
    rollupAttemptStatus(["PUBLISHED", "FAILED", "PUBLISHED", "PUBLISHED"]),
    "PARTIALLY_PUBLISHED",
  );
  assert.equal(rollupAttemptStatus(["PUBLISHED", "PUBLISHED"]), "PUBLISHED");
  assert.equal(rollupAttemptStatus(["FAILED", "FAILED"]), "PUBLISH_FAILED");
});

test("expired token errors stay user-facing", () => {
  const error = mapHttpFailure("Instagram", 401, "OAuthException 190");
  assert.equal(error.code, "AUTH");
  assert.match(error.message, /Reconnect Instagram/);
  assert.equal(error.retryable, false);
  assert.doesNotMatch(error.message, /OAuthException/);
});

test("oauth state rejects a tampered payload", () => {
  const state = createOAuthState({ platform: "LINKEDIN", userId: "user_1" });
  const verified = verifyOAuthState(state);
  assert.equal(verified?.userId, "user_1");
  assert.equal(verifyOAuthState(`${state}tampered`), null);
});

test("tokens round-trip through encryption and are not stored in plaintext", () => {
  const encrypted = encryptSecret("linkedin-access-token");
  assert.equal(decryptSecret(encrypted), "linkedin-access-token");
  assert.doesNotMatch(encrypted, /linkedin-access-token/);
});

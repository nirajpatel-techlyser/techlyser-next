import { createHash } from "crypto";
import { absoluteUrl } from "@/lib/seo";
import type { SocialCaption, SocialPlatform, WebsitePostSource } from "@/social/types";

const LIMITS: Record<SocialPlatform, number> = {
  LINKEDIN: 2900,
  INSTAGRAM: 2100,
  FACEBOOK: 2000,
  GOOGLE_BUSINESS: 1400,
};

export function htmlToText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isPublicHttpsUrl(value: string | null | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function clip(value: string, max: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function hashtagsFromTags(tags: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of tags) {
    const word = tag
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 30);
    if (!word || seen.has(word)) continue;
    seen.add(word);
    out.push(`#${word}`);
    if (out.length >= 5) break;
  }
  return out;
}

function leadText(post: WebsitePostSource) {
  const excerpt = htmlToText(post.excerpt);
  if (excerpt) return excerpt;
  return clip(htmlToText(post.content), 500);
}

export function sourceHashFor(post: WebsitePostSource) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        lead: leadText(post),
        image: post.featuredImage,
        tags: post.tags,
        personal: post.linkedinPersonalPost,
        page: post.linkedinPagePost,
      }),
    )
    .digest("hex");
}

export function contentHashFor(input: {
  platform: SocialPlatform;
  caption: string;
  hashtags: string[];
  linkUrl: string;
  imageUrl: string | null;
}) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        platform: input.platform,
        caption: input.caption,
        hashtags: input.hashtags,
        linkUrl: input.linkUrl,
        imageUrl: input.imageUrl,
      }),
    )
    .digest("hex");
}

function linkedinCaption(post: WebsitePostSource, linkUrl: string) {
  const personal = htmlToText(post.linkedinPersonalPost);
  const page = htmlToText(post.linkedinPagePost);
  const body = personal || page || `${post.title}\n\n${leadText(post)}`;
  const withLink = body.includes(linkUrl) ? body : `${body}\n\n${linkUrl}`;
  return clip(withLink, LIMITS.LINKEDIN);
}

function captionFor(platform: SocialPlatform, post: WebsitePostSource, linkUrl: string, hashtags: string[]) {
  if (platform === "LINKEDIN") return linkedinCaption(post, linkUrl);
  if (platform === "INSTAGRAM") {
    const tags = hashtags.length ? `\n\n${hashtags.join(" ")}` : "";
    const body = `${post.title}\n\n${leadText(post)}\n\n${linkUrl}${tags}`;
    return clip(body, LIMITS.INSTAGRAM);
  }
  if (platform === "FACEBOOK") {
    return clip(`${post.title}\n\n${leadText(post)}\n\n${linkUrl}`, LIMITS.FACEBOOK);
  }
  return clip(`${post.title}. ${leadText(post)}`, LIMITS.GOOGLE_BUSINESS);
}

export function buildSocialCaption(
  post: WebsitePostSource,
  platform: SocialPlatform,
): SocialCaption {
  const linkUrl = absoluteUrl(`/${post.slug}`);
  const hashtags = platform === "INSTAGRAM" ? hashtagsFromTags(post.tags) : [];
  const imageUrl = isPublicHttpsUrl(post.featuredImage) ? post.featuredImage : null;
  const caption = captionFor(platform, post, linkUrl, hashtags);
  const sourceHash = sourceHashFor(post);
  return {
    platform,
    caption,
    hashtags,
    linkUrl,
    imageUrl,
    sourceHash,
    contentHash: contentHashFor({
      platform,
      caption,
      hashtags,
      linkUrl,
      imageUrl,
    }),
  };
}

export function buildSocialCaptions(post: WebsitePostSource) {
  return (["LINKEDIN", "INSTAGRAM", "FACEBOOK", "GOOGLE_BUSINESS"] as const).map(
    (platform) => buildSocialCaption(post, platform),
  );
}

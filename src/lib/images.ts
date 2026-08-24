export function isRemoteImageUrl(src?: string | null): boolean {
  if (!src) return false;
  return /^https?:\/\//i.test(src.trim());
}

/** Shopify (and most pasted CDNs) block Next.js image optimization fetches. */
export function shouldUnoptimizeImage(src?: string | null): boolean {
  if (!src) return false;
  const value = src.trim();
  if (!isRemoteImageUrl(value)) return !value.startsWith("/");

  try {
    const host = new URL(value).hostname;
    return host !== "res.cloudinary.com" && host !== "images.unsplash.com";
  } catch {
    return true;
  }
}

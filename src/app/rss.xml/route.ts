import { getRssPosts } from "@/lib/blog";
import { unstable_cache } from "next/cache";
import { connection } from "next/server";

// Must stay fully dynamic for build safety when DATABASE_URL is unavailable,
// but cache the DB read so origin hits do not smash Supabase on every poll.
export const dynamic = "force-dynamic";

const getCachedRssPosts = unstable_cache(
  async () => getRssPosts(),
  ["rss-posts-v1"],
  { revalidate: 300 },
);

export async function GET() {
  await connection();

  const baseUrl = "https://techlyser.com";
  let posts: Awaited<ReturnType<typeof getRssPosts>> = [];
  try {
    posts = await getCachedRssPosts();
  } catch (error) {
    console.error("RSS feed failed to load posts:", error);
  }

  const items = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/${post.slug}</link>
      <guid>${baseUrl}/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt || ""}]]></description>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Techlyser Web Solutions Blog</title>
      <link>${baseUrl}/blog</link>
      <description>Practical Shopify, ecommerce and web development insights from Techlyser Web Solutions.</description>
      ${items}
    </channel>
  </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}

import { ResearchSourceKinds } from "../source-kinds";
import type { ResearchSourceAdapter, RawResearchHit } from "../types";
import { fetchJson } from "../http";
import { REDDIT_SUBREDDITS } from "../config";

type RedditListing = {
  data?: {
    children?: Array<{
      data?: {
        title?: string;
        url?: string;
        permalink?: string;
        selftext?: string;
        created_utc?: number;
        link_flair_text?: string;
        subreddit?: string;
      };
    }>;
  };
};

export const redditSource: ResearchSourceAdapter = {
  id: "reddit",
  kind: ResearchSourceKinds.REDDIT,
  label: "Reddit",
  category: "community",
  async collect(ctx) {
    try {
      const limit = ctx.limit || 12;
      const hits: RawResearchHit[] = [];
      const subs = ctx.query
        ? ["shopify", "ecommerce", "SEO"]
        : [...REDDIT_SUBREDDITS];

      for (const sub of subs) {
        if (hits.length >= limit) break;
        const url = `https://www.reddit.com/r/${sub}/hot.json?limit=15`;
        try {
          const listing = await fetchJson<RedditListing>(url, {
            signal: ctx.signal,
            headers: {
              Accept: "application/json",
            },
          });
          for (const child of listing.data?.children || []) {
            if (hits.length >= limit) break;
            const post = child.data;
            if (!post?.title) continue;
            const title = post.title;
            if (
              ctx.query &&
              !`${title} ${post.selftext || ""}`
                .toLowerCase()
                .includes(ctx.query.toLowerCase())
            ) {
              continue;
            }
            const permalink = post.permalink
              ? `https://www.reddit.com${post.permalink}`
              : post.url;
            if (!permalink) continue;

            hits.push({
              title,
              url: permalink,
              summary: post.selftext?.slice(0, 400) || post.link_flair_text,
              publishedAt: post.created_utc
                ? new Date(post.created_utc * 1000)
                : undefined,
              keywords: [sub.toLowerCase(), "reddit"],
              category: "community",
              sourceLabel: `r/${sub}`,
              raw: { subreddit: post.subreddit },
            });
          }
        } catch (error) {
          console.error(`[research.reddit:${sub}]`, error);
        }
      }

      return hits;
    } catch (error) {
      console.error("[research.reddit]", error);
      return [];
    }
  },
};

type PhPost = {
  name?: string;
  tagline?: string;
  url?: string;
  topics?: { nodes?: Array<{ name?: string }> };
  createdAt?: string;
};

/**
 * Product Hunt GraphQL — requires PRODUCT_HUNT_TOKEN.
 * Soft-skips when token is missing so the engine remains runnable.
 */
export const productHuntSource: ResearchSourceAdapter = {
  id: "product-hunt",
  kind: ResearchSourceKinds.PRODUCT_HUNT,
  label: "Product Hunt",
  category: "products",
  async collect(ctx) {
    const token = process.env.PRODUCT_HUNT_TOKEN;
    if (!token) {
      console.warn(
        "[research.product-hunt] PRODUCT_HUNT_TOKEN missing — skipping source",
      );
      return [];
    }

    try {
      const query = `
        query {
          posts(first: ${ctx.limit || 12}, order: VOTES) {
            edges {
              node {
                name
                tagline
                url
                createdAt
                topics {
                  nodes { name }
                }
              }
            }
          }
        }
      `;

      const response = await fetch("https://api.producthunt.com/v2/api/graphql", {
        method: "POST",
        signal: ctx.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Product Hunt HTTP ${response.status}`);
      }

      const payload = (await response.json()) as {
        data?: { posts?: { edges?: Array<{ node?: PhPost }> } };
      };

      return (payload.data?.posts?.edges || [])
        .map((edge) => edge.node)
        .filter(Boolean)
        .map((node): RawResearchHit => ({
          title: node!.name || "Product Hunt launch",
          url: node!.url || "https://www.producthunt.com/",
          summary: node!.tagline,
          publishedAt: node!.createdAt,
          keywords: (node!.topics?.nodes || [])
            .map((t) => t.name)
            .filter(Boolean) as string[],
          category: "products",
          sourceLabel: "Product Hunt",
        }));
    } catch (error) {
      console.error("[research.product-hunt]", error);
      return [];
    }
  },
};

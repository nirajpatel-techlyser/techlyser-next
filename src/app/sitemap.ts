import type { MetadataRoute } from "next";
import {
  getAllCategorySlugs,
  getAllTagSlugs,
  getSitemapEntries,
} from "@/lib/blog";
import { getAllServiceSlugs } from "@/data/services";
import {
  getAllShopifyLocationSlugs,
  shopifyIndiaHub,
} from "@/data/shopify-locations";
import { siteConfig } from "@/lib/seo";

/** Cache sitemap for 1 hour — avoids Vercel timeouts from force-dynamic + full post loads. */
export const revalidate = 3600;

function safeDate(value: Date | string | undefined) {
  if (!value) return new Date();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.85, changeFrequency: "daily" as const },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/portfolio", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/services", priority: 0.9, changeFrequency: "weekly" as const },
    {
      path: "/free-shopify-audit",
      priority: 0.9,
      changeFrequency: "weekly" as const,
    },
    {
      path: "/resources",
      priority: 0.9,
      changeFrequency: "weekly" as const,
    },
    {
      path: shopifyIndiaHub.path,
      priority: 0.95,
      changeFrequency: "weekly" as const,
    },
  ].map((item) => ({
    url: `${baseUrl}${item.path}`,
    lastModified: now,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = getAllServiceSlugs().map(
    (slug) => ({
      url: `${baseUrl}/services/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: slug === "shopify" ? 0.92 : 0.78,
    }),
  );

  const shopifyCityRoutes: MetadataRoute.Sitemap =
    getAllShopifyLocationSlugs().map((city) => ({
      url: `${baseUrl}/shopify-developers/${city}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.86,
    }));

  // Always return static + service + city URLs even if the DB is down.
  let blogRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];
  let tagRoutes: MetadataRoute.Sitemap = [];

  try {
    const [postsResult, categoriesResult, tagsResult] = await Promise.allSettled([
      getSitemapEntries(),
      getAllCategorySlugs(),
      getAllTagSlugs(100),
    ]);

    if (postsResult.status === "fulfilled") {
      blogRoutes = postsResult.value.map((post) => ({
        url: `${baseUrl}/${post.slug}`,
        lastModified: safeDate(post.lastModified),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    } else {
      console.error("[sitemap] posts failed:", postsResult.reason);
    }

    if (categoriesResult.status === "fulfilled") {
      categoryRoutes = categoriesResult.value.map((slug) => ({
        url: `${baseUrl}/category/${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.65,
      }));
    } else {
      console.error("[sitemap] categories failed:", categoriesResult.reason);
    }

    if (tagsResult.status === "fulfilled") {
      tagRoutes = tagsResult.value.map((slug) => ({
        url: `${baseUrl}/tag/${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.55,
      }));
    } else {
      console.error("[sitemap] tags failed:", tagsResult.reason);
    }
  } catch (error) {
    console.error("[sitemap] unexpected failure:", error);
  }

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...shopifyCityRoutes,
    ...categoryRoutes,
    ...tagRoutes,
    ...blogRoutes,
  ];
}

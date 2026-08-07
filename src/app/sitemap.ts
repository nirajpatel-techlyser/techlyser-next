import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getAllCategories, getAllPosts, getAllTags } from "@/lib/blog";
import { getAllServiceSlugs } from "@/data/services";
import {
  getAllShopifyLocationSlugs,
  shopifyIndiaHub,
} from "@/data/shopify-locations";
import { siteConfig } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

  const baseUrl = siteConfig.url;
  const now = new Date();

  const staticRoutes = [
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

  const serviceRoutes = getAllServiceSlugs().map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: slug === "shopify" ? 0.92 : 0.78,
  }));

  const shopifyCityRoutes = getAllShopifyLocationSlugs().map((city) => ({
    url: `${baseUrl}/shopify-developers/${city}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.86,
  }));

  let posts: Awaited<ReturnType<typeof getAllPosts>> = [];
  let categories: Awaited<ReturnType<typeof getAllCategories>> = [];
  let tags: Awaited<ReturnType<typeof getAllTags>> = [];

  try {
    posts = await getAllPosts();
  } catch {
    posts = [];
  }

  try {
    categories = await getAllCategories();
  } catch {
    categories = [];
  }

  try {
    tags = await getAllTags();
  } catch {
    tags = [];
  }

  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));

  const tagRoutes = tags.slice(0, 100).map((tag) => ({
    url: `${baseUrl}/tag/${tag.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.55,
  }));

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...shopifyCityRoutes,
    ...categoryRoutes,
    ...tagRoutes,
    ...blogRoutes,
  ];
}

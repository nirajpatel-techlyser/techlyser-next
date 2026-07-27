import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getAllPosts } from "@/lib/blog";
import { getAllServiceSlugs } from "@/data/services";
import {
  getAllShopifyLocationSlugs,
  shopifyIndiaHub,
} from "@/data/shopify-locations";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

  const baseUrl = "https://techlyser.com";
  const staticRoutes = [
    "",
    "/about",
    "/blog",
    "/contact",
    "/portfolio",
    "/services",
    shopifyIndiaHub.path,
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : path === shopifyIndiaHub.path ? 0.95 : 0.8,
  }));

  const serviceRoutes = getAllServiceSlugs().map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: slug === "shopify" ? 0.9 : 0.75,
  }));

  const shopifyCityRoutes = getAllShopifyLocationSlugs().map((city) => ({
    url: `${baseUrl}/shopify-developers/${city}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  let posts: Awaited<ReturnType<typeof getAllPosts>> = [];
  try {
    posts = await getAllPosts();
  } catch {
    posts = [];
  }

  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...shopifyCityRoutes,
    ...blogRoutes,
  ];
}

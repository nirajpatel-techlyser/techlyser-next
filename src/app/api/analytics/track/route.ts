import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getClientIp,
  getGeoFromHeaders,
  hashIp,
} from "@/lib/analytics";

function isBot(userAgent: string | null) {
  if (!userAgent) return false;
  return /bot|crawl|spider|slurp|facebookexternalhit|preview|wget|curl|python-requests|headless/i.test(
    userAgent,
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const path =
      typeof body.path === "string" && body.path.startsWith("/")
        ? body.path.slice(0, 500)
        : null;

    if (!path) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    if (
      path.startsWith("/admin") ||
      path.startsWith("/api") ||
      path.startsWith("/_next")
    ) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const headers = request.headers;
    if (isBot(headers.get("user-agent"))) {
      return NextResponse.json({ ok: true, skipped: true, reason: "bot" });
    }

    const ip = getClientIp(headers);
    const geo = getGeoFromHeaders(headers);

    const slugMatch = path.match(/^\/(?!blog\/?$)([a-z0-9-]+)\/?$/i);
    const slug = slugMatch?.[1] || null;
    const reserved = new Set([
      "about",
      "blog",
      "contact",
      "portfolio",
      "services",
      "admin",
      "api",
      "rss.xml",
      "sitemap.xml",
      "robots.txt",
      "category",
      "tag",
      "resources",
      "free-shopify-audit",
      "shopify-developers-india",
      "shopify-developers",
    ]);

    let blogId: string | null = null;
    if (slug && !reserved.has(slug.toLowerCase())) {
      const rows = await prisma.$queryRaw<{ id: string }[]>`
        UPDATE "Blog"
        SET views = views + 1
        WHERE slug = ${slug} AND status = 'PUBLISHED'
        RETURNING id
      `;
      blogId = rows[0]?.id ?? null;
    }

    // Sample detailed PageView rows; Blog.views stays accurate above.
    const samplePageView = Math.random() < 0.4;
    if (samplePageView) {
      await prisma.pageView.create({
        data: {
          path,
          blogId,
          country: geo.country,
          city: geo.city,
          region: geo.region,
          referrer:
            typeof body.referrer === "string"
              ? body.referrer.slice(0, 500)
              : headers.get("referer")?.slice(0, 500) || null,
          userAgent: null,
          ipHash: hashIp(ip),
        },
      });
    }

    return NextResponse.json({ ok: true, sampled: samplePageView });
  } catch (error) {
    console.error("Analytics track failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

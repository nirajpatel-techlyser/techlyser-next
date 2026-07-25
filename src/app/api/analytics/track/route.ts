import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getClientIp,
  getGeoFromHeaders,
  hashIp,
  lookupGeoByIp,
} from "@/lib/analytics";

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

    // Skip admin/api noise
    if (
      path.startsWith("/admin") ||
      path.startsWith("/api") ||
      path.startsWith("/_next")
    ) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const headers = request.headers;
    const ip = getClientIp(headers);
    let geo = getGeoFromHeaders(headers);

    if (!geo.country && !geo.city) {
      geo = await lookupGeoByIp(ip);
    }

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
    ]);

    let blogId: string | null = null;
    if (slug && !reserved.has(slug.toLowerCase())) {
      const blog = await prisma.blog.findFirst({
        where: { slug, status: "PUBLISHED" },
        select: { id: true },
      });
      blogId = blog?.id || null;

      if (blogId) {
        await prisma.blog.update({
          where: { id: blogId },
          data: { views: { increment: 1 } },
        });
      }
    }

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
        userAgent: headers.get("user-agent")?.slice(0, 500) || null,
        ipHash: hashIp(ip),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Analytics track failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

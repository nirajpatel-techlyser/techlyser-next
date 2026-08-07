import { PrismaClient, BlogStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const prisma = new PrismaClient();

const POSTS_PATH = path.join(process.cwd(), "content/blog");
const WORDPRESS_UPLOADS_REGEX =
  /(?:https?:)?\/\/(?:www\.)?techlyser\.com\/+wp-content\/uploads\/|\/+wp-content\/uploads\//gi;

function normalizeContent(markdown: string): string {
  return markdown
    .replace(WORDPRESS_UPLOADS_REGEX, "/images/blog/")
    .replace(/<(https?:\/\/[^>\s]+)>/g, "[$1]($1)");
}

function readingTimeMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function extractFirstImage(markdown: string): string | null {
  const match = markdown.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return match?.[1]?.trim() || null;
}

function resolveExcerpt(value: unknown, content: string): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed && trimmed !== '""' && trimmed !== "''") {
      return trimmed;
    }
  }

  const plain = content
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "$1")
    .replace(/[#>*`_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plain.slice(0, 180);
}

async function seedAdmin() {
  const email = (
    process.env.ADMIN_EMAIL || "admin@techlyser.com"
  ).toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "TechlyserAdmin@2026";
  const name = process.env.ADMIN_NAME || "Techlyser Admin";
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name, role: "ADMIN" },
    create: {
      email,
      name,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Admin ready: ${admin.email}`);
}

async function seedBlogs() {
  if (!fs.existsSync(POSTS_PATH)) {
    console.log("No content/blog folder found — skipping blog seed.");
    return;
  }

  const files = fs.readdirSync(POSTS_PATH).filter((f) => f.endsWith(".mdx"));
  let created = 0;
  let updated = 0;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_PATH, file), "utf8");
    const { data, content } = matter(raw);
    const normalized = normalizeContent(content);
    const slug =
      (typeof data.slug === "string" && data.slug) ||
      file.replace(/\.mdx$/, "");
    const title = typeof data.title === "string" ? data.title : slug;
    const excerpt = resolveExcerpt(data.excerpt, normalized);
    const coverFromFrontmatter =
      typeof data.coverImage === "string" ? data.coverImage : "";
    const featuredImage =
      coverFromFrontmatter || extractFirstImage(normalized) || null;
    const categories = Array.isArray(data.categories)
      ? data.categories.filter((c: unknown) => typeof c === "string")
      : [];
    const tags = Array.isArray(data.tags)
      ? data.tags.filter((t: unknown) => typeof t === "string")
      : [];
    const dateValue =
      typeof data.date === "string" || data.date instanceof Date
        ? new Date(data.date)
        : new Date();
    const publishedAt = Number.isNaN(dateValue.getTime())
      ? new Date()
      : dateValue;

    const seoTitle =
      typeof data.seoTitle === "string" && data.seoTitle.trim()
        ? data.seoTitle.trim()
        : title;
    const seoDescription =
      typeof data.seoDescription === "string" && data.seoDescription.trim()
        ? data.seoDescription.trim()
        : excerpt;

    const payload = {
      title,
      slug,
      excerpt,
      content: normalized,
      featuredImage,
      category: categories[0] || "Shopify",
      tags,
      author:
        typeof data.author === "string" && data.author
          ? data.author
          : "Techlyser Web Solutions",
      seoTitle,
      seoDescription,
      metaKeywords: tags.join(", "),
      status: BlogStatus.PUBLISHED,
      featured: Boolean(data.featured),
      readingTime: readingTimeMinutes(normalized),
      publishedAt,
    };

    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) {
      await prisma.blog.update({ where: { slug }, data: payload });
      updated += 1;
    } else {
      await prisma.blog.create({ data: payload });
      created += 1;
    }
  }

  console.log(`Blogs seeded — created: ${created}, updated: ${updated}`);
}

async function main() {
  await seedAdmin();
  await seedBlogs();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

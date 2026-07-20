import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BlogPost } from "@/types/blog";

const POSTS_PATH = path.join(process.cwd(), "content/blog");
const WORDPRESS_UPLOADS_REGEX =
  /(?:https?:)?\/\/(?:www\.)?techlyser\.com\/+wp-content\/uploads\/|\/+wp-content\/uploads\//gi;

export function normalizeBlogImageUrl(url: string): string {
  if (!url) {
    return "";
  }

  return url.replace(WORDPRESS_UPLOADS_REGEX, "/images/blog/");
}

export function getPostSlugs(): string[] {
  return fs
    .readdirSync(POSTS_PATH)
    .filter((file) => file.endsWith(".mdx"));
}

function normalizeBlogMarkdown(markdown: string): string {
  return normalizeBlogImageUrl(
    markdown.replace(/<(https?:\/\/[^>\s]+)>/g, "[$1]($1)")
  );
}

function extractFirstImage(markdown: string): string {
  const markdownImage = markdown.match(/!\[[^\]]*\]\(([^)]+)\)/);

  if (markdownImage?.[1]) {
    return normalizeBlogImageUrl(markdownImage[1].trim());
  }

  return "";
}

function resolveExcerpt(value: unknown, content: string): string {
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (
      trimmed.length > 0 &&
      trimmed !== '""' &&
      trimmed !== "''"
    ) {
      return trimmed;
    }
  }

  return createExcerpt(content);
}

function createExcerpt(content: string): string {
  const plainText = content
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "$1")
    .replace(/[#>*`_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plainText.slice(0, 180).trim();
}

export function getPostBySlug(slug: string): BlogPost {
  const realSlug = slug.replace(/\.mdx$/, "");
  const allFiles = getPostSlugs();
  const matchingFile = allFiles.find((file) => {
    if (file === `${realSlug}.mdx`) {
      return true;
    }

    const fileContents = fs.readFileSync(path.join(POSTS_PATH, file), "utf8");
    const { data } = matter(fileContents);
    return data.slug === realSlug;
  });

  if (!matchingFile) {
    throw new Error(`Post not found for slug: ${realSlug}`);
  }

  const fullPath = path.join(POSTS_PATH, matchingFile);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const { data, content } = matter(fileContents);
  const normalizedContent = normalizeBlogMarkdown(content);
  const excerpt = resolveExcerpt(data.excerpt, normalizedContent);
  const coverImageFromFrontmatter =
    typeof data.coverImage === "string"
      ? normalizeBlogImageUrl(data.coverImage)
      : "";

  return {
    title: data.title ?? "",
    slug: data.slug ?? realSlug,
    description: data.description ?? "",
    excerpt,
    date: data.date ?? "",
    author: data.author ?? "Techlyser",
    categories: data.categories ?? [],
    tags: data.tags ?? [],
    coverImage: coverImageFromFrontmatter || extractFirstImage(normalizedContent),
    featured: data.featured ?? false,
    content: normalizedContent,
  };
}

export function getAllPosts(): BlogPost[] {
  const slugs = getPostSlugs();

  const posts = slugs.map((slug) => getPostBySlug(slug));

  return posts.sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  );
}
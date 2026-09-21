import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import BlogCard from "@/components/blog/BlogCard";
import JsonLd from "@/components/seo/JsonLd";
import {
  countPublishedPosts,
  getAllCategories,
  getAllPosts,
  getAllTags,
  searchPublishedPosts,
} from "@/lib/blog";
import { Container } from "@/components/ui";
import {
  buildPageMetadata,
  collectionPageJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Shopify & Ecommerce Blog India",
  description:
    "Practical Shopify, ecommerce SEO, Next.js, and growth insights from Techlyser — India's premium Shopify and web development agency.",
  path: "/blog",
  keywords: [
    "Shopify blog India",
    "ecommerce tips",
    "Shopify SEO",
    "Techlyser blog",
  ],
});

export const revalidate = 3600;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

type BlogIndexProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

const PAGE_SIZE = 24;

export default async function BlogIndexPage({ searchParams }: BlogIndexProps) {
  const { q, page: pageRaw } = await searchParams;
  const query = (q || "").trim();
  const page = Math.max(1, Number.parseInt(pageRaw || "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  let posts: Awaited<ReturnType<typeof getAllPosts>> = [];
  let total = 0;
  let categories: Awaited<ReturnType<typeof getAllCategories>> = [];
  let tags: Awaited<ReturnType<typeof getAllTags>> = [];

  try {
    if (query) {
      const result = await searchPublishedPosts(query, {
        take: PAGE_SIZE,
        skip,
      });
      posts = result.posts;
      total = result.total;
    } else {
      total = await countPublishedPosts();
      posts = await getAllPosts({ take: PAGE_SIZE, skip });
    }
  } catch {
    posts = [];
    total = 0;
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/blog?${s}` : "/blog";
  };

  return (
    <div className="bg-surface-dark min-h-screen">
      <JsonLd
        data={collectionPageJsonLd({
          name: "Techlyser Blog",
          description:
            "Shopify and ecommerce insights from Techlyser Web Solutions.",
          path: "/blog",
        })}
      />
      <Navbar />
      <main className="bg-white py-16">
        <Container>
          <header className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Blog
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
              Shopify & ecommerce insights from Techlyser
            </h1>
            <p className="mt-4 max-w-2xl text-slate-600">
              Guides on Shopify development, migrations, performance, SEO, and
              growth for brands across India.
            </p>
            <form action="/blog" method="get" className="mt-6 max-w-md">
              <label htmlFor="blog-search" className="sr-only">
                Search articles
              </label>
              <div className="flex gap-2">
                <input
                  id="blog-search"
                  name="q"
                  defaultValue={q || ""}
                  placeholder="Search Shopify, SEO, Next.js…"
                  className="w-full rounded-[5px] border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none ring-primary focus:ring-2"
                />
                <button
                  type="submit"
                  className="btn-brand rounded-[5px] px-4 py-2.5 text-sm"
                >
                  Search
                </button>
              </div>
            </form>
            {query ? (
              <p className="mt-3 text-sm text-slate-500">
                Showing {posts.length} of {total} result
                {total === 1 ? "" : "s"} for “{q}”.{" "}
                <Link href="/blog" className="text-primary hover:underline">
                  Clear
                </Link>
              </p>
            ) : null}
          </header>

          {categories.length > 0 ? (
            <nav
              aria-label="Blog categories"
              className="mb-8 flex flex-wrap gap-2"
            >
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-primary/40 hover:text-primary"
                >
                  {category.name} ({category.count})
                </Link>
              ))}
            </nav>
          ) : null}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard
                key={post.slug}
                post={post}
                formattedDate={formatDate(post.date)}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <nav
              aria-label="Blog pagination"
              className="mt-10 flex items-center justify-center gap-4 text-sm"
            >
              {page > 1 ? (
                <Link
                  href={qs(page - 1)}
                  className="font-medium text-primary hover:underline"
                >
                  ← Previous
                </Link>
              ) : (
                <span className="text-slate-300">← Previous</span>
              )}
              <span className="text-slate-600">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={qs(page + 1)}
                  className="font-medium text-primary hover:underline"
                >
                  Next →
                </Link>
              ) : (
                <span className="text-slate-300">Next →</span>
              )}
            </nav>
          ) : null}

          {tags.length > 0 ? (
            <section className="mt-14 border-t border-slate-200 pt-8">
              <h2 className="text-lg font-semibold text-slate-900">
                Popular tags
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.slice(0, 24).map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:text-primary"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </Container>
      </main>
    </div>
  );
}

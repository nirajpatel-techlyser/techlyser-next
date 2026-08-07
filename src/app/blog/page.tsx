import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import BlogCard from "@/components/blog/BlogCard";
import JsonLd from "@/components/seo/JsonLd";
import { getAllCategories, getAllPosts, getAllTags } from "@/lib/blog";
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
  searchParams: Promise<{ q?: string }>;
};

export default async function BlogIndexPage({ searchParams }: BlogIndexProps) {
  const { q } = await searchParams;
  const query = (q || "").trim().toLowerCase();

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

  const filtered = query
    ? posts.filter((post) => {
        const haystack = [
          post.title,
          post.excerpt,
          post.categories.join(" "),
          post.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
    : posts;

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
                Showing {filtered.length} result
                {filtered.length === 1 ? "" : "s"} for “{q}”.{" "}
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
            {filtered.map((post) => (
              <BlogCard
                key={post.slug}
                post={post}
                formattedDate={formatDate(post.date)}
              />
            ))}
          </div>

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

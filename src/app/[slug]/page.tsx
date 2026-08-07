import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import BlogContent from "@/components/blog/BlogContent";
import BlogComments from "@/components/blog/BlogComments";
import TOC from "@/components/blog/TOC";
import RelatedPosts from "@/components/blog/RelatedPosts";
import ReadingTime from "@/components/blog/ReadingTime";
import JsonLd from "@/components/seo/JsonLd";
import { Container } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import {
  getAdjacentPosts,
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog";
import { prepareBlogHtml } from "@/lib/prepare-blog-html";
import { slugifyTaxonomy } from "@/lib/blog-html";
import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  buildPageMetadata,
  siteConfig,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const RESERVED_PATHS = new Set([
  "about",
  "api",
  "blog",
  "contact",
  "portfolio",
  "services",
  "admin",
  "shopify-developers-india",
  "shopify-developers",
  "free-shopify-audit",
  "resources",
  "category",
  "tag",
  "rss.xml",
  "llms.txt",
]);

export const revalidate = 3600;
export const runtime = "nodejs";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function generateStaticParams() {
  try {
    const posts = await getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (RESERVED_PATHS.has(slug)) {
    return {};
  }

  try {
    const post = await getPostBySlug(slug);
    const title = post.seoTitle || post.title;
    const description =
      post.seoDescription || post.description || post.excerpt || "";

    return buildPageMetadata({
      title,
      description,
      path: `/${post.slug}`,
      keywords: post.metaKeywords
        ? post.metaKeywords.split(",").map((k) => k.trim())
        : post.tags,
      ogImage: post.coverImage || siteConfig.defaultOgImage,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updatedAt || post.date,
      authors: [post.author],
    });
  } catch {
    return {};
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  if (RESERVED_PATHS.has(slug)) {
    notFound();
  }

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  let related: Awaited<ReturnType<typeof getRelatedPosts>> = [];
  let adjacent: Awaited<ReturnType<typeof getAdjacentPosts>> = {
    previous: null,
    next: null,
  };
  let approvedComments: Array<{
    id: string;
    name: string;
    content: string;
    createdAt: Date;
  }> = [];

  try {
    related = await getRelatedPosts(slug, post.categories[0], 3);
  } catch (error) {
    console.error("[blog] related posts failed:", error);
  }

  try {
    adjacent = await getAdjacentPosts(slug);
  } catch (error) {
    console.error("[blog] adjacent posts failed:", error);
  }

  if (post.id && post.commentsEnabled) {
    try {
      approvedComments = await prisma.blogComment.findMany({
        where: { blogId: post.id, status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          name: true,
          content: true,
          createdAt: true,
        },
      });
    } catch (error) {
      console.error("[blog] comments failed:", error);
    }
  }

  const prepared = await prepareBlogHtml(
    post.content,
    post.coverImage,
    post.title,
  );

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      ...(post.categories[0]
        ? [
            {
              name: post.categories[0],
              path: `/category/${slugifyTaxonomy(post.categories[0])}`,
            },
          ]
        : []),
      { name: post.title, path: `/${post.slug}` },
    ]),
    blogPostingJsonLd({
      title: post.title,
      description: post.seoDescription || post.excerpt || "",
      slug: post.slug,
      image: post.coverImage || undefined,
      datePublished: post.date,
      dateModified: post.updatedAt || post.date,
      author: post.author,
      keywords: post.tags,
      wordCount: prepared.wordCount,
      readingTimeMinutes: post.readingTimeMinutes,
    }),
  ];

  const isRemoteCover =
    !!post.coverImage &&
    (post.coverImage.startsWith("http://") ||
      post.coverImage.startsWith("https://"));

  return (
    <div className="bg-surface-dark min-h-screen">
      <JsonLd data={jsonLd} />
      <Navbar />
      <main className="bg-white py-14">
        <Container className="max-w-4xl">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/blog" className="hover:text-primary">
                  Blog
                </Link>
              </li>
              {post.categories[0] ? (
                <>
                  <li aria-hidden>/</li>
                  <li>
                    <Link
                      href={`/category/${slugifyTaxonomy(post.categories[0])}`}
                      className="hover:text-primary"
                    >
                      {post.categories[0]}
                    </Link>
                  </li>
                </>
              ) : null}
              <li aria-hidden>/</li>
              <li className="text-slate-800 line-clamp-1">{post.title}</li>
            </ol>
          </nav>

          <article className="mt-6">
            <header className="border-b border-slate-200 pb-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                {post.readingTime ? (
                  <>
                    <span aria-hidden>·</span>
                    <ReadingTime value={post.readingTime} />
                  </>
                ) : null}
                {post.categories[0] ? (
                  <Link
                    href={`/category/${slugifyTaxonomy(post.categories[0])}`}
                    className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                  >
                    {post.categories[0]}
                  </Link>
                ) : null}
              </div>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                {post.title}
              </h1>
              <p className="mt-3 text-slate-600">
                By{" "}
                <Link href="/about" className="font-medium hover:text-primary">
                  {post.author}
                </Link>
              </p>
            </header>

            <TOC items={prepared.toc} />

            {post.coverImage ? (
              <div className="relative mx-auto mt-8 aspect-video max-w-2xl overflow-hidden rounded-2xl bg-slate-100">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 672px"
                  priority
                  unoptimized={!isRemoteCover && !post.coverImage.startsWith("/")}
                />
              </div>
            ) : null}

            <BlogContent html={prepared.html} />

            {post.tags.length > 0 ? (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-slate-200 pt-6">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tag/${slugifyTaxonomy(tag)}`}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-primary/40 hover:text-primary"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            ) : null}

            <aside className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Need a Shopify partner in India?
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Techlyser builds conversion-focused Shopify stores, migrations,
                and Next.js headless commerce. Book a free Shopify Growth Audit.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/free-shopify-audit"
                  className="btn-brand rounded-[5px] px-5 py-2.5 text-sm"
                >
                  Free Shopify audit
                </Link>
                <Link
                  href="/shopify-developers-india"
                  className="rounded-[5px] border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800"
                >
                  Shopify developers India
                </Link>
              </div>
            </aside>

            {post.commentsEnabled && post.id ? (
              <BlogComments
                blogId={post.id}
                comments={approvedComments.map((comment) => ({
                  ...comment,
                  createdAt: comment.createdAt.toISOString(),
                }))}
              />
            ) : null}

            <div className="mt-10 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2">
              {adjacent.previous ? (
                <Link
                  href={`/${adjacent.previous.slug}`}
                  className="rounded-2xl border border-slate-200 p-4 transition hover:border-primary/30 hover:shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Previous
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {adjacent.previous.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
              {adjacent.next ? (
                <Link
                  href={`/${adjacent.next.slug}`}
                  className="rounded-2xl border border-slate-200 p-4 text-right transition hover:border-primary/30 hover:shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Next
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {adjacent.next.title}
                  </p>
                </Link>
              ) : null}
            </div>

            <RelatedPosts posts={related} />
          </article>
        </Container>
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import BlogContent from "@/components/blog/BlogContent";
import BlogComments from "@/components/blog/BlogComments";
import { Container } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import {
  getAdjacentPosts,
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog";

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
]);

export const revalidate = 0;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
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

    return {
      title: `${title} | Techlyser Web Solutions`,
      description,
      keywords: post.metaKeywords || post.tags.join(", "),
      alternates: {
        canonical: `/${post.slug}`,
      },
      openGraph: {
        title,
        description,
        type: "article",
        url: `/${post.slug}`,
        images: post.coverImage ? [{ url: post.coverImage }] : undefined,
        siteName: "Techlyser Web Solutions",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: post.coverImage ? [post.coverImage] : undefined,
      },
    };
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

  const [related, adjacent, approvedComments] = await Promise.all([
    getRelatedPosts(slug, post.categories[0], 3),
    getAdjacentPosts(slug),
    post.id && post.commentsEnabled
      ? prisma.blogComment.findMany({
          where: { blogId: post.id, status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            name: true,
            content: true,
            createdAt: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: post.coverImage || undefined,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Techlyser Web Solutions",
    },
    mainEntityOfPage: `https://techlyser.com/${post.slug}`,
  };

  return (
    <div className="bg-surface-dark min-h-screen">
      <Navbar />
      <main className="bg-white py-14">
        <Container className="max-w-4xl">
          <Link
            href="/blog"
            className="text-sm font-semibold text-primary hover:text-primary-hover"
          >
            ← Back to blog
          </Link>

          <article className="mt-6">
            <header className="border-b border-slate-200 pb-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>{formatDate(post.date)}</span>
                {post.readingTime ? <span>· {post.readingTime}</span> : null}
                {post.categories[0] ? (
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {post.categories[0]}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                {post.title}
              </h1>
              <p className="mt-3 text-slate-600">By {post.author}</p>
            </header>

            {post.coverImage ? (
              <div className="relative mx-auto mt-8 aspect-video max-w-2xl overflow-hidden rounded-2xl bg-slate-100">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 672px"
                  priority
                />
              </div>
            ) : null}

            <BlogContent content={post.content} coverImage={post.coverImage} />

            {post.tags.length > 0 ? (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-slate-200 pt-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

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

            {related.length > 0 ? (
              <section className="mt-12 border-t border-slate-200 pt-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  Related Posts
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {related.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/${item.slug}`}
                      className="rounded-2xl border border-slate-200 p-4 transition hover:border-primary/30 hover:shadow-sm"
                    >
                      <p className="font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                        {item.excerpt}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </article>
        </Container>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}

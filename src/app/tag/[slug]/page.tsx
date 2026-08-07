import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BlogCard from "@/components/blog/BlogCard";
import JsonLd from "@/components/seo/JsonLd";
import { Container } from "@/components/ui";
import { getAllTags, getPostsByTag } from "@/lib/blog";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  collectionPageJsonLd,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const tags = await getAllTags();
    return tags.slice(0, 100).map((tag) => ({ slug: tag.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPostsByTag(slug).catch(() => null);
  if (!data) return { title: "Tag not found" };

  return buildPageMetadata({
    title: `#${data.tag} Articles`,
    description: `Browse Techlyser posts tagged ${data.tag}. Shopify, ecommerce, and growth insights from a premium agency in India.`,
    path: `/tag/${slug}`,
    keywords: [data.tag, "Techlyser blog"],
  });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getPostsByTag(slug).catch(() => null);
  if (!data) notFound();

  const path = `/tag/${slug}`;
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: `#${data.tag}`, path },
    ]),
    collectionPageJsonLd({
      name: `Posts tagged ${data.tag}`,
      description: `Articles tagged ${data.tag}`,
      path,
    }),
  ];

  return (
    <div className="bg-surface-dark min-h-screen">
      <JsonLd data={jsonLd} />
      <Navbar />
      <main className="bg-white py-16">
        <Container>
          <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-primary">
              Blog
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-800">#{data.tag}</span>
          </nav>
          <header className="mt-6 mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Tag
            </p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">
              #{data.tag}
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              {data.posts.length} article
              {data.posts.length === 1 ? "" : "s"} tagged {data.tag}.
            </p>
          </header>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.posts.map((post) => (
              <BlogCard
                key={post.slug}
                post={post}
                formattedDate={formatDate(post.date)}
              />
            ))}
          </div>
        </Container>
      </main>
    </div>
  );
}

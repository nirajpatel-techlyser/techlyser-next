import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BlogCard from "@/components/blog/BlogCard";
import JsonLd from "@/components/seo/JsonLd";
import { Container } from "@/components/ui";
import { getAllCategories, getPostsByCategory } from "@/lib/blog";
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
    const categories = await getAllCategories();
    return categories.map((category) => ({ slug: category.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPostsByCategory(slug).catch(() => null);
  if (!data) return { title: "Category not found" };

  return buildPageMetadata({
    title: `${data.category} Articles`,
    description: `Read Techlyser articles on ${data.category} — Shopify, ecommerce, and digital growth insights from India's premium development agency.`,
    path: `/category/${slug}`,
    keywords: [data.category, "Techlyser blog", "Shopify India"],
  });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getPostsByCategory(slug).catch(() => null);
  if (!data) notFound();

  const path = `/category/${slug}`;
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: data.category, path },
    ]),
    collectionPageJsonLd({
      name: `${data.category} Articles`,
      description: `Articles in ${data.category}`,
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
            <span className="text-slate-800">{data.category}</span>
          </nav>
          <header className="mt-6 mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Category
            </p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">
              {data.category}
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              {data.posts.length} article
              {data.posts.length === 1 ? "" : "s"} on {data.category} from
              Techlyser — practical Shopify and ecommerce guidance for Indian
              brands.
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

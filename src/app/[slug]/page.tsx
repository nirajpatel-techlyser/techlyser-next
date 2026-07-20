import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import Navbar from "@/components/layout/Navbar";
import { Container } from "@/components/ui";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

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
]);

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
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (RESERVED_PATHS.has(slug)) {
    return {};
  }

  try {
    const post = getPostBySlug(slug);
    return {
      title: `${post.title} | Techlyser`,
      description: post.description || post.excerpt,
      alternates: {
        canonical: `/${post.slug}`,
      },
      openGraph: {
        title: post.title,
        description: post.description || post.excerpt,
        type: "article",
        url: `/${post.slug}`,
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
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <div className="bg-surface-dark min-h-screen">
      <Navbar />
      <main className="bg-white py-14">
        <Container className="max-w-4xl">
          <Link href="/blog" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            ← Back to blog
          </Link>

          <article className="mt-6">
            <header className="border-b border-slate-200 pb-6">
              <p className="text-sm text-slate-500">{formatDate(post.date)}</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                {post.title}
              </h1>
            </header>

            <div className="blog-content mt-8 text-slate-700">
              <MDXRemote source={post.content} />
            </div>
          </article>
        </Container>
      </main>
    </div>
  );
}

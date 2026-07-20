import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import BlogCard from "@/components/blog/BlogCard";
import { getAllPosts } from "@/lib/blog";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Blog | Techlyser",
  description:
    "Read practical eCommerce, Shopify, and digital marketing insights from the Techlyser team.",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="bg-surface-dark min-h-screen">
      <Navbar />
      <main className="bg-white py-16">
        <Container>
          <header className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Blog
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
              Latest insights from Techlyser
            </h1>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {posts.map((post) => (
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

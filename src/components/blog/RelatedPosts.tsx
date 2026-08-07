import Link from "next/link";
import type { BlogPost } from "@/types/blog";

type RelatedPostsProps = {
  posts: BlogPost[];
};

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12 border-t border-slate-200 pt-8" aria-labelledby="related-posts-heading">
      <h2 id="related-posts-heading" className="text-2xl font-bold text-slate-900">
        Related Posts
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {posts.map((item) => (
          <Link
            key={item.slug}
            href={`/${item.slug}`}
            className="rounded-2xl border border-slate-200 p-4 transition hover:border-primary/30 hover:shadow-sm"
          >
            <p className="font-semibold text-slate-900">{item.title}</p>
            <p className="mt-2 line-clamp-3 text-sm text-slate-600">
              {item.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

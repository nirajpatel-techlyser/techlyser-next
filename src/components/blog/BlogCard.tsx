import Link from "next/link";
import CoverImage from "@/components/media/CoverImage";
import type { BlogPost } from "@/types/blog";

type BlogCardProps = {
  post: BlogPost;
  formattedDate: string;
};

export default function BlogCard({ post, formattedDate }: BlogCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {post.coverImage ? (
        <Link
          href={`/${post.slug}`}
          className="block overflow-hidden border-b border-slate-100 bg-white"
        >
          <CoverImage
            src={post.coverImage}
            alt={post.title}
            fit="natural"
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="h-auto w-full"
          />
        </Link>
      ) : null}

      <div className="p-6">
        <p className="text-sm text-slate-500">{formattedDate}</p>
        <h2 className="mt-3 text-xl font-semibold text-slate-900 lg:text-2xl">
          <Link href={`/${post.slug}`} className="hover:text-primary">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? (
          <p className="mt-3 line-clamp-3 text-slate-600">{post.excerpt}</p>
        ) : null}
        <Link
          href={`/${post.slug}`}
          className="mt-5 inline-flex text-sm font-semibold text-primary hover:text-primary-hover"
        >
          Read article →
        </Link>
      </div>
    </article>
  );
}

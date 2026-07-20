import Image from "next/image";
import Link from "next/link";
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
          className="relative block aspect-video overflow-hidden bg-slate-50"
        >
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-contain p-2"
          />
        </Link>
      ) : null}

      <div className="p-6">
        <p className="text-sm text-slate-500">{formattedDate}</p>
        <h2 className="mt-3 text-xl font-semibold text-slate-900 lg:text-2xl">
          <Link href={`/${post.slug}`} className="hover:text-blue-600">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? (
          <p className="mt-3 line-clamp-3 text-slate-600">{post.excerpt}</p>
        ) : null}
        <Link
          href={`/${post.slug}`}
          className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Read article →
        </Link>
      </div>
    </article>
  );
}

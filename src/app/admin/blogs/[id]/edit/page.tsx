import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogForm from "@/components/admin/forms/BlogForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

function toLocalInputValue(date: Date | null) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EditBlogPage({ params }: PageProps) {
  const { id } = await params;
  const blog = await prisma.blog.findUnique({ where: { id } });

  if (!blog) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Edit Blog
        </h1>
        <p className="mt-2 text-slate-600">{blog.title}</p>
      </div>
      <BlogForm
        initialValues={{
          id: blog.id,
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt || "",
          content: blog.content,
          featuredImage: blog.featuredImage,
          category: blog.category || "",
          tags: blog.tags.join(", "),
          author: blog.author,
          seoTitle: blog.seoTitle || "",
          seoDescription: blog.seoDescription || "",
          metaKeywords: blog.metaKeywords || "",
          status: blog.status,
          featured: blog.featured,
          commentsEnabled: blog.commentsEnabled,
          publishedAt: toLocalInputValue(blog.publishedAt),
          scheduledAt: toLocalInputValue(blog.scheduledAt),
        }}
      />
    </div>
  );
}

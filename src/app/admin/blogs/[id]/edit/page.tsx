import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogForm from "@/components/admin/forms/BlogForm";
import SocialPublishPanel from "@/components/admin/social/SocialPublishPanel";
import { LIFECYCLE_LABEL } from "@/social/labels";
import { composeSocialPublishView } from "@/social/store";

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

  const social = await composeSocialPublishView({
    blogId: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt || "",
    content: blog.content,
    featuredImage: blog.featuredImage,
    tags: blog.tags,
    linkedinPersonalPost: blog.linkedinPersonalPost || "",
    linkedinPagePost: blog.linkedinPagePost || "",
    websiteStatus: blog.status,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Edit Blog
        </h1>
        <p className="mt-2 text-slate-600">{blog.title}</p>
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          <div>
            <dt className="inline font-medium text-slate-800">Website status: </dt>
            <dd className="inline">{blog.status === "PUBLISHED" ? "Published" : "Draft"}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-slate-800">Social: </dt>
            <dd className="inline">{LIFECYCLE_LABEL[social.lifecycle] || social.lifecycle}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-slate-800">Image: </dt>
            <dd className="inline">{blog.featuredImage ? "Attached" : "Missing"}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-slate-800">Created: </dt>
            <dd className="inline">{blog.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-slate-800">Updated: </dt>
            <dd className="inline">{blog.updatedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</dd>
          </div>
        </dl>
      </div>
      <SocialPublishPanel initial={social} />
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
          linkedinPersonalPost: blog.linkedinPersonalPost || "",
          linkedinPagePost: blog.linkedinPagePost || "",
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

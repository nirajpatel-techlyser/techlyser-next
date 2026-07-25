import BlogForm from "@/components/admin/forms/BlogForm";

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Create Blog
        </h1>
        <p className="mt-2 text-slate-600">
          Write, optimize SEO, and publish a new article.
        </p>
      </div>
      <BlogForm />
    </div>
  );
}

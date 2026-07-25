"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BlogStatus } from "@prisma/client";
import { createBlog, updateBlog, type BlogInput } from "@/actions/blogs";
import TiptapEditor from "@/components/admin/editor/TiptapEditor";
import ImageUploader from "@/components/admin/forms/ImageUploader";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export type BlogFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  category: string;
  tags: string;
  author: string;
  seoTitle: string;
  seoDescription: string;
  metaKeywords: string;
  status: BlogStatus;
  featured: boolean;
  commentsEnabled: boolean;
  publishedAt: string;
  scheduledAt: string;
};

type BlogFormProps = {
  initialValues?: Partial<BlogFormValues>;
};

const defaults: BlogFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featuredImage: null,
  category: "Shopify",
  tags: "",
  author: "Techlyser Web Solutions",
  seoTitle: "",
  seoDescription: "",
  metaKeywords: "",
  status: BlogStatus.DRAFT,
  featured: false,
  commentsEnabled: false,
  publishedAt: "",
  scheduledAt: "",
};

export default function BlogForm({ initialValues }: BlogFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<BlogFormValues>({
    ...defaults,
    ...initialValues,
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug));
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [pending, startTransition] = useTransition();

  const tagList = useMemo(
    () =>
      values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [values.tags],
  );

  function updateField<K extends keyof BlogFormValues>(
    key: K,
    value: BlogFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function buildPayload(status: BlogStatus): BlogInput {
    return {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      content: values.content,
      featuredImage: values.featuredImage,
      category: values.category || null,
      tags: tagList,
      author: values.author || "Techlyser Web Solutions",
      seoTitle: values.seoTitle || values.title,
      seoDescription: values.seoDescription || values.excerpt,
      metaKeywords: values.metaKeywords || tagList.join(", "),
      status,
      featured: values.featured,
      commentsEnabled: values.commentsEnabled,
      publishedAt: values.publishedAt || null,
      scheduledAt: values.scheduledAt || null,
    };
  }

  function onSubmit(status: BlogStatus) {
    setError("");
    setSavedMsg("");
    startTransition(async () => {
      const payload = buildPayload(status);
      const result = values.id
        ? await updateBlog(values.id, payload)
        : await createBlog(payload);

      if (!result.success) {
        setError(result.error || "Something went wrong");
        return;
      }

      if (values.id) {
        setValues((prev) => ({ ...prev, status }));
        setSavedMsg(
          status === BlogStatus.PUBLISHED
            ? "Saved. Comments and other changes are live on the public page."
            : "Draft saved.",
        );
        router.refresh();
        return;
      }

      router.push(`/admin/blogs/${result.id}/edit`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              value={values.title}
              onChange={(e) => {
                const title = e.target.value;
                updateField("title", title);
                if (!slugTouched) {
                  updateField("slug", slugify(title));
                }
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              placeholder="Blog title"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Slug
            </label>
            <input
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                updateField("slug", slugify(e.target.value));
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Excerpt
            </label>
            <textarea
              value={values.excerpt}
              onChange={(e) => updateField("excerpt", e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Content
            </label>
            <TiptapEditor
              value={values.content}
              onChange={(html) => updateField("content", html)}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Featured Image
            </h3>
            <div className="mt-4">
              <ImageUploader
                value={values.featuredImage}
                onChange={(url) => updateField("featuredImage", url)}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category
              </label>
              <input
                value={values.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Tags (comma separated)
              </label>
              <input
                value={values.tags}
                onChange={(e) => updateField("tags", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Author
              </label>
              <input
                value={values.author}
                onChange={(e) => updateField("author", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={values.featured}
                onChange={(e) => updateField("featured", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary"
              />
              Featured post
            </label>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <label className="flex items-start gap-3 text-sm text-slate-800">
                <input
                  type="checkbox"
                  checked={values.commentsEnabled}
                  onChange={(e) =>
                    updateField("commentsEnabled", e.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary"
                />
                <span>
                  <span className="font-semibold">Enable comments / queries</span>
                  <span className="mt-1 block text-xs text-slate-600">
                    Shows a comment form on the public blog page after you save.
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              SEO
            </h3>
            <input
              value={values.seoTitle}
              onChange={(e) => updateField("seoTitle", e.target.value)}
              placeholder="SEO Title"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
            <textarea
              value={values.seoDescription}
              onChange={(e) => updateField("seoDescription", e.target.value)}
              placeholder="SEO Description"
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
            <input
              value={values.metaKeywords}
              onChange={(e) => updateField("metaKeywords", e.target.value)}
              placeholder="Meta keywords"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Publishing
            </h3>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Published at
              </label>
              <input
                type="datetime-local"
                value={values.publishedAt}
                onChange={(e) => updateField("publishedAt", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Schedule publish
              </label>
              <input
                type="datetime-local"
                value={values.scheduledAt}
                onChange={(e) => updateField("scheduledAt", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {savedMsg ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {savedMsg}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {values.id ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => onSubmit(values.status)}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save Changes"}
          </button>
        ) : null}
        <button
          type="button"
          disabled={pending}
          onClick={() => onSubmit(BlogStatus.DRAFT)}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Save Draft
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => onSubmit(BlogStatus.PUBLISHED)}
          className={`rounded-xl px-5 py-3 text-sm font-semibold transition disabled:opacity-60 ${
            values.id
              ? "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
              : "bg-primary text-white hover:bg-primary-hover"
          }`}
        >
          {pending ? "Saving…" : values.status === BlogStatus.PUBLISHED ? "Update & Keep Published" : "Publish"}
        </button>
        {values.slug ? (
          <a
            href={`/${values.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Preview
          </a>
        ) : null}
      </div>
      <p className="text-xs text-slate-500">
        Tip: After enabling comments, click <span className="font-semibold">Save Changes</span>{" "}
        (or Publish) before opening Preview — Preview alone does not save.
      </p>
    </div>
  );
}

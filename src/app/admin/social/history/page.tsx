import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RetryAttemptButton from "@/components/admin/social/RetryAttemptButton";
import { PLATFORM_LABEL } from "@/social/labels";
import type { SocialPlatform } from "@/social/types";

const PAGE_SIZE = 15;

export default async function SocialHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || "1") || 1);
  const where = {};
  const [total, jobs] = await Promise.all([
    prisma.socialPublishJob.count({ where }),
    prisma.socialPublishJob.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        status: true,
        createdAt: true,
        blog: { select: { id: true, title: true, slug: true } },
        attempts: {
          select: {
            id: true,
            platform: true,
            status: true,
            publishedUrl: true,
            secondaryPublishedUrl: true,
            errorMessage: true,
            retryable: true,
          },
        },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Social history</h1>
        <p className="mt-2 text-slate-600">Recent publish jobs. Each platform keeps its own result.</p>
      </div>
      {jobs.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-sm text-slate-500">
          No social posts have been published yet.
        </p>
      ) : (
        jobs.map((job) => (
          <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{job.blog.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Kolkata",
                  }).format(job.createdAt)}
                </p>
              </div>
              <Link href={`/admin/blogs/${job.blog.id}/edit`} className="text-sm font-semibold text-primary hover:underline">
                View post
              </Link>
            </div>
            <ul className="mt-4 space-y-2">
              {job.attempts.map((attempt) => (
                <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-800">
                    {PLATFORM_LABEL[attempt.platform as SocialPlatform] || attempt.platform}
                  </span>
                  <span className="flex flex-wrap items-center gap-3">
                    <span className={attempt.status === "PUBLISHED" ? "text-emerald-700" : attempt.status === "FAILED" ? "text-red-700" : "text-slate-600"}>
                      {attempt.status === "PUBLISHED" ? "Published" : attempt.status === "FAILED" ? "Failed" : attempt.status}
                    </span>
                    {attempt.publishedUrl ? (
                      <a href={attempt.publishedUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                        {attempt.secondaryPublishedUrl ? "Profile" : "Open"}
                      </a>
                    ) : null}
                    {attempt.secondaryPublishedUrl ? (
                      <a href={attempt.secondaryPublishedUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                        Page
                      </a>
                    ) : null}
                    {attempt.status === "FAILED" ? (
                      <RetryAttemptButton
                        attemptId={attempt.id}
                        label={PLATFORM_LABEL[attempt.platform as SocialPlatform] || "platform"}
                      />
                    ) : null}
                  </span>
                  {attempt.errorMessage ? (
                    <p className="w-full text-red-700">{attempt.errorMessage}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </article>
        ))
      )}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-3">
          {page > 1 ? (
            <Link href={`/admin/social/history?page=${page - 1}`} className="font-semibold text-primary hover:underline">
              Previous
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link href={`/admin/social/history?page=${page + 1}`} className="font-semibold text-primary hover:underline">
              Next
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

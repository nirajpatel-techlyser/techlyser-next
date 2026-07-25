import { prisma } from "@/lib/prisma";
import CommentsTable from "@/components/admin/tables/CommentsTable";

export default async function AdminCommentsPage() {
  const comments = await prisma.blogComment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      blog: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Comments
        </h1>
        <p className="mt-2 text-slate-600">
          Moderate blog comments and queries before they appear publicly.
        </p>
      </div>

      <CommentsTable
        comments={comments.map((comment) => ({
          id: comment.id,
          name: comment.name,
          email: comment.email,
          content: comment.content,
          status: comment.status,
          createdAt: comment.createdAt.toISOString(),
          blogTitle: comment.blog.title,
          blogSlug: comment.blog.slug,
        }))}
      />
    </div>
  );
}

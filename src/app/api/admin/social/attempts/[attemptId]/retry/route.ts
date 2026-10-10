import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { retrySocialAttempt } from "@/social/job";
import { loadSocialPublishView } from "@/social/store";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ attemptId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { session, error } = await requireAdminApi();
  if (error || !session) return error;
  if (session.user.role === "EDITOR") {
    return NextResponse.json({ error: "Only an admin can retry publishing." }, { status: 403 });
  }
  const { attemptId } = await context.params;
  const result = await retrySocialAttempt(attemptId);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  const attempt = await prisma.socialPublishAttempt.findUnique({
    where: { id: attemptId },
    select: { blogId: true },
  });
  const view = attempt ? await loadSocialPublishView(attempt.blogId) : null;
  return NextResponse.json({ jobId: result.jobId, view });
}

import { after, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { readJobStatus, runSocialJob } from "@/social/job";

type RouteContext = { params: Promise<{ jobId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { session, error } = await requireAdminApi();
  if (error || !session) return error;
  if (session.user.role === "EDITOR") {
    return NextResponse.json({ error: "Only an admin can view publishing jobs." }, { status: 403 });
  }
  const { jobId } = await context.params;
  const queued = await readJobStatus(jobId);
  if (!queued) return NextResponse.json({ error: "Publishing job not found." }, { status: 404 });
  if (queued.status === "QUEUED") {
    after(() => runSocialJob(jobId));
  }
  return NextResponse.json({
    id: queued.id,
    status: queued.status,
    blogId: queued.blogId,
    lifecycle: queued.distribution.status,
    attempts: queued.attempts,
  });
}

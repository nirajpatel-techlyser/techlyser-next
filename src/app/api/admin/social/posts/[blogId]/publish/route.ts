import { after, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { runSocialJob, startPublishJob } from "@/social/job";
import { loadSocialPublishView } from "@/social/store";
import { isSocialPlatform, type SocialPlatform } from "@/social/types";

type RouteContext = { params: Promise<{ blogId: string }> };

async function guard() {
  const { session, error } = await requireAdminApi();
  if (error || !session) return { session: null, error };
  if (session.user.role === "EDITOR") {
    return {
      session: null,
      error: NextResponse.json({ error: "Only an admin can publish social posts." }, { status: 403 }),
    };
  }
  return { session, error: null };
}

export async function GET(_request: Request, context: RouteContext) {
  const { error } = await guard();
  if (error) return error;
  const { blogId } = await context.params;
  const view = await loadSocialPublishView(blogId);
  if (!view) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  return NextResponse.json(view);
}

export async function POST(request: Request, context: RouteContext) {
  const { error } = await guard();
  if (error) return error;
  const { blogId } = await context.params;
  const body = (await request.json().catch(() => null)) as { platforms?: string[] } | null;
  const platforms = (body?.platforms || []).filter(isSocialPlatform);
  const unique = [...new Set(platforms)] as SocialPlatform[];
  if (unique.length === 0) {
    return NextResponse.json({ error: "Select at least one platform." }, { status: 400 });
  }
  const result = await startPublishJob({ blogId, platforms: unique });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  if (result.created && result.jobId) {
    const jobId = result.jobId;
    after(() => runSocialJob(jobId));
  }
  const view = await loadSocialPublishView(blogId);
  return NextResponse.json({ jobId: result.jobId, view }, { status: result.status });
}

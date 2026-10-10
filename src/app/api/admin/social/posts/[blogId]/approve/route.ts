import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { loadSocialPublishView, loadWebsitePost } from "@/social/store";
import { evaluatePublish } from "@/social/validate";

type RouteContext = { params: Promise<{ blogId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { session, error } = await requireAdminApi();
  if (error || !session?.user?.id) return error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "EDITOR") {
    return NextResponse.json({ error: "Only an admin can approve social publishing." }, { status: 403 });
  }
  const { blogId } = await context.params;
  const post = await loadWebsitePost(blogId);
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (!post.title.trim() || !post.content.trim()) {
    return NextResponse.json({ error: "Add a title and post content before approving." }, { status: 400 });
  }
  const accounts = await prisma.socialAccount.findMany({
    where: { status: "CONNECTED" },
    select: { platform: true },
    take: 8,
  });
  const gate = evaluatePublish({
    websitePublished: post.websiteStatus === "PUBLISHED",
    approved: true,
    hasContent: true,
    featuredImage: post.featuredImage,
    selected: accounts.map((account) => account.platform),
    connected: accounts.map((account) => account.platform),
  });
  await prisma.socialDistribution.upsert({
    where: { blogId },
    create: {
      blogId,
      approvedAt: new Date(),
      approvedByUserId: session.user.id,
      status: gate.ok ? "READY_TO_PUBLISH" : "APPROVED",
    },
    update: {
      approvedAt: new Date(),
      approvedByUserId: session.user.id,
      status: gate.ok ? "READY_TO_PUBLISH" : "APPROVED",
    },
  });
  const view = await loadSocialPublishView(blogId);
  return NextResponse.json(view);
}

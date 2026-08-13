import { BlogStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { runMarketResearch } from "@/ai/research";
import { runOpportunityEngine } from "@/ai/opportunity";
import { generateArticleDraft } from "@/ai/writer";
import { optimizeSeoAndGeo } from "@/ai/seo";
import {
  AUTOPILOT_WORKFLOW_ID,
  autopilotGenerateImageEnabled,
  autopilotOncePerDay,
  autopilotPublishEnabled,
  isAutopilotEnabled,
} from "./config";
import { generateFeaturedImage } from "./image";
import { markTopicUsed, pickNextAutopilotTopic } from "./pick-topic";
import type { DailyAutopilotOptions, DailyAutopilotReport } from "./types";

function startOfTodayUtc() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function alreadyRanToday(): Promise<boolean> {
  const run = await prisma.aiAgentRun.findFirst({
    where: {
      workflowId: AUTOPILOT_WORKFLOW_ID,
      status: "SUCCEEDED",
      createdAt: { gte: startOfTodayUtc() },
    },
    select: { id: true },
  });
  return Boolean(run);
}

async function createRun() {
  return prisma.aiAgentRun.create({
    data: {
      workflowId: AUTOPILOT_WORKFLOW_ID,
      status: "RUNNING",
      currentStep: "research",
      startedAt: new Date(),
    },
  });
}

async function completeRun(
  runId: string,
  output: DailyAutopilotReport,
  errorMessage?: string,
) {
  return prisma.aiAgentRun.update({
    where: { id: runId },
    data: {
      status: errorMessage ? "FAILED" : "SUCCEEDED",
      currentStep: errorMessage ? "failed" : "done",
      output: output as object,
      errorMessage: errorMessage || null,
      completedAt: new Date(),
    },
  });
}

export async function runDailyAutopilot(
  options: DailyAutopilotOptions = {},
): Promise<DailyAutopilotReport> {
  const oncePerDay = options.oncePerDay ?? autopilotOncePerDay();
  const refreshMarket = options.refreshMarket !== false;
  const applySeo = options.applySeo !== false;
  const generateImage =
    options.generateImage ?? autopilotGenerateImageEnabled();

  const report: DailyAutopilotReport = {
    workflowId: AUTOPILOT_WORKFLOW_ID,
    runId: "",
    skipped: false,
    steps: {},
  };

  if (!isAutopilotEnabled()) {
    report.skipped = true;
    report.skipReason = "AI_AUTOPILOT_ENABLED is off";
    return report;
  }

  if (oncePerDay && (await alreadyRanToday())) {
    report.skipped = true;
    report.skipReason = "Already ran successfully today";
    return report;
  }

  if (options.dryRun) {
    const topic = await pickNextAutopilotTopic();
    report.skipped = true;
    report.skipReason = "dryRun";
    report.topic = topic || undefined;
    return report;
  }

  const run = await createRun();
  report.runId = run.id;

  try {
    if (refreshMarket) {
      report.steps.research = { ok: false };
      const research = await runMarketResearch({
        createRun: true,
        runTitle: `Autopilot research ${new Date().toISOString().slice(0, 10)}`,
        locale: "en-IN",
      });
      report.steps.research = {
        ok: true,
        detail: `collected ${research.collected}, upserted ${research.upserted}`,
      };

      report.steps.opportunities = { ok: false };
      const opp = await runOpportunityEngine({ limit: 80 });
      report.steps.opportunities = {
        ok: true,
        detail: `analyzed ${opp.analyzed}, upserted ${opp.upserted}`,
      };
    }

    report.steps.pickTopic = { ok: false };
    const topic = await pickNextAutopilotTopic();
    if (!topic) {
      report.skipped = true;
      report.skipReason = "No content idea or opportunity available";
      await completeRun(run.id, report);
      return report;
    }
    report.topic = topic;
    report.steps.pickTopic = { ok: true, detail: `${topic.source}: ${topic.keyword}` };

    report.steps.write = { ok: false };
    const draft = await generateArticleDraft({
      keyword: topic.keyword,
      audience: topic.audience,
      searchIntent: topic.searchIntent,
      category: topic.category,
      tone: topic.tone,
      length: topic.length,
      contentIdeaId: topic.contentIdeaId,
    });
    report.blogId = draft.blogId;
    report.slug = draft.slug;
    report.steps.write = {
      ok: true,
      detail: `${draft.seoTitle} (${draft.readingTimeMinutes} min)`,
    };

    await markTopicUsed(topic, draft.blogId);

    if (generateImage && draft.output.featuredImagePrompt) {
      report.steps.image = { ok: false };
      try {
        const image = await generateFeaturedImage({
          prompt: draft.output.featuredImagePrompt,
          slug: draft.slug,
        });
        if (image?.url) {
          await prisma.blog.update({
            where: { id: draft.blogId },
            data: { featuredImage: image.url },
          });
          report.featuredImage = image.url;
          report.steps.image = {
            ok: true,
            detail: `${image.storage} · ${image.model}`,
          };
        } else {
          report.steps.image = { ok: false, detail: "skipped (no OpenAI key)" };
        }
      } catch (err) {
        report.steps.image = {
          ok: false,
          detail: err instanceof Error ? err.message : "image failed",
        };
      }
    }

    if (applySeo) {
      report.steps.seoGeo = { ok: false };
      const optimized = await optimizeSeoAndGeo({
        blogId: draft.blogId,
        primaryKeyword: topic.keyword,
        apply: true,
      });
      report.seoScore = optimized.seo.score;
      report.geoScore = optimized.geo.score;
      report.steps.seoGeo = {
        ok: true,
        detail: `SEO ${optimized.seo.score} · GEO ${optimized.geo.score}`,
      };
    }

    if (autopilotPublishEnabled()) {
      await prisma.blog.update({
        where: { id: draft.blogId },
        data: {
          status: BlogStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });
      report.steps.done = { ok: true, detail: "published" };
    } else {
      report.steps.done = { ok: true, detail: "saved as DRAFT" };
    }

    await completeRun(run.id, report);
    return report;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Autopilot failed";
    report.steps.done = { ok: false, detail: message };
    await completeRun(run.id, report, message);
    throw err;
  }
}

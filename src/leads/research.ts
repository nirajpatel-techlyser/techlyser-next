import { LeadStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { websiteForDomain, normalizeDomain } from "@/leads/domain";
import { fetchPublicHtml } from "@/leads/fetch-site";
import { googleCseHits, manualHits, type DiscoveryHit } from "@/leads/providers";
import { countAppScripts, ecommerceSignals, qualifyFromFacts } from "@/leads/qualify";
import { detectShopify } from "@/leads/shopify";
import { extractPublicEmail, extractSocialProfiles, pageTitle } from "@/leads/social";
import { isLeadMarket, type LeadMarketId } from "@/leads/markets";

const BATCH = 3;
const LOCKED: LeadStatus[] = ["CONTACTED", "REPLIED", "CONVERTED"];

function asTargets(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export async function createResearchJob(input: {
  country: string;
  city?: string;
  niche: string;
  keywords: string;
  limit: number;
  shopifyOnly: boolean;
  minScore: number;
  domains: string[];
  userId?: string | null;
}) {
  if (!isLeadMarket(input.country)) {
    throw new Error("Choose United States, Canada, Australia, New Zealand, Denmark, or Europe.");
  }
  const limit = Math.min(25, Math.max(1, input.limit));
  const manual = manualHits(input.domains).slice(0, limit);
  let hits: DiscoveryHit[] = manual;
  let provider = "manual";
  if (hits.length === 0) {
    hits = await googleCseHits({
      country: input.country as LeadMarketId,
      city: input.city,
      niche: input.niche,
      keywords: input.keywords,
      limit,
      domains: [],
    });
    provider = "google_cse";
  }
  const targets = [...new Set(hits.map((hit) => normalizeDomain(hit.url)).filter((domain): domain is string => Boolean(domain)))].slice(0, limit);
  if (targets.length === 0) {
    throw new Error("No research targets. Paste store URLs, or configure Google Custom Search. Mock leads are not created.");
  }
  return prisma.leadResearchJob.create({
    data: {
      status: "QUEUED",
      targetCountry: input.country,
      city: input.city || null,
      niche: input.niche.slice(0, 120),
      keywords: input.keywords.slice(0, 300),
      leadLimit: limit,
      shopifyOnly: input.shopifyOnly,
      minScore: Math.min(100, Math.max(0, input.minScore)),
      provider,
      targets,
      createdByUserId: input.userId || null,
    },
    select: { id: true, status: true, provider: true, leadLimit: true },
  });
}

export async function stepResearchJob(jobId: string) {
  const job = await prisma.leadResearchJob.findUnique({ where: { id: jobId } });
  if (!job) return { error: "Research job not found.", status: 404 as const };
  if (job.status === "CANCELLED" || job.status === "COMPLETED") {
    return { jobId, done: true, status: job.status };
  }
  const targets = asTargets(job.targets);
  if (job.cursor >= targets.length) {
    await prisma.leadResearchJob.update({
      where: { id: job.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    return { jobId, done: true, status: "COMPLETED" as const };
  }

  await prisma.leadResearchJob.update({
    where: { id: job.id },
    data: { status: "RUNNING", startedAt: job.startedAt || new Date() },
  });

  const slice = targets.slice(job.cursor, job.cursor + BATCH);
  let cursor = job.cursor;
  let discovered = job.discoveredCount;
  let errorMessage: string | null = null;

  for (const domain of slice) {
    cursor += 1;
    try {
      const suppressed = await prisma.leadSuppression.findUnique({
        where: { domain },
        select: { id: true },
      });
      if (suppressed) continue;
      await researchDomain({
        domain,
        jobId: job.id,
        niche: job.niche,
        targetCountry: job.targetCountry,
        minScore: job.minScore,
        shopifyOnly: job.shopifyOnly,
        source: job.provider,
      });
      discovered += 1;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Research failed.";
    }
  }

  const done = cursor >= targets.length;
  await prisma.leadResearchJob.update({
    where: { id: job.id },
    data: {
      cursor,
      discoveredCount: discovered,
      status: done ? "COMPLETED" : "RUNNING",
      completedAt: done ? new Date() : null,
      errorMessage,
    },
  });
  return { jobId, done, status: done ? "COMPLETED" : "RUNNING", cursor, total: targets.length, errorMessage };
}

async function researchDomain(input: {
  domain: string;
  jobId: string;
  niche: string;
  targetCountry: string;
  minScore: number;
  shopifyOnly: boolean;
  source: string;
}) {
  const fetched = await fetchPublicHtml(websiteForDomain(input.domain));
  const shopify = detectShopify(fetched.html);
  const profiles = extractSocialProfiles(fetched.html);
  const email = extractPublicEmail(fetched.html);
  const signals = ecommerceSignals(fetched.html);
  const qualification = qualifyFromFacts(
    {
      name: pageTitle(fetched.html) || input.domain,
      domain: input.domain,
      niche: input.niche,
      targetCountry: input.targetCountry,
      countryCode: null,
      shopify,
      profiles,
      publicEmail: email,
      ecommerceSignals: signals,
      appScriptCount: countAppScripts(fetched.html),
    },
    input.minScore,
  );
  const status =
    input.shopifyOnly && !shopify.shopifyDetected ? "DISQUALIFIED" : qualification.status;
  const existing = await prisma.lead.findUnique({
    where: { domain: input.domain },
    select: { id: true, status: true, notes: true },
  });
  const keepStatus = existing && LOCKED.includes(existing.status);
  const data = {
    website: websiteForDomain(input.domain),
    name: (pageTitle(fetched.html) || input.domain).slice(0, 180),
    targetCountry: input.targetCountry,
    publicEmail: email,
    shopifyDetected: shopify.shopifyDetected,
    shopifyConfidence: shopify.confidence,
    shopifyEvidence: shopify.evidence,
    shopifyCheckedAt: new Date(shopify.checkedAt),
    score: qualification.score,
    scoreExplanation: qualification.explanation,
    observedFacts: qualification.observedFacts,
    hypotheses: qualification.hypotheses,
    recommendedServices: qualification.recommendedServices,
    source: input.source,
    lastVerifiedAt: new Date(),
    jobId: input.jobId,
    ...(keepStatus ? {} : { status }),
  };
  const lead = existing
    ? await prisma.lead.update({ where: { id: existing.id }, data, select: { id: true } })
    : await prisma.lead.create({
        data: { domain: input.domain, ...data },
        select: { id: true },
      });

  for (const profile of profiles) {
    await prisma.leadSocialProfile.upsert({
      where: { leadId_platform: { leadId: lead.id, platform: profile.platform } },
      create: {
        leadId: lead.id,
        platform: profile.platform,
        url: profile.url,
        verification: profile.verification,
        evidence: profile.evidence,
      },
      update: {
        url: profile.url,
        verification: profile.verification,
        evidence: profile.evidence,
        checkedAt: new Date(),
      },
    });
  }
}

export async function cancelResearchJob(jobId: string) {
  await prisma.leadResearchJob.updateMany({
    where: { id: jobId, status: { in: ["QUEUED", "RUNNING"] } },
    data: { status: "CANCELLED", completedAt: new Date() },
  });
}

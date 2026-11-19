import { BizWebsiteStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCategoryById } from "@/lib/business-discovery/categories";
import {
  getCountryName,
  isValidCountryCode,
} from "@/lib/business-discovery/countries";
import { resolveCityCoordinates } from "@/lib/business-discovery/geocode";
import type { BusinessDiscoveryHit } from "@/lib/business-discovery/provider-interface";
import {
  defaultDiscoveryProviderId,
  getDiscoveryProvider,
} from "@/lib/business-discovery/providers/registry";

export type DiscoveryFilters = {
  websiteFilter: "any" | "no_website_listed" | "unverified";
  requireEmail: boolean;
  requirePhone: boolean;
};

export type CreateDiscoveryJobInput = {
  countryCode: string;
  cities: string[];
  categories: string[];
  radiusKm?: number;
  resultLimit?: number;
  websiteFilter?: DiscoveryFilters["websiteFilter"];
  requireEmail?: boolean;
  requirePhone?: boolean;
  provider?: string;
  userId?: string | null;
};

function websiteStatusForHit(hit: BusinessDiscoveryHit): BizWebsiteStatus {
  return hit.websiteUrl ? "WEBSITE_UNVERIFIED" : "NO_WEBSITE_LISTED";
}

function readFilters(value: Prisma.JsonValue | null | undefined): DiscoveryFilters {
  const obj = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const record = obj as Record<string, unknown>;
  const websiteFilter =
    record.websiteFilter === "any" ||
    record.websiteFilter === "unverified" ||
    record.websiteFilter === "no_website_listed"
      ? record.websiteFilter
      : "no_website_listed";
  return {
    websiteFilter,
    requireEmail: Boolean(record.requireEmail),
    requirePhone: Boolean(record.requirePhone),
  };
}

async function upsertHit(hit: BusinessDiscoveryHit, jobId: string) {
  const data = {
    businessName: hit.businessName,
    category: hit.categoryLabel,
    categoryGroup: hit.categoryGroup || null,
    countryCode: hit.countryCode,
    countryName: hit.countryName,
    city: hit.city,
    address: hit.address || null,
    phone: hit.phone || null,
    publicEmail: hit.publicEmail || null,
    websiteUrl: hit.websiteUrl || null,
    websiteStatus: websiteStatusForHit(hit),
    description: hit.description || null,
    openingHours: (hit.openingHours as Prisma.InputJsonValue) ?? undefined,
    locationData: {
      latitude: hit.latitude,
      longitude: hit.longitude,
    } as Prisma.InputJsonValue,
    sourceUrl: hit.sourceUrl || null,
    sourceMetadata: (hit.sourceMetadata || {}) as Prisma.InputJsonValue,
    jobId,
  };

  return prisma.businessOpportunity.upsert({
    where: {
      provider_providerRecordId: {
        provider: hit.provider,
        providerRecordId: hit.providerRecordId,
      },
    },
    create: {
      provider: hit.provider,
      providerRecordId: hit.providerRecordId,
      leadStatus: "NEW",
      ...data,
    },
    update: data,
    select: { id: true },
  });
}

export async function createDiscoveryJob(input: CreateDiscoveryJobInput) {
  const countryCode = input.countryCode?.trim().toUpperCase();
  if (!countryCode || !isValidCountryCode(countryCode)) {
    throw new Error("Select a valid country.");
  }

  const cities = [
    ...new Set((input.cities || []).map((c) => c.trim()).filter(Boolean)),
  ];
  if (cities.length === 0) {
    throw new Error("Select or enter at least one city.");
  }

  const categories = [
    ...new Set((input.categories || []).map((c) => c.trim()).filter(Boolean)),
  ];
  if (categories.length === 0) {
    throw new Error("Select at least one business category.");
  }
  for (const id of categories) {
    if (!getCategoryById(id)) throw new Error(`Unknown category: ${id}`);
  }

  const provider = getDiscoveryProvider(
    input.provider || defaultDiscoveryProviderId(),
  );
  if (!provider?.configured()) {
    throw new Error(
      "No discovery provider is configured. OpenStreetMap Overpass is available without an API key.",
    );
  }

  const resultLimit = Math.min(100, Math.max(5, Number(input.resultLimit) || 25));
  const radiusKm = Math.min(100, Math.max(1, Number(input.radiusKm) || 10));
  const filters: DiscoveryFilters = {
    websiteFilter: input.websiteFilter || "no_website_listed",
    requireEmail: Boolean(input.requireEmail),
    requirePhone: Boolean(input.requirePhone),
  };

  return prisma.businessOpportunityJob.create({
    data: {
      status: "QUEUED",
      step: "PENDING",
      progress: 0,
      countryCode,
      countryName: getCountryName(countryCode),
      cities,
      categories,
      radiusKm,
      resultLimit,
      provider: provider.id,
      filters,
      discoveredCount: 0,
      createdByUserId: input.userId || null,
    },
    select: { id: true, status: true, provider: true, resultLimit: true },
  });
}

export async function stepDiscoveryJob(jobId: string) {
  const job = await prisma.businessOpportunityJob.findUnique({
    where: { id: jobId },
  });
  if (!job) return { error: "Discovery job not found.", status: 404 as const };
  if (job.status === "CANCELLED" || job.status === "COMPLETED") {
    return {
      jobId,
      done: true,
      status: job.status,
      discoveredCount: job.discoveredCount,
    };
  }
  if (job.status === "FAILED") {
    return {
      jobId,
      done: true,
      status: job.status,
      errorMessage: job.errorMessage,
      discoveredCount: job.discoveredCount,
    };
  }

  const provider = getDiscoveryProvider(job.provider);
  if (!provider?.configured()) {
    await prisma.businessOpportunityJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        step: "FAILED",
        errorMessage: "Discovery provider is not configured.",
        completedAt: new Date(),
      },
    });
    return {
      jobId,
      done: true,
      status: "FAILED" as const,
      errorMessage: "Discovery provider is not configured.",
    };
  }

  const filters = readFilters(job.filters);
  const categories = job.categories
    .map((id) => getCategoryById(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  if (categories.length === 0) {
    await prisma.businessOpportunityJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        step: "FAILED",
        errorMessage: "Job has no valid categories.",
        completedAt: new Date(),
      },
    });
    return {
      jobId,
      done: true,
      status: "FAILED" as const,
      errorMessage: "Job has no valid categories.",
    };
  }

  await prisma.businessOpportunityJob.update({
    where: { id: job.id },
    data: {
      status: "RUNNING",
      step: "DISCOVERING",
      startedAt: job.startedAt || new Date(),
      progress: 5,
      errorMessage: null,
    },
  });

  const perCityLimit = Math.max(
    5,
    Math.ceil(job.resultLimit / Math.max(1, job.cities.length)),
  );
  let discovered = 0;
  const errors: string[] = [];

  try {
    for (let i = 0; i < job.cities.length; i += 1) {
      const city = job.cities[i];
      const coords = await resolveCityCoordinates(job.countryCode, city);
      if (!coords) {
        errors.push(`Could not geocode city: ${city}`);
        continue;
      }

      const remaining = job.resultLimit - discovered;
      if (remaining <= 0) break;

      const hits = await provider.discover({
        countryCode: job.countryCode,
        countryName: job.countryName,
        city,
        latitude: coords.latitude,
        longitude: coords.longitude,
        radiusKm: job.radiusKm || 10,
        categories,
        limit: Math.min(perCityLimit, remaining),
        websiteFilter: filters.websiteFilter,
        requireEmail: filters.requireEmail,
        requirePhone: filters.requirePhone,
      });

      for (const hit of hits) {
        if (discovered >= job.resultLimit) break;
        await upsertHit(hit, job.id);
        discovered += 1;
      }

      await prisma.businessOpportunityJob.update({
        where: { id: job.id },
        data: {
          discoveredCount: discovered,
          progress: Math.min(
            95,
            Math.round(((i + 1) / job.cities.length) * 90) + 5,
          ),
        },
      });

      // Be polite to Nominatim / Overpass when scanning multiple cities.
      if (i < job.cities.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
    }

    if (discovered === 0) {
      const message =
        errors[0] ||
        "No matching businesses found for these filters. Try another city/category or widen the website filter.";
      await prisma.businessOpportunityJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          step: "COMPLETED",
          progress: 100,
          discoveredCount: 0,
          errorMessage: message,
          completedAt: new Date(),
        },
      });
      return {
        jobId,
        done: true,
        status: "COMPLETED" as const,
        discoveredCount: 0,
        errorMessage: message,
      };
    }

    await prisma.businessOpportunityJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        step: "COMPLETED",
        progress: 100,
        discoveredCount: discovered,
        errorMessage: errors.length ? errors.join(" · ") : null,
        completedAt: new Date(),
      },
    });

    return {
      jobId,
      done: true,
      status: "COMPLETED" as const,
      discoveredCount: discovered,
      errorMessage: errors.length ? errors.join(" · ") : null,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Discovery failed unexpectedly.";
    await prisma.businessOpportunityJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        step: "FAILED",
        discoveredCount: discovered,
        errorMessage: message,
        completedAt: new Date(),
      },
    });
    return {
      jobId,
      done: true,
      status: "FAILED" as const,
      discoveredCount: discovered,
      errorMessage: message,
    };
  }
}

export async function cancelDiscoveryJob(jobId: string) {
  await prisma.businessOpportunityJob.updateMany({
    where: { id: jobId, status: { in: ["QUEUED", "RUNNING"] } },
    data: {
      status: "CANCELLED",
      step: "FAILED",
      completedAt: new Date(),
    },
  });
}

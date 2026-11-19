import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/seo";
import {
  extractVerifiedExtras,
  resolveDisplayName,
} from "@/lib/business-website-generator/verified-fields";
import { getDesignTokens } from "@/lib/business-website-generator/design-systems";
import { fallbackCopy } from "@/lib/business-website-generator/ai-content";
import { assembleFromCategoryTemplate } from "@/lib/business-website-generator/fill-category-template";
import { assembleConceptHtml } from "@/lib/business-website-generator/assemble-html";
import { listBusinessAssets } from "@/lib/business-discovery/images";
import type { ConceptBusiness } from "@/lib/business-website-generator/types";
import {
  categoryIdToPublicSlug,
  isKnownPublicCategorySlug,
  publicSlugToCategoryId,
  resolveCategoryIdFromLabelOrId,
  slugifyHandle,
} from "@/lib/business-website-generator/public-listing-slugs";

export {
  CATEGORY_ID_TO_SLUG,
  RESERVED_PUBLIC_PATHS,
  categoryIdToPublicSlug,
  categoryIdToTemplateFile,
  isKnownPublicCategorySlug,
  publicSlugToCategoryId,
  resolveCategoryIdFromLabelOrId,
  slugifyHandle,
} from "@/lib/business-website-generator/public-listing-slugs";

function publicBaseUrl() {
  const env = (process.env.NEXTAUTH_URL || "").trim().replace(/\/$/, "");
  if (env && !/localhost|127\.0\.0\.1/i.test(env)) return env;
  return siteConfig.url.replace(/\/$/, "");
}

export function getPublicListingPath(input: {
  publicCategorySlug: string;
  publicHandle: string;
}) {
  return `/${input.publicCategorySlug}/${input.publicHandle}`;
}

export function getPublicListingUrl(input: {
  publicCategorySlug: string;
  publicHandle: string;
}) {
  return `${publicBaseUrl()}${getPublicListingPath(input)}`;
}

export async function ensurePublicListingPath(businessOpportunityId: string) {
  const business = await prisma.businessOpportunity.findUnique({
    where: { id: businessOpportunityId },
    select: {
      id: true,
      businessName: true,
      category: true,
      description: true,
      sourceMetadata: true,
      publicCategorySlug: true,
      publicHandle: true,
    },
  });
  if (!business) throw new Error("Business not found.");

  if (business.publicCategorySlug && business.publicHandle) {
    return {
      publicCategorySlug: business.publicCategorySlug,
      publicHandle: business.publicHandle,
      path: getPublicListingPath({
        publicCategorySlug: business.publicCategorySlug,
        publicHandle: business.publicHandle,
      }),
      url: getPublicListingUrl({
        publicCategorySlug: business.publicCategorySlug,
        publicHandle: business.publicHandle,
      }),
    };
  }

  const categoryId =
    resolveCategoryIdFromLabelOrId(business.category) || "doctors";
  const publicCategorySlug =
    categoryIdToPublicSlug(categoryId) || slugifyHandle(business.category);

  const extras = extractVerifiedExtras({
    businessName: business.businessName,
    description: business.description,
    sourceMetadata: business.sourceMetadata,
  });
  const displayName = resolveDisplayName({
    businessName: business.businessName,
    englishName: extras.englishName,
  });

  let base = slugifyHandle(displayName);
  if (base.length < 3) base = slugifyHandle(business.businessName) || "business";

  let publicHandle = base;
  for (let i = 0; i < 40; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const clash = await prisma.businessOpportunity.findFirst({
      where: {
        publicCategorySlug,
        publicHandle: candidate,
        NOT: { id: business.id },
      },
      select: { id: true },
    });
    if (!clash) {
      publicHandle = candidate;
      break;
    }
  }

  await prisma.businessOpportunity.update({
    where: { id: business.id },
    data: { publicCategorySlug, publicHandle },
  });

  return {
    publicCategorySlug,
    publicHandle,
    path: getPublicListingPath({ publicCategorySlug, publicHandle }),
    url: getPublicListingUrl({ publicCategorySlug, publicHandle }),
  };
}

async function toConceptBusiness(id: string): Promise<ConceptBusiness> {
  const business = await prisma.businessOpportunity.findUnique({
    where: { id },
    select: {
      id: true,
      businessName: true,
      category: true,
      categoryGroup: true,
      city: true,
      countryName: true,
      address: true,
      phone: true,
      publicEmail: true,
      websiteUrl: true,
      description: true,
      openingHours: true,
      sourceMetadata: true,
    },
  });
  if (!business) throw new Error("Business not found.");
  const assets = await listBusinessAssets(business.id);
  const extras = extractVerifiedExtras({
    businessName: business.businessName,
    description: business.description,
    sourceMetadata: business.sourceMetadata,
  });
  return {
    id: business.id,
    businessName: business.businessName,
    displayName: resolveDisplayName({
      businessName: business.businessName,
      englishName: extras.englishName,
    }),
    category: business.category,
    categoryGroup: business.categoryGroup,
    city: business.city,
    countryName: business.countryName,
    address: business.address,
    phone: business.phone,
    publicEmail: business.publicEmail,
    websiteUrl: business.websiteUrl,
    description: business.description,
    openingHours: business.openingHours,
    degree: extras.degree,
    specialty: extras.specialty,
    assets,
  };
}

export async function resolvePublicListing(categorySlug: string, handle: string) {
  if (!isKnownPublicCategorySlug(categorySlug)) return null;

  const business = await prisma.businessOpportunity.findFirst({
    where: {
      publicCategorySlug: categorySlug.toLowerCase(),
      publicHandle: handle.toLowerCase(),
    },
    select: {
      id: true,
      businessName: true,
      category: true,
      categoryGroup: true,
      city: true,
      publicCategorySlug: true,
      publicHandle: true,
    },
  });
  if (!business?.publicCategorySlug || !business.publicHandle) return null;

  const concept = await prisma.businessWebsiteConcept.findFirst({
    where: { businessOpportunityId: business.id },
    orderBy: { createdAt: "desc" },
    select: {
      generationStatus: true,
      generatedHtml: true,
    },
  });
  if (concept?.generationStatus === "READY" && concept.generatedHtml.length > 400) {
    return {
      business,
      html: concept.generatedHtml,
      source: "concept" as const,
    };
  }

  const conceptBusiness = await toConceptBusiness(business.id);
  const tokens = getDesignTokens(
    conceptBusiness.category,
    conceptBusiness.categoryGroup,
  );
  const copy = fallbackCopy(conceptBusiness, tokens);
  const categoryId = publicSlugToCategoryId(categorySlug);
  const assembled =
    assembleFromCategoryTemplate({
      business: conceptBusiness,
      tokens,
      copy,
      categoryId,
    }) || assembleConceptHtml({ business: conceptBusiness, tokens, copy });

  return {
    business,
    html: assembled.html,
    source: "template" as const,
  };
}

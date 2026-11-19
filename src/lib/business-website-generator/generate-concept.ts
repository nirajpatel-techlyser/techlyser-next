import { prisma } from "@/lib/prisma";
import { collectBusinessImages, listBusinessAssets } from "@/lib/business-discovery/images";
import { generateConceptCopy } from "@/lib/business-website-generator/ai-content";
import { assembleConceptHtml } from "@/lib/business-website-generator/assemble-html";
import { getDesignTokens } from "@/lib/business-website-generator/design-systems";
import { assembleFromCategoryTemplate } from "@/lib/business-website-generator/fill-category-template";
import { ensurePublicListingPath } from "@/lib/business-website-generator/public-listing";
import { resolveCategoryIdFromLabelOrId } from "@/lib/business-website-generator/public-listing-slugs";
import {
  extractVerifiedExtras,
  resolveDisplayName,
} from "@/lib/business-website-generator/verified-fields";
import type { ConceptBusiness } from "@/lib/business-website-generator/types";

async function loadBusiness(id: string): Promise<ConceptBusiness> {
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

export async function generateWebsiteConcept(businessOpportunityId: string) {
  await prisma.businessOpportunity.update({
    where: { id: businessOpportunityId },
    data: { leadStatus: "REVIEWING" },
  });

  await collectBusinessImages(businessOpportunityId);
  const business = await loadBusiness(businessOpportunityId);
  const tokens = getDesignTokens(business.category, business.categoryGroup);

  const drafting = await prisma.businessWebsiteConcept.create({
    data: {
      businessOpportunityId,
      conceptTitle: `${business.businessName} concept`,
      generatedHtml: "<html><body>Generating…</body></html>",
      generationStatus: "GENERATING",
    },
    select: { id: true },
  });

  try {
    const copy = await generateConceptCopy(business, tokens);
    const categoryId = resolveCategoryIdFromLabelOrId(business.category);
    const assembled =
      assembleFromCategoryTemplate({
        business,
        tokens,
        copy,
        categoryId,
      }) || assembleConceptHtml({ business, tokens, copy });

    const concept = await prisma.businessWebsiteConcept.update({
      where: { id: drafting.id },
      data: {
        conceptTitle: assembled.conceptTitle,
        generatedHtml: assembled.html,
        generatedContent: assembled.content,
        generationStatus: "READY",
      },
    });

    await prisma.businessOpportunity.update({
      where: { id: businessOpportunityId },
      data: { leadStatus: "CONCEPT_READY" },
    });

    // Stable public share URL for WhatsApp / email.
    await ensurePublicListingPath(businessOpportunityId);

    return concept;
  } catch (err) {
    await prisma.businessWebsiteConcept.update({
      where: { id: drafting.id },
      data: { generationStatus: "FAILED" },
    });
    throw err;
  }
}

export async function getLatestConcept(businessOpportunityId: string) {
  return prisma.businessWebsiteConcept.findFirst({
    where: { businessOpportunityId },
    orderBy: { createdAt: "desc" },
  });
}

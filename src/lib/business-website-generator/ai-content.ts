import { jsonrepair } from "jsonrepair";
import type {
  ConceptBusiness,
  ConceptCopy,
  DesignFamily,
  DesignTokens,
} from "@/lib/business-website-generator/types";

function extractJsonObject(text: string): Record<string, unknown> {
  let candidate = text.trim();
  const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) candidate = fenced[1].trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end > start) candidate = candidate.slice(start, end + 1);
  try {
    return JSON.parse(candidate) as Record<string, unknown>;
  } catch {
    return JSON.parse(jsonrepair(candidate)) as Record<string, unknown>;
  }
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function categoryServiceItems(
  family: DesignFamily,
  business: ConceptBusiness,
): Array<{ title: string; body: string }> {
  const city = business.city;
  const phoneHint = business.phone
    ? `Call ${business.phone} to enquire.`
    : "Enquire using the contact details on this page.";

  switch (family) {
    case "clinic":
      return [
        {
          title: business.specialty || "Consultation",
          body: business.specialty
            ? `Listed specialty: ${business.specialty}.`
            : `Clear presentation of care options for patients in ${city}.`,
        },
        {
          title: business.degree || "Clinic details",
          body: business.degree
            ? `Listed qualification: ${business.degree}.`
            : "Show verified clinic information patients need before visiting.",
        },
        {
          title: "Contact",
          body: phoneHint,
        },
      ];
    case "salon":
      return [
        { title: "Services", body: `Highlight salon / grooming services for ${city} clients.` },
        { title: "Visit", body: business.address || `Find us in ${city}.` },
        { title: "Book / call", body: phoneHint },
      ];
    case "restaurant":
      return [
        {
          title: business.specialty || "Menu highlights",
          body: business.description || `Food and hospitality for guests in ${city}.`,
        },
        { title: "Location", body: business.address || `${city}, ${business.countryName}` },
        { title: "Reserve / call", body: phoneHint },
      ];
    case "retail":
      return [
        { title: "Store", body: `A clear storefront page for ${business.category.toLowerCase()} shoppers.` },
        { title: "Visit", body: business.address || `${city}` },
        { title: "Enquire", body: phoneHint },
      ];
    case "fitness":
      return [
        { title: "Training", body: `Present fitness offerings for members in ${city}.` },
        { title: "Visit", body: business.address || `${city}` },
        { title: "Join / call", body: phoneHint },
      ];
    case "professional":
      return [
        { title: "Practice", body: `Professional ${business.category.toLowerCase()} presence for ${city}.` },
        { title: "Office", body: business.address || `${city}` },
        { title: "Contact", body: phoneHint },
      ];
    case "home_services":
      return [
        { title: "Services", body: `Home / local services listed for ${city}.` },
        { title: "Area", body: business.address || `${city}` },
        { title: "Call", body: phoneHint },
      ];
    default:
      return [
        { title: "About", body: business.description || `${business.category} in ${city}.` },
        { title: "Location", body: business.address || `${city}` },
        { title: "Contact", body: phoneHint },
      ];
  }
}

function displayNameOf(business: ConceptBusiness) {
  return (business.displayName || business.businessName).trim();
}

/** Strip non-English sentence content while keeping ASCII digits/punctuation. */
function ensureEnglishText(value: string, fallback: string) {
  const text = (value || "").trim();
  if (!text) return fallback;
  if (/[\u0900-\u097F]/.test(text)) return fallback;
  return text;
}

/** Category-aware copy using only verified listing fields. Always English UI copy. */
export function fallbackCopy(
  business: ConceptBusiness,
  tokens: DesignTokens,
): ConceptCopy {
  const hasPhone = Boolean(business.phone);
  const name = displayNameOf(business);
  const credentialLine = [business.degree, business.specialty].filter(Boolean).join(" · ");

  const clinicSub =
    credentialLine
      ? `${credentialLine}. Serving patients in ${business.city}, ${business.countryName}.`
      : `${business.category} practice information for patients in ${business.city}.`;

  const subByFamily: Record<DesignFamily, string> = {
    clinic: clinicSub,
    salon: `${name} — ${business.category.toLowerCase()} in ${business.city}.`,
    restaurant: business.description || `${business.category} in ${business.city}, ${business.countryName}.`,
    retail: `Shop ${business.category.toLowerCase()} with clear store details for ${business.city}.`,
    fitness: `Train with ${name} in ${business.city}.`,
    professional: `${business.category} services in ${business.city}, ${business.countryName}.`,
    home_services: `${business.category} for homes and businesses in ${business.city}.`,
    default: business.description || `${business.category} in ${business.city}.`,
  };

  const aboutFallback = [
    `${name} is listed as a ${business.category.toLowerCase()} business in ${business.city}, ${business.countryName}.`,
    credentialLine ? `Listing details: ${credentialLine}.` : null,
    "This concept page uses only public listing information — nothing invented.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    conceptTitle: `${name} website concept`,
    heroEyebrow: `${business.category} · ${business.city}`,
    heroHeadline: name,
    heroSubhead: subByFamily[tokens.family],
    primaryCta: hasPhone ? `Call ${business.phone}` : "Contact us",
    aboutTitle: `About ${name}`,
    aboutBody: ensureEnglishText(business.description || "", aboutFallback),
    servicesTitle:
      tokens.family === "clinic"
        ? "Care & information"
        : tokens.family === "restaurant"
          ? "Highlights"
          : "What we offer",
    serviceItems: categoryServiceItems(tokens.family, business),
    galleryTitle: "Gallery",
    contactTitle: "Contact",
    contactBody: hasPhone
      ? `Reach ${name} at ${business.phone}${business.publicEmail ? ` or ${business.publicEmail}` : ""}.`
      : `Contact details for ${name} will appear here when available on the public listing.`,
    footerNote: "Website concept preview · prepared by Techlyser · not a live site",
    designNotes: `${tokens.label} landing layout from verified scrap fields only.`,
  };
}

function normalizeCopy(
  raw: Record<string, unknown>,
  business: ConceptBusiness,
  tokens: DesignTokens,
): ConceptCopy {
  const fallback = fallbackCopy(business, tokens);
  const itemsRaw = Array.isArray(raw.serviceItems) ? raw.serviceItems : [];
  const serviceItems = itemsRaw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const title = asString(row.title, "");
      const body = asString(row.body, "");
      if (!title || !body) return null;
      return { title: title.slice(0, 60), body: body.slice(0, 180) };
    })
    .filter((row): row is { title: string; body: string } => Boolean(row))
    .slice(0, 4);

  return {
    conceptTitle: ensureEnglishText(
      asString(raw.conceptTitle, fallback.conceptTitle).slice(0, 100),
      fallback.conceptTitle,
    ),
    heroEyebrow: ensureEnglishText(
      asString(raw.heroEyebrow, fallback.heroEyebrow).slice(0, 80),
      fallback.heroEyebrow,
    ),
    heroHeadline: ensureEnglishText(
      asString(raw.heroHeadline, fallback.heroHeadline).slice(0, 80),
      fallback.heroHeadline,
    ),
    heroSubhead: ensureEnglishText(
      asString(raw.heroSubhead, fallback.heroSubhead).slice(0, 320),
      fallback.heroSubhead,
    ),
    primaryCta: ensureEnglishText(
      asString(raw.primaryCta, fallback.primaryCta).slice(0, 60),
      fallback.primaryCta,
    ),
    aboutTitle: ensureEnglishText(
      asString(raw.aboutTitle, fallback.aboutTitle).slice(0, 80),
      fallback.aboutTitle,
    ),
    aboutBody: ensureEnglishText(
      asString(raw.aboutBody, fallback.aboutBody).slice(0, 500),
      fallback.aboutBody,
    ),
    servicesTitle: ensureEnglishText(
      asString(raw.servicesTitle, fallback.servicesTitle).slice(0, 80),
      fallback.servicesTitle,
    ),
    serviceItems: serviceItems.length
      ? serviceItems.map((item) => ({
          title: ensureEnglishText(item.title, fallback.serviceItems[0]?.title || "Detail"),
          body: ensureEnglishText(item.body, fallback.serviceItems[0]?.body || "Listing detail"),
        }))
      : fallback.serviceItems,
    galleryTitle: ensureEnglishText(
      asString(raw.galleryTitle, fallback.galleryTitle).slice(0, 80),
      fallback.galleryTitle,
    ),
    contactTitle: ensureEnglishText(
      asString(raw.contactTitle, fallback.contactTitle).slice(0, 80),
      fallback.contactTitle,
    ),
    contactBody: ensureEnglishText(
      asString(raw.contactBody, fallback.contactBody).slice(0, 240),
      fallback.contactBody,
    ),
    footerNote: ensureEnglishText(
      asString(raw.footerNote, fallback.footerNote).slice(0, 120),
      fallback.footerNote,
    ),
    designNotes: ensureEnglishText(
      asString(raw.designNotes, fallback.designNotes).slice(0, 200),
      fallback.designNotes,
    ),
  };
}

export async function generateConceptCopy(
  business: ConceptBusiness,
  tokens: DesignTokens,
): Promise<ConceptCopy> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return fallbackCopy(business, tokens);

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";
  const hours =
    typeof business.openingHours === "string"
      ? business.openingHours
      : business.openingHours
        ? JSON.stringify(business.openingHours)
        : null;

  const prompt = `You write polished website copy for a ${tokens.family} landing page concept for Techlyser outreach.
CRITICAL: Write ALL copy in English only. Never use Hindi or any other language in any field.
Use displayName (English) for the business name in all sentences. Do not paste non-English scripts into copy.
Use ONLY verified fields below. Do NOT invent reviews, ratings, prices, discounts, certifications, team members, years of experience, awards, or medical claims.
If degree/specialty are present, you may mention them as listing details — do not upgrade or invent qualifications.
Return JSON object with keys:
conceptTitle, heroEyebrow, heroHeadline, heroSubhead, primaryCta, aboutTitle, aboutBody, servicesTitle, serviceItems (array of {title, body} max 4), galleryTitle, contactTitle, contactBody, footerNote, designNotes.
Design family: ${tokens.family} (${tokens.label})
Business: ${JSON.stringify({
    displayName: displayNameOf(business),
    businessName: business.businessName,
    category: business.category,
    city: business.city,
    countryName: business.countryName,
    address: business.address,
    phone: business.phone,
    publicEmail: business.publicEmail,
    websiteUrl: business.websiteUrl,
    description: business.description,
    degree: business.degree,
    specialty: business.specialty,
    openingHours: hours,
  })}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.35, maxOutputTokens: 2048 },
        }),
        signal: AbortSignal.timeout(25000),
      },
    );
    if (!response.ok) return fallbackCopy(business, tokens);
    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text =
      payload.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n") ||
      "";
    if (!text.trim()) return fallbackCopy(business, tokens);
    return normalizeCopy(extractJsonObject(text), business, tokens);
  } catch {
    return fallbackCopy(business, tokens);
  }
}

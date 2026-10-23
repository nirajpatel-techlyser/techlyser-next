function cell(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export type CsvLead = {
  name: string;
  website: string;
  domain: string;
  targetCountry: string;
  countryCode: string | null;
  shopifyConfidence: string;
  publicEmail: string | null;
  score: number;
  status: string;
  source: string;
  profiles: { platform: string; url: string; verification: string }[];
};

export function leadsToCsv(leads: CsvLead[]) {
  const header = [
    "name",
    "website",
    "domain",
    "targetCountry",
    "countryCode",
    "shopify",
    "email",
    "instagram",
    "facebook",
    "linkedin",
    "youtube",
    "score",
    "status",
    "source",
  ];
  const lines = leads.map((lead) => {
    const profile = (platform: string) =>
      lead.profiles.find((row) => row.platform === platform)?.url || "";
    return [
      lead.name,
      lead.website,
      lead.domain,
      lead.targetCountry,
      lead.countryCode || "",
      lead.shopifyConfidence,
      lead.publicEmail || "",
      profile("INSTAGRAM"),
      profile("FACEBOOK"),
      profile("LINKEDIN"),
      profile("YOUTUBE"),
      lead.score,
      lead.status,
      lead.source,
    ].map(cell).join(",");
  });
  return [header.join(","), ...lines].join("\n");
}

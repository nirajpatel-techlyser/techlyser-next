import type { Qualification } from "@/leads/qualify";

export function buildOutreachDrafts(input: {
  name: string;
  website: string;
  publicEmail: string | null;
  qualification: Pick<Qualification, "observedFacts" | "recommendedServices" | "hypotheses">;
}) {
  const fact = input.qualification.observedFacts[0] || "The public website was reviewed.";
  const service = input.qualification.recommendedServices[0] || "Shopify development";
  const email = [
    `Subject: A note on ${input.name}`,
    ``,
    `Hi,`,
    ``,
    `I looked at ${input.website}. Observed: ${fact}`,
    input.qualification.hypotheses[0] ? `This part is only a hypothesis: ${input.qualification.hypotheses[0]}` : "",
    `Techlyser helps brands with ${service}. If useful, I can share 3 specific observations on a short call.`,
    ``,
    `Niraj`,
    `Techlyser`,
  ].filter(Boolean).join("\n");

  const linkedin = `Hi, I reviewed ${input.name} (${input.website}). ${fact} We help Shopify brands with ${service}. Open to a short conversation?`;
  const followup = `Following up on ${input.name}. I am not adding any new claims. The earlier note was based on this public signal: ${fact} Happy to close the loop if the timing is wrong.`;

  return [
    { channel: "email", body: email },
    { channel: "linkedin", body: linkedin },
    { channel: "followup", body: followup },
  ];
}

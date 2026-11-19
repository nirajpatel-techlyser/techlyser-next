/** Digits-only WhatsApp number for wa.me (with country code when possible). */
export function normalizeWhatsAppPhone(
  phone: string | null | undefined,
  countryCode?: string | null,
): string | null {
  if (!phone?.trim()) return null;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  // Strip leading 00 international prefix.
  if (digits.startsWith("00")) digits = digits.slice(2);

  const cc = (countryCode || "").toUpperCase();
  if (cc === "IN") {
    if (digits.length === 10 && /^[6-9]/.test(digits)) return `91${digits}`;
    if (digits.length === 11 && digits.startsWith("0")) {
      return `91${digits.slice(1)}`;
    }
    if (digits.length === 12 && digits.startsWith("91")) return digits;
  }

  // Already looks international (E.164 without +).
  if (digits.length >= 11 && digits.length <= 15) return digits;
  if (digits.length === 10 && cc === "US") return `1${digits}`;
  if (digits.length === 10 && cc === "AU") return `61${digits}`;

  return digits.length >= 8 ? digits : null;
}

export function buildWhatsAppDeepLink(phoneDigits: string, text: string) {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;
}

export function buildMailtoLink(input: {
  to: string;
  subject: string;
  body: string;
}) {
  const params = new URLSearchParams({
    subject: input.subject,
    body: input.body,
  });
  return `mailto:${input.to}?${params.toString()}`;
}

/** Build a draft email / WhatsApp body only — never auto-sends. */

export function buildOpportunityEmailDraft(input: {
  businessName: string;
  city: string;
  countryName: string;
  category: string;
  publicEmail: string | null;
  phone?: string | null;
  websiteUrl: string | null;
  /** Public concept URL e.g. https://techlyser.com/doctor/yogendra-jamra */
  publicListingUrl?: string | null;
}) {
  const hasWebsite = Boolean(input.websiteUrl);
  const shareUrl = input.publicListingUrl?.trim() || "";
  const subject = hasWebsite
    ? `A clearer website idea for ${input.businessName}`
    : `A website concept for ${input.businessName}`;

  const body = [
    `Hi ${input.businessName} team,`,
    ``,
    `I came across your ${input.category.toLowerCase()} business in ${input.city}, ${input.countryName}.`,
    hasWebsite
      ? `I reviewed the public listing and think a sharper website presentation could help more local customers find and trust you.`
      : `I noticed there may not be a clear website for the business yet — many local customers search online before they visit or call.`,
    input.phone
      ? `Your public listing shows a contact number (${input.phone}), so customers can already reach you by phone — a website would make the same details easier to find online.`
      : null,
    ``,
    `Techlyser designs modern business websites. I prepared a premium website concept for ${input.businessName} (layout + messaging only — no obligation).`,
    shareUrl ? `` : null,
    shareUrl ? `Preview the concept here: ${shareUrl}` : null,
    ``,
    shareUrl
      ? `If that sounds useful, reply to this email and we can refine it together.`
      : `If that sounds useful, reply to this email and I will share the concept link.`,
    ``,
    `Thanks,`,
    `Techlyser`,
    `info@techlyser.com`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const whatsappBody = [
    `Hi ${input.businessName} team — Techlyser here.`,
    `I put together a website concept for your ${input.category.toLowerCase()} business in ${input.city}.`,
    shareUrl ? `Preview: ${shareUrl}` : null,
    `Happy to adjust it if useful — no obligation.`,
  ]
    .filter((line) => line !== null)
    .join("\n\n");

  return {
    recipientEmail: input.publicEmail || "",
    senderEmail: "info@techlyser.com",
    subject,
    emailBody: body,
    whatsappBody,
    publicListingUrl: shareUrl || null,
  };
}

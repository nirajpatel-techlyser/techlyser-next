export const CONTACT_SERVICES = [
  "Shopify Development",
  "Next.js Development",
  "WordPress Development",
  "UI / UX Design",
  "Performance Optimization",
  "Technical SEO",
] as const;

export const CONTACT_BUDGETS = [
  "Less than $1,000",
  "$1,000 - $3,000",
  "$3,000 - $5,000",
  "$5,000 - $10,000",
  "$10,000+",
] as const;

export type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  /** Honeypot — must stay empty */
  website?: string;
};

export type ContactFieldErrors = Partial<
  Record<"name" | "email" | "phone" | "service" | "budget" | "message", string>
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s().-]{7,20}$/;

function trim(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeContactPayload(input: unknown): ContactPayload {
  const body = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  return {
    name: trim(body.name),
    email: trim(body.email),
    phone: trim(body.phone),
    company: trim(body.company),
    service: trim(body.service),
    budget: trim(body.budget),
    message: trim(body.message),
    website: trim(body.website),
  };
}

export function validateContactPayload(payload: ContactPayload): {
  ok: boolean;
  errors: ContactFieldErrors;
  bot?: boolean;
} {
  if (payload.website) {
    return { ok: false, errors: {}, bot: true };
  }

  const errors: ContactFieldErrors = {};

  if (payload.name.length < 2) {
    errors.name = "Please enter your full name.";
  } else if (payload.name.length > 120) {
    errors.name = "Name is too long.";
  }

  if (!payload.email) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_RE.test(payload.email) || payload.email.length > 254) {
    errors.email = "Please enter a valid email address.";
  }

  if (payload.phone && !PHONE_RE.test(payload.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!(CONTACT_SERVICES as readonly string[]).includes(payload.service)) {
    errors.service = "Please select a service.";
  }

  if (!(CONTACT_BUDGETS as readonly string[]).includes(payload.budget)) {
    errors.budget = "Please select a project budget.";
  }

  if (payload.message.length < 20) {
    errors.message = "Please describe your project in at least 20 characters.";
  } else if (payload.message.length > 5000) {
    errors.message = "Message is too long.";
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

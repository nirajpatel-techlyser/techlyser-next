import type { WriterLength } from "./types";

export const WRITER_LENGTH_WORD_TARGETS: Record<WriterLength, number> = {
  short: 900,
  medium: 1500,
  long: 2500,
};

export function getWriterModel(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export function hasLlmProvider(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export const WRITER_DEFAULT_CTA = {
  headline: "Need expert help with your project?",
  body: "Techlyser builds Shopify, Next.js, and headless commerce solutions for brands in India and worldwide.",
  buttonText: "Get a free consultation",
  href: "/contact",
} as const;

import type { WriterLength } from "./types";

export const WRITER_LENGTH_WORD_TARGETS: Record<WriterLength, number> = {
  short: 900,
  medium: 1500,
  long: 2500,
};

export type LlmProviderId = "gemini" | "groq" | "openai";

export function resolveLlmProvider(): LlmProviderId | null {
  const forced = process.env.AI_LLM_PROVIDER?.trim().toLowerCase();
  if (forced === "gemini" || forced === "groq" || forced === "openai") {
    if (forced === "gemini" && process.env.GEMINI_API_KEY?.trim()) return "gemini";
    if (forced === "groq" && process.env.GROQ_API_KEY?.trim()) return "groq";
    if (forced === "openai" && process.env.OPENAI_API_KEY?.trim()) return "openai";
  }

  // Prefer free/cheap providers first (no OpenAI required)
  if (process.env.GEMINI_API_KEY?.trim()) return "gemini";
  if (process.env.GROQ_API_KEY?.trim()) return "groq";
  if (process.env.OPENAI_API_KEY?.trim()) return "openai";
  return null;
}

export function getWriterModel(provider?: LlmProviderId | null): string {
  const p = provider ?? resolveLlmProvider();
  if (p === "gemini") {
    return process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  }
  if (p === "groq") {
    return process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";
  }
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export function hasLlmProvider(): boolean {
  return resolveLlmProvider() !== null;
}

export const WRITER_DEFAULT_CTA = {
  headline: "Need expert help with your project?",
  body: "Techlyser builds Shopify, Next.js, and headless commerce solutions for brands in India and worldwide.",
  buttonText: "Get a free consultation",
  href: "/contact",
} as const;

import { jsonrepair } from "jsonrepair";
import type { WriterLlmPayload } from "../types";
import {
  getWriterModel,
  resolveLlmProvider,
  type LlmProviderId,
} from "../config";
import {
  GEMINI_WRITER_EXTRAS_SCHEMA,
  GEMINI_WRITER_META_SCHEMA,
  GEMINI_WRITER_RESPONSE_SCHEMA,
  type GeminiWriterBodyPayload,
  type GeminiWriterExtrasPayload,
  type GeminiWriterMetaPayload,
} from "./gemini-schema";
import { coerceArticleMarkdown } from "./coerce-body";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionResponse = {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
};

type GeminiPart = {
  text?: string;
  thought?: boolean;
};

type GeminiResponse = {
  candidates?: {
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }[];
  error?: { message?: string };
};

function isGemini3Model(model: string): boolean {
  return /^gemini-3(?:\.|$|-)/.test(model);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stripTrailingCommas(json: string): string {
  return json.replace(/,\s*([}\]])/g, "$1");
}

function extractJson(text: string): Record<string, unknown> {
  let candidate = text.trim();
  if (candidate.charCodeAt(0) === 0xfeff) {
    candidate = candidate.slice(1);
  }

  const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    candidate = fenced[1].trim();
  }

  candidate = candidate.replace(/^THOUGHT:[\s\S]*?(?=\{)/i, "").trim();

  const slices: string[] = [candidate];
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end > start) {
    slices.push(candidate.slice(start, end + 1));
  }

  for (const slice of slices) {
    const variants = [slice, stripTrailingCommas(slice)];
    for (const variant of variants) {
      for (const attempt of [() => JSON.parse(variant), () => JSON.parse(jsonrepair(variant))]) {
        try {
          const parsed = attempt();
          if (isRecord(parsed)) return parsed;
        } catch {
          // continue
        }
      }
    }
  }

  throw new Error("LLM response was not valid JSON");
}

function collectGeminiText(data: GeminiResponse): {
  content: string;
  finishReason?: string;
} {
  const candidate = data.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  const content = parts
    .filter((part) => part.thought !== true)
    .map((part) => part.text || "")
    .join("")
    .trim();

  return {
    content,
    finishReason: candidate?.finishReason,
  };
}

async function callOpenAiCompatible(input: {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: ChatMessage[];
  label: string;
}): Promise<string> {
  const response = await fetch(`${input.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model,
      messages: input.messages,
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  const data = (await response.json()) as ChatCompletionResponse;
  if (!response.ok) {
    throw new Error(
      data.error?.message || `${input.label} API error (${response.status})`,
    );
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`${input.label} returned an empty response`);
  }
  return content;
}

async function callGeminiPlain(input: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<{ content: string; finishReason?: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent?key=${encodeURIComponent(input.apiKey)}`;

  const generationConfig: Record<string, unknown> = {
    maxOutputTokens: 65536,
  };

  if (isGemini3Model(input.model)) {
    generationConfig.thinkingConfig = { thinkingLevel: "minimal" };
  } else {
    generationConfig.temperature = 0.7;
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: input.systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: input.userPrompt }],
        },
      ],
      generationConfig,
    }),
  });

  const data = (await response.json()) as GeminiResponse;
  if (!response.ok) {
    throw new Error(
      data.error?.message || `Gemini API error (${response.status})`,
    );
  }

  const { content, finishReason } = collectGeminiText(data);
  if (!content) {
    throw new Error("Gemini returned an empty response");
  }

  if (finishReason === "MAX_TOKENS") {
    throw new Error(
      "Gemini response was truncated (MAX_TOKENS). Try a shorter article length.",
    );
  }

  return { content, finishReason };
}

async function callGemini(input: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  responseSchema: Record<string, unknown>;
}): Promise<{ content: string; finishReason?: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent?key=${encodeURIComponent(input.apiKey)}`;

  const generationConfig: Record<string, unknown> = {
    maxOutputTokens: 65536,
    responseMimeType: "application/json",
    responseSchema: input.responseSchema,
  };

  if (isGemini3Model(input.model)) {
    generationConfig.thinkingConfig = { thinkingLevel: "minimal" };
  } else {
    generationConfig.temperature = 0.7;
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: input.systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: input.userPrompt }],
        },
      ],
      generationConfig,
    }),
  });

  const data = (await response.json()) as GeminiResponse;
  if (!response.ok) {
    throw new Error(
      data.error?.message || `Gemini API error (${response.status})`,
    );
  }

  const { content, finishReason } = collectGeminiText(data);
  if (!content) {
    throw new Error("Gemini returned an empty response");
  }

  if (finishReason === "MAX_TOKENS") {
    throw new Error(
      "Gemini response was truncated (MAX_TOKENS). Try a shorter article length.",
    );
  }

  return { content, finishReason };
}

function parseJsonResponse<T extends Record<string, unknown>>(
  content: string,
  meta: { model: string; finishReason?: string; phase: string },
): T {
  try {
    return extractJson(content) as T;
  } catch (err) {
    console.error(`[writer.llm] JSON parse failed (${meta.phase})`, {
      model: meta.model,
      finishReason: meta.finishReason,
      length: content.length,
      preview: content.slice(0, 240),
      suffix: content.slice(-240),
    });
    throw err;
  }
}

function buildMetaPrompt(
  originalUserPrompt: string,
  body: GeminiWriterBodyPayload,
): string {
  return `The article body is complete. Return SEO metadata JSON for the same article.

Original brief:
${originalUserPrompt}

Article body:
${body.articleMarkdown}

Return JSON with: seoTitle, metaDescription, slug, outline (markdown H2/H3 bullets), excerpt, faqs (4–6), featuredImagePrompt, tags (3–6).`;
}

function buildExtrasPrompt(
  originalUserPrompt: string,
  body: GeminiWriterBodyPayload,
  meta: GeminiWriterMetaPayload,
): string {
  return `Return supplementary JSON fields for this completed article.

Original brief:
${originalUserPrompt}

SEO title: ${meta.seoTitle}
Excerpt: ${meta.excerpt}

Article preview:
${body.articleMarkdown.slice(0, 1200)}

Return JSON with: howTo (or null), comparisonTable (or null), cta, linkedinPersonalPost, linkedinPagePost.`;
}

async function callGeminiWriter(
  systemPrompt: string,
  userPrompt: string,
  model: string,
  apiKey: string,
): Promise<WriterLlmPayload> {
  const label = `gemini/${model}`;

  const bodyPrompt = `${userPrompt}

Write ONLY the article body in markdown (H2/H3, lists, bold). No H1. No FAQ, HowTo, or CTA sections. Do not wrap in JSON or code fences.`;

  const { content: articleMarkdown, finishReason: bodyFinish } =
    await callGeminiPlain({
      apiKey,
      model,
      systemPrompt,
      userPrompt: bodyPrompt,
    });

  if (!articleMarkdown.trim()) {
    throw new Error("Gemini body response missing articleMarkdown");
  }

  const body: GeminiWriterBodyPayload = {
    articleMarkdown: coerceArticleMarkdown(articleMarkdown),
  };

  console.info("[writer.llm] Gemini body phase ok", {
    model: label,
    finishReason: bodyFinish,
    length: body.articleMarkdown.length,
  });

  const { content: metaContent, finishReason: metaFinish } = await callGemini({
    apiKey,
    model,
    systemPrompt,
    userPrompt: buildMetaPrompt(userPrompt, body),
    responseSchema: GEMINI_WRITER_META_SCHEMA,
  });

  const meta = parseJsonResponse<GeminiWriterMetaPayload>(metaContent, {
    model: label,
    finishReason: metaFinish,
    phase: "meta",
  });

  const { content: extrasContent, finishReason: extrasFinish } = await callGemini({
    apiKey,
    model,
    systemPrompt,
    userPrompt: buildExtrasPrompt(userPrompt, body, meta),
    responseSchema: GEMINI_WRITER_EXTRAS_SCHEMA,
  });

  const extras = parseJsonResponse<GeminiWriterExtrasPayload>(extrasContent, {
    model: label,
    finishReason: extrasFinish,
    phase: "extras",
  });

  return { ...body, ...meta, ...extras };
}

export async function callWriterLlm(
  systemPrompt: string,
  userPrompt: string,
): Promise<{ payload: WriterLlmPayload; model: string; provider: LlmProviderId }> {
  const provider = resolveLlmProvider();
  if (!provider) {
    throw new Error(
      "No LLM provider configured. Set GEMINI_API_KEY (recommended free), GROQ_API_KEY, or OPENAI_API_KEY.",
    );
  }

  const model = getWriterModel(provider);
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  if (provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY!.trim();
    const payload = await callGeminiWriter(systemPrompt, userPrompt, model, apiKey);
    return { payload, model: `${provider}/${model}`, provider };
  }

  let content: string;
  if (provider === "groq") {
    content = await callOpenAiCompatible({
      apiKey: process.env.GROQ_API_KEY!.trim(),
      baseUrl: "https://api.groq.com/openai/v1",
      model,
      messages,
      label: "Groq",
    });
  } else {
    content = await callOpenAiCompatible({
      apiKey: process.env.OPENAI_API_KEY!.trim(),
      baseUrl: "https://api.openai.com/v1",
      model,
      messages,
      label: "OpenAI",
    });
  }

  const payload = parseJsonResponse<WriterLlmPayload>(content, {
    model: `${provider}/${model}`,
    phase: "single",
  });
  return { payload, model: `${provider}/${model}`, provider };
}

export { GEMINI_WRITER_RESPONSE_SCHEMA };

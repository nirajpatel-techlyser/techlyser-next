import type { WriterLlmPayload } from "../types";
import {
  getWriterModel,
  resolveLlmProvider,
  type LlmProviderId,
} from "../config";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionResponse = {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
};

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
};

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() || trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error("LLM response was not valid JSON");
  }
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

async function callGemini(input: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent?key=${encodeURIComponent(input.apiKey)}`;

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
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    }),
  });

  const data = (await response.json()) as GeminiResponse;
  if (!response.ok) {
    throw new Error(
      data.error?.message || `Gemini API error (${response.status})`,
    );
  }

  const content = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("")
    .trim();

  if (!content) {
    throw new Error("Gemini returned an empty response");
  }
  return content;
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

  let content: string;

  if (provider === "gemini") {
    content = await callGemini({
      apiKey: process.env.GEMINI_API_KEY!.trim(),
      model,
      systemPrompt,
      userPrompt,
    });
  } else if (provider === "groq") {
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

  const parsed = extractJson(content) as WriterLlmPayload;
  return { payload: parsed, model: `${provider}/${model}`, provider };
}

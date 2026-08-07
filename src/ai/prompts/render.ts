import { prisma } from "@/lib/prisma";
import type { PromptTemplateKind } from "../types";
import {
  getWriterPromptTemplate,
  interpolatePrompt,
  WRITER_PROMPT_KEYS,
  type WriterPromptKey,
} from "../writer/prompts";

export type RenderPromptInput = {
  key: WriterPromptKey | string;
  kind: PromptTemplateKind;
  variables?: Record<string, string | number>;
};

export type RenderPromptResult = {
  text: string;
  source: "database" | "code";
  version: string;
};

async function loadFromDatabase(key: string): Promise<string | null> {
  const row = await prisma.promptTemplate.findFirst({
    where: { key, active: true },
    orderBy: { version: "desc" },
    select: { template: true, version: true },
  });
  return row?.template ?? null;
}

export async function renderPrompt(
  input: RenderPromptInput,
): Promise<RenderPromptResult> {
  const variables = input.variables ?? {};
  const dbTemplate = await loadFromDatabase(input.key);

  if (dbTemplate) {
    const row = await prisma.promptTemplate.findFirst({
      where: { key: input.key, active: true },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    return {
      text: interpolatePrompt(dbTemplate, variables),
      source: "database",
      version: String(row?.version ?? 1),
    };
  }

  const codeKey = input.key as WriterPromptKey;
  if (
    input.key === WRITER_PROMPT_KEYS.SYSTEM_BRAND ||
    input.key === WRITER_PROMPT_KEYS.ARTICLE_FULL
  ) {
    const template = getWriterPromptTemplate(codeKey);
    return {
      text: interpolatePrompt(template, variables),
      source: "code",
      version: "code-v1",
    };
  }

  throw new Error(`Prompt template not found: ${input.key}`);
}

export function createPromptService() {
  return { render: renderPrompt };
}

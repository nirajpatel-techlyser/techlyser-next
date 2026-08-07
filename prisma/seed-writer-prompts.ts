import { PrismaClient, PromptTemplateKind } from "@prisma/client";
import {
  WRITER_ARTICLE_FULL_TEMPLATE,
  WRITER_PROMPT_KEYS,
  WRITER_SYSTEM_BRAND_TEMPLATE,
} from "../src/ai/writer/prompts";

export async function seedWriterPrompts(prisma: PrismaClient) {
  const templates = [
    {
      key: WRITER_PROMPT_KEYS.SYSTEM_BRAND,
      name: "Writer — brand system prompt",
      kind: PromptTemplateKind.WRITER,
      template: WRITER_SYSTEM_BRAND_TEMPLATE,
      variables: [] as string[],
      notes: "Brand voice and JSON output guardrails for article generation.",
    },
    {
      key: WRITER_PROMPT_KEYS.ARTICLE_FULL,
      name: "Writer — full article JSON",
      kind: PromptTemplateKind.WRITER,
      template: WRITER_ARTICLE_FULL_TEMPLATE,
      variables: [
        "keyword",
        "audience",
        "searchIntent",
        "category",
        "tone",
        "targetWords",
      ],
      notes: "Single-shot article draft with metadata, body, FAQs, HowTo, CTA.",
    },
  ];

  for (const row of templates) {
    await prisma.promptTemplate.upsert({
      where: {
        key_version: { key: row.key, version: 1 },
      },
      update: {
        name: row.name,
        kind: row.kind,
        template: row.template,
        variables: row.variables,
        notes: row.notes,
        active: true,
      },
      create: {
        key: row.key,
        name: row.name,
        kind: row.kind,
        version: 1,
        active: true,
        template: row.template,
        variables: row.variables,
        notes: row.notes,
      },
    });
  }

  console.log(`Writer prompts seeded: ${templates.length}`);
}

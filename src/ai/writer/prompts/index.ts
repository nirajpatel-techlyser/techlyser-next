import { WRITER_ARTICLE_FULL_TEMPLATE } from "./article-full";
import { WRITER_PROMPT_KEYS, type WriterPromptKey } from "./keys";
import { WRITER_SYSTEM_BRAND_TEMPLATE } from "./system-brand";

export { WRITER_PROMPT_KEYS, type WriterPromptKey };
export { WRITER_SYSTEM_BRAND_TEMPLATE, WRITER_ARTICLE_FULL_TEMPLATE };

const CODE_TEMPLATES: Record<WriterPromptKey, string> = {
  [WRITER_PROMPT_KEYS.SYSTEM_BRAND]: WRITER_SYSTEM_BRAND_TEMPLATE,
  [WRITER_PROMPT_KEYS.ARTICLE_FULL]: WRITER_ARTICLE_FULL_TEMPLATE,
};

export function getWriterPromptTemplate(key: WriterPromptKey): string {
  const template = CODE_TEMPLATES[key];
  if (!template) {
    throw new Error(`Unknown writer prompt key: ${key}`);
  }
  return template;
}

export function interpolatePrompt(
  template: string,
  variables: Record<string, string | number>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, name: string) => {
    const value = variables[name];
    return value === undefined || value === null ? "" : String(value);
  });
}

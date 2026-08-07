/**
 * Prompt Catalog — render service + stable keys.
 *
 * Prompt text lives in module-specific folders (e.g. src/ai/writer/prompts).
 * This module resolves DB overrides (PromptTemplate) or code defaults.
 */

export { PROMPT_KEYS, type PromptKey } from "./keys";
export {
  renderPrompt,
  createPromptService,
  type RenderPromptInput,
  type RenderPromptResult,
} from "./render";

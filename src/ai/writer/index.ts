/**
 * AI Writer Engine (Phase 5)
 *
 * Generates full SEO article drafts from keyword + intent inputs.
 * Always saves to Blog CMS as DRAFT — never auto-publishes.
 */

export * from "./types";
export * from "./config";
export * from "./prompts";
export {
  generateArticleDraft,
  composeWriterOutput,
  createWriterService,
  writerInputSchema,
} from "./engine";
export {
  listWriterRuns,
  getWriterRun,
  listDraftContentIdeas,
} from "./store";

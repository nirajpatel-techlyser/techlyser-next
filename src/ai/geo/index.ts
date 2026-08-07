/**
 * GEO / Generative Engine Optimization (Phase 6)
 *
 * Modular answer-engine optimization for ChatGPT, Gemini, Claude,
 * Perplexity, Google AI Overviews, Knowledge Graph, and entity coverage.
 */

export * from "./types";
export * from "./config";
export { optimizeGeo, createGeoService } from "./engine";
export * as geoModules from "./modules";

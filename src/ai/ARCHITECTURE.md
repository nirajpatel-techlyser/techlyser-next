# Techlyser AI Growth Operating System — Phase 1 Architecture

Status: **architecture only** (no agent runtime).  
Audience: engineering, product, SEO.

## Existing system (constraints)

| Layer | Today | AI OS must |
| --- | --- | --- |
| Public site | Next.js App Router | Stay RSC-first; no AI SDKs in public layout |
| CMS | Prisma `Blog` + TipTap admin | Publish **through** CMS actions, not parallel stores |
| MDX | Seed path only (`content/blog` → seed) | Optional import; runtime source of truth = DB |
| Auth | Auth.js JWT + `/admin` middleware | All AI Studio routes under `/admin/ai` |
| SEO | `src/lib/seo.ts` + sitemap/robots | SEO/GEO modules emit fields compatible with helpers |
| Analytics | `PageView` + `/admin/analytics` | `AiAnalytics` is decision telemetry, not a UI replacement |

## Folder map

```text
src/ai/
  agents/      Orchestrator contracts & workflow graphs
  research/    SERP / competitor / brief contracts
  writer/      Draft generation contracts → Blog CMS
  seo/         On-page + schema hint contracts
  geo/         Answer-engine / citation contracts
  planner/     Clusters, calendars, ContentIdea emission
  analytics/   Opportunity scoring / ingest contracts
  memory/      Brand + run memory contracts
  prompts/     Prompt keys & render contracts
  utils/       Pure helpers
  types/       Shared DTOs + module registry
  index.ts     Public barrel
```

## Service responsibilities

1. **agents** — Workflow orchestration, approval gates, budgets. Does not call LLMs itself.
2. **research** — Builds `Research` rows from keywords/competitors.
3. **planner** — Forms `ContentCluster` + `ContentIdea` + queue candidates.
4. **writer** — Produces drafts; handoff to `src/actions/blogs.ts` in later phases.
5. **seo** — Metadata, slug, internal links, schema hints via `buildPageMetadata` shapes.
6. **geo** — Entity consistency, speakable passages, `llms.txt` alignment.
7. **analytics** — Ingests GSC/Bing/PageView signals into `AiAnalytics`.
8. **memory** — Durable facts + run context (`AiMemory`).
9. **prompts** — Versioned `PromptTemplate` selection/render.
10. **utils/types** — Shared contracts; no I/O.

## Data flow (target)

```text
Keyword / Competitor
        ↓
   research.run → Research
        ↓
   planner.plan → ContentCluster + ContentIdea
        ↓
   writer.draft → (approval)
        ↓
   seo.optimize + geo.optimize
        ↓
   PublishingQueue → Blog (CMS)
        ↓
   analytics.ingest → AiAnalytics → planner (loop)
```

## Admin surface

- `/admin/ai` — AI Studio architecture hub (Phase 1)
- Future: `/admin/ai/research`, `/planner`, `/queue`, `/settings` (not built yet)

## Scalability principles (Vercel / Stripe / Shopify style)

- **Contracts first** — modules export typed factories; swap providers later
- **Queue-backed work** — long jobs via `PublishingQueue` + `AiAgentRun`, not request threads
- **Human approval default** — `AiSettings.requireHumanApproval = true`
- **Idempotent publishes** — queue items reference `blogId` / `ideaId` uniquely where needed
- **Observability** — every run has `AiAgentRun` audit row
- **Isolation** — AI schema never blocks public rendering if agents fail

## Phase roadmap

| Phase | Scope |
| --- | --- |
| 1 | Folders, contracts, Prisma models, Admin shell |
| 2 | Research engine: multi-source collect → normalize → `ResearchItem` persist |
| 3 | Opportunity engine: multi-factor score → rank → `Opportunity` persist |
| 4 | Content planner: clusters, pillar/supporting, daily/weekly/monthly plans, link map, APIs, admin UI |
| 5 | Writer → draft into CMS (never auto-publish) |
| 6 | SEO + GEO modular engines → optimize drafts (metadata, schema, answer engines) |

## Phase 2 Research Engine

- Entry: `runMarketResearch()` / `npm run ai:research`
- Adapters: `src/ai/research/sources/*`
- Persist: `ResearchItem` (+ parent `Research` run)
- Soft-fail per source; Product Hunt / GitHub tokens optional

## Phase 3 Opportunity Engine

- Entry: `runOpportunityEngine()` / `npm run ai:opportunities`
- Factors: search intent, commercial intent, competition, trend, freshness, Techlyser relevance, existing content, keyword gap, authority gap
- Persist: `Opportunity` ranked by `opportunityScore`
- Corpus: published `Blog` + tracked `Keyword` rows

## Phase 4 Content Planner

- Entry: `generateContentPlans()` / `npm run ai:plan` / `/admin/ai/planner`
- APIs: `/api/ai/planner/generate`, `/plans`, `/plans/[id]`, `/clusters`, `/link-map/[id]`
- Persist: `ContentPlan`, `ContentPlanItem`, `ContentCluster`, draft `ContentIdea`
- Outputs: daily/weekly/monthly plans, topic clusters, pillar + supporting items, internal link map
- No AI article body writing yet

## Phase 5 AI Writer

- Entry: `generateArticleDraft()` / `npm run ai:write` / `/admin/ai/writer`
- Prompts: `src/ai/writer/prompts/` (separate from services)
- Persist: `AiWriterRun` + Blog **DRAFT** only

## Phase 6 SEO + GEO

- Entry: `optimizeSeoAndGeo()` / `npm run ai:seo` / `/admin/ai/seo`
- SEO modules: metadata, canonical, headings, alt text, FAQ, internal links, Open Graph, Twitter, schema/JSON-LD
- GEO modules: ChatGPT, Gemini, Claude, Perplexity, AI Overviews, Knowledge Graph, entity coverage, citations, speakable, llms.txt
- Persist: `AiSeoGeoRun`; optional apply updates Blog fields without publishing


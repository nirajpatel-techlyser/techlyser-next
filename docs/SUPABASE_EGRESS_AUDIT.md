# Supabase Egress Audit — Techlyser Next.js

**Date:** 2026-09-21  
**Project:** Techlyser Next Website (`lnrqgtozwlzpvylfxadn`)  
**Stack:** Prisma → Supabase Postgres (`DATABASE_URL` pooler). **No** `@supabase/supabase-js`, Realtime, or Supabase Storage.  
**Observed org usage:** ~6.47 GB egress / 5 GB Free quota; DB ~35 MB; Storage 0 GB.

## Goal

Keep origin (uncached) Supabase egress **comfortably under 5 GB/month** (internal soft target **&lt; 3.5 GB**). Design so traffic growth does not grow egress linearly where ISR/cache can absorb reads.

---

## Executive summary

| Area | Verdict |
|------|---------|
| Client library | Prisma only |
| Public reads | ISR `revalidate=3600` + `blogListSelect` help; tag pages + full post rows still expensive |
| Public writes | Every public navigation → `POST /api/analytics/track` (1–3 DB ops) |
| Worst public read | `getPostsByTag` loads **all** published posts then filters in JS |
| Worst admin read | Analytics page loads **all** `createdAt` for 30 days (unbounded) |
| Storage / Realtime / polling | None (images via Cloudinary / `/public`) |
| Already mitigated | List select without HTML/LinkedIn; PageView UA null; daily retention cron |

---

## Existing good patterns

| Pattern | Location |
|---------|----------|
| `blogListSelect` (no `content` / LinkedIn) | `src/lib/blog.ts` |
| ISR `revalidate = 3600` | blog, slug, category, tag, sitemap |
| PageView `userAgent: null` | `src/app/api/analytics/track/route.ts` |
| Retention cleanup | `src/lib/db-retention.ts` + daily cron |
| Admin blog list pagination | `src/app/admin/blogs/page.tsx` |

**Gaps:** No `React.cache` / `unstable_cache` on hot helpers; metadata + page often double-fetch.

---

## Findings table

| File | Function / component | Operation | Est. frequency | Data returned | Why expensive | Recommended optimization | Priority |
|------|----------------------|-----------|----------------|---------------|---------------|--------------------------|----------|
| `src/lib/blog.ts` | `getPostsByTag` | `getAllTags` + `findMany` all published + JS filter | 2× per tag page (ISR miss) | Entire published corpus × list cols | Fetches all posts to keep few | Filter with `tags` hasSome / slug match + `take`; never load all | **CRITICAL** |
| `src/lib/blog.ts` | `getPostBySlug` | `findFirst` **no select** | 2× per post (metadata + page) | Full row: `content` + LinkedIn Text | Large Text; LinkedIn unused publicly | Slim public select; metadata-only select; `React.cache` | **CRITICAL** |
| `src/components/shared/AnalyticsTracker.tsx` + `api/analytics/track` | Client → POST | find blog + update views + `pageView.create` | **Every public navigation** | 1–3 round-trips / visit | Traffic-linear egress + row growth | Sample/bot-skip/debounce; path→id cache; optional skip detailed PageView | **CRITICAL** |
| `src/app/admin/analytics/page.tsx` | `SiteAnalyticsPage` | `pageView.findMany` 30d `createdAt` only, **no take** | Per admin visit | One row per visit in 30d | Can be 10k–100k+ rows for charts | SQL/`groupBy` by day; never pull all timestamps | **CRITICAL** |
| `src/ai/writer/store.ts` | `listWriterRuns` / `getWriterRun` | findMany/Unique **with input/output Json** | Admin AI pages | Large JSON blobs | List UI doesn’t need payloads | List select without input/output | **CRITICAL** |
| `src/lib/blog.ts` | `getAllPosts` | `findMany` list select, unbounded | `/blog`, RSS, static params | All published × list cols | Grows with corpus | Paginate public blog; RSS slim select + ISR | **HIGH** |
| `src/lib/blog.ts` | `getAdjacentPosts` | `findMany` all slug+title | Per post page | N×2 cols | Full scan for prev/next | Two `take: 1` queries by `publishedAt` | **HIGH** |
| `src/lib/blog.ts` | `getAllTags` | `findMany` all tags arrays | Blog, tags, sitemap | Full published scan | Repeated | Cache; denormalize later | **HIGH** |
| `src/lib/settings.ts` | `getSiteSettings` | upsert + select | Layout + Footer + CTA = 2–3×/page | Tiny row | Query volume | `React.cache`; findUnique first | **HIGH** |
| `src/app/admin/page.tsx` | Dashboard | Many `pageView.count` / groupBy | Per admin home | Full-table aggregates | Scans grow with PageView | Date bounds + rollups | **HIGH** |
| `src/app/admin/ai/autopilot/page.tsx` | Run list | `aiAgentRun.findMany` no select | Per page | input/output Json | Heavy | Slim select | **HIGH** |
| `src/ai/seo/store.ts` | list/get runs | Full Json outputs | Admin | Large JSON | List over-fetch | Slim list select | **HIGH** |
| `src/ai/growth-engine/pool.ts` | `buildTopicPool` | opportunities with `factors` | Autopilot | Json factors | Heavy | Select score fields only | **HIGH** |
| `src/ai/opportunity/context.ts` | `loadOpportunityCorpus` | researchItem + blogs | Opportunity engine | raw Json | Heavy | Exclude `raw`; limit | **HIGH** |
| `src/ai/planner/engine.ts` | `getContentPlanById` | Deep include | Admin planner | Nested opportunity/idea Json | Heavy | Select needed fields only | **HIGH** |
| `src/app/api/cron/daily-blog/route.ts` | Cron | Autopilot + retention | Daily | Many writes/reads | Burst | Keep; ensure research off | **HIGH** |
| `src/app/rss.xml/route.ts` | GET | `getAllPosts` | Every origin hit (`force-dynamic`) | All list posts | Dynamic bypasses ISR | Allow revalidate / cache | **HIGH** |
| `src/lib/blog.ts` | `getPostsByCategory` | categories + findMany | Category pages | Unbounded per category | Medium | Paginate; cache() | **MEDIUM** |
| `src/app/sitemap.ts` | sitemap | slim entries + tags | Hourly | Unbounded slim | Acceptable | Keep | **LOW** |
| `src/app/admin/blogs/[id]/edit/page.tsx` | Edit | Full blog row | Per edit | content + LinkedIn | Needed for editor | OK | **MEDIUM** |
| `src/app/admin/comments/page.tsx` | Comments | findMany take 100 + content | Admin | Comment text | Bounded | Slim if possible | **MEDIUM** |
| `src/auth.ts` | authorize | `user.findUnique` | Login | Full user | Rare | Select needed fields | **LOW** |
| Realtime / Storage / polling | — | None | — | — | — | N/A | — |

---

## Classification of data (for caching)

| Class | Examples | Strategy |
|-------|----------|----------|
| **STATIC** | Services, portfolio static data, nav | Code/static — already no DB |
| **SEMI-STATIC** | Published posts, categories, tags, settings | ISR + `unstable_cache` / `React.cache` |
| **USER-SPECIFIC** | Admin sessions, drafts | Fetch on demand; no public cache |
| **REAL-TIME** | — | Not used; do not add |

---

## Egress budget (project)

| Level | Monthly origin egress |
|-------|------------------------|
| Comfortable | &lt; 3.5 GB |
| Warning | 3.5–4.0 GB |
| High warning | 4.0–4.5 GB |
| Critical | 4.5–5.0 GB |
| Hard limit | 5 GB (Free) |

Past egress already transferred **cannot** be deleted; only future transfer can be reduced. Meter resets each billing cycle.

---

## Highest-impact order (implementation)

1. Fix `getPostsByTag` (DB filter + limit).  
2. Slim + cache `getPostBySlug` / metadata; fix `getAdjacentPosts`.  
3. Admin analytics: day aggregates instead of all timestamps.  
4. Analytics track: sampling / bot filter / fewer round-trips.  
5. Cache `getSiteSettings`; strip AI list Json.  
6. Paginate `/blog`; soft-cache RSS.  
7. Docs + lint rules for query discipline.

---

## Notes

- “Supabase egress” here = **Postgres bytes out via Prisma** (and connection overhead), not Storage CDN.  
- Images on Cloudinary do **not** count toward Supabase Storage egress.  
- Do **not** delete published `Blog` rows to save egress.

*Audit complete — code changes begin after this document.*

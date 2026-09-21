# Supabase egress optimization report

**Date:** 2026-09-21  
**Audit:** [SUPABASE_EGRESS_AUDIT.md](./SUPABASE_EGRESS_AUDIT.md)

## What changed (code)

| Area | Change |
|------|--------|
| Tag pages | `getPostsByTag` uses `tags.hasSome(variants)` + `take` — no full corpus download |
| Post pages | Public select excludes LinkedIn; metadata uses body-less select; `React.cache` |
| Adjacent posts | Two `take: 1` queries instead of loading all slugs |
| Blog index | Pagination (24/page) + DB search (no JS filter over all posts) |
| Settings | `findUnique` + `React.cache` (no upsert write on every page) |
| Analytics track | Bot skip; no ipapi; view increment via `RETURNING`; **40% PageView sample** |
| Admin analytics | Day `GROUP BY` SQL instead of all timestamps |
| AI lists | Writer / SEO / Autopilot lists omit heavy JSON |
| RSS | Slim fields + `unstable_cache` 300s + take 50 |
| Static params | Uses sitemap slim entries |

## Docs added

- `SUPABASE_EGRESS_AUDIT.md`
- `DATABASE_OPTIMIZATION.md`
- `EGRESS_MONITORING.md`
- `SUPABASE_QUERY_RULES.md`
- This report

## Before / after (strategy)

| Area | Before | After | Expected impact |
|------|--------|-------|-----------------|
| DB queries (tag page) | Load all posts ×2 | Filtered + limited | **Very high** |
| Columns (post page) | Full row incl. LinkedIn ×2 | Meta slim + public body once | **High** |
| Rows (blog index) | All published | 24/page | **High** as corpus grows |
| Adjacent | All slugs | 2 rows | **Medium–high** |
| Settings | Upsert 2–3×/page | Cached find 1×/request | **Medium** (round-trips) |
| PageView writes | 100% human visits | ~40% + bots skipped | **Very high** on traffic |
| Admin chart | All 30d timestamps | ≤30 day aggregates | **High** on admin use |
| AI admin lists | Full JSON blobs | Slim selects | **High** on admin |
| RSS | Full list every hit | Cached slim 50 | **High** if polled |
| Realtime | None | None | — |
| Storage | 0 GB | 0 GB | — |
| Images | Cloudinary/public | Unchanged | — |

## Expected egress reduction

Qualitative only (past GB cannot be erased):

- **Public traffic:** large reduction vs prior tag/list/content patterns + PageView sampling.
- **Admin/AI:** large reduction when using dashboards.
- **Cron:** unchanged order of magnitude; retention still runs daily.

Conservative target for next billing cycle under similar traffic: **comfortably under 5 GB**, aiming **&lt; 3.5 GB** if deploys/AI scripts stay moderate.

## Remaining risks

1. `getAllTags` still scans all published `tags` arrays (lighter than full posts, still O(n)).
2. PageView sample rate 40% — analytics charts are approximate; raise/lower as needed.
3. ISR misses still hit DB (expected).
4. Heavy AI **detail** pages still load JSON when opened.
5. Past cycle egress already over quota until reset.

## Recommended next steps

1. Deploy this commit; watch Usage mid-cycle.
2. Optional GIN index on `Blog.tags` if tag pages slow.
3. Consider `PageViewDaily` rollup later.
4. Delete unused paused Supabase project after backup (org hygiene).
5. If traffic grows 3–5×, plan Pro or further sampling.

## Verification

- `npx tsc --noEmit` — passed after changes.
- Manual: `/blog`, `/blog?q=shopify`, tag/category, post page, admin analytics, RSS.

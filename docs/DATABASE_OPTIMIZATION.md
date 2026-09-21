# Database optimization candidates

**Date:** 2026-09-21  
**Rule:** Do **not** drop production columns or delete published blogs without an explicit product decision.

## Large / heavy columns

| Table | Column | Notes | Candidate action |
|-------|--------|-------|------------------|
| Blog | `content` | Required for articles | Never load on list pages (done) |
| Blog | `linkedinPersonalPost`, `linkedinPagePost` | Admin-only | Exclude from public selects (done) |
| PageView | `userAgent` | Writes null now | Optional: drop column in future migration |
| ResearchItem | `raw` | Large JSON | Retention nulls; delete PROCESSED after 30d |
| Research | `rawPayload` | Large JSON | Retention nulls |
| Opportunity | `factors` | Large JSON | Retention nulls on terminal statuses |
| AiWriterRun | `input`, `output` | Largest AI blobs | List without payloads (done); retain 30d |
| AiSeoGeoRun | `input`, `seoOutput`, `geoOutput` | Large | List slim (done) |
| AiAgentRun | `input`, `output` | Large | List slim (done); retention nulls |
| ContentPlan | `linkMap` | JSON | Load only on plan detail |

## Index candidates (add only if EXPLAIN shows need)

| Query pattern | Suggested index |
|---------------|-----------------|
| Published posts by date | Already: `[status, publishedAt]` |
| PageView by createdAt | Already: `[createdAt]` |
| PageView by blog + date | Already: `[blogId, createdAt]` |
| Tag filter `hasSome` | Consider GIN on `Blog.tags` if tag pages slow |

```sql
-- Optional (review before applying):
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS blog_tags_gin ON "Blog" USING GIN (tags);
```

## Denormalization ideas (future)

- Materialized `Tag` / `Category` tables for counts (avoid scanning all tag arrays).
- Daily `PageViewDaily` rollup (date, path, count) to retire raw timestamp charts.

## Storage

Supabase Storage usage is **0 GB**. Keep images on Cloudinary / `/public`.

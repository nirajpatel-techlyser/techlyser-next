# Supabase / Prisma query rules (Techlyser)

This project talks to Supabase **Postgres via Prisma**, not supabase-js. Rules still apply.

## Must follow

1. **Never** load a full `Blog` row on list/archive/RSS/sitemap paths.
2. **Never** use unbounded `findMany` for public UIs without `take` / pagination (exceptions: sitemap slim slug list).
3. Prefer explicit `select` / `blogListSelect` / `blogPublicSelect` / `blogMetaSelect`.
4. Do **not** return `input`/`output`/`raw`/`factors` JSON on admin **list** pages.
5. Deduplicate with `React.cache()` for helpers used multiple times per request (`getSiteSettings`, `getPostBySlug`, tags/categories).
6. Prefer ISR (`revalidate`) / `unstable_cache` for semi-static public data.
7. Do **not** add Realtime or polling against Postgres without a documented product need.
8. Do **not** store website images in Supabase Storage.
9. Analytics: prefer sampling + bot skip; never pull all PageView timestamps for charts — use SQL day aggregates.
10. Mutations: avoid `include` of huge relations unless the UI needs them.

## Anti-patterns (reject in review)

```ts
// BAD — full table then filter in JS
const all = await prisma.blog.findMany();
all.filter((p) => p.tags.includes("x"));

// BAD — metadata loads full HTML
await prisma.blog.findFirst({ where: { slug } }); // no select

// BAD — chart loads every row
await prisma.pageView.findMany({ where: { createdAt: { gte } }, select: { createdAt: true } });
```

## Good patterns

```ts
// GOOD — DB filter + limit
await prisma.blog.findMany({
  where: { status: "PUBLISHED", tags: { hasSome: variants } },
  select: blogListSelect,
  take: 100,
});

// GOOD — day aggregate
await prisma.$queryRaw`SELECT to_char(...) AS day, COUNT(*)::int AS views ... GROUP BY 1`;
```

## Lint

At minimum, PR review must grep for:

- `findMany({` without `take` / `select` on Blog/AI/Research models
- `pageView.findMany` without `take`
- `aiWriterRun.findMany` / `aiAgentRun.findMany` without slim `select`

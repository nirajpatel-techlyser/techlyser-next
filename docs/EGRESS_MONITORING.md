# Egress monitoring

## Budget (Free plan)

| Level | Monthly origin egress |
|-------|------------------------|
| Comfortable | &lt; 3.5 GB |
| Warning | 3.5–4.0 GB |
| High | 4.0–4.5 GB |
| Critical | 4.5–5.0 GB |
| Hard limit | 5 GB |

## Where to look (no extra DB writes)

1. Supabase Dashboard → **Organization → Usage → Egress** (source of truth).
2. Vercel → project logs for `/api/analytics/track` volume.
3. Local: `npm run db:cleanup` prints table sizes (disk, not egress).

## Do **not**

- Insert a monitoring row into Supabase for every request (that increases egress).
- Log full Prisma payloads to a DB table.

## Lightweight server logging (optional)

In high-risk routes, log **counts only** to Vercel logs:

```ts
console.info("[egress]", { route: "analytics/track", sampled: true });
```

Review weekly; if track volume is huge, lower the PageView sample rate further in `src/app/api/analytics/track/route.ts`.

## Alerts

Set a calendar reminder mid-billing-cycle to check Usage. If &gt; 3.5 GB with &gt; 2 weeks left, reduce deploys / AI scripts / sample rate.

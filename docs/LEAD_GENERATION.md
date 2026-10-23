# Lead generation

Internal research for `/admin/lead-generation`. It does not email or message anyone.

## Markets

United States, Canada, Australia, New Zealand, Denmark, and Europe. Europe covers GB, IE, DE, FR, NL, BE, SE, NO, FI, DK, ES, IT, AT, CH, PT, PL, CZ, GR, HU, and RO.

## How a run works

1. Paste store URLs, or leave them empty to use Google Programmable Search when `GOOGLE_CSE_API_KEY` and `GOOGLE_CSE_CX` are set.
2. The job is stored in Postgres. The browser calls `/api/admin/leads/jobs/:id/step` until the cursor finishes. Each step checks up to 3 sites. Vercel does not keep an in-memory queue.
3. Each site is fetched over public HTTP only. Private IPs, localhost, and cloud metadata hosts are blocked.
4. Shopify and social links are recorded only from that page. A profile is verified only when the official site links to it.
5. The score uses those observations. Hypotheses are labelled separately. Missing revenue, traffic, or email is left blank.

## Environment

```
GOOGLE_CSE_API_KEY=
GOOGLE_CSE_CX=
```

Create a Programmable Search Engine at https://programmablesearchengine.google.com and enable the Custom Search API in Google Cloud. Without the keys, paste URLs. The app will not invent leads.

Gemini is not required for scoring. Outreach drafts are template text built from stored facts.

## Database

Migration `20261023120000_lead_generation` adds `Lead`, `LeadResearchJob`, `LeadSocialProfile`, `LeadOutreachDraft`, and `LeadSuppression`. RLS is on and `anon` / `authenticated` have no grants. Apply with:

```
npx prisma db execute --file prisma/migrations/20261023120000_lead_generation/migration.sql --schema prisma/schema.prisma
```

## Limits

- 25 businesses per job.
- Google Custom Search returns at most 10 results per request on the free JSON API quota.
- Country is the market you selected. A country code is stored only when the page itself shows one. This version does not geolocate the server.
- Re-research does not reset a lead that is already Contacted, Replied, or Converted.

# Social publishing and Supabase egress

Social publishing is built to avoid another Free-plan egress spike. The app still reads and writes through Prisma on the server. It does not add a browser Supabase client, realtime channel, or `select *`.

## What is fetched

| Screen or action | Query |
| --- | --- |
| Blog list | Existing page of 12 posts, plus at most those 12 distribution rows (`blogId`, `status` only). |
| Edit post | The existing blog row, plus connected account labels, one distribution, up to 20 recent attempts, and one active job id. Tokens are not selected. |
| History | 15 jobs per page, with attempt status fields. No captions, no `errorDetail`, no tokens. |
| Publish click | One blog row (the post being published), matching attempts by idempotency key (at most one per selected platform), then per-platform updates. |
| Job status check | One job and its attempts (at most four). The browser does this at most 12 times after a click. |

Account tokens are selected only inside `loadPublisherAccount`, during the server job, and are not returned.

## What this feature does not do

- No Supabase realtime subscription.
- No polling of platform analytics (impressions, likes, comments).
- No repeated image download in the browser. LinkedIn receives the image once per job from the server. Instagram, Facebook, and Google Business receive the existing public image URL.
- No second copy of the image in Supabase Storage. Storage usage stays on Cloudinary.
- No full-table history read.
- Captions are built locally from the post. There is no extra LLM call on publish.
- The daily cron does not publish to social networks.

## Budget

Keep an eye on the same Supabase egress chart as the rest of the site. This feature should add a few small admin queries per publish, not public traffic. If egress climbs, check Analytics page views and bot traffic first. Those were the previous source of the 6.47 GB spike. Social tables are not on the public site.

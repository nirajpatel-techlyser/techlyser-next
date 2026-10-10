# Social publishing architecture

The website post remains the source of truth. Social publishing is an extra step after a person approves that post. AI generation, `Blog.status`, and the public site are unchanged.

## Current post flow

- Daily autopilot writes a `Blog` row with `status = DRAFT` through the existing writer. It does not call social publishing.
- Admins review that post at `/admin/blogs/[id]/edit` (`BlogForm`).
- Website visibility is still only `DRAFT` or `PUBLISHED`.
- Featured images upload through `/api/upload` to Cloudinary (or local public files in development).
- LinkedIn copy fields on `Blog` (`linkedinPersonalPost`, `linkedinPagePost`) stay admin-only drafts. Publishing reads them. It does not rewrite them.
- Admin auth is Auth.js credentials (JWT). Data access is Prisma on the server. Supabase Data API roles have RLS and no grants.

## Where this system attaches

```
Blog (source)
  -> admin reviews and publishes the website post
  -> admin clicks Approve
  -> admin clicks Publish Everywhere
  -> SocialDistribution + SocialVariant (platform captions)
  -> SocialPublishJob
  -> SocialPublishAttempt per platform
  -> official platform API
```

The edit page renders `SocialPublishPanel` beside the existing form. Account connection lives at `/admin/social/accounts`. History lives at `/admin/social/history`.

`Blog.status` is not replaced. Social state is `SocialDistribution.status`:

`NEEDS_REVIEW -> APPROVED or READY_TO_PUBLISH -> PUBLISHING -> PUBLISHED | PARTIALLY_PUBLISHED | PUBLISH_FAILED`

`CANCELLED` exists on the job/lifecycle enums so a later scheduler can cancel a queued job without a schema rewrite. The current UI does not auto-cancel.

## Data

| Table | Purpose |
| --- | --- |
| `SocialAccount` | One connected official account per platform target. Tokens encrypted. |
| `SocialDistribution` | One row per website post. Approval timestamp lives here. |
| `SocialVariant` | Caption, hashtags, link, and image URL for one platform. |
| `SocialPublishJob` | One Publish Everywhere click. `scheduledFor` is reserved for a later scheduler. |
| `SocialPublishAttempt` | Per-platform result, external id, public URL, friendly error. |

Idempotency keys are hashes of `blogId + platform + content hash`. A successful attempt blocks a second publish of that same version. A failed attempt is retried in place. Other platforms in the same job are not republished.

## API

OAuth (admin session required, secrets stay on the server):

- `GET /api/social/linkedin/connect` and `/callback`
- `GET /api/social/meta/connect` and `/callback` (Facebook Page + linked Instagram professional account)
- `GET /api/social/google/connect` and `/callback`

Publishing:

- `POST /api/admin/social/posts/[blogId]/approve`
- `POST /api/admin/social/posts/[blogId]/publish`
- `GET /api/admin/social/jobs/[jobId]`
- `POST /api/admin/social/attempts/[attemptId]/retry`
- `GET|DELETE /api/admin/social/accounts`

Publish creates the job and returns immediately. `after()` runs the job on the server. The edit screen checks that one job at most 12 times, two seconds apart. It does not subscribe to Supabase realtime.

## Adapters

`src/social/publishers/` keeps each official API in its own publisher:

- LinkedIn Posts API (`/rest/posts`) for the connected member, including image upload when a public https image exists
- Instagram content publishing (container, then `media_publish`)
- Facebook Page photos or feed
- Google Business Profile local posts

Captions are built in `src/social/content.ts` from the title, excerpt or a short lead, existing LinkedIn draft text, tags, and the canonical URL. The full article is not copied. Facts are not added.

## Security

- OAuth `state` is HMAC-signed with `AUTH_SECRET`, stored in an httpOnly cookie, and checked against the admin user id.
- Access and refresh tokens are encrypted with `SOCIAL_TOKEN_SECRET` (AES-256-GCM) before insert.
- API responses never select token columns.
- Technical platform bodies are stored in `errorDetail` and are not returned to the browser.
- RLS is enabled on the new tables and `anon` / `authenticated` grants are revoked. Prisma uses the database role and bypasses RLS, which matches the rest of this app.
- Editors cannot connect accounts or publish. There is no password storage and no browser automation.

## Not automatic

Nothing in the daily cron calls `startPublishJob`. A person still approves the post and clicks Publish Everywhere.

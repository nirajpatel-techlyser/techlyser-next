# Social publishing setup

Connect LinkedIn, Instagram, Facebook, and Google Business Profile from `/admin/social/accounts` after the keys below exist on the server. Placeholder names are in `.env.example`. Do not commit real values. Do not put these in `NEXT_PUBLIC_*` variables.

`AUTH_URL` must be the site origin (`http://localhost:3000` locally, `https://techlyser.com` in production). Redirect URLs are derived from it.

Also set `SOCIAL_TOKEN_SECRET` to a random string of at least 16 characters. Without it, connect is refused and tokens are never stored.

Apply the schema once:

```bash
npx prisma db execute --file prisma/migrations/20261010120000_social_publishing/migration.sql --schema prisma/schema.prisma
npx prisma generate
```

If the migration was already applied, Prisma will report that the types exist. Do not drop `Blog`.

## LinkedIn

1. Create an app at https://www.linkedin.com/developers/apps
2. Add the products **Share on LinkedIn** and **Sign In with LinkedIn using OpenID Connect**. Do not add Community Management API to this app. LinkedIn disables that request when any other product is already on the app.
3. Redirect URL: `https://techlyser.com/api/social/linkedin/callback`
   Local: `http://localhost:3000/api/social/linkedin/callback`
4. Set `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`.
5. In admin, click **Connect LinkedIn** and approve `openid`, `profile`, and `w_member_social`.

Page posting needs a second, empty LinkedIn app that has only Community Management API. After that product is approved, one publish can write the same caption to the member profile and to the Techlyser Page. If the Page post fails after the profile post succeeded, retry continues from the Page and does not post the profile again.

The live post is not verified until you connect the app and publish one approved post.

## Facebook and Instagram

1. Create an app at https://developers.facebook.com/apps with Facebook Login and Instagram products.
2. Valid OAuth redirect: `https://techlyser.com/api/social/meta/callback`
   Local: `http://localhost:3000/api/social/meta/callback`
3. Request these permissions: `pages_show_list`, `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`, `business_management`.
4. Set `META_APP_ID` and `META_APP_SECRET`.
5. The Facebook user must be an admin of the Techlyser Facebook Page. Instagram must be a professional account linked to that Page.
6. Connect once. The callback stores the Page whose name contains “Techlyser”, otherwise the first Page you granted. Instagram is stored only when that Page has `instagram_business_account`.

App Review is required before a non-tester can grant these permissions in production. Until then, only app roles (admin, developer, tester) can connect.

## Google Business Profile

1. In Google Cloud, create an OAuth client (Web) and enable:
   - My Business Account Management API
   - My Business Business Information API
   - Google My Business API (local posts, v4)
2. Redirect: `https://techlyser.com/api/social/google/callback`
   Local: `http://localhost:3000/api/social/google/callback`
3. Scope requested: `https://www.googleapis.com/auth/business.manage`
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
5. Google must approve Business Profile API access for the project. Until that approval exists, connect or publish returns a reconnect / permission message instead of a raw API error.

The first location whose title contains “Techlyser” is stored. Otherwise the first location on the account is stored.

## Daily use

1. Open **Admin → Blogs** and edit today’s draft.
2. Edit the article if needed and save.
3. Publish the website post (existing Publish button) so `/{slug}` is live.
4. Upload one https featured image and save.
5. Click **Approve**.
6. Leave the platforms you want checked. Open **Preview** to read the shorter caption.
7. Click **Publish Everywhere**.
8. Each platform shows Published or Failed. Use **Retry** only on the failed platform.

Publishing does not run from the daily autopilot.

## Troubleshooting

| What you see | What to do |
| --- | --- |
| This platform app is not configured yet | Set that platform’s client id and secret, then redeploy. |
| Set SOCIAL_TOKEN_SECRET | Add the encryption secret on the server and redeploy. |
| The connection attempt expired | Start Connect again. The state cookie lasts 10 minutes. |
| Add an https image | Instagram and Google Business need a public `https://` featured image. Cloudinary URLs qualify. |
| Authorization has expired | Use Reconnect on `/admin/social/accounts`. |
| No Facebook Page was shared | Reconnect and grant the Techlyser Page. |
| Instagram stays disconnected | Link a professional Instagram account to the Facebook Page, then reconnect. |

Tokens are encrypted in `SocialAccount` and are not shown in admin or API responses. Disconnect deletes that account row. Publish history remains.

## Local development

Copy `.env.example` into `.env.local`, set `AUTH_URL=http://localhost:3000`, and use the localhost redirect URLs in each developer console. `npm run dev`, sign in at `/admin/login`, then open `/admin/social/accounts`.

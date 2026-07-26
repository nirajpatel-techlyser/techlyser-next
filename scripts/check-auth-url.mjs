/**
 * On Vercel production builds only: fail if AUTH_URL still points at localhost.
 * Local `.env.local` can keep http://localhost:3000 for `next dev` / local builds.
 */
const isVercelProduction =
  process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";

const url = process.env.AUTH_URL || "";

if (isVercelProduction && /localhost|127\.0\.0\.1/i.test(url)) {
  console.error(
    [
      "",
      "✗ AUTH_URL is localhost on the Vercel Production environment.",
      "  Fix: Vercel → Project → Settings → Environment Variables",
      "  Set AUTH_URL=https://techlyser.com for Production (no quotes).",
      "  Keep localhost AUTH_URL only in your local `.env.local` file.",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

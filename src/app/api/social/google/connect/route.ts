import { beginSocialConnect } from "@/social/oauth-flow";
import { googleAuthorizeUrl } from "@/social/oauth-config";

export async function GET() {
  return beginSocialConnect({
    platform: "GOOGLE_BUSINESS",
    configured: "GOOGLE_BUSINESS",
    authorizeUrl: googleAuthorizeUrl,
  });
}

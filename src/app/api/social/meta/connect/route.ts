import { beginSocialConnect } from "@/social/oauth-flow";
import { metaAuthorizeUrl } from "@/social/oauth-config";

export async function GET() {
  return beginSocialConnect({
    platform: "META",
    configured: "FACEBOOK",
    authorizeUrl: metaAuthorizeUrl,
  });
}

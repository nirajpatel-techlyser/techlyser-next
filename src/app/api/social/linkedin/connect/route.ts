import { beginSocialConnect } from "@/social/oauth-flow";
import { linkedInAuthorizeUrl } from "@/social/oauth-config";

export async function GET() {
  return beginSocialConnect({
    platform: "LINKEDIN",
    configured: "LINKEDIN",
    authorizeUrl: linkedInAuthorizeUrl,
  });
}

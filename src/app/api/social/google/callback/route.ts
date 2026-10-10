import { connectGoogleBusiness } from "@/social/connect";
import { finishSocialConnect } from "@/social/oauth-flow";

export async function GET(request: Request) {
  return finishSocialConnect({
    request,
    platform: "GOOGLE_BUSINESS",
    connect: connectGoogleBusiness,
  });
}

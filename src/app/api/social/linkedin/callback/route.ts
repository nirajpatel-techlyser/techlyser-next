import { connectLinkedIn } from "@/social/connect";
import { finishSocialConnect } from "@/social/oauth-flow";

export async function GET(request: Request) {
  return finishSocialConnect({
    request,
    platform: "LINKEDIN",
    connect: connectLinkedIn,
  });
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DisconnectAccountButton from "@/components/admin/social/DisconnectAccountButton";
import { oauthConfigured } from "@/social/oauth-config";
import { PLATFORM_LABEL } from "@/social/labels";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/social/types";

const CONNECT_PATH: Record<SocialPlatform, string> = {
  LINKEDIN: "/api/social/linkedin/connect",
  INSTAGRAM: "/api/social/meta/connect",
  FACEBOOK: "/api/social/meta/connect",
  GOOGLE_BUSINESS: "/api/social/google/connect",
};

export default async function SocialAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; connected?: string }>;
}) {
  const params = await searchParams;
  const accounts = await prisma.socialAccount.findMany({
    select: {
      id: true,
      platform: true,
      label: true,
      status: true,
      expiresAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 12,
  });
  const notice = params.error?.slice(0, 240);
  const connected = params.connected;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Social accounts</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Connect official accounts with OAuth. Techlyser never asks for a social password.
          Facebook and Instagram use one Meta login. If the Page has a linked Instagram professional account, both connect together.
        </p>
      </div>

      {notice ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{notice}</p>
      ) : null}
      {connected ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Account connection finished. Confirm the platforms below show Connected.
        </p>
      ) : null}

      <div className="grid gap-4">
        {SOCIAL_PLATFORMS.map((platform) => {
          const account = accounts.find((row) => row.platform === platform && row.status === "CONNECTED");
          const ready = oauthConfigured(platform);
          return (
            <article key={platform} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{PLATFORM_LABEL[platform]}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {account ? `Connected · ${account.label}` : ready ? "Not connected" : "App credentials are not set"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    account ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {account ? "Connected" : "Not connected"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                {ready ? (
                  <Link href={CONNECT_PATH[platform]} className="text-sm font-semibold text-primary hover:underline">
                    {account ? "Reconnect" : `Connect ${PLATFORM_LABEL[platform]}`}
                  </Link>
                ) : (
                  <span className="text-sm text-slate-500">Add the platform keys in the server environment.</span>
                )}
                {account ? <DisconnectAccountButton id={account.id} /> : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

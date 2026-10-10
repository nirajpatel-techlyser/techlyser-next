import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { disconnectAccount, listPublicAccounts } from "@/social/store";

async function guard() {
  const { session, error } = await requireAdminApi();
  if (error || !session) return { error };
  if (session.user.role === "EDITOR") {
    return { error: NextResponse.json({ error: "Only an admin can manage social accounts." }, { status: 403 }) };
  }
  return { error: null };
}

export async function GET() {
  const { error } = await guard();
  if (error) return error;
  const accounts = await listPublicAccounts();
  return NextResponse.json({
    accounts: accounts.map((account) => ({
      id: account.id,
      platform: account.platform,
      label: account.label,
      status: account.status,
      expiresAt: account.expiresAt?.toISOString() ?? null,
    })),
  });
}

export async function DELETE(request: Request) {
  const { error } = await guard();
  if (error) return error;
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "Account id is required." }, { status: 400 });
  await disconnectAccount(id);
  return NextResponse.json({ ok: true });
}

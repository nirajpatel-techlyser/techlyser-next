import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireAdminApi() {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null as null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, error: null as null };
}

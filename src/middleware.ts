import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuthSecret, normalizeAuthEnv } from "@/lib/env";

normalizeAuthEnv();

async function readSessionToken(request: NextRequest) {
  const secret = getAuthSecret();
  // Production HTTPS uses `__Secure-authjs.session-token`.
  // getToken defaults to the non-secure name unless secureCookie is set.
  const secureCookie =
    request.nextUrl.protocol === "https:" ||
    process.env.NODE_ENV === "production";

  return getToken({
    req: request,
    secret,
    secureCookie,
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (pathname.startsWith("/admin/login")) {
    const token = await readSessionToken(request);

    if (token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (pathname.startsWith("/admin")) {
    const token = await readSessionToken(request);

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

import { NextResponse, type NextRequest } from "next/server";
import {
  authConfig,
  isAuthConfigured,
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // Dormant until AUTH_EMAIL / AUTH_PASSWORD / AUTH_SECRET are all set.
  if (!isAuthConfigured()) return NextResponse.next();

  if (request.nextUrl.pathname === "/login") return NextResponse.next();

  const { secret } = authConfig();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = secret ? await verifySessionToken(token, secret) : false;
  if (valid) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|.*\\.).*)",
  ],
};

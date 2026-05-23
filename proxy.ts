import { NextRequest, NextResponse } from "next/server";
import { adminSessionCookieName, isAllowedAdminEmail, verifyAdminSession } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin") || pathname === "/admin/login" || pathname === "/admin/access-denied") return NextResponse.next();

  const session = await verifyAdminSession(request.cookies.get(adminSessionCookieName)?.value);
  if (session && isAllowedAdminEmail(session.email)) return NextResponse.next();
  if (session) {
    const deniedUrl = request.nextUrl.clone();
    deniedUrl.pathname = "/admin/access-denied";
    deniedUrl.searchParams.set("email", session.email);
    const response = NextResponse.redirect(deniedUrl);
    response.cookies.delete(adminSessionCookieName);
    return response;
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};

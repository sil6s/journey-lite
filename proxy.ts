import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { adminSessionCookieName, isAllowedAdminEmail, verifyAdminSession } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || pathname === "/admin/access-denied") return NextResponse.next();

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

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/dashboard") && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname === "/signup") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/courses/:path*",
  ],
};

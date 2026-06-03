import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isValidLocale, LOCALE_COOKIE } from "@/lib/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;

function isBypassedPath(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/studio") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    PUBLIC_FILE.test(pathname)
  );
}

function rewriteLocalizedPath(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isBypassedPath(pathname)) return null;

  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];
  if (!maybeLocale || !isValidLocale(maybeLocale)) return null;
  if (["admin", "api", "studio"].includes(segments[1] ?? "")) {
    const unlocalizedUrl = request.nextUrl.clone();
    unlocalizedUrl.pathname = `/${segments.slice(1).join("/")}`;
    return NextResponse.redirect(unlocalizedUrl);
  }

  if (maybeLocale === defaultLocale) {
    const englishUrl = request.nextUrl.clone();
    englishUrl.pathname = `/${segments.slice(1).join("/")}`;
    if (englishUrl.pathname === "/") englishUrl.pathname = "/";
    const response = NextResponse.redirect(englishUrl);
    response.cookies.set(LOCALE_COOKIE, defaultLocale, { path: "/", sameSite: "lax" });
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${segments.slice(1).join("/")}`;
  if (url.pathname === "/") url.pathname = "/";
  const response = NextResponse.rewrite(url);
  response.cookies.set(LOCALE_COOKIE, maybeLocale, { path: "/", sameSite: "lax" });
  return response;
}

async function refreshSupabaseSession(request: NextRequest) {
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

  return { supabaseResponse, user };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const localizedResponse = rewriteLocalizedPath(request);
  if (localizedResponse) return localizedResponse;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await refreshSupabaseSession(request);

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    pathname !== "/admin/access-denied" &&
    !user
  ) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/admin/login" && user) {
    const nextParam = request.nextUrl.searchParams.get("next");
    const url = request.nextUrl.clone();
    url.pathname = nextParam?.startsWith("/admin") ? nextParam : "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};

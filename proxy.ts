import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isValidLocale, LOCALE_COOKIE } from "@/lib/i18n/config";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

const PUBLIC_FILE = /\.(.*)$/;
const ADMIN_PUBLIC_PATHS = ["/admin/login", "/admin/access-denied"];

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
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-locale", maybeLocale);
  const response = NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders,
    },
  });
  response.cookies.set(LOCALE_COOKIE, maybeLocale, { path: "/", sameSite: "lax" });
  return response;
}

function nextWithRequestHeaders(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    requestHeaders.set("x-locale", cookieLocale);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function redirectWithSupabaseCookies(url: URL, supabaseResponse: NextResponse) {
  const response = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });
  return response;
}

async function refreshSupabaseSession(request: NextRequest) {
  let supabaseResponse = nextWithRequestHeaders(request);
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabasePublishableKey();

  if (!supabaseUrl || !supabaseKey) {
    return { supabaseResponse, user: null };
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = nextWithRequestHeaders(request);
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();

  return { supabaseResponse, user: data?.claims ?? null };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const localizedResponse = rewriteLocalizedPath(request);
  if (localizedResponse) return localizedResponse;

  if (!pathname.startsWith("/admin")) {
    return nextWithRequestHeaders(request);
  }

  const { supabaseResponse, user } = await refreshSupabaseSession(request);

  if (
    pathname.startsWith("/admin") &&
    !ADMIN_PUBLIC_PATHS.some((path) => pathname.startsWith(path)) &&
    !user
  ) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", pathname);
    return redirectWithSupabaseCookies(loginUrl, supabaseResponse);
  }

  if (pathname === "/admin/login" && user) {
    const nextParam = request.nextUrl.searchParams.get("next");
    const url = request.nextUrl.clone();
    url.pathname = nextParam?.startsWith("/admin") ? nextParam : "/admin";
    url.search = "";
    return redirectWithSupabaseCookies(url, supabaseResponse);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};

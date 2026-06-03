import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import {
  defaultLocale,
  isValidLocale,
  LOCALE_COOKIE,
  type SupportedLocale,
} from "@/lib/i18n/config";

const BYPASS_LOCALE_PREFIXES = [
  "/admin",
  "/studio",
  "/api",
  "/_next",
  "/favicon",
];

const STATIC_EXTENSION = /\.[\w]+$/;

function detectLocale(request: NextRequest): SupportedLocale {
  const [, urlSegment] = request.nextUrl.pathname.split("/");
  if (urlSegment && isValidLocale(urlSegment)) return urlSegment;

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale;

  const acceptLang = request.headers.get("accept-language") ?? "";
  for (const part of acceptLang.split(",")) {
    const tag = part.split(";")[0]?.trim().split("-")[0]?.toLowerCase();
    if (tag && isValidLocale(tag)) return tag;
  }

  return defaultLocale;
}

function localeRedirectIfNeeded(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const shouldBypassLocale =
    BYPASS_LOCALE_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    STATIC_EXTENSION.test(pathname);

  if (shouldBypassLocale) return null;

  const [, firstSegment] = pathname.split("/");
  if (firstSegment && isValidLocale(firstSegment)) return null;

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
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

  const localeRedirect = localeRedirectIfNeeded(request);
  if (localeRedirect) return localeRedirect;

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
    "/((?!_next/static|_next/image|favicon|sitemap|robots|manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|mp4|pdf)$).*)",
  ],
};

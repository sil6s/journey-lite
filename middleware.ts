/**
 * Unified Next.js middleware — handles TWO concerns in one pass:
 *
 * 1. Locale routing (public marketing pages)
 *    – Detects user's preferred locale from URL prefix, cookie, Accept-Language
 *    – Redirects root paths (e.g. /about) to locale-prefixed versions (/en/about)
 *    – Skips admin, studio, API, _next, and static files
 *
 * 2. Supabase session refresh + admin-route protection
 *    – Refreshes the Supabase session cookie on every request
 *    – Redirects unauthenticated users away from /admin/* to /admin/login
 *    – Redirects authenticated users away from /admin/login to /admin
 *
 * IMPORTANT: This runs in the Edge runtime — no Node.js APIs (fs, path, etc.).
 */
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  defaultLocale,
  isValidLocale,
  publicLocales,
  LOCALE_COOKIE,
  type SupportedLocale,
} from "@/lib/i18n/config";

// ── Paths that should NEVER receive a locale prefix ───────────────────────────
const BYPASS_PREFIXES = [
  "/admin",
  "/studio",
  "/api",
  "/_next",
  "/favicon",
  // Add any other non-localized paths here
];

// File extension pattern — skip static assets
const STATIC_EXTENSION = /\.[\w]+$/;

// ── Locale detection ──────────────────────────────────────────────────────────

function detectLocale(request: NextRequest): SupportedLocale {
  // 1. URL prefix: /es/... → "es"
  const [, urlSegment] = request.nextUrl.pathname.split("/");
  if (urlSegment && isValidLocale(urlSegment)) return urlSegment;

  // 2. Locale cookie (set when user explicitly switches language)
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale;

  // 3. Accept-Language header (browser preference)
  const acceptLang = request.headers.get("accept-language") ?? "";
  for (const part of acceptLang.split(",")) {
    const tag = part.split(";")[0]?.trim().split("-")[0]?.toLowerCase();
    if (tag && isValidLocale(tag)) return tag;
  }

  return defaultLocale;
}

// ── Main middleware ───────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Skip bypass paths and static files ──────────────────────────────────────
  const shouldBypass =
    BYPASS_PREFIXES.some((p) => pathname.startsWith(p)) ||
    STATIC_EXTENSION.test(pathname);

  if (!shouldBypass) {
    // ── Locale routing ─────────────────────────────────────────────────────────
    const [, firstSegment] = pathname.split("/");
    const hasLocalePrefix = firstSegment && isValidLocale(firstSegment);

    if (!hasLocalePrefix) {
      // Redirect /about → /en/about  (or /es/about based on detection)
      const locale = detectLocale(request);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
      const response = NextResponse.redirect(url);
      // Persist the detected locale in a cookie so the next request is faster
      response.cookies.set(LOCALE_COOKIE, locale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: "lax",
      });
      return response;
    }
  }

  // ── Supabase session refresh (all routes) ────────────────────────────────────
  // Must run on every request to keep the session alive and write updated
  // session cookies back to the browser.
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
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() validates the token with Supabase — do not replace with getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Admin-route protection ───────────────────────────────────────────────────
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login") &&
    !pathname.startsWith("/admin/access-denied")
  ) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.search = "";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect already-authenticated users away from the login page
  if (pathname === "/admin/login" && user) {
    const nextParam = request.nextUrl.searchParams.get("next");
    const dest = nextParam?.startsWith("/admin") ? nextParam : "/admin";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * – _next/static  (compiled assets)
     * – _next/image   (optimized images)
     * – favicon.ico, sitemap.xml, robots.txt, manifest files
     * – Any file with an extension (fonts, images, etc.)
     */
    "/((?!_next/static|_next/image|favicon|sitemap|robots|manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|mp4|pdf)$).*)",
  ],
};

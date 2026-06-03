/**
 * Supabase Auth callback handler.
 *
 * This single route handles ALL Supabase Auth flows:
 *   - Google / other OAuth sign-ins
 *   - Magic-link / email OTP sign-ins
 *
 * Supabase redirects here with ?code=… after the external auth step.
 * We exchange the code for a session, then forward to the admin portal.
 * The admin layout performs the admin_users table check after this redirect.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent("Missing authentication code.")}`
    );
  }

  const cookieStore = await cookies();
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabasePublishableKey();

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent("Supabase is not configured.")}`
    );
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback]", error.message);
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // Sanitize the next param so we can't be used as an open redirect
  const safeNext = next.startsWith("/admin") ? next : "/admin";
  return NextResponse.redirect(`${origin}${safeNext}`);
}

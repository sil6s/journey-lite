/**
 * @deprecated — replaced by Supabase Auth.
 * Supabase handles Google OAuth natively. The admin login page calls
 * supabase.auth.signInWithOAuth({ provider: 'google' }) directly,
 * which redirects to /api/auth/callback on return.
 *
 * This stub redirects any old bookmarks to the new login page.
 */
import { NextResponse } from "next/server";

export function GET(request: Request) {
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export function POST(request: Request) {
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

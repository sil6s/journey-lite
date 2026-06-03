/**
 * @deprecated — replaced by Supabase Auth.
 * Email/password sign-in now uses supabase.auth.signInWithPassword() on the
 * client side. This stub returns a clear error so any lingering calls surface
 * the deprecation rather than silently failing.
 */
import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json(
    { error: "This endpoint has been removed. Sign in via the admin login page using Supabase Auth." },
    { status: 410 }
  );
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getAdminAccessForEmail } from "@/lib/admin/users";

/**
 * Used in API route handlers to reject non-admin requests.
 * Returns null if the request is authorized, or a 401 NextResponse if not.
 */
export async function requireAdmin(request: NextRequest) {
  // Build a read-only Supabase client from the incoming request cookies.
  // We don't need to refresh the session here — middleware handles that.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // No-op: API route handlers don't need to write back cookies
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Admin authentication is required." }, { status: 401 });
  }

  const access = await getAdminAccessForEmail(user.email);
  if (!access) {
    return NextResponse.json({ error: "Admin authentication is required." }, { status: 401 });
  }

  return null;
}

/**
 * Returns the current admin's access record from a server component or server action.
 * Uses next/headers cookies, so it only works outside of middleware/edge functions.
 */
export async function getCurrentAdminAccess() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return null;
  return getAdminAccessForEmail(user.email);
}

/**
 * Throws if the current user is not a superadmin.
 */
export async function requireSuperadmin() {
  const access = await getCurrentAdminAccess();
  if (!access || access.role !== "superadmin") {
    throw new Error("Superadmin access is required.");
  }
  return access;
}

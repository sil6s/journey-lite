import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { createClient } from "@/lib/supabase/server";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";
import { getAdminAccessForEmail } from "@/lib/admin/users";

export const metadata: Metadata = {
  title: "JourneyLite Admin",
  description: "Manage JourneyLite website content and performance.",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "";
  const isPublicAdminRoute =
    pathname.startsWith("/admin/login") || pathname.startsWith("/admin/access-denied");

  if (isPublicAdminRoute) {
    return children;
  }

  if (!getSupabaseUrl() || !getSupabasePublishableKey()) {
    redirect(
      `/admin/login?error=${encodeURIComponent(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
      )}`
    );
  }

  const supabase = await createClient();

  // getUser() re-validates the token against Supabase — never skip this in server components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/admin/login");
  }

  // Check that this Supabase user is in the admin_users allowlist
  const access = await getAdminAccessForEmail(user.email);
  if (!access) {
    redirect("/admin/access-denied");
  }

  return (
    <AdminShell
      user={{
        email: user.email,
        // Supabase stores Google name/avatar in user_metadata
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? undefined,
        picture: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? undefined,
        role: access.role,
      }}
    >
      {children}
    </AdminShell>
  );
}

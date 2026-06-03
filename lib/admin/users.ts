import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAllowedAdminEmail, type AdminRole } from "@/lib/auth/session";

export type AdminUser = {
  email: string;
  role: AdminRole;
  status: "active" | "disabled";
  invited_at: string | null;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminAccess = {
  email: string;
  role: AdminRole;
  source: "supabase" | "env";
};

export async function getAdminAccessForEmail(email: string): Promise<AdminAccess | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select("email,role,status")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (!error && data?.status === "active") {
      return { email: data.email, role: data.role, source: "supabase" };
    }
  } catch (err) {
    console.warn("[admin] Supabase admin access lookup failed:", err);
  }

  if (isAllowedAdminEmail(normalizedEmail)) {
    return { email: normalizedEmail, role: "admin", source: "env" };
  }

  return null;
}

export async function getCurrentAdminAccess(): Promise<AdminAccess | null> {
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

  if (!user?.email) return null;
  return getAdminAccessForEmail(user.email);
}

export async function requireSuperadmin(): Promise<AdminAccess> {
  const access = await getCurrentAdminAccess();
  if (!access || access.role !== "superadmin") {
    throw new Error("Superadmin access is required.");
  }
  return access;
}

export async function listAdminUsers() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("email,role,status,invited_at,invited_by,created_at,updated_at")
    .order("role", { ascending: false })
    .order("email", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AdminUser[];
}

export function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase();
}

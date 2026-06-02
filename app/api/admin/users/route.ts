import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { listAdminUsers, normalizeAdminEmail, requireSuperadmin } from "@/lib/admin/users";
import type { AdminRole } from "@/lib/auth/session";

const roles = new Set<AdminRole>(["admin", "superadmin"]);

export async function GET() {
  try {
    await requireSuperadmin();
    return NextResponse.json({ users: await listAdminUsers() });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  let body: { email?: string; role?: AdminRole };
  try {
    body = (await request.json()) as { email?: string; role?: AdminRole };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const currentAdmin = await requireSuperadmin();
    const email = normalizeAdminEmail(body.email || "");
    const role = body.role || "admin";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!roles.has(role)) {
      return NextResponse.json({ error: "Invalid admin role." }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { error: upsertError } = await supabase.from("admin_users").upsert({
      email,
      role,
      status: "active",
      invited_at: new Date().toISOString(),
      invited_by: currentAdmin.email,
    });
    if (upsertError) throw upsertError;

    const origin = request.nextUrl.origin;
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${origin}/admin/login`,
    });

    return NextResponse.json({
      ok: true,
      inviteSent: !inviteError,
      inviteError: inviteError?.message,
      users: await listAdminUsers(),
    });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 403 });
  }
}

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Admin user operation failed.";
}

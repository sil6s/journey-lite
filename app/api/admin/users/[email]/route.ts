import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { listAdminUsers, normalizeAdminEmail, requireSuperadmin } from "@/lib/admin/users";
import type { AdminRole } from "@/lib/auth/session";

const roles = new Set<AdminRole>(["admin", "superadmin"]);
const statuses = new Set(["active", "disabled"]);

type RouteProps = {
  params: Promise<{ email: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteProps) {
  let body: { role?: AdminRole; status?: "active" | "disabled" };
  try {
    body = (await request.json()) as { role?: AdminRole; status?: "active" | "disabled" };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const currentAdmin = await requireSuperadmin();
    const { email: encodedEmail } = await params;
    const email = normalizeAdminEmail(decodeURIComponent(encodedEmail));

    if (body.role && !roles.has(body.role)) return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    if (body.status && !statuses.has(body.status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });

    if (email === currentAdmin.email && (body.role === "admin" || body.status === "disabled")) {
      return NextResponse.json({ error: "You cannot downgrade or disable your own superadmin account." }, { status: 400 });
    }

    const patch: { role?: AdminRole; status?: "active" | "disabled" } = {};
    if (body.role) patch.role = body.role;
    if (body.status) patch.status = body.status;
    if (!Object.keys(patch).length) return NextResponse.json({ error: "No changes provided." }, { status: 400 });

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("admin_users").update(patch).eq("email", email);
    if (error) throw error;

    return NextResponse.json({ ok: true, users: await listAdminUsers() });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Admin user update failed." }, { status: 403 });
  }
}

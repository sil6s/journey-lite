import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { adminSessionCookieName, verifyAdminSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const statuses = new Set(["new", "reviewed", "contacted", "closed", "spam"]);

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  const cookieStore = await cookies();
  const session = await verifyAdminSession(cookieStore.get(adminSessionCookieName)?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json()) as { status?: string; admin_notes?: string | null };
  if (body.status && !statuses.has(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const patch: { status?: "new" | "reviewed" | "contacted" | "closed" | "spam"; admin_notes?: string | null } = {};
  if (body.status) patch.status = body.status as "new" | "reviewed" | "contacted" | "closed" | "spam";
  if ("admin_notes" in body) patch.admin_notes = body.admin_notes ?? null;

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("form_submissions").update(patch).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("admin_users")
    .select("email", { count: "exact", head: true })
    .limit(1);

  if (error) {
    return NextResponse.json(
      { error: "Supabase keepalive failed", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    checkedAt: new Date().toISOString(),
  });
}

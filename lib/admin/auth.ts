import { NextRequest, NextResponse } from "next/server";
import { adminSessionCookieName, isAllowedAdminEmail, verifyAdminSession } from "@/lib/auth/session";

export async function requireAdmin(request: NextRequest) {
  const session = await verifyAdminSession(request.cookies.get(adminSessionCookieName)?.value);
  if (!session || !isAllowedAdminEmail(session.email)) {
    return NextResponse.json({ error: "Admin authentication is required." }, { status: 401 });
  }
  return null;
}

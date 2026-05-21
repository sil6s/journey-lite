import { NextResponse } from "next/server";
import { adminSessionCookieName } from "@/lib/auth/session";

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  response.cookies.delete(adminSessionCookieName);
  return response;
}

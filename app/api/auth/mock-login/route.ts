import { NextResponse } from "next/server";
import { getAdminAccessForEmail } from "@/lib/admin/users";
import { adminSessionCookieName, createAdminSession } from "@/lib/auth/session";
import { verifyRecaptchaToken } from "@/lib/auth/recaptcha";

export async function POST(request: Request) {
  const { email, password, recaptchaToken } = (await request.json()) as { email?: string; password?: string; recaptchaToken?: string };
  const recaptcha = await verifyRecaptchaToken(recaptchaToken, "admin_login", request.headers.get("x-forwarded-for") ?? undefined);
  if (!recaptcha.ok) return NextResponse.json({ error: recaptcha.reason || "reCAPTCHA verification failed." }, { status: 403 });
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });
  const access = await getAdminAccessForEmail(email);
  if (!access) return NextResponse.json({ error: "This email is not allowed for admin access." }, { status: 403 });

  const mockPassword = process.env.ADMIN_MOCK_PASSWORD;
  if (!mockPassword) {
    return NextResponse.json({ error: "Email/password sign-in is not configured. Use Google sign-in." }, { status: 403 });
  }
  if (!password || password !== mockPassword) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, recaptchaBypassed: recaptcha.bypassed });
  response.cookies.set(adminSessionCookieName, await createAdminSession({ email: access.email, name: "Mock admin user", role: access.role }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

import { NextResponse } from "next/server";
import { adminSessionCookieName, createAdminSession, isAllowedAdminEmail } from "@/lib/auth/session";
import { verifyRecaptchaToken } from "@/lib/auth/recaptcha";

export async function POST(request: Request) {
  const { email, recaptchaToken } = (await request.json()) as { email?: string; recaptchaToken?: string };
  const recaptcha = await verifyRecaptchaToken(recaptchaToken, "admin_login", request.headers.get("x-forwarded-for") ?? undefined);
  if (!recaptcha.ok) return NextResponse.json({ error: recaptcha.reason || "reCAPTCHA verification failed." }, { status: 403 });
  if (!email || !isAllowedAdminEmail(email)) return NextResponse.json({ error: "This email is not allowed for admin access." }, { status: 403 });

  const response = NextResponse.json({ ok: true, recaptchaBypassed: recaptcha.bypassed });
  response.cookies.set(adminSessionCookieName, await createAdminSession({ email, name: "Mock admin user" }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

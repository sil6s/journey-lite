import { NextResponse } from "next/server";
import { verifyRecaptchaToken } from "@/lib/auth/recaptcha";

const oauthStateCookieName = "jl_oauth_state";
const googleCallbackPath = "/api/auth/callback/google";

export async function POST(request: Request) {
  const { recaptchaToken, next } = (await request.json()) as { recaptchaToken?: string; next?: string };
  const recaptcha = await verifyRecaptchaToken(recaptchaToken, "admin_login", request.headers.get("x-forwarded-for") ?? undefined);
  if (!recaptcha.ok) return NextResponse.json({ error: recaptcha.reason || "reCAPTCHA verification failed." }, { status: 403 });

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "Missing GOOGLE_OAUTH_CLIENT_ID." }, { status: 500 });

  const origin = new URL(request.url).origin;
  const state = crypto.randomUUID();
  const redirectUri = `${origin}${googleCallbackPath}`;
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", `${state}:${safeNextPath(next)}`);
  url.searchParams.set("prompt", "select_account");

  const response = NextResponse.json({ url: url.toString(), recaptchaBypassed: recaptcha.bypassed });
  response.cookies.set(oauthStateCookieName, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });
  return response;
}

function safeNextPath(path?: string) {
  return path?.startsWith("/admin") ? path : "/admin";
}

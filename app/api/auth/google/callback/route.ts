import { NextRequest, NextResponse } from "next/server";
import { adminSessionCookieName, createAdminSession, isAllowedAdminEmail } from "@/lib/auth/session";

const oauthStateCookieName = "jl_oauth_state";

type GoogleTokenInfo = {
  aud?: string;
  email?: string;
  email_verified?: "true" | "false" | boolean;
  name?: string;
  picture?: string;
};

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") ?? "";
  const [stateToken, nextPath = "/admin"] = state.split(":");

  if (!code || !stateToken || stateToken !== request.cookies.get(oauthStateCookieName)?.value) {
    return redirectWithError(request, "Google sign-in state could not be verified.");
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return redirectWithError(request, "Google OAuth credentials are not configured.");

  const origin = new URL(request.url).origin;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${origin}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) return redirectWithError(request, "Google token exchange failed. Check the OAuth redirect URI.");

  const tokenPayload = (await tokenResponse.json()) as { id_token?: string };
  if (!tokenPayload.id_token) return redirectWithError(request, "Google did not return an ID token.");

  const tokenInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenPayload.id_token)}`);
  if (!tokenInfoResponse.ok) return redirectWithError(request, "Google ID token could not be verified.");
  const tokenInfo = (await tokenInfoResponse.json()) as GoogleTokenInfo;

  if (tokenInfo.aud !== clientId || !tokenInfo.email || tokenInfo.email_verified === false || tokenInfo.email_verified === "false") {
    return redirectWithError(request, "Google account could not be verified.");
  }
  if (!isAllowedAdminEmail(tokenInfo.email)) return redirectWithError(request, "This Google account is not allowed for admin access.");

  const response = NextResponse.redirect(new URL(safeNextPath(nextPath), request.url));
  response.cookies.delete(oauthStateCookieName);
  response.cookies.set(adminSessionCookieName, await createAdminSession({
    email: tokenInfo.email,
    name: tokenInfo.name,
    picture: tokenInfo.picture,
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

function redirectWithError(request: NextRequest, message: string) {
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("error", message);
  return NextResponse.redirect(loginUrl);
}

function safeNextPath(path: string) {
  return path.startsWith("/admin") ? path : "/admin";
}

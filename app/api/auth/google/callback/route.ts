import { NextRequest, NextResponse } from "next/server";
import { getAdminAccessForEmail } from "@/lib/admin/users";
import { adminSessionCookieName, createAdminSession } from "@/lib/auth/session";

const oauthStateCookieName = "jl_oauth_state";
const googleCallbackPath = "/api/auth/callback/google";

type GoogleTokenInfo = {
  aud?: string;
  email?: string;
  email_verified?: "true" | "false" | boolean;
  name?: string;
  picture?: string;
};

type GoogleUserInfo = {
  email?: string;
  email_verified?: boolean;
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
      redirect_uri: `${origin}${googleCallbackPath}`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) return redirectWithError(request, "Google token exchange failed. Check the OAuth redirect URI.");

  const tokenPayload = (await tokenResponse.json()) as { id_token?: string; access_token?: string };
  if (!tokenPayload.id_token) return redirectWithError(request, "Google did not return an ID token.");

  const tokenInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenPayload.id_token)}`);
  if (!tokenInfoResponse.ok) return redirectWithError(request, "Google ID token could not be verified.");
  const tokenInfo = (await tokenInfoResponse.json()) as GoogleTokenInfo;

  if (tokenInfo.aud !== clientId || !tokenInfo.email || tokenInfo.email_verified === false || tokenInfo.email_verified === "false") {
    return redirectWithError(request, "Google account could not be verified.");
  }
  const profile = await getGoogleProfile(tokenPayload.access_token);
  const email = profile?.email || tokenInfo.email;
  const access = await getAdminAccessForEmail(email);
  if (!access) return redirectAccessDenied(request, email);

  const response = NextResponse.redirect(new URL(safeNextPath(nextPath), request.url));
  response.cookies.delete(oauthStateCookieName);
  response.cookies.set(adminSessionCookieName, await createAdminSession({
    email: access.email,
    name: profile?.name || tokenInfo.name,
    picture: profile?.picture || tokenInfo.picture,
    role: access.role,
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

async function getGoogleProfile(accessToken?: string): Promise<GoogleUserInfo | null> {
  if (!accessToken) return null;
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  return (await response.json()) as GoogleUserInfo;
}

function redirectWithError(request: NextRequest, message: string) {
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("error", message);
  return NextResponse.redirect(loginUrl);
}

function redirectAccessDenied(request: NextRequest, email: string) {
  const deniedUrl = new URL("/admin/access-denied", request.url);
  deniedUrl.searchParams.set("email", email);
  const response = NextResponse.redirect(deniedUrl);
  response.cookies.delete(oauthStateCookieName);
  response.cookies.delete(adminSessionCookieName);
  return response;
}

function safeNextPath(path: string) {
  return path.startsWith("/admin") ? path : "/admin";
}

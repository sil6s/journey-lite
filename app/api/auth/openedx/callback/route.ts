/**
 * /api/auth/openedx/callback
 *
 * OAuth2 authorization-code callback handler for Open edX SSO.
 *
 * Flow:
 *   1. User clicks "Log in with JourneyLite" on the Open edX portal.
 *   2. Open edX redirects back here with ?code=... after the user grants consent.
 *   3. We exchange the code for an access_token + refresh_token.
 *   4. We store the tokens in a secure httpOnly cookie and redirect the user to
 *      the Open edX dashboard.
 *
 * To enable this:
 *   • Set OPENEDX_CLIENT_ID + OPENEDX_CLIENT_SECRET in .env.local
 *   • Register http://{your-domain}/api/auth/openedx/callback as an allowed
 *     redirect URI in the Open edX Django Admin → OAuth2 → Applications.
 */

import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/openedx/client";
import { edxDashboardUrl } from "@/lib/openedx/config";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    console.error("[openedx/callback] OAuth error:", error);
    return NextResponse.redirect(new URL("/login?error=openedx_oauth", req.url));
  }

  const redirectUri = new URL("/api/auth/openedx/callback", req.url).toString();
  const tokens = await exchangeCodeForToken(code, redirectUri);

  if (!tokens) {
    return NextResponse.redirect(new URL("/login?error=openedx_token", req.url));
  }

  // Store the access token in a short-lived, httpOnly cookie so that
  // subsequent server-side Open edX API calls can use it.
  const response = NextResponse.redirect(edxDashboardUrl());
  response.cookies.set("openedx_access_token", tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: tokens.expires_in,
    path: "/",
  });
  if (tokens.refresh_token) {
    response.cookies.set("openedx_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      // Refresh tokens are typically long-lived; store for 30 days
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  return response;
}

/**
 * Server-side Open edX REST API client.
 *
 * Only import this from Server Components or API route handlers — it uses
 * OPENEDX_CLIENT_SECRET which must never be exposed to the browser.
 */

import {
  OPENEDX_LMS_URL,
  OPENEDX_CLIENT_ID,
  OPENEDX_CLIENT_SECRET,
  edxOAuthTokenUrl,
} from "./config";
import type {
  OpenEdxCourseCatalogResponse,
  OpenEdxEnrollment,
  OpenEdxUserProfile,
  OpenEdxTokenResponse,
} from "./types";

// ─── Service-account token (for read-only catalog calls) ─────────────────────

let _serviceToken: string | null = null;
let _serviceTokenExpiry = 0;

async function getServiceToken(): Promise<string | null> {
  if (!OPENEDX_CLIENT_ID || !OPENEDX_CLIENT_SECRET) return null;
  if (_serviceToken && Date.now() < _serviceTokenExpiry) return _serviceToken;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: OPENEDX_CLIENT_ID,
    client_secret: OPENEDX_CLIENT_SECRET,
  });

  const res = await fetch(edxOAuthTokenUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    // Next.js cache — revalidate every 50 min
    next: { revalidate: 3000 },
  });

  if (!res.ok) {
    console.warn("[openedx/client] service token request failed:", res.status);
    return null;
  }

  const data: OpenEdxTokenResponse = await res.json();
  _serviceToken = data.access_token;
  _serviceTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return _serviceToken;
}

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

async function edxFetch<T>(
  path: string,
  opts?: { bearerToken?: string; revalidate?: number }
): Promise<T | null> {
  const token = opts?.bearerToken ?? (await getServiceToken());
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const url = `${OPENEDX_LMS_URL}${path}`;
  try {
    const res = await fetch(url, {
      headers,
      next: { revalidate: opts?.revalidate ?? 300 },
    });
    if (!res.ok) {
      console.warn("[openedx/client] fetch failed:", res.status, url);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("[openedx/client] fetch error:", err);
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Fetch the published course catalog (uses service account, cached 5 min) */
export async function getCourseCatalog(): Promise<OpenEdxCourseCatalogResponse | null> {
  return edxFetch<OpenEdxCourseCatalogResponse>(
    "/api/courses/v1/courses/?page_size=50&mobile_available=false",
    { revalidate: 300 }
  );
}

/** Fetch enrollments for an authenticated user (pass their edX bearer token) */
export async function getUserEnrollments(
  bearerToken: string
): Promise<OpenEdxEnrollment[]> {
  const data = await edxFetch<OpenEdxEnrollment[]>(
    "/api/enrollment/v1/enrollment",
    { bearerToken, revalidate: 0 }
  );
  return data ?? [];
}

/** Fetch the Open edX user profile for an authenticated user */
export async function getUserProfile(
  bearerToken: string
): Promise<OpenEdxUserProfile | null> {
  return edxFetch<OpenEdxUserProfile>("/api/user/v1/me", {
    bearerToken,
    revalidate: 0,
  });
}

/**
 * Exchange an OAuth2 authorization code for an access token.
 * Call this in the /api/auth/openedx/callback route handler.
 */
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<OpenEdxTokenResponse | null> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: OPENEDX_CLIENT_ID,
    client_secret: OPENEDX_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
  });

  try {
    const res = await fetch(edxOAuthTokenUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) return null;
    return (await res.json()) as OpenEdxTokenResponse;
  } catch {
    return null;
  }
}

/**
 * Open edX (Tutor) connection configuration.
 *
 * Local dev:  tutor local launch → http://local.edly.io:8000
 * Production: https://learn.journeylite.com  (set via NEXT_PUBLIC_OPENEDX_LMS_URL)
 *
 * Set these in .env.local (dev) and .env.production (prod):
 *   NEXT_PUBLIC_OPENEDX_LMS_URL=https://learn.journeylite.com
 *   NEXT_PUBLIC_OPENEDX_CMS_URL=https://studio.journeylite.com
 *   OPENEDX_CLIENT_ID=journeylite-nextjs
 *   OPENEDX_CLIENT_SECRET=<secret from tutor oauth2 provider>
 */

export const OPENEDX_LMS_URL =
  process.env.NEXT_PUBLIC_OPENEDX_LMS_URL ?? "http://local.edly.io:8000";

export const OPENEDX_CMS_URL =
  process.env.NEXT_PUBLIC_OPENEDX_CMS_URL ?? "http://studio.local.edly.io:8001";

/** OAuth2 client id registered in Open edX for this Next.js app (SSO) */
export const OPENEDX_CLIENT_ID =
  process.env.OPENEDX_CLIENT_ID ?? "";

/** OAuth2 client secret (server-side only, never exposed to browser) */
export const OPENEDX_CLIENT_SECRET =
  process.env.OPENEDX_CLIENT_SECRET ?? "";

// ─── URL helpers ─────────────────────────────────────────────────────────────

/** Learner course catalog page */
export function edxCourseCatalogUrl(): string {
  return `${OPENEDX_LMS_URL}/courses`;
}

/** Individual course "about" page */
export function edxCourseUrl(courseKey: string): string {
  return `${OPENEDX_LMS_URL}/courses/${courseKey}/about`;
}

/** Learner dashboard (enrolled courses) */
export function edxDashboardUrl(): string {
  return `${OPENEDX_LMS_URL}/dashboard`;
}

/** OAuth2 authorize endpoint (login / SSO) */
export function edxOAuthAuthorizeUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: OPENEDX_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email",
    ...(state ? { state } : {}),
  });
  return `${OPENEDX_LMS_URL}/oauth2/authorize?${params}`;
}

/** OAuth2 token endpoint (server-side only) */
export function edxOAuthTokenUrl(): string {
  return `${OPENEDX_LMS_URL}/oauth2/access_token`;
}

/**
 * TypeScript types that mirror Open edX REST API responses.
 *
 * API reference:
 *   https://docs.openedx.org/projects/edx-platform/en/latest/references/rest_api/
 *
 * These types are used when the Next.js app calls Open edX APIs
 * (e.g., for the portal dashboard or SSO token exchange).
 */

// ─── Course Catalog ───────────────────────────────────────────────────────────

export interface OpenEdxCourse {
  /** e.g. "course-v1:JourneyLite+BAR101+2026" */
  id: string;
  name: string;
  /** Short description shown in catalog */
  short_description: string | null;
  /** Full description (HTML) */
  course_image_url: string | null;
  start: string | null; // ISO date
  end: string | null;   // ISO date
  enrollment_start: string | null;
  enrollment_end: string | null;
  /** "open", "invite_only", "none" */
  enrollment_mode: string;
  org: string;
  /** URL slug used in edX URLs */
  course_id: string;
  /** Human-readable bariatric category (custom field) */
  short_category?: string | null;
}

export interface OpenEdxCourseCatalogResponse {
  next: string | null;
  previous: string | null;
  count: number;
  results: OpenEdxCourse[];
}

// ─── Enrollment ───────────────────────────────────────────────────────────────

export interface OpenEdxEnrollment {
  course_id: string;
  is_active: boolean;
  mode: string; // "audit", "verified", etc.
  course_details: {
    course_id: string;
    course_name: string;
    enrollment_end: string | null;
    course_start: string | null;
    course_end: string | null;
  };
}

// ─── User / Profile ───────────────────────────────────────────────────────────

export interface OpenEdxUserProfile {
  username: string;
  email: string;
  name: string;
  user_id: number;
}

// ─── OAuth2 token response ─────────────────────────────────────────────────

export interface OpenEdxTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: "Bearer";
  scope: string;
  refresh_token?: string;
}

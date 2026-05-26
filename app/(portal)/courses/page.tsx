import { redirect } from "next/navigation";
import { edxCourseCatalogUrl } from "@/lib/openedx/config";

/**
 * /courses — hard-redirect to the Open edX course catalog.
 *
 * The patient education portal is now served entirely by Open edX (Tutor).
 * Set NEXT_PUBLIC_OPENEDX_LMS_URL in your environment to point to your
 * Open edX instance (local dev: http://local.edly.io:8000,
 * production: https://learn.journeylite.com).
 */
export default function CoursesPage() {
  redirect(edxCourseCatalogUrl());
}

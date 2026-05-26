import { redirect } from "next/navigation";
import { edxCourseCatalogUrl } from "@/lib/openedx/config";

/**
 * /courses/[slug]/lessons/[lessonSlug] — redirect to Open edX catalog.
 *
 * Individual lesson URLs are now owned by Open edX (Tutor). We redirect to
 * the catalog root; Open edX will restore any in-progress state automatically.
 */
export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  // Suppress unused-param lint while keeping the correct signature
  void params;
  redirect(edxCourseCatalogUrl());
}

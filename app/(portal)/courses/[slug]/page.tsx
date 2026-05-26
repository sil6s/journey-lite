import { redirect } from "next/navigation";
import { edxCourseUrl } from "@/lib/openedx/config";

/**
 * /courses/[slug] — redirect to the Open edX course page.
 *
 * The slug coming in from old Next.js course links is used as a best-effort
 * course key. Deep course URLs are handled by Open edX (Tutor).
 */
export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Best-effort: try to map the old slug to an edX course "about" page.
  // If the key doesn't exist edX will show a 404 — that's acceptable.
  redirect(edxCourseUrl(slug));
}

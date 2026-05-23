import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/src/lib/sanity/client";
import { getUserEnrollments, getCourseProgress, calculateCourseProgress, getNextLesson } from "@/lib/lms/progress";
import { coursesForSlugsQuery } from "@/src/lib/sanity/lms-queries";
import { CourseCard } from "@/components/lms/CourseCard";
import { DashboardHeader } from "@/components/lms/DashboardHeader";
import { ContinueLearningCard } from "@/components/lms/ContinueLearningCard";
import { EmptyState } from "@/components/lms/EmptyState";
import type { SanityCourse } from "@/src/lib/sanity/lms-types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileResult, enrollments] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    getUserEnrollments(user.id),
  ]);

  const profile = profileResult.data;
  const firstName = profile?.full_name?.split(" ")[0] ?? null;

  // Fetch course data from Sanity for enrolled courses
  const enrolledSlugs = enrollments.map((e) => e.course_slug);
  const courses: SanityCourse[] = enrolledSlugs.length > 0
    ? await adminClient.fetch(coursesForSlugsQuery, { slugs: enrolledSlugs })
    : [];

  // Compute progress for each enrolled course
  const progressByCourse = await Promise.all(
    courses.map(async (course) => {
      const rows = await getCourseProgress(user.id, course.slug);
      const summary = calculateCourseProgress(course as SanityCourse, rows);
      const nextLesson = getNextLesson(course as SanityCourse, rows);
      return { course, rows, summary, nextLesson };
    })
  );

  // Find the best "continue learning" candidate: most recently viewed, not complete
  const continueCandidates = progressByCourse
    .filter((p) => !p.summary.isCompleted && p.summary.lastViewedLessonSlug)
    .sort((a, b) => {
      const aTime = a.rows.find((r) => r.lesson_slug === a.summary.lastViewedLessonSlug)?.last_viewed_at ?? "";
      const bTime = b.rows.find((r) => r.lesson_slug === b.summary.lastViewedLessonSlug)?.last_viewed_at ?? "";
      return bTime.localeCompare(aTime);
    });

  const continueItem = continueCandidates[0];
  const inProgressCount = progressByCourse.filter(
    (p) => !p.summary.isCompleted && p.summary.completedLessons > 0
  ).length;

  // Find lesson title for continue card
  let continueLessonTitle = "";
  if (continueItem) {
    for (const mod of (continueItem.course as SanityCourse).modules ?? []) {
      const found = mod.lessons.find((l) => l.slug === continueItem.summary.lastViewedLessonSlug);
      if (found) { continueLessonTitle = found.title; break; }
    }
  }

  return (
    <div className="space-y-10">
      <DashboardHeader firstName={firstName} coursesInProgress={inProgressCount} />

      {/* Continue learning */}
      {continueItem && continueItem.summary.lastViewedLessonSlug && (
        <section aria-labelledby="continue-heading">
          <h2 id="continue-heading" className="sr-only">Continue Learning</h2>
          <ContinueLearningCard
            courseTitle={continueItem.course.title}
            courseSlug={continueItem.course.slug}
            lessonTitle={continueLessonTitle}
            lessonSlug={continueItem.summary.lastViewedLessonSlug}
            percentComplete={continueItem.summary.percentComplete}
          />
        </section>
      )}

      {/* My courses */}
      <section aria-labelledby="my-courses-heading">
        <h2 id="my-courses-heading" className="mb-5 text-xl font-semibold text-[#1f2c25]">
          My Courses
        </h2>
        {courses.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-8 w-8" />}
            title="No courses yet"
            description="Your care team will add courses to your account based on your care plan. You can also browse available courses."
            action={{ label: "Browse courses", href: "/courses" }}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {progressByCourse.map(({ course, summary }) => (
              <CourseCard
                key={course._id}
                course={course}
                progress={summary.percentComplete}
                isEnrolled
              />
            ))}
          </div>
        )}
      </section>

      {/* Support CTA */}
      <section className="rounded-2xl border border-[#c8ddd4] bg-[#f0f8f4] p-6">
        <h2 className="text-base font-semibold text-[#1f2c25]">Have questions about your care plan?</h2>
        <p className="mt-1 text-sm text-[#66756d]">
          Your JourneyLite team is here to help with your diet plan, vitamins, appointments, and more.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="tel:+18774422263"
            className="inline-flex items-center gap-2 rounded-md bg-[#145c42] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37]"
          >
            <Phone className="h-4 w-4" />
            Call 877-442-2263
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-md border border-[#cbd7d0] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42]"
          >
            Send a message
          </Link>
        </div>
      </section>
    </div>
  );
}

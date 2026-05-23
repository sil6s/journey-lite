import { BookOpen, GraduationCap } from "lucide-react";
import { adminClient } from "@/src/lib/sanity/client";
import { createClient } from "@/lib/supabase/server";
import { allCoursesQuery } from "@/src/lib/sanity/lms-queries";
import { getUserEnrollments, getCourseProgress, calculateCourseProgress } from "@/lib/lms/progress";
import { CourseCard } from "@/components/lms/CourseCard";
import { EmptyState } from "@/components/lms/EmptyState";
import type { SanityCourseCard, SanityCourse, BariatricStage } from "@/src/lib/sanity/lms-types";

export const dynamic = "force-dynamic";

const stageGroups: { slug: BariatricStage; label: string }[] = [
  { slug: "pre-op", label: "Pre-Op Preparation" },
  { slug: "immediate-post-op", label: "Immediate Post-Op" },
  { slug: "soft-food", label: "Soft Food Phase" },
  { slug: "long-term-maintenance", label: "Long-Term Maintenance" },
  { slug: "vitamins", label: "Vitamins & Supplements" },
  { slug: "general-education", label: "General Education" },
];

export default async function CoursesPage() {
  const [courses, supabase] = await Promise.all([
    adminClient.fetch<SanityCourseCard[]>(allCoursesQuery),
    createClient(),
  ]);

  const { data: { user } } = await supabase.auth.getUser();

  let enrolledSlugs = new Set<string>();
  let progressMap = new Map<string, number>();

  if (user) {
    const enrollments = await getUserEnrollments(user.id);
    enrolledSlugs = new Set(enrollments.map((e) => e.course_slug));

    await Promise.all(
      Array.from(enrolledSlugs).map(async (slug) => {
        const course = courses.find((c) => c.slug === slug);
        if (!course) return;
        const rows = await getCourseProgress(user.id, slug);
        const summary = calculateCourseProgress(course as unknown as SanityCourse, rows);
        progressMap.set(slug, summary.percentComplete);
      })
    );
  }

  const coursesByStage = stageGroups
    .map((stage) => ({
      ...stage,
      courses: courses.filter((c) => c.bariatricStage === stage.slug),
    }))
    .filter((g) => g.courses.length > 0);

  const uncategorized = courses.filter((c) => !c.bariatricStage);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="rounded-2xl border border-[#c8ddd4] bg-gradient-to-br from-[#0f3e2e] to-[#145c42] px-6 py-10 text-white sm:px-10">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-[#7cc9a8]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#7cc9a8]">
            Patient Education Center
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Bariatric Learning Portal</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#c5ddd4]">
          Evidence-based courses designed to support you at every stage of your bariatric journey —
          from preparing for surgery to building long-term healthy habits.
        </p>
        {!user && (
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/signup"
              className="inline-flex rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-[#0f3e2e] shadow-sm transition hover:bg-[#edf4ef]"
            >
              Create a free account
            </a>
            <a
              href="/login"
              className="inline-flex rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign in
            </a>
          </div>
        )}
      </div>

      {/* Course groups */}
      {courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="Courses coming soon"
          description="Our team is building out the patient education library. Check back soon."
        />
      ) : (
        <>
          {coursesByStage.map((group) => (
            <section key={group.slug} aria-labelledby={`stage-${group.slug}`}>
              <h2 id={`stage-${group.slug}`} className="mb-5 text-xl font-semibold text-[#1f2c25]">
                {group.label}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.courses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    isEnrolled={enrolledSlugs.has(course.slug)}
                    progress={progressMap.get(course.slug)}
                  />
                ))}
              </div>
            </section>
          ))}

          {uncategorized.length > 0 && (
            <section aria-labelledby="uncategorized">
              <h2 id="uncategorized" className="mb-5 text-xl font-semibold text-[#1f2c25]">
                More Courses
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {uncategorized.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    isEnrolled={enrolledSlugs.has(course.slug)}
                    progress={progressMap.get(course.slug)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

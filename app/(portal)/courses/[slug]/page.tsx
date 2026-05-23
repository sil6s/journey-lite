import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, BookOpen, BarChart2, ArrowRight } from "lucide-react";
import { adminClient } from "@/src/lib/sanity/client";
import { urlFor } from "@/src/lib/sanity/image";
import { createClient } from "@/lib/supabase/server";
import { courseBySlugQuery } from "@/src/lib/sanity/lms-queries";
import { getCourseProgress, calculateCourseProgress, getNextLesson } from "@/lib/lms/progress";
import { checkCourseAccess } from "@/lib/lms/access";
import { ModuleAccordion } from "@/components/lms/ModuleAccordion";
import { EmptyState } from "@/components/lms/EmptyState";
import type { SanityCourse, LessonProgressRecord } from "@/src/lib/sanity/lms-types";

export const dynamic = "force-dynamic";

const stageLabels: Record<string, string> = {
  "pre-op": "Pre-Op Preparation",
  "immediate-post-op": "Immediate Post-Op",
  "soft-food": "Soft Food Phase",
  "long-term-maintenance": "Long-Term Maintenance",
  vitamins: "Vitamins & Supplements",
  "general-education": "General Education",
};

const stageColors: Record<string, string> = {
  "pre-op": "bg-[#dbeafe] text-[#1e40af]",
  "immediate-post-op": "bg-[#dcfce7] text-[#15803d]",
  "soft-food": "bg-[#fef9c3] text-[#854d0e]",
  "long-term-maintenance": "bg-[#f3e8ff] text-[#7e22ce]",
  vitamins: "bg-[#ffedd5] text-[#9a3412]",
  "general-education": "bg-[#f1f5f9] text-[#475569]",
};

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [course, supabase] = await Promise.all([
    adminClient.fetch<SanityCourse | null>(courseBySlugQuery, { slug }),
    createClient(),
  ]);

  if (!course) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  let progressRows: LessonProgressRecord[] = [];
  let isEnrolled = false;

  if (user) {
    const [access, rows] = await Promise.all([
      checkCourseAccess(user.id, course.slug, course.accessType),
      getCourseProgress(user.id, course.slug),
    ]);
    isEnrolled = access.allowed;
    progressRows = rows;
  }

  const summary = calculateCourseProgress(course, progressRows);
  const nextLesson = isEnrolled ? getNextLesson(course, progressRows) : null;

  // Find first lesson for preview CTA
  const firstLesson = course.modules?.[0]?.lessons?.[0] ?? null;

  const imageUrl = course.featuredImage?.asset
    ? urlFor(course.featuredImage).width(1200).height(480).fit("crop").url()
    : null;

  const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-[#66756d]">
          <li><Link href="/courses" className="hover:text-[#145c42]">Courses</Link></li>
          <li aria-hidden>/</li>
          <li className="font-semibold text-[#1f2c25] truncate max-w-xs">{course.title}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero image */}
          {imageUrl && (
            <div className="overflow-hidden rounded-2xl border border-[#dce4df]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={course.title}
                className="h-52 w-full object-cover sm:h-64"
                src={imageUrl}
              />
            </div>
          )}

          {/* Course header */}
          <div>
            <div className="flex flex-wrap gap-2">
              {course.bariatricStage && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${stageColors[course.bariatricStage] ?? "bg-[#f1f5f9] text-[#475569]"}`}>
                  {stageLabels[course.bariatricStage] ?? course.bariatricStage}
                </span>
              )}
              {course.difficultyLevel && (
                <span className="rounded-full bg-[#f3f4f6] px-2.5 py-0.5 text-xs font-medium text-[#6b7280] capitalize">
                  {course.difficultyLevel}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-[#1f2c25] sm:text-4xl">{course.title}</h1>
            {course.description && (
              <p className="mt-3 text-base leading-7 text-[#53635b]">{course.description}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#66756d]">
              {course.estimatedDuration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#145c42]" />
                  {course.estimatedDuration}
                </span>
              )}
              {totalLessons > 0 && (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-[#145c42]" />
                  {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
                </span>
              )}
              {course.modules?.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <BarChart2 className="h-4 w-4 text-[#145c42]" />
                  {course.modules.length} module{course.modules.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Modules + lessons */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-[#1f2c25]">Course Content</h2>
            {!course.modules || course.modules.length === 0 ? (
              <EmptyState
                title="No lessons yet"
                description="Content for this course is being prepared."
              />
            ) : (
              <div className="space-y-3">
                {course.modules.map((mod, i) => (
                  <ModuleAccordion
                    key={mod._id}
                    module={mod}
                    courseSlug={course.slug}
                    progressRows={progressRows}
                    isEnrolled={isEnrolled}
                    defaultOpen={i === 0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Progress / access card */}
            <div className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-sm">
              {isEnrolled ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#145c42]">
                    Your Progress
                  </p>
                  <div className="mt-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-bold text-[#1f2c25]">{summary.percentComplete}%</span>
                      <span className="text-sm text-[#66756d]">
                        {summary.completedLessons}/{summary.totalLessons} lessons
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf4ef]">
                      <div
                        className="h-full rounded-full bg-[#145c42] transition-all duration-500"
                        style={{ width: `${summary.percentComplete}%` }}
                      />
                    </div>
                  </div>

                  {summary.isCompleted ? (
                    <p className="mt-4 rounded-lg bg-[#dcfce7] px-3 py-2.5 text-sm font-semibold text-[#15803d]">
                      🎉 Course complete!
                    </p>
                  ) : nextLesson ? (
                    <Link
                      href={`/courses/${course.slug}/lessons/${nextLesson.lessonSlug}`}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#145c42] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                    >
                      {summary.completedLessons > 0 ? "Continue Course" : "Start Course"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[#1f2c25]">
                    {user ? "Not enrolled in this course" : "Sign in to access this course"}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-[#66756d]">
                    {user
                      ? "Your care team will add this course to your account. Contact us if you think this is an error."
                      : "Create a free account or sign in to access your courses."}
                  </p>
                  <div className="mt-4 space-y-2">
                    {user ? (
                      <a
                        href="tel:+18774422263"
                        className="flex w-full items-center justify-center rounded-md border border-[#cbd7d0] py-2.5 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42]"
                      >
                        Call 877-442-2263
                      </a>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="flex w-full items-center justify-center rounded-md bg-[#145c42] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37]"
                        >
                          Sign in
                        </Link>
                        <Link
                          href="/signup"
                          className="flex w-full items-center justify-center rounded-md border border-[#cbd7d0] py-2.5 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42]"
                        >
                          Create account
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Free preview */}
                  {firstLesson?.isPreview && (
                    <Link
                      href={`/courses/${course.slug}/lessons/${firstLesson.slug}`}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-[#145c42] hover:underline"
                    >
                      Preview first lesson →
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Related resources */}
            {course.relatedResources && course.relatedResources.length > 0 && (
              <div className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-[#1f2c25]">Related Articles</p>
                <ul className="mt-3 space-y-2">
                  {course.relatedResources.map((r) => (
                    <li key={r._id}>
                      <Link
                        href={`/blog/${r.slug}`}
                        className="text-sm font-medium text-[#145c42] hover:underline"
                      >
                        {r.title}
                      </Link>
                      {r.excerpt && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-[#66756d]">{r.excerpt}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

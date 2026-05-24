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
import { EnrollButton } from "@/components/lms/EnrollButton";
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
  const firstLesson = course.modules?.[0]?.lessons?.[0] ?? null;

  const imageUrl = course.featuredImage?.asset
    ? urlFor(course.featuredImage).width(1200).height(480).fit("crop").url()
    : null;

  const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-[#66756d]">
          <li><Link href="/courses" className="hover:text-[#145c42]">Courses</Link></li>
          <li aria-hidden>/</li>
          <li className="font-semibold text-[#1f2c25] truncate max-w-xs">{course.title}</li>
        </ol>
      </nav>

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
      <div className="space-y-3">
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
        <h1 className="text-3xl font-semibold text-[#1f2c25] sm:text-4xl">{course.title}</h1>
        {course.description && (
          <p className="text-base leading-7 text-[#53635b]">{course.description}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-[#66756d]">
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

      {/* ── CTA / Progress card ── */}
      {isEnrolled ? (
        <div className="rounded-2xl border border-[#dce4df] bg-white p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#145c42]">Your Progress</p>
            <span className="text-sm text-[#66756d]">{summary.completedLessons}/{summary.totalLessons} lessons</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf4ef]">
            <div
              className="h-full rounded-full bg-[#145c42] transition-all duration-500"
              style={{ width: `${summary.percentComplete}%` }}
            />
          </div>
          {summary.isCompleted ? (
            <p className="mt-4 rounded-lg bg-[#dcfce7] px-3 py-2.5 text-sm font-semibold text-[#15803d]">
              🎉 Course complete!
            </p>
          ) : nextLesson ? (
            <Link
              href={`/courses/${course.slug}/lessons/${nextLesson.lessonSlug}`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#145c42] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37]"
            >
              {summary.completedLessons > 0 ? "Continue Course" : "Start Course"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      ) : user ? (
        <div className="rounded-2xl border border-[#c8ddd4] bg-[#f0f8f4] p-6">
          <h2 className="text-base font-semibold text-[#1f2c25]">Ready to start?</h2>
          <p className="mt-1 text-sm text-[#53635b]">
            Enroll for free to track your progress and access all lessons.
          </p>
          <div className="mt-4 max-w-xs">
            <EnrollButton courseSlug={course.slug} />
          </div>
          {firstLesson?.isPreview && (
            <Link
              href={`/courses/${course.slug}/lessons/${firstLesson.slug}`}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#145c42] hover:underline"
            >
              Preview first lesson →
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#dce4df] bg-white p-6">
          <h2 className="text-base font-semibold text-[#1f2c25]">Sign in to access this course</h2>
          <p className="mt-1 text-sm text-[#66756d]">
            Create a free account — enrollment is open to all patients.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/login?redirectTo=/courses/${course.slug}`}
              className="inline-flex items-center justify-center rounded-md bg-[#145c42] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37]"
            >
              Sign in
            </Link>
            <Link
              href={`/signup?redirectTo=/courses/${course.slug}`}
              className="inline-flex items-center justify-center rounded-md border border-[#cbd7d0] px-5 py-2.5 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42]"
            >
              Create account
            </Link>
          </div>
          {firstLesson?.isPreview && (
            <Link
              href={`/courses/${course.slug}/lessons/${firstLesson.slug}`}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#145c42] hover:underline"
            >
              Preview first lesson →
            </Link>
          )}
        </div>
      )}

      {/* Course content */}
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

      {/* Related articles */}
      {course.relatedResources && course.relatedResources.length > 0 && (
        <div className="rounded-2xl border border-[#dce4df] bg-white p-5">
          <p className="text-sm font-semibold text-[#1f2c25]">Related Articles</p>
          <ul className="mt-3 space-y-2">
            {course.relatedResources.map((r) => (
              <li key={r._id}>
                <Link href={`/blog/${r.slug}`} className="text-sm font-medium text-[#145c42] hover:underline">
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
  );
}

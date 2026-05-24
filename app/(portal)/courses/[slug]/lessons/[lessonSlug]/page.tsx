import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { adminClient } from "@/src/lib/sanity/client";
import { createClient } from "@/lib/supabase/server";
import { courseBySlugQuery, lessonBySlugQuery } from "@/src/lib/sanity/lms-queries";
import { getCourseProgress, getUnlockedLessonSlugs } from "@/lib/lms/progress";
import { checkLessonAccess } from "@/lib/lms/access";
import { LessonViewer } from "@/components/lms/LessonViewer";
import { LockedContentNotice } from "@/components/lms/LockedContentNotice";
import { ModuleAccordion } from "@/components/lms/ModuleAccordion";
import { LessonStatusBadge } from "@/components/lms/LessonStatusBadge";
import type { SanityCourse, SanityLesson, LessonProgressRecord } from "@/src/lib/sanity/lms-types";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  article: "Article",
  video: "Video",
  download: "Download",
  checklist: "Checklist",
  recipe: "Recipe",
  mixed: "Video + Article",
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;

  const [course, lesson, supabase] = await Promise.all([
    adminClient.fetch<SanityCourse | null>(courseBySlugQuery, { slug }),
    adminClient.fetch<SanityLesson | null>(lessonBySlugQuery, { slug: lessonSlug }),
    createClient(),
  ]);

  if (!course || !lesson) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  // Check access
  const accessResult = await checkLessonAccess(
    user?.id ?? null,
    course.slug,
    course.accessType,
    lesson.isPreview
  );

  let progressRows: LessonProgressRecord[] = [];
  let lessonProgress: LessonProgressRecord | null = null;
  let isEnrolled = false;

  if (user && accessResult.allowed) {
    progressRows = await getCourseProgress(user.id, course.slug);
    lessonProgress = progressRows.find((p) => p.lesson_slug === lesson.slug) ?? null;
    isEnrolled = true;
  }

  // Compute prev / next lesson
  const allLessons = course.modules?.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleSlug: m.slug, moduleTitle: m.title }))
  ) ?? [];
  const currentIndex = allLessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const unlockedLessonSlugs = getUnlockedLessonSlugs(course, progressRows);
  const currentLessonUnlocked = lesson.isPreview || !isEnrolled || unlockedLessonSlugs.has(lesson.slug);
  const nextLessonUnlocked = nextLesson ? unlockedLessonSlugs.has(nextLesson.slug) : false;

  // Find which module this lesson belongs to
  const parentModule = course.modules?.find((m) =>
    m.lessons.some((l) => l.slug === lessonSlug)
  ) ?? null;

  const lessonStatus: "complete" | "in-progress" | "preview" | "not-started" =
    lessonProgress?.completed
      ? "complete"
      : lesson.isPreview
        ? "preview"
        : lessonProgress
          ? "in-progress"
          : "not-started";

  return (
    <div className="grid gap-8 lg:grid-cols-4">
      {/* Sidebar navigation (desktop) */}
      <aside
        aria-label="Course navigation"
        className="hidden lg:col-span-1 lg:block"
      >
        <div className="sticky top-24 space-y-4 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
          <div className="pb-2">
            <Link
              href={`/courses/${course.slug}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#145c42] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to course
            </Link>
            <p className="mt-2 text-sm font-semibold text-[#1f2c25] leading-snug">{course.title}</p>
          </div>

          {course.modules?.map((mod, i) => (
            <ModuleAccordion
              key={mod._id}
              module={mod}
              courseSlug={course.slug}
              progressRows={progressRows}
              activeLessonSlug={lessonSlug}
              isEnrolled={isEnrolled || lesson.isPreview}
              unlockedLessonSlugs={unlockedLessonSlugs}
              defaultOpen={mod.lessons.some((l) => l.slug === lessonSlug) || i === 0}
            />
          ))}
        </div>
      </aside>

      {/* Main lesson content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[#66756d]">
            <li><Link href="/courses" className="hover:text-[#145c42]">Courses</Link></li>
            <li aria-hidden>/</li>
            <li><Link href={`/courses/${course.slug}`} className="hover:text-[#145c42] truncate max-w-[8rem]">{course.title}</Link></li>
            {parentModule && (
              <>
                <li aria-hidden>/</li>
                <li className="truncate max-w-[8rem] text-[#8fa09a]">{parentModule.title}</li>
              </>
            )}
            <li aria-hidden>/</li>
            <li className="font-semibold text-[#1f2c25] truncate max-w-[10rem]">{lesson.title}</li>
          </ol>
        </nav>

        {/* Lesson header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <LessonStatusBadge status={lessonStatus} />
            {lesson.lessonType && (
              <span className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs font-medium text-[#475569]">
                {typeLabels[lesson.lessonType] ?? lesson.lessonType}
              </span>
            )}
            {lesson.estimatedTime && (
              <span className="flex items-center gap-1 text-xs text-[#8fa09a]">
                <Clock className="h-3.5 w-3.5" />
                {lesson.estimatedTime}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-[#1f2c25] sm:text-3xl">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-sm leading-6 text-[#66756d]">{lesson.description}</p>
          )}
        </div>

        {/* Lesson content or locked notice */}
        {!accessResult.allowed ? (
          <LockedContentNotice
            courseTitle={course.title}
            courseSlug={course.slug}
            reason={accessResult.reason}
          />
        ) : !currentLessonUnlocked ? (
          <section className="rounded-2xl border border-[#dce4df] bg-white p-6">
            <h2 className="text-base font-semibold text-[#1f2c25]">Complete the previous lesson first</h2>
            <p className="mt-2 text-sm leading-6 text-[#66756d]">
              Lessons open in order so your education is completed step by step. Return to the course outline and complete the next available lesson before continuing.
            </p>
            <Link
              href={`/courses/${course.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#145c42] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37]"
            >
              Back to course
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        ) : (
          <LessonViewer
            lesson={lesson}
            courseSlug={course.slug}
            moduleSlug={parentModule?.title ?? null}
            progress={lessonProgress}
            isAuthenticated={!!user}
          />
        )}

        {/* Related lessons */}
        {accessResult.allowed && currentLessonUnlocked && lesson.relatedLessons && lesson.relatedLessons.length > 0 && (
          <div className="rounded-2xl border border-[#dce4df] bg-white p-5">
            <p className="text-sm font-semibold text-[#1f2c25]">Related Lessons</p>
            <ul className="mt-3 space-y-2">
              {lesson.relatedLessons.map((related) => (
                <li key={related._id}>
                  <Link
                    href={`/courses/${course.slug}/lessons/${related.slug}`}
                    className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-[#f5f8f6]"
                  >
                    <span className="font-medium text-[#145c42]">{related.title}</span>
                    {related.estimatedTime && (
                      <span className="ml-auto text-xs text-[#8fa09a]">{related.estimatedTime}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prev / Next navigation */}
        <div className="flex items-center justify-between border-t border-[#dce4df] pt-6">
          {prevLesson ? (
            <Link
              href={`/courses/${course.slug}/lessons/${prevLesson.slug}`}
              className="group flex max-w-xs flex-col items-start gap-0.5"
            >
              <span className="flex items-center gap-1 text-xs font-semibold text-[#66756d] group-hover:text-[#145c42]">
                <ArrowLeft className="h-3.5 w-3.5" />
                Previous
              </span>
              <span className="line-clamp-1 text-sm font-medium text-[#1f2c25] group-hover:text-[#145c42]">
                {prevLesson.title}
              </span>
            </Link>
          ) : <div />}

          {accessResult.allowed && nextLesson && nextLessonUnlocked ? (
            <Link
              href={`/courses/${course.slug}/lessons/${nextLesson.slug}`}
              className="group flex max-w-xs flex-col items-end gap-0.5"
            >
              <span className="flex items-center gap-1 text-xs font-semibold text-[#66756d] group-hover:text-[#145c42]">
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="line-clamp-1 text-sm font-medium text-[#1f2c25] group-hover:text-[#145c42]">
                {nextLesson.title}
              </span>
            </Link>
          ) : accessResult.allowed && nextLesson ? (
            <div className="flex max-w-xs flex-col items-end gap-0.5 text-right">
              <span className="flex items-center gap-1 text-xs font-semibold text-[#8fa09a]">
                Next locked
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="line-clamp-1 text-sm font-medium text-[#66756d]">
                Mark this lesson complete to continue
              </span>
            </div>
          ) : (
            <Link
              href={`/courses/${course.slug}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#145c42] hover:underline"
            >
              Back to course
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Clock, BookOpen, Lock } from "lucide-react";
import { urlFor } from "@/src/lib/sanity/image";
import type { SanityCourseCard } from "@/src/lib/sanity/lms-types";

const stageLabels: Record<string, string> = {
  "pre-op": "Pre-Op",
  "immediate-post-op": "Post-Op",
  "soft-food": "Soft Food",
  "long-term-maintenance": "Maintenance",
  vitamins: "Vitamins",
  "general-education": "General",
};

const stageColors: Record<string, string> = {
  "pre-op": "bg-[#dbeafe] text-[#1e40af]",
  "immediate-post-op": "bg-[#dcfce7] text-[#15803d]",
  "soft-food": "bg-[#fef9c3] text-[#854d0e]",
  "long-term-maintenance": "bg-[#f3e8ff] text-[#7e22ce]",
  vitamins: "bg-[#ffedd5] text-[#9a3412]",
  "general-education": "bg-[#f1f5f9] text-[#475569]",
};

interface CourseCardProps {
  course: SanityCourseCard;
  progress?: number;
  isEnrolled?: boolean;
}

export function CourseCard({ course, progress, isEnrolled }: CourseCardProps) {
  const stage = course.bariatricStage;
  const stageLabel = stage ? (stageLabels[stage] ?? stage) : null;
  const stageColor = stage ? (stageColors[stage] ?? "bg-[#f1f5f9] text-[#475569]") : "";

  const imageUrl = course.featuredImage?.asset
    ? urlFor(course.featuredImage).width(640).height(360).fit("crop").url()
    : null;

  const isLocked = course.accessType !== "free" && !isEnrolled;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#dce4df] bg-white shadow-sm transition hover:shadow-md hover:border-[#9bbfb0]">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#edf4ef]">
        {imageUrl ? (
          <Image
            alt={course.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            src={imageUrl}
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-12 w-12 text-[#9bbfb0]" />
          </div>
        )}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#1f2c25]">
              <Lock className="h-3.5 w-3.5" />
              Enrollment required
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 flex-wrap">
          {stageLabel && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${stageColor}`}>
              {stageLabel}
            </span>
          )}
          {course.difficultyLevel && (
            <span className="rounded-full bg-[#f3f4f6] px-2.5 py-0.5 text-xs font-medium text-[#6b7280] capitalize">
              {course.difficultyLevel}
            </span>
          )}
        </div>

        <h3 className="mt-3 text-base font-semibold leading-snug text-[#1f2c25] group-hover:text-[#145c42]">
          {course.title}
        </h3>

        {course.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[#66756d]">{course.excerpt}</p>
        )}

        <div className="mt-3 flex items-center gap-3 text-xs text-[#8fa09a]">
          {course.estimatedDuration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {course.estimatedDuration}
            </span>
          )}
          {course.lessonCount > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {isEnrolled && progress !== undefined && (
          <div className="mt-3">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-xs font-semibold text-[#145c42]">{progress}% complete</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#edf4ef]">
              <div
                className="h-full rounded-full bg-[#145c42] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-4 pt-2">
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center rounded-md bg-[#145c42] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2"
          >
            {isEnrolled && progress && progress > 0 ? "Continue" : "View Course"}
          </Link>
        </div>
      </div>
    </article>
  );
}

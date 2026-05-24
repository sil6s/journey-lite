"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LessonListItem } from "./LessonListItem";
import type { SanityModule, LessonProgressRecord } from "@/src/lib/sanity/lms-types";

interface ModuleAccordionProps {
  module: SanityModule;
  courseSlug: string;
  progressRows: LessonProgressRecord[];
  activeLessonSlug?: string;
  isEnrolled: boolean;
  unlockedLessonSlugs?: Set<string>;
  defaultOpen?: boolean;
}

export function ModuleAccordion({
  module,
  courseSlug,
  progressRows,
  activeLessonSlug,
  isEnrolled,
  unlockedLessonSlugs,
  defaultOpen = false,
}: ModuleAccordionProps) {
  const completedSlugs = new Set(
    progressRows.filter((p) => p.completed).map((p) => p.lesson_slug)
  );

  const hasActiveLesson = module.lessons.some((l) => l.slug === activeLessonSlug);
  const [open, setOpen] = useState(defaultOpen || hasActiveLesson);

  const completedCount = module.lessons.filter((l) => completedSlugs.has(l.slug)).length;
  const total = module.lessons.length;
  const allDone = completedCount === total && total > 0;

  return (
    <div className="rounded-xl border border-[#dce4df] bg-white overflow-hidden">
      <button
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[#fafcfb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#145c42]"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-5 truncate ${allDone ? "text-[#145c42]" : "text-[#1f2c25]"}`}>
            {module.title}
          </p>
          <p className="mt-0.5 text-xs text-[#8fa09a]">
            {completedCount}/{total} lesson{total !== 1 ? "s" : ""} complete
          </p>
        </div>

        {/* Mini progress pill */}
        {total > 0 && (
          <span
            className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
              allDone ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#f1f5f9] text-[#64748b]"
            }`}
          >
            {allDone ? "✓ Done" : `${Math.round((completedCount / total) * 100)}%`}
          </span>
        )}

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#66756d] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-[#f0f3f1] px-2 pb-2 pt-1">
          {module.lessons.length === 0 ? (
            <p className="px-3 py-3 text-sm text-[#8fa09a]">No lessons yet.</p>
          ) : (
            module.lessons.map((lesson) => (
              <LessonListItem
                key={lesson._id}
                lesson={lesson}
                courseSlug={courseSlug}
                isCompleted={completedSlugs.has(lesson.slug)}
                isActive={lesson.slug === activeLessonSlug}
                isLocked={(!isEnrolled && !lesson.isPreview) || (isEnrolled && unlockedLessonSlugs ? !unlockedLessonSlugs.has(lesson.slug) : false)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

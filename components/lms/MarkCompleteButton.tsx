"use client";

import { useState, useTransition } from "react";
import { CheckCircle, Circle } from "lucide-react";
import { markLessonComplete } from "@/lib/lms/actions";
import type { CompletionRequirement } from "@/lib/lms/actions";

interface MarkCompleteButtonProps {
  courseSlug: string;
  sectionTitle: string | null;
  lessonSlug: string;
  initialCompleted: boolean;
  requirements: CompletionRequirement[];
}

export function MarkCompleteButton({
  courseSlug,
  sectionTitle,
  lessonSlug,
  initialCompleted,
  requirements,
}: MarkCompleteButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !completed;
    setCompleted(next);
    setError("");
    startTransition(async () => {
      try {
        await markLessonComplete(courseSlug, sectionTitle, lessonSlug, next, requirements);
      } catch (completeError) {
        setCompleted(!next); // revert on error
        setError(completeError instanceof Error ? completeError.message : "Could not update lesson progress.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        aria-pressed={completed}
        className={`inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2 disabled:opacity-60 ${
          completed
            ? "bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0]"
            : "bg-[#145c42] text-white hover:bg-[#0f4d37]"
        }`}
        disabled={isPending}
        onClick={toggle}
        type="button"
      >
        {completed ? (
          <CheckCircle className="h-4 w-4" aria-hidden />
        ) : (
          <Circle className="h-4 w-4" aria-hidden />
        )}
        {isPending ? "Saving..." : completed ? "Mark as Incomplete" : "Mark as Complete"}
      </button>
      {error ? (
        <p className="max-w-xs text-right text-xs font-medium text-[#b45309]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

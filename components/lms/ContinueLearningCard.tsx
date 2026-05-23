import Link from "next/link";
import { PlayCircle, ArrowRight } from "lucide-react";

interface ContinueLearningCardProps {
  courseTitle: string;
  courseSlug: string;
  lessonTitle: string;
  lessonSlug: string;
  percentComplete: number;
}

export function ContinueLearningCard({
  courseTitle,
  courseSlug,
  lessonTitle,
  lessonSlug,
  percentComplete,
}: ContinueLearningCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#c8ddd4] bg-[#f0f8f4] p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#145c42]">
        Continue Learning
      </p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#145c42]">
            <PlayCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1f2c25]">{courseTitle}</p>
            <p className="mt-0.5 text-sm text-[#66756d]">{lessonTitle}</p>
          </div>
        </div>
        <Link
          href={`/courses/${courseSlug}/lessons/${lessonSlug}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#145c42] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
        >
          Resume Lesson
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {percentComplete > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs font-semibold">
            <span className="text-[#355346]">{percentComplete}% complete</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#cbd9d1]">
            <div
              className="h-full rounded-full bg-[#145c42] transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

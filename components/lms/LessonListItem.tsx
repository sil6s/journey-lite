import Link from "next/link";
import { CheckCircle, Lock, PlayCircle, Eye, Clock, FileText, Video, Download } from "lucide-react";
import type { SanityLessonRef, LessonType } from "@/src/lib/sanity/lms-types";

const typeIcons: Record<LessonType, React.ReactNode> = {
  article: <FileText className="h-3.5 w-3.5" />,
  video: <Video className="h-3.5 w-3.5" />,
  download: <Download className="h-3.5 w-3.5" />,
  checklist: <CheckCircle className="h-3.5 w-3.5" />,
  recipe: <FileText className="h-3.5 w-3.5" />,
  mixed: <PlayCircle className="h-3.5 w-3.5" />,
};

interface LessonListItemProps {
  lesson: SanityLessonRef;
  courseSlug: string;
  isCompleted: boolean;
  isActive?: boolean;
  isLocked?: boolean;
}

export function LessonListItem({
  lesson,
  courseSlug,
  isCompleted,
  isActive = false,
  isLocked = false,
}: LessonListItemProps) {
  const href = `/courses/${courseSlug}/lessons/${lesson.slug}`;

  const statusIcon = isCompleted ? (
    <CheckCircle className="h-5 w-5 text-[#145c42]" />
  ) : isLocked && !lesson.isPreview ? (
    <Lock className="h-5 w-5 text-[#94a3b8]" />
  ) : (
    <PlayCircle className="h-5 w-5 text-[#145c42]" />
  );

  const inner = (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
        isActive
          ? "bg-[#edf4ef]"
          : isLocked && !lesson.isPreview
            ? "opacity-60"
            : "hover:bg-[#f5f8f6]"
      }`}
    >
      <span className="shrink-0">{statusIcon}</span>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium leading-5 ${
            isActive ? "text-[#145c42]" : isCompleted ? "text-[#53635b]" : "text-[#1f2c25]"
          }`}
        >
          {lesson.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-[#8fa09a]">
          {lesson.lessonType && (
            <span className="flex items-center gap-1">
              {typeIcons[lesson.lessonType]}
              <span className="capitalize">{lesson.lessonType}</span>
            </span>
          )}
          {lesson.estimatedTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lesson.estimatedTime}
            </span>
          )}
          {lesson.isPreview && (
            <span className="flex items-center gap-1 text-[#854d0e]">
              <Eye className="h-3 w-3" />
              Preview
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (isLocked && !lesson.isPreview) {
    return <div aria-disabled="true">{inner}</div>;
  }

  return <Link href={href}>{inner}</Link>;
}

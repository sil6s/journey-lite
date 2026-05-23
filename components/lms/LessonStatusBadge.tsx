import { CheckCircle, Lock, PlayCircle, Eye } from "lucide-react";

type Status = "complete" | "in-progress" | "locked" | "preview" | "not-started";

interface LessonStatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; icon: React.ReactNode; className: string }> = {
  complete: {
    label: "Complete",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    className: "bg-[#dcfce7] text-[#15803d]",
  },
  "in-progress": {
    label: "In Progress",
    icon: <PlayCircle className="h-3.5 w-3.5" />,
    className: "bg-[#dbeafe] text-[#1d4ed8]",
  },
  locked: {
    label: "Locked",
    icon: <Lock className="h-3.5 w-3.5" />,
    className: "bg-[#f1f5f9] text-[#64748b]",
  },
  preview: {
    label: "Free Preview",
    icon: <Eye className="h-3.5 w-3.5" />,
    className: "bg-[#fef9c3] text-[#854d0e]",
  },
  "not-started": {
    label: "Not Started",
    icon: null,
    className: "bg-[#f3f4f6] text-[#6b7280]",
  },
};

export function LessonStatusBadge({ status, className = "" }: LessonStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${config.className} ${className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { enrollInCourse } from "@/lib/lms/actions";

export function EnrollButton({ courseSlug }: { courseSlug: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleEnroll() {
    setError(null);
    startTransition(async () => {
      const result = await enrollInCourse(courseSlug);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleEnroll}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-[#145c42] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
      >
        {isPending ? "Enrolling…" : "Enroll for Free"}
        {!isPending && <ArrowRight className="h-4 w-4" />}
      </button>
      {error && (
        <p className="text-center text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-[#e8eeea]", className)} />;
}

export function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#dce4df] bg-white shadow-sm">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-2 flex gap-2">
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => <CourseCardSkeleton key={i} />)}
      </div>
    </div>
  );
}

export function LessonPageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-9 w-3/4" />
      <Skeleton className="h-5 w-32" />
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-5 w-full last:w-2/3" />)}
      </div>
    </div>
  );
}

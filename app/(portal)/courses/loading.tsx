export default function CoursesLoading() {
  return (
    <div className="space-y-12">
      {/* Hero skeleton */}
      <div className="h-44 animate-pulse rounded-2xl bg-[#dce4df]" />
      {/* Card grid skeletons */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-[#dce4df] bg-white">
            <div className="aspect-video bg-[#edf4ef]" />
            <div className="space-y-2 p-5">
              <div className="h-3 w-1/3 rounded bg-[#edf4ef]" />
              <div className="h-4 w-3/4 rounded bg-[#edf4ef]" />
              <div className="h-3 w-full rounded bg-[#edf4ef]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

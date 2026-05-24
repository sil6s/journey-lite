export default function CourseDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-pulse">
      <div className="h-4 w-32 rounded bg-[#dce4df]" />
      <div className="h-52 rounded-2xl bg-[#dce4df]" />
      <div className="space-y-3">
        <div className="h-8 w-2/3 rounded bg-[#dce4df]" />
        <div className="h-4 w-full rounded bg-[#dce4df]" />
        <div className="h-4 w-3/4 rounded bg-[#dce4df]" />
      </div>
      <div className="h-24 rounded-2xl bg-[#dce4df]" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-[#dce4df]" />
        ))}
      </div>
    </div>
  );
}

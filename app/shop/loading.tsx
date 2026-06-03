export default function ShopLoading() {
  return (
    <div className="space-y-8">
      <div className="h-16 animate-pulse rounded-xl bg-[#dce4df]" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-[#dce4df] bg-white">
            <div className="aspect-square bg-[#edf4ef]" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 rounded bg-[#edf4ef]" />
              <div className="h-3 w-full rounded bg-[#edf4ef]" />
              <div className="h-8 w-1/2 rounded bg-[#edf4ef]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

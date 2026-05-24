export default function PortalLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#dce4df] border-t-[#145c42]" />
        <p className="text-sm text-[#66756d]">Loading…</p>
      </div>
    </div>
  );
}

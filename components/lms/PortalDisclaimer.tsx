export function PortalDisclaimer() {
  return (
    <footer className="mt-16 border-t border-[#dce4df] bg-[#f5f8f6] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs leading-6 text-[#66756d]">
          <strong className="font-semibold text-[#53635b]">Educational content only.</strong>{" "}
          This portal is for general patient education and does not replace medical advice from your
          care team. Always follow the personalized guidance from your JourneyLite physician and
          dietitian. For medical emergencies, call 911.
        </p>
        <p className="mt-2 text-xs text-[#8fa09a]">
          © {new Date().getFullYear()} JourneyLite Physicians · Patient Education Portal
        </p>
      </div>
    </footer>
  );
}

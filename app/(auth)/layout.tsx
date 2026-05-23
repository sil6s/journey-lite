import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f8f6]">
      {/* Header */}
      <header className="border-b border-[#dce4df] bg-white py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[#1f2c25]">
            <GraduationCap className="h-6 w-6 text-[#145c42]" />
            JourneyLite
          </Link>
          <Link href="/courses" className="text-sm text-[#66756d] hover:text-[#145c42]">
            Browse courses
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-12">{children}</main>

      {/* Footer note */}
      <footer className="pb-8 text-center">
        <p className="text-xs text-[#8fa09a]">
          This portal is for patient education only and does not replace medical advice.
        </p>
      </footer>
    </div>
  );
}

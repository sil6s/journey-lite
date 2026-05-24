import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "./UserMenu";

export async function PortalNav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: { full_name: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  return (
    <nav
      aria-label="Patient education portal navigation"
      className="sticky top-0 z-40 border-b border-[#dce4df] bg-white/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo + portal label */}
        <div className="flex items-center gap-3">
          <Link href="/" className="shrink-0" aria-label="JourneyLite home">
            <Image
              src="/journeylite-logo.svg"
              alt="JourneyLite"
              width={140}
              height={40}
              priority
              unoptimized
              className="h-8 w-auto"
            />
          </Link>
          <div className="hidden sm:block h-5 w-px bg-[#dce4df]" />
          <Link
            href="/courses"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#1f2c25] hover:text-[#145c42]"
          >
            <BookOpen className="h-4 w-4 text-[#145c42]" />
            Patient Education
          </Link>
        </div>

        {/* Nav links (desktop) */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/courses"
            className="rounded-md px-3 py-2 text-sm font-medium text-[#53635b] hover:bg-[#f5f8f6] hover:text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
          >
            Browse Courses
          </Link>
          <Link
            href="/shop"
            className="rounded-md px-3 py-2 text-sm font-medium text-[#53635b] hover:bg-[#f5f8f6] hover:text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] inline-flex items-center gap-1.5"
          >
            <ShoppingBag className="h-4 w-4" />
            Shop
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#53635b] hover:bg-[#f5f8f6] hover:text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
            >
              My Dashboard
            </Link>
          )}
        </div>

        {/* Return to main site */}
        <a
          href="https://www.journeylite.com"
          className="hidden lg:inline-flex items-center gap-1 text-xs font-medium text-[#66756d] hover:text-[#145c42]"
        >
          <ArrowLeft className="h-3 w-3" />
          Main site
        </a>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {user ? (
            <UserMenu
              email={user.email ?? ""}
              fullName={profile?.full_name ?? user.user_metadata?.full_name ?? null}
            />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-semibold text-[#1f2c25] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-[#145c42] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

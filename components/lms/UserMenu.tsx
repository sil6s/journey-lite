"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  LogOut,
  ChevronDown,
  ShoppingBag,
  BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  email: string;
  fullName?: string | null;
}

export function UserMenu({ email, fullName }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : email.slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-[#1f2c25] transition hover:bg-[#edf4ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#145c42] text-xs font-bold text-white">
          {initials}
        </span>
        <span className="hidden sm:block max-w-[120px] truncate">
          {fullName ?? email}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-[#66756d]" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[#dce4df] bg-white shadow-xl shadow-[#20372b]/8"
          role="menu"
        >
          {/* Account header */}
          <div className="border-b border-[#f0f3f1] px-4 py-3">
            <p className="text-xs font-semibold text-[#1f2c25]">
              {fullName ?? "My Account"}
            </p>
            <p className="mt-0.5 truncate text-xs text-[#66756d]">{email}</p>
          </div>

          {/* Navigation */}
          <div className="p-1.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-[#1f2c25] hover:bg-[#f5f8f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#145c42]"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <LayoutDashboard className="h-4 w-4 text-[#66756d]" />
              My Dashboard
            </Link>
            <Link
              href="/courses"
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-[#1f2c25] hover:bg-[#f5f8f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#145c42]"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <BookOpen className="h-4 w-4 text-[#66756d]" />
              My Courses
            </Link>
            <Link
              href="/courses"
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-[#1f2c25] hover:bg-[#f5f8f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#145c42]"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <BookOpen className="h-4 w-4 text-[#66756d]" />
              Browse Courses
            </Link>
            <Link
              href="/shop"
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-[#1f2c25] hover:bg-[#f5f8f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#145c42]"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <ShoppingBag className="h-4 w-4 text-[#66756d]" />
              Shop
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-[#f0f3f1] p-1.5">
            <button
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-[#8a3b22] hover:bg-[#fef2ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#145c42]"
              onClick={handleSignOut}
              role="menuitem"
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

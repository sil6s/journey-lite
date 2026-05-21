"use client";

import { useConsult } from "./consult-context";

interface BookConsultButtonProps {
  children?: React.ReactNode;
  className?: string;
  treatmentInterest?: string;
  variant?: "primary" | "light" | "outline" | "ghost";
}

const variantClasses: Record<string, string> = {
  primary:
    "inline-flex min-h-11 items-center justify-center rounded-md bg-[#145c42] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2",
  light:
    "inline-flex min-h-11 items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#145c42] shadow-sm transition hover:bg-[#f0f5f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
  outline:
    "inline-flex min-h-11 items-center justify-center rounded-md border border-white/40 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
  ghost:
    "inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold text-[#145c42] transition hover:bg-[#f0f5f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]",
};

export function BookConsultButton({
  children = "Book Consultation",
  className,
  treatmentInterest,
  variant = "primary",
}: BookConsultButtonProps) {
  const { openOverlay } = useConsult();
  return (
    <button
      className={className ?? variantClasses[variant]}
      onClick={() => openOverlay({ treatmentInterest })}
      type="button"
    >
      {children}
    </button>
  );
}

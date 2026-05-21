"use client";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConsultProvider } from "./consult-context";
import { BookConsultOverlay } from "./BookConsultOverlay";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <ConsultProvider>
        {children}
        <BookConsultOverlay />
      </ConsultProvider>
      <Toaster richColors closeButton />
    </TooltipProvider>
  );
}

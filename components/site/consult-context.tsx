"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface ConsultContextValue {
  open: boolean;
  openOverlay: (prefill?: { treatmentInterest?: string }) => void;
  closeOverlay: () => void;
  prefill: { treatmentInterest?: string };
}

const ConsultContext = createContext<ConsultContextValue | null>(null);

export function ConsultProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<{ treatmentInterest?: string }>({});

  const openOverlay = useCallback((p: { treatmentInterest?: string } = {}) => {
    setPrefill(p);
    setOpen(true);
    document.documentElement.style.overflow = "hidden";
  }, []);

  const closeOverlay = useCallback(() => {
    setOpen(false);
    document.documentElement.style.overflow = "";
  }, []);

  return (
    <ConsultContext.Provider value={{ open, openOverlay, closeOverlay, prefill }}>
      {children}
    </ConsultContext.Provider>
  );
}

export function useConsult() {
  const ctx = useContext(ConsultContext);
  if (!ctx) throw new Error("useConsult must be used inside ConsultProvider");
  return ctx;
}

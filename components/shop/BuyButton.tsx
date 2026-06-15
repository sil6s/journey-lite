"use client";

import { useState, useTransition } from "react";
import { ShoppingCart } from "lucide-react";
import { createCheckout } from "@/lib/shopify/actions";

export function BuyButton({
  variantId,
  available,
  compact = false,
}: {
  variantId: string;
  available: boolean;
  compact?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!available) {
    return (
      <button
        disabled
        className={`w-full rounded-lg border border-[#dce4df] font-semibold text-[#8fa09a] cursor-not-allowed ${
          compact ? "py-1.5 text-xs" : "py-2.5 text-sm"
        }`}
      >
        Out of Stock
      </button>
    );
  }

  function handleBuy() {
    setError(null);
    startTransition(async () => {
      const result = await createCheckout(variantId);
      if (result.error) {
        setError(result.error);
      } else if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    });
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleBuy}
        disabled={isPending}
        className={`flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#145c42] font-semibold text-white transition hover:bg-[#0f4d37] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] ${
          compact ? "py-1.5 text-xs" : "py-2.5 text-sm gap-2"
        }`}
      >
        <ShoppingCart className={compact ? "h-3 w-3" : "h-4 w-4"} />
        {isPending ? "Redirecting…" : "Buy Now"}
      </button>
      {error && <p className="text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}

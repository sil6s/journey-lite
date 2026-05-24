"use client";

import { useState, useTransition } from "react";
import { ShoppingCart } from "lucide-react";
import { createCheckout } from "@/lib/shopify/actions";

export function BuyButton({ variantId, available }: { variantId: string; available: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!available) {
    return (
      <button disabled className="w-full rounded-lg border border-[#dce4df] py-2.5 text-sm font-semibold text-[#8fa09a] cursor-not-allowed">
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
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#145c42] py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f4d37] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
      >
        <ShoppingCart className="h-4 w-4" />
        {isPending ? "Redirecting…" : "Buy Now"}
      </button>
      {error && <p className="text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}

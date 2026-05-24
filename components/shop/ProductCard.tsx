import Image from "next/image";
import { Package } from "lucide-react";
import { BuyButton } from "./BuyButton";
import type { ShopifyProduct } from "@/lib/shopify/types";

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(
    parseFloat(amount)
  );
}

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const image = product.images.edges[0]?.node ?? null;
  const variant = product.variants.edges[0]?.node ?? null;
  const price = product.priceRange.minVariantPrice;
  const maxPrice = product.priceRange.maxVariantPrice;
  const hasRange = price.amount !== maxPrice.amount;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#dce4df] bg-white shadow-sm transition hover:shadow-md">
      {/* Product image */}
      <div className="relative aspect-[4/3] bg-[#f5f8f6]">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-[#c8ddd4]" />
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[#1f2c25] leading-snug">{product.title}</h3>
          {product.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#66756d]">
              {product.description}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-base font-bold text-[#1f2c25]">
            {hasRange ? `From ` : ""}{formatPrice(price.amount, price.currencyCode)}
          </p>
          {variant && (
            <BuyButton variantId={variant.id} available={variant.availableForSale} />
          )}
        </div>
      </div>
    </div>
  );
}

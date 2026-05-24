import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { storefrontFetch } from "@/lib/shopify/client";
import { PRODUCTS_QUERY } from "@/lib/shopify/queries";
import { ProductCard } from "@/components/shop/ProductCard";
import type { ProductsQuery, ShopifyProduct } from "@/lib/shopify/types";

export const revalidate = 60;

type ProductGroup = { label: string; products: ShopifyProduct[] };

function categorize(products: ShopifyProduct[]): ProductGroup[] {
  const order = ["Pre-Op Diet", "Post-Op Diet", "Vitamin Kits", "Smoothies", "Food & Snacks", "Other"];
  const groups: Record<string, ShopifyProduct[]> = Object.fromEntries(order.map((k) => [k, []]));

  for (const p of products) {
    const h = p.handle;
    if (h.includes("pre-op")) groups["Pre-Op Diet"].push(p);
    else if (h.includes("post-op")) groups["Post-Op Diet"].push(p);
    else if (h.includes("kit")) groups["Vitamin Kits"].push(p);
    else if (h.includes("smoothie")) groups["Smoothies"].push(p);
    else if (["mashed", "pasta", "soup", "protein", "bar", "snack"].some((w) => h.includes(w)))
      groups["Food & Snacks"].push(p);
    else groups["Other"].push(p);
  }

  return order
    .filter((k) => groups[k].length > 0)
    .map((k) => ({ label: k, products: groups[k] }));
}

export default async function ShopPage() {
  let allProducts: ShopifyProduct[] = [];

  try {
    const data = await storefrontFetch<ProductsQuery>(PRODUCTS_QUERY, { first: 50 });
    allProducts = data.products.edges.map((e) => e.node);
  } catch (e) {
    console.error("[shop] failed to fetch products:", e);
  }

  const groups = categorize(allProducts);

  return (
    <div className="space-y-10">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <a
            href="https://www.journeylite.com"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#66756d] hover:text-[#145c42]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to main site
          </a>
          <span className="text-[#dce4df]">|</span>
          <Link
            href="/courses"
            className="text-sm font-medium text-[#66756d] hover:text-[#145c42]"
          >
            Patient Education
          </Link>
        </div>
      </div>

      {/* Page header */}
      <div className="border-b border-[#dce4df] pb-6">
        <div className="flex items-center gap-2.5">
          <ShoppingBag className="h-6 w-6 text-[#145c42]" />
          <h1 className="text-2xl font-semibold text-[#1f2c25] sm:text-3xl">JourneyLite Shop</h1>
        </div>
        <p className="mt-2 text-sm leading-6 text-[#66756d]">
          Bariatric-friendly vitamins, supplements, pre-op diet kits, and nutritional products
          curated by your JourneyLite care team. Checkout is handled securely by Shopify.
        </p>
      </div>

      {/* Products */}
      {allProducts.length === 0 ? (
        <div className="rounded-2xl border border-[#dce4df] bg-white p-12 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-[#c8ddd4]" />
          <p className="mt-3 text-sm font-semibold text-[#1f2c25]">Products coming soon</p>
          <p className="mt-1 text-xs text-[#66756d]">Check back shortly.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {groups.map((group) => (
            <section key={group.label} aria-labelledby={`group-${group.label}`}>
              <h2
                id={`group-${group.label}`}
                className="mb-5 text-lg font-semibold text-[#1f2c25]"
              >
                {group.label}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Footer note */}
      <p className="border-t border-[#dce4df] pt-6 text-xs text-[#8fa09a]">
        Products are recommendations from your care team and do not constitute individualized medical advice.
        Always follow the guidance of your JourneyLite physician and dietitian.
      </p>
    </div>
  );
}

import { Apple, Beaker, Box, Dumbbell, Pill, ShoppingBag, UtensilsCrossed, Wheat } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { storefrontFetch } from "@/lib/shopify/client";
import { PRODUCTS_QUERY } from "@/lib/shopify/queries";
import { ProductCard } from "@/components/shop/ProductCard";
import type { ProductsQuery, ShopifyProduct } from "@/lib/shopify/types";

export const revalidate = 60;

// ── Category config ─────────────────────────────────────────────────────────

type CategoryConfig = {
  label: string;
  Icon: LucideIcon;
  description: string;
  test: (handle: string, title: string) => boolean;
};

const CATEGORIES: CategoryConfig[] = [
  {
    label: "Pre-Op Diet",
    Icon: Apple,
    description: "Meal replacements and protein shakes to prepare for surgery",
    test: (h) => h.includes("pre-op") || h.includes("preop"),
  },
  {
    label: "Post-Op Diet",
    Icon: UtensilsCrossed,
    description: "Soft, bariatric-friendly foods for your recovery phase",
    test: (h) => h.includes("post-op") || h.includes("postop"),
  },
  {
    label: "Vitamin Kits",
    Icon: Pill,
    description: "Complete bariatric vitamin bundles recommended by your care team",
    test: (h) => h.includes("kit") || h.includes("vitamin"),
  },
  {
    label: "Protein Shakes & Smoothies",
    Icon: Dumbbell,
    description: "High-protein shakes and smoothie mixes to hit your daily goals",
    test: (h) => h.includes("smoothie") || h.includes("shake") || h.includes("protein-shake"),
  },
  {
    label: "Food & Snacks",
    Icon: Wheat,
    description: "Bariatric-friendly snacks, soups, and nutritious meals",
    test: (h) =>
      ["mashed", "pasta", "soup", "protein-bar", "bar", "snack", "chip", "cracker", "cookie"].some((w) =>
        h.includes(w)
      ),
  },
  {
    label: "Supplements",
    Icon: Beaker,
    description: "Individual vitamins, minerals, and nutritional supplements",
    test: (h, title) =>
      ["supplement", "calcium", "iron", "zinc", "b12", "omega", "probiotic", "fiber"].some(
        (w) => h.includes(w) || title.toLowerCase().includes(w)
      ),
  },
  {
    label: "Other",
    Icon: Box,
    description: "Additional bariatric products and accessories",
    test: () => true, // catch-all
  },
];

type ProductGroup = { config: CategoryConfig; products: ShopifyProduct[] };

function categorize(products: ShopifyProduct[]): ProductGroup[] {
  const assigned = new Set<string>();
  const groups: ProductGroup[] = [];

  for (const config of CATEGORIES) {
    const matched = products.filter((p) => {
      if (assigned.has(p.id)) return false;
      return config.test(p.handle, p.title);
    });
    if (matched.length > 0 || config.label === "Other") {
      // "Other" only shows if it has items (since all assigned first)
      const othersOnly = matched.filter((p) => !assigned.has(p.id));
      if (othersOnly.length > 0) {
        othersOnly.forEach((p) => assigned.add(p.id));
        groups.push({ config, products: othersOnly });
      }
    }
  }

  return groups;
}

function slugify(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

// ── Page ────────────────────────────────────────────────────────────────────

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
    <div className="min-h-screen">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="border-b border-[#dce4df] bg-gradient-to-br from-[#f2f8f4] to-white pb-8 pt-6">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#145c42] shadow">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1f2c25] sm:text-3xl">JourneyLite Shop</h1>
              <p className="mt-0.5 text-sm text-[#66756d]">
                Bariatric vitamins, supplements, and diet products — curated by your care team
              </p>
            </div>
          </div>

          {/* Category pills */}
          {groups.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {groups.map(({ config }) => (
                <a
                  key={config.label}
                  href={`#${slugify(config.label)}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#dce4df] bg-white px-3 py-1.5 text-xs font-semibold text-[#314139] shadow-sm transition hover:border-[#145c42] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                >
                  <config.Icon className="h-3.5 w-3.5" />
                  {config.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Products ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl space-y-14 px-5 py-10 lg:px-8">
        {allProducts.length === 0 ? (
          <div className="rounded-2xl border border-[#dce4df] bg-white p-16 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-[#c8ddd4]" />
            <p className="mt-4 text-base font-semibold text-[#1f2c25]">Products coming soon</p>
            <p className="mt-1 text-sm text-[#66756d]">
              We're stocking the shelves. Check back shortly.
            </p>
          </div>
        ) : (
          groups.map(({ config, products }) => (
            <section
              key={config.label}
              id={slugify(config.label)}
              aria-labelledby={`heading-${slugify(config.label)}`}
              className="scroll-mt-24"
            >
              {/* Section header */}
              <div className="mb-6 flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf4ef]">
                  <config.Icon className="h-4 w-4 text-[#145c42]" />
                </div>
                <div>
                  <h2
                    id={`heading-${slugify(config.label)}`}
                    className="text-xl font-bold text-[#1f2c25]"
                  >
                    {config.label}
                  </h2>
                  <p className="mt-0.5 text-sm text-[#66756d]">{config.description}</p>
                </div>
              </div>

              {/* Product grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))
        )}

        {/* Footer note */}
        <p className="border-t border-[#dce4df] pt-6 text-xs text-[#8fa09a]">
          Products are recommendations from your care team and do not constitute individualized
          medical advice. Always follow the guidance of your JourneyLite physician and dietitian.
          Checkout is handled securely by Shopify.
        </p>
      </div>
    </div>
  );
}

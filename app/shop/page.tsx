import { Box, Dumbbell, Pill, ShoppingBag, Utensils, Wheat } from "lucide-react";
import { storefrontFetch } from "@/lib/shopify/client";
import { PRODUCTS_QUERY } from "@/lib/shopify/queries";
import { ProductCard } from "@/components/shop/ProductCard";
import { BuyButton } from "@/components/shop/BuyButton";
import type { ProductsQuery, ShopifyProduct } from "@/lib/shopify/types";

export const revalidate = 60;

// ── Surgery types for the vitamin kit selector ───────────────────────────────

const SURGERY_TYPES = [
  { key: "gastric-sleeve",   label: "Gastric Sleeve",   desc: "Vertical sleeve gastrectomy" },
  { key: "gastric-bypass",   label: "Gastric Bypass",   desc: "Roux-en-Y gastric bypass" },
  { key: "sadi-sips",        label: "SADI / SIPS",      desc: "Single anastomosis duodeno-ileal bypass" },
  { key: "gastric-band",     label: "Gastric Band",     desc: "Adjustable gastric banding" },
  { key: "gastric-balloon",  label: "Gastric Balloon",  desc: "Non-surgical balloon procedure" },
];

// ── Category definitions (use Shopify productType for accuracy) ─────────────

type Section = {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (p: ShopifyProduct) => boolean;
};

const SECTIONS: Section[] = [
  {
    id: "vitamin-kits",
    label: "Vitamin Starter Kits",
    description: "Complete vitamin bundles tailored to your specific surgery procedure",
    icon: Pill,
    match: (p) => p.productType === "Vitamin Kits" && p.handle.includes("starter-kit"),
  },
  {
    id: "vitamin-refills",
    label: "90-Day Vitamin Refills",
    description: "Ongoing supply packs to keep you stocked after your first 30 days",
    icon: Pill,
    match: (p) => p.productType === "Vitamin Kits" && p.handle.includes("90-day"),
  },
  {
    id: "multivitamins",
    label: "Multivitamins",
    description: "Bariatric-formulated chewable and capsule multivitamins",
    icon: Pill,
    match: (p) => p.productType === "Multivitamins",
  },
  {
    id: "calcium",
    label: "Calcium",
    description: "Calcium citrate chewables in a variety of flavors",
    icon: Pill,
    match: (p) => p.productType === "Calcium",
  },
  {
    id: "b12",
    label: "B12",
    description: "Sublingual B12 supplements for optimal absorption after surgery",
    icon: Pill,
    match: (p) => p.productType === "B12",
  },
  {
    id: "vitamin-d",
    label: "Vitamin D",
    description: "High-potency Vitamin D3 capsules",
    icon: Pill,
    match: (p) => p.productType === "D Vitamins",
  },
  {
    id: "iron",
    label: "Iron",
    description: "Bariatric iron supplements with Vitamin C for absorption",
    icon: Pill,
    match: (p) => p.productType === "Iron",
  },
  {
    id: "other-vitamins",
    label: "Other Supplements",
    description: "Biotin and additional nutritional supplements",
    icon: Pill,
    match: (p) => p.productType === "Other Vitamins",
  },
  {
    id: "pre-op",
    label: "Pre-Op Diet Kits",
    description: "BMI-matched meal replacement kits to prepare your liver for surgery",
    icon: Utensils,
    match: (p) =>
      p.productType === "Pre-op Diet" && !p.handle.includes("post-op") && !p.handle.includes("clear-liquid"),
  },
  {
    id: "post-op",
    label: "Post-Op Clear Liquid Diet",
    description: "Liquid nutrition for the first days after your procedure",
    icon: Utensils,
    match: (p) => p.handle.includes("clear-liquid") || (p.productType === "Pre-op Diet" && p.handle.includes("post-op")),
  },
  {
    id: "smoothies",
    label: "Protein Shakes",
    description: "High-protein bariatric shakes and smoothie mixes",
    icon: Dumbbell,
    match: (p) => p.productType === "Smoothies",
  },
  {
    id: "protein-bars",
    label: "Protein Bars",
    description: "VLC and crunchy protein bars — perfect between-meal snacks",
    icon: Wheat,
    match: (p) => p.productType === "Bars VLC" || p.productType === "Bars Crunchy",
  },
  {
    id: "food",
    label: "Food & Snacks",
    description: "Bariatric-friendly meals, soups, and snacks",
    icon: Box,
    match: (p) =>
      ["Pasta & Potatoes", "Breakfast", "Soups", "Snacks"].includes(p.productType),
  },
];

// ── Surgery kit lookup helpers ───────────────────────────────────────────────

function starterKitForSurgery(products: ShopifyProduct[], surgeryKey: string) {
  return products.find(
    (p) => p.productType === "Vitamin Kits" && p.handle === `${surgeryKey}-starter-kit`
  );
}

function refillKitForSurgery(products: ShopifyProduct[], surgeryKey: string) {
  return products.find(
    (p) => p.productType === "Vitamin Kits" && p.handle === `${surgeryKey}-90-days`
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ShopPage() {
  let allProducts: ShopifyProduct[] = [];
  let fetchError: string | null = null;

  try {
    const data = await storefrontFetch<ProductsQuery>(PRODUCTS_QUERY, { first: 50 });
    allProducts = data.products.edges.map((e) => e.node);
  } catch (e) {
    console.error("[shop] failed to fetch products:", e);
    fetchError = e instanceof Error ? e.message : "Unknown error";
  }

  // Build sections — each product can only appear in the first matching section
  const assigned = new Set<string>();
  const sections = SECTIONS.map((sec) => {
    const products = allProducts.filter((p) => {
      if (assigned.has(p.id)) return false;
      return sec.match(p);
    });
    products.forEach((p) => assigned.add(p.id));
    return { ...sec, products };
  }).filter((s) => s.products.length > 0);

  // Visible nav sections (non-empty)
  const navSections = sections.filter((s) => s.id !== "vitamin-refills");

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <div className="border-b border-[#dce4df] bg-gradient-to-br from-[#f2f8f4] to-white pb-8 pt-8">
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

          {/* Category nav pills */}
          {sections.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="#vitamin-kits"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0D3D24] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#145c42]">
                <Pill className="h-3.5 w-3.5" /> Vitamin Kits
              </a>
              {navSections.filter((s) => s.id !== "vitamin-kits").map((s) => (
                <a key={s.id} href={`#${s.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#dce4df] bg-white px-3 py-1.5 text-xs font-semibold text-[#314139] shadow-sm transition hover:border-[#145c42] hover:text-[#145c42]">
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-16 px-5 py-12 lg:px-8">

        {/* ── Error / empty state ──────────────────────────────────────── */}
        {fetchError && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <p className="font-semibold text-red-700">Could not load products</p>
            <p className="mt-1 text-sm text-red-600">{fetchError}</p>
          </div>
        )}

        {!fetchError && allProducts.length === 0 && (
          <div className="rounded-2xl border border-[#dce4df] bg-white p-16 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-[#c8ddd4]" />
            <p className="mt-4 text-base font-semibold text-[#1f2c25]">Products coming soon</p>
            <p className="mt-1 text-sm text-[#66756d]">We're stocking the shelves. Check back shortly.</p>
          </div>
        )}

        {/* ── Vitamin Starter Kits — surgery selector ──────────────────── */}
        {allProducts.length > 0 && (
          <section id="vitamin-kits" className="scroll-mt-24">
            <div className="mb-6 flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf4ef]">
                <Pill className="h-4 w-4 text-[#145c42]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1f2c25]">Vitamin Starter Kits</h2>
                <p className="mt-0.5 text-sm text-[#66756d]">
                  Complete vitamin bundles tailored to your specific surgery procedure — everything you need for the first 30 days
                </p>
              </div>
            </div>

            {/* Surgery type cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {SURGERY_TYPES.map((surgery) => {
                const starter = starterKitForSurgery(allProducts, surgery.key);
                const refill  = refillKitForSurgery(allProducts, surgery.key);
                return (
                  <div key={surgery.key} className="overflow-hidden rounded-2xl border border-[#dce4df] bg-white shadow-sm">
                    {/* Surgery header */}
                    <div className="bg-[#f2f8f4] px-4 py-4 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#145c42]">Surgery Type</p>
                      <h3 className="mt-1 text-sm font-bold text-[#1f2c25]">{surgery.label}</h3>
                      <p className="mt-0.5 text-[11px] text-[#9aafa5] leading-4">{surgery.desc}</p>
                    </div>

                    {/* Starter kit */}
                    <div className="border-t border-[#dce4df] p-4">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9aafa5]">30-Day Starter</p>
                      {starter ? (
                        <MiniProductCard product={starter} />
                      ) : (
                        <p className="text-xs text-[#c8ddd4]">Not available</p>
                      )}
                    </div>

                    {/* 90-day refill */}
                    {refill && (
                      <div className="border-t border-[#dce4df] p-4">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9aafa5]">90-Day Refill</p>
                        <MiniProductCard product={refill} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── All other sections ───────────────────────────────────────── */}
        {sections
          .filter((s) => s.id !== "vitamin-kits" && s.id !== "vitamin-refills")
          .map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24" aria-labelledby={`heading-${section.id}`}>
              <div className="mb-6 flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf4ef]">
                  <section.icon className="h-4 w-4 text-[#145c42]" />
                </div>
                <div>
                  <h2 id={`heading-${section.id}`} className="text-xl font-bold text-[#1f2c25]">
                    {section.label}
                  </h2>
                  <p className="mt-0.5 text-sm text-[#66756d]">{section.description}</p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}

        {/* Footer note */}
        <p className="border-t border-[#dce4df] pt-6 text-xs text-[#8fa09a]">
          Products are recommendations from your JourneyLite care team and do not constitute individualized medical advice.
          Always follow the guidance of your physician and dietitian. Checkout is handled securely by Shopify.
        </p>
      </div>
    </div>
  );
}

// ── Mini product card for the surgery kit grid ───────────────────────────────

function MiniProductCard({ product }: { product: ShopifyProduct }) {
  const variant = product.variants.edges[0]?.node ?? null;
  const price = product.priceRange.minVariantPrice;
  const maxPrice = product.priceRange.maxVariantPrice;
  const hasRange = price.amount !== maxPrice.amount;
  const fmt = (amount: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: price.currencyCode }).format(parseFloat(amount));

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold leading-snug text-[#1f2c25]">{product.title}</p>
      <p className="text-sm font-bold text-[#145c42]">
        {hasRange ? "From " : ""}{fmt(price.amount)}
      </p>
      {variant && (
        <BuyButton variantId={variant.id} available={variant.availableForSale} compact />
      )}
    </div>
  );
}

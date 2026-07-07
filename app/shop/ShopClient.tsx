"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition, type ComponentType, type CSSProperties, type MouseEvent } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ClipboardList,
  FileText,
  Heart,
  LockKeyhole,
  Menu,
  Minus,
  Package,
  Pill,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Stethoscope,
  Trash2,
  Truck,
  UserRound,
  Utensils,
  X,
} from "lucide-react";
import { addToCart } from "@/lib/shopify/actions";
import type { ShopifyProduct } from "@/lib/shopify/types";

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STORE_URL = SHOPIFY_STORE_DOMAIN ? `https://${SHOPIFY_STORE_DOMAIN}` : null;
const CART_ID_KEY = "journeylite_shopify_cart_id";
const CART_URL_KEY = "journeylite_shopify_checkout_url";
const CART_QTY_KEY = "journeylite_shopify_cart_qty";
const CART_UPDATED_EVENT = "journeylite-shopify-cart-updated";
const PROCEDURE_OPTIONS = [
  { id: "all", label: "Not selected", terms: [] },
  { id: "sleeve", label: "Gastric Sleeve", terms: ["sleeve", "vsg"] },
  { id: "bypass", label: "Gastric Bypass", terms: ["bypass", "roux"] },
  { id: "sadi", label: "SADI/SIPS", terms: ["sadi", "sips", "duodenal"] },
  { id: "band", label: "Gastric Band", terms: ["band", "lap band", "lap-band"] },
  { id: "balloon", label: "Gastric Balloon", terms: ["balloon", "orbera", "spatz", "allurion"] },
];

function getSectionTag(p: ShopifyProduct): string {
  const pt = p.productType;
  const h = p.handle;
  const tags = p.tags.map((tag) => tag.toLowerCase());
  const hasTag = (tag: string) => tags.includes(tag.toLowerCase());
  const hasAnyTag = (...values: string[]) => values.some(hasTag);

  if (pt === "Vitamin Kits" || pt === "Vitamins & Supplements") {
    if (h.includes("starter-kit") || hasTag("Procedure Starter Kits")) return "type-preop-kit";
    if (h.includes("90-day") || h.includes("90days") || hasTag("Procedure Maintenance Kits")) return "type-long-term-kit";
    if (hasAnyTag("Multivitamins", "ADEK Multivitamins")) return "type-multivitamin";
    if (hasTag("Calcium")) return "type-calcium";
    if (hasAnyTag("B12", "Vitamin D")) return "type-b12-vitamin-d";
    if (hasAnyTag("Iron", "Biotin")) return "type-other-vitamin";
    return "type-other";
  }

  if (pt === "Pre-op Diet" || pt === "Diet Kits") {
    if (h.includes("clear-liquid") || h.includes("post-op") || hasTag("Post-Op Diet Kits")) return "type-clear-liquid";
    return "type-preop-diet";
  }

  if (pt === "Multivitamins") return "type-multivitamin";
  if (pt === "Calcium") return "type-calcium";
  if (pt === "B12" || pt === "D Vitamins") return "type-b12-vitamin-d";
  if (pt === "Iron") return "type-iron";
  if (pt === "Other Vitamins") return "type-other-vitamin";
  if (pt === "Bars VLC" || pt === "Bars Crunchy" || hasAnyTag("Protein Bars", "Protein Bars - Very Low Carb", "Protein Bars - Crunchy")) return "type-bar";
  if (pt === "Smoothies" || pt === "Shakes & Puddings" || hasAnyTag("Smoothies", "Shakes & Puddings")) return "type-shake";
  if (pt === "Drinks-Cold" || pt === "Drinks-Hot" || pt === "Protein Drinks" || hasAnyTag("Cold Drinks", "Hot Drinks")) return "type-drink";
  if (pt === "Protein Chips" || pt === "Protein Snacks" || hasTag("Protein Chips")) return "type-chip";
  if (["Pasta & Potatoes", "Breakfast", "Soups", "Snacks", "Entrees", "Meals & Soups"].includes(pt) || hasAnyTag("Breakfast", "Soups", "Pasta & Potatoes")) return "type-snack";
  if (pt === "Services") return "type-service";
  return "type-other";
}

function fmtPrice(amount: string, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(parseFloat(amount));
}

function conciseDescription(product: ShopifyProduct): string | null {
  const description = product.description?.trim();
  if (!description) return null;
  if (description.includes("Imported from the JourneyLite shop category")) return null;
  if (description.startsWith("A JourneyLite ")) return null;
  return description;
}

function productEyebrow(product: ShopifyProduct): string {
  const tag = getSectionTag(product);
  if (tag === "type-preop-kit") return "Starter kit";
  if (tag === "type-long-term-kit") return "90-day refill";
  if (tag === "type-preop-diet") return "Pre-op diet";
  if (tag === "type-clear-liquid") return "Post-op diet";
  if (tag === "type-multivitamin") return "Multivitamin";
  if (tag === "type-calcium") return "Calcium";
  if (tag === "type-b12-vitamin-d") return "B12 / D";
  if (tag === "type-other-vitamin" || tag === "type-iron") return "Supplement";
  if (tag === "type-shake") return "Shake / pudding";
  if (tag === "type-bar") return "Protein bar";
  if (tag === "type-drink") return "Protein drink";
  if (tag === "type-chip") return "Protein snack";
  if (tag === "type-snack") return "Meal";
  if (tag === "type-service") return "Service";
  return product.productType || "Product";
}

function matchesProcedure(product: ShopifyProduct, procedureId: string): boolean {
  const procedure = PROCEDURE_OPTIONS.find((option) => option.id === procedureId);
  if (!procedure || procedure.id === "all") return true;
  const haystack = `${product.title} ${product.handle} ${product.productType} ${product.tags.join(" ")}`.toLowerCase();
  return procedure.terms.some((term) => haystack.includes(term));
}

function spanFor(index: number, total: number, cols: number): number {
  if (total <= cols) return 1;
  const orphans = total % cols;
  if (orphans === 0) return 1;
  const orphanStart = total - orphans;
  if (index < orphanStart) return 1;
  return 1;
}

function BuyBtn({
  variantId,
  available,
  label = "Add",
}: {
  variantId: string;
  available: boolean;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!available) {
    return (
      <button disabled style={disabledButtonStyle}>
        Out of stock
      </button>
    );
  }

  function handleBuy(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setError(null);
    startTransition(async () => {
      const cartId = window.localStorage.getItem(CART_ID_KEY);
      const res = await addToCart(variantId, cartId);
      if (res.error) setError(res.error);
      else {
        if (res.cartId) window.localStorage.setItem(CART_ID_KEY, res.cartId);
        if (res.checkoutUrl) window.localStorage.setItem(CART_URL_KEY, res.checkoutUrl);
        if (typeof res.totalQuantity === "number") {
          window.localStorage.setItem(CART_QTY_KEY, String(res.totalQuantity));
        }
        window.dispatchEvent(new Event(CART_UPDATED_EVENT));
      }
    });
  }

  return (
    <div>
      <button className="jls-buybtn" disabled={isPending} onClick={handleBuy} style={buyButtonStyle}>
        <Plus size={14} />
        {isPending ? "Adding..." : label}
      </button>
      {error ? <p style={{ color: "#b91c1c", fontSize: 11, margin: "5px 0 0" }}>{error}</p> : null}
    </div>
  );
}

function ProductPlaceholder({ compact = false }: { compact?: boolean }) {
  return (
    <div aria-hidden="true" style={{ alignItems: "center", display: "flex", height: "100%", justifyContent: "center", width: "100%" }}>
      <div style={{ alignItems: "center", background: "linear-gradient(180deg, #ffffff 0%, #edf4ef 100%)", border: "1px solid #c9d8cf", borderRadius: compact ? 10 : 14, boxShadow: "0 10px 24px rgba(10, 75, 56, 0.08)", display: "flex", flexDirection: "column", height: compact ? 50 : 82, justifyContent: "center", position: "relative", width: compact ? 38 : 58 }}>
        <div style={{ background: "#0a4b38", borderRadius: "7px 7px 3px 3px", height: compact ? 8 : 12, left: "50%", position: "absolute", top: compact ? -6 : -9, transform: "translateX(-50%)", width: compact ? 21 : 32 }} />
        <div style={{ background: "#ffffff", border: "1px solid #d6e2dc", borderRadius: 6, height: compact ? 22 : 34, width: compact ? 25 : 39 }} />
        <div style={{ background: "#0a4b38", borderRadius: 999, height: 4, marginTop: compact ? 4 : 7, width: compact ? 20 : 30 }} />
      </div>
    </div>
  );
}

function PCard({ product, span = 1, onSelect }: { product: ShopifyProduct; span?: number; onSelect: (product: ShopifyProduct) => void }) {
  const variant = product.variants.edges[0]?.node ?? null;
  const price = product.priceRange.minVariantPrice;
  const maxPrice = product.priceRange.maxVariantPrice;
  const hasRange = price.amount !== maxPrice.amount;
  const description = conciseDescription(product);
  const image = product.images.edges[0]?.node ?? null;
  const isFmlaPaperwork = /fmla|short-term|disability|paperwork/i.test(`${product.title} ${product.handle}`);

  return (
    <article className="jls-product-card" onClick={() => onSelect(product)} onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(product);
      }
    }} role="button" tabIndex={0} style={{ ...productCardStyle, gridColumn: span > 1 ? `span ${span}` : undefined }}>
      <div style={productImageWrapStyle}>
        {image ? (
          <Image alt={image.altText || product.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 22vw" src={image.url} style={{ objectFit: "contain", padding: 14 }} />
        ) : (
          <ProductPlaceholder />
        )}
      </div>
      <div style={{ display: "flex", flex: 1, flexDirection: "column", padding: 14 }}>
        <span style={badgeStyle}>{productEyebrow(product)}</span>
        <h3 style={{ color: "#111f18", fontSize: 14, lineHeight: 1.3, margin: "0 0 5px" }}>{product.title}</h3>
        {description ? <p style={descriptionStyle}>{description}</p> : <span style={{ flex: 1 }} />}
        <div style={productFooterStyle}>
          <strong style={{ fontSize: 14 }}>{hasRange ? "From " : ""}{fmtPrice(price.amount, price.currencyCode)}</strong>
          {variant && isFmlaPaperwork ? (
            variant.availableForSale ? (
              <Link href={`/fmla-short-term-disability-paperwork?variantId=${encodeURIComponent(variant.id)}`} onClick={(event) => event.stopPropagation()} style={formGateStyle}>
                <FileText size={13} />
                Form first
              </Link>
            ) : (
              <BuyBtn available={false} variantId={variant.id} />
            )
          ) : variant ? (
            <BuyBtn available={variant.availableForSale} variantId={variant.id} />
          ) : null}
        </div>
      </div>
    </article>
  );
}

function PGrid({
  products,
  cols,
  defaultShow = 4,
  id,
  label,
  showMore,
  toggle,
  onSelect,
}: {
  products: ShopifyProduct[];
  cols: 3 | 4 | 5;
  defaultShow?: number;
  id: string;
  label: string;
  showMore: Record<string, boolean>;
  toggle: (id: string) => void;
  onSelect: (product: ShopifyProduct) => void;
}) {
  if (products.length === 0) return null;
  const expanded = showMore[id] ?? false;
  const visible = expanded ? products : products.slice(0, defaultShow);
  const hidden = products.length - visible.length;

  return (
    <>
      <div className={`jls-grid jls-g${cols}`} style={{ display: "grid", gap: 14, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {visible.map((product, index) => (
          <PCard key={product.id} onSelect={onSelect} product={product} span={spanFor(index, visible.length, cols)} />
        ))}
      </div>
      {!expanded && hidden > 0 ? (
        <button onClick={() => toggle(id)} style={showMoreBtn}>
          <ChevronDown size={14} />
          Show {hidden} more {label}
        </button>
      ) : null}
      {expanded && products.length > defaultShow ? (
        <button onClick={() => toggle(id)} style={showMoreBtn}>
          Show less
        </button>
      ) : null}
    </>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ borderBottom: "1px solid #dfe6e2", marginBottom: 16, paddingBottom: 10 }}>
      <h2 style={{ color: "#071b13", fontSize: 19, fontWeight: 800, margin: 0 }}>{title}</h2>
      {subtitle ? <p style={{ color: "#596960", fontSize: 13, margin: "4px 0 0" }}>{subtitle}</p> : null}
    </div>
  );
}

export function ShopClient({ products }: { products: ShopifyProduct[] }) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProcedure, setSelectedProcedure] = useState("all");
  const [showMore, setShowMore] = useState<Record<string, boolean>>({});
  const [cartUrl, setCartUrl] = useState<string | null>(null);
  const [cartQty, setCartQty] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(null);

  const toggle = useCallback((id: string) => setShowMore((prev) => ({ ...prev, [id]: !prev[id] })), []);

  useEffect(() => {
    function syncCartState() {
      setCartUrl(window.localStorage.getItem(CART_URL_KEY));
      setCartQty(Number(window.localStorage.getItem(CART_QTY_KEY) ?? "0") || 0);
    }

    syncCartState();
    window.addEventListener(CART_UPDATED_EVENT, syncCartState);
    window.addEventListener("storage", syncCartState);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCartState);
      window.removeEventListener("storage", syncCartState);
    };
  }, []);

  const byTag = (tag: string) => products.filter((product) => getSectionTag(product) === tag);
  const starterKits = byTag("type-preop-kit");
  const longTermKits = byTag("type-long-term-kit");
  const preOpDiet = byTag("type-preop-diet");
  const clearLiquid = byTag("type-clear-liquid");
  const multivitamins = byTag("type-multivitamin");
  const calcium = byTag("type-calcium");
  const b12VitD = byTag("type-b12-vitamin-d");
  const supplements = [...byTag("type-iron"), ...byTag("type-other-vitamin")];
  const protein = [...byTag("type-shake"), ...byTag("type-bar"), ...byTag("type-drink"), ...byTag("type-chip"), ...clearLiquid];
  const meals = byTag("type-snack");
  const services = byTag("type-service");

  const categories = [
    { id: "starter", label: "Starter Kits", icon: Package, products: starterKits },
    { id: "preop", label: "Pre-op Diet", icon: ShoppingCart, products: preOpDiet },
    { id: "vitamins", label: "Vitamins", icon: Pill, products: [...multivitamins, ...calcium, ...b12VitD, ...supplements, ...longTermKits] },
    { id: "protein", label: "Protein", icon: Utensils, products: protein },
    { id: "meals", label: "Meals", icon: Utensils, products: meals },
    { id: "services", label: "Medical Services", icon: Stethoscope, products: services },
    { id: "forms", label: "Forms & Admin", icon: ClipboardList, products: services.filter((product) => /form|admin|fmla|paperwork|disability/i.test(`${product.title} ${product.handle}`)) },
  ];

  const selectedProcedureLabel = PROCEDURE_OPTIONS.find((option) => option.id === selectedProcedure)?.label ?? "Not selected";
  const activeProducts = category === "all" ? products : categories.find((item) => item.id === category)?.products ?? products;
  const searchTerm = search.trim().toLowerCase();
  const searchedProducts = activeProducts.filter((product) => {
    if (!matchesProcedure(product, selectedProcedure)) return false;
    if (!searchTerm) return true;
    return `${product.title} ${product.productType} ${product.tags.join(" ")}`.toLowerCase().includes(searchTerm);
  });

  const productWithImage = (items: ShopifyProduct[]) => items.find((product) => Boolean(product.images.edges[0]?.node));
  const heroProducts = [
    productWithImage([...multivitamins, ...starterKits, ...products]),
    productWithImage([...protein, ...products]),
    productWithImage([...calcium, ...longTermKits, ...products]),
  ].filter(Boolean) as ShopifyProduct[];
  const cartPreview = [multivitamins[0] ?? starterKits[0], protein[0], calcium[0] ?? longTermKits[0]].filter(Boolean) as ShopifyProduct[];
  const suggestedProducts = [protein[1] ?? protein[0], preOpDiet[0] ?? meals[0], supplements[0] ?? b12VitD[0]]
    .filter((product): product is ShopifyProduct => Boolean(product))
    .filter((product) => !cartPreview.some((cartItem) => cartItem.id === product.id))
    .slice(0, 2);
  const cartPreviewTotal = cartPreview.reduce((total, product) => total + Number(product.priceRange.minVariantPrice.amount), 0);
  const checkoutHref = cartUrl ?? (SHOPIFY_STORE_URL ? `${SHOPIFY_STORE_URL}/cart` : "/shop");
  const showSearchResults = category !== "all" || searchTerm.length > 0 || selectedProcedure !== "all";

  const collections = [
    { badge: "Best seller", title: "Essential Vitamins", copy: "Daily vitamins recommended by our care team.", product: multivitamins[0] ?? longTermKits[0] ?? starterKits[0] },
    { badge: "Popular", title: "Protein Essentials", copy: "High-quality protein to support healing and weight loss.", product: protein[0] },
    { badge: "Care team pick", title: "Post-Op Essentials", copy: "Top products for a smooth recovery and lifelong success.", product: longTermKits[0] ?? calcium[0] },
    { badge: "Staff favorite", title: "Hydration & Wellness", copy: "Stay hydrated and feel your best every day.", product: clearLiquid[0] ?? protein[1] },
  ].filter((item) => item.product) as Array<{ badge: string; title: string; copy: string; product: ShopifyProduct }>;

  const sections = [
    { id: "starter-kits", title: "Starter Kits", subtitle: "Procedure-specific kits for the first phase of care", products: starterKits, cols: 5 as const },
    { id: "vitamins", title: "Vitamins & Supplements", subtitle: "Daily bariatric essentials recommended by your care team", products: [...multivitamins, ...calcium, ...b12VitD, ...supplements, ...longTermKits], cols: 4 as const },
    { id: "protein", title: "Protein & Nutrition", subtitle: "Shakes, bars, drinks, and recovery nutrition", products: protein, cols: 4 as const },
    { id: "meals", title: "Meals", subtitle: "Bariatric-friendly meals and snacks", products: meals, cols: 3 as const },
    { id: "services", title: "Medical Services", subtitle: "Administrative fees and visit payments", products: services, cols: 3 as const },
  ].filter((section) => section.products.length > 0);

  return (
    <>
      <style>{`
        .jls-shop-shell { min-height: 100vh; background: #f7f8f6; color: #071b13; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .jls-store-grid { display: grid; grid-template-columns: minmax(0, 1fr) 384px; gap: 0; width: 100%; padding: 0 0 0 24px; }
        .jls-search:focus-within { border-color: #0a4b38; box-shadow: 0 0 0 3px rgba(10, 75, 56, 0.1); }
        .jls-nav-link:hover, .jls-icon-button:hover, .jls-category:hover, .jls-collection:hover { border-color: #adc8b9 !important; transform: translateY(-1px); }
        .jls-product-card:hover { border-color: #adc8b9 !important; box-shadow: 0 10px 24px rgba(13, 61, 36, 0.08); transform: translateY(-1px); }
        .jls-buybtn:hover:not(:disabled), .jls-checkout:hover, .jls-hero-cta:hover { background: #063a2a !important; }
        .jls-side-cart { align-self: stretch; background: #fff; border-left: 1px solid #e1e7e3; box-shadow: -16px 0 34px rgba(12, 42, 30, 0.08); position: sticky; top: 0; }
        .jls-g5 { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }
        .jls-g4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        .jls-g3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        @media (max-width: 1320px) { .jls-g5 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; } }
        @media (max-width: 1180px) { .jls-store-grid { grid-template-columns: 1fr; padding-right: 24px; } .jls-side-cart { border: 1px solid #e1e7e3; box-shadow: none; position: static; } .jls-actions-extra { display: none !important; } }
        @media (max-width: 920px) { .jls-main-header { grid-template-columns: 1fr !important; } .jls-hero { grid-template-columns: 1fr !important; padding: 32px !important; } .jls-g5, .jls-g4, .jls-g3 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } .jls-product-card { grid-column: auto !important; } }
        @media (max-width: 640px) { .jls-store-grid { padding: 0 14px; } .jls-top-strip-inner, .jls-main-header, .jls-nav-inner { padding-left: 16px !important; padding-right: 16px !important; } .jls-g5, .jls-g4, .jls-g3, .jls-category-grid, .jls-collections, .jls-trust-grid { grid-template-columns: 1fr !important; } .jls-hero { margin-left: -14px !important; margin-right: -14px !important; padding: 24px !important; } .jls-hero-title { font-size: 34px !important; } .jls-side-cart { display: none; } }
      `}</style>

      <div className="jls-shop-shell">
        <TopStrip />
        <Header checkoutHref={checkoutHref} cartCount={cartQty || cartPreview.length} cartTotal={cartPreviewTotal} search={search} selectedProcedure={selectedProcedure} setSearch={setSearch} setSelectedProcedure={(value) => {
          setSelectedProcedure(value);
          if (value !== "all") setCategory("all");
        }} />

        <div className="jls-store-grid">
          <main>
            <Hero products={heroProducts} />
            <CategoryTiles categories={categories} selected={category} setSelected={setCategory} />

            {showSearchResults ? (
              <section id="featured" style={{ padding: "20px 0 8px" }}>
                <SectionHead title={selectedProcedure !== "all" ? `${selectedProcedureLabel} Products` : category === "all" ? "Search Results" : categories.find((item) => item.id === category)?.label ?? "Products"} subtitle={`${searchedProducts.length} matching item${searchedProducts.length === 1 ? "" : "s"}`} />
                <PGrid cols={4} defaultShow={12} id="search-results" label="products" onSelect={setSelectedProduct} products={searchedProducts} showMore={showMore} toggle={toggle} />
              </section>
            ) : (
              <>
                <section id="featured" style={{ padding: "20px 0 8px" }}>
                  <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <h2 style={blockTitleStyle}>Featured Collections</h2>
                    <a href="#starter-kits" style={viewAllStyle}>View all collections →</a>
                  </div>
                  <div className="jls-collections" style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
                    {collections.map((collection) => <CollectionCard key={collection.title} onSelect={setSelectedProduct} {...collection} />)}
                  </div>
                </section>

                {sections.map((section) => (
                  <section id={section.id} key={section.id} style={{ padding: "22px 0 4px" }}>
                    <SectionHead subtitle={section.subtitle} title={section.title} />
                    <PGrid cols={section.cols} defaultShow={section.cols === 5 ? 10 : section.cols === 4 ? 8 : 6} id={section.id} label="products" onSelect={setSelectedProduct} products={section.products} showMore={showMore} toggle={toggle} />
                  </section>
                ))}
              </>
            )}

            <TrustBar />
          </main>

          <aside className="jls-side-cart">
            <CartPanel cartPreview={cartPreview} checkoutHref={checkoutHref} suggestedProducts={suggestedProducts} total={cartPreviewTotal} />
          </aside>
        </div>

        <ShopFooter />
        {selectedProduct ? <ProductDetailModal onClose={() => setSelectedProduct(null)} product={selectedProduct} /> : null}
      </div>
    </>
  );
}

function TopStrip() {
  return (
    <div style={{ background: "#003f2d", color: "#fff" }}>
      <div className="jls-top-strip-inner" style={{ alignItems: "center", display: "grid", gridTemplateColumns: "1fr auto 1fr", padding: "10px 24px", width: "100%" }}>
        <Link href="/" style={{ alignItems: "center", color: "#fff", display: "inline-flex", fontSize: 13, fontWeight: 700, gap: 8, textDecoration: "none" }}>
          <ArrowLeft size={15} />
          Return to Main Site
        </Link>
        <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Bariatric and Medical Weight Loss Care You Can Trust</p>
        <span />
      </div>
    </div>
  );
}

function Header({
  checkoutHref,
  cartCount,
  cartTotal,
  search,
  selectedProcedure,
  setSearch,
  setSelectedProcedure,
}: {
  checkoutHref: string;
  cartCount: number;
  cartTotal: number;
  search: string;
  selectedProcedure: string;
  setSearch: (value: string) => void;
  setSelectedProcedure: (value: string) => void;
}) {
  const [procedureOpen, setProcedureOpen] = useState(false);
  const navItems = ["Starter Kits", "Vitamins & Supplements", "Protein & Nutrition", "Meals", "Medical Services", "Forms & Admin"];
  const navTargets = ["starter-kits", "vitamins", "protein", "meals", "services", "services"];
  const selectedProcedureLabel = PROCEDURE_OPTIONS.find((option) => option.id === selectedProcedure)?.label ?? "Not selected";

  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #e0e6e2" }}>
      <div className="jls-main-header" style={{ alignItems: "center", display: "grid", gap: 24, gridTemplateColumns: "260px minmax(280px, 1fr) auto", padding: "18px 24px", width: "100%" }}>
        <Link href="/" style={{ display: "inline-flex" }}>
          <Image alt="JourneyLite Bariatric Physicians" height={160} priority src="/journeylite-logo.svg" style={{ height: "auto", width: 198 }} width={560} />
        </Link>

        <label className="jls-search" style={{ alignItems: "center", background: "#fff", border: "1px solid #ccd8d1", borderRadius: 7, display: "flex", gap: 12, minHeight: 47, padding: "0 16px" }}>
          <Search size={20} />
          <input aria-label="Search products" onChange={(event) => setSearch(event.target.value)} placeholder="Search products, categories, or services..." style={{ border: 0, flex: 1, font: "inherit", outline: "none" }} value={search} />
        </label>

        <div style={{ alignItems: "center", display: "flex", gap: 18, justifyContent: "flex-end" }}>
          <div className="jls-actions-extra" style={{ position: "relative" }}>
            <button aria-expanded={procedureOpen} aria-haspopup="listbox" className="jls-icon-button" onClick={() => setProcedureOpen((open) => !open)} style={headerActionStyle}>
              <ClipboardList size={20} />
              <span><strong>Procedure</strong><br />{selectedProcedureLabel}</span>
              <ChevronDown size={14} />
            </button>
            {procedureOpen ? (
              <div role="listbox" style={{ background: "#fff", border: "1px solid #dbe6df", borderRadius: 9, boxShadow: "0 16px 38px rgba(12, 42, 30, 0.14)", minWidth: 210, padding: 6, position: "absolute", right: 0, top: "calc(100% + 12px)", zIndex: 20 }}>
                {PROCEDURE_OPTIONS.map((option) => {
                  const active = option.id === selectedProcedure;
                  return (
                    <button aria-selected={active} key={option.id} onClick={() => {
                      setSelectedProcedure(option.id);
                      setProcedureOpen(false);
                    }} role="option" style={{ alignItems: "center", background: active ? "#eef7f2" : "#fff", border: 0, borderRadius: 7, color: "#071b13", cursor: "pointer", display: "flex", font: "inherit", fontSize: 13, fontWeight: active ? 800 : 600, justifyContent: "space-between", padding: "10px 11px", textAlign: "left", width: "100%" }}>
                      {option.label}
                      {active ? <span style={{ background: "#0a4b38", borderRadius: 999, height: 7, width: 7 }} /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
          <a className="jls-icon-button jls-actions-extra" href={SHOPIFY_STORE_URL ? `${SHOPIFY_STORE_URL}/account` : "#"} style={headerActionStyle}><UserRound size={20} /><span>Account</span></a>
          <a href={checkoutHref} style={{ alignItems: "center", color: "#071b13", display: "inline-flex", fontSize: 14, fontWeight: 800, gap: 10, textDecoration: "none" }}>
            <span style={{ position: "relative" }}>
              <ShoppingCart size={28} />
              <span style={{ background: "#0a4b38", borderRadius: 999, color: "#fff", fontSize: 11, fontWeight: 800, minWidth: 19, padding: "2px 6px", position: "absolute", right: -11, textAlign: "center", top: -9 }}>{cartCount}</span>
            </span>
            {cartTotal ? `$${cartTotal.toFixed(2)}` : "Cart"}
          </a>
        </div>
      </div>

      <nav style={{ borderTop: "1px solid #edf1ee" }}>
        <div className="jls-nav-inner" style={{ alignItems: "center", display: "flex", gap: 18, overflowX: "auto", padding: "11px 24px", width: "100%" }}>
          <button className="jls-nav-link" style={{ ...navButtonStyle, border: "1px solid #ccd8d1", borderRadius: 6 }}><Menu size={16} /> Shop by Category</button>
          {navItems.map((item, index) => (
            <a className="jls-nav-link" href={`#${navTargets[index]}`} key={item} style={navButtonStyle}>
              {item}
              {index > 0 ? <ChevronDown size={13} /> : null}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

function Hero({ products }: { products: ShopifyProduct[] }) {
  const fallbackVisuals = [
    { alt: "Bariatric vitamin bottle", url: "/legacy-blog/495__BA-dark-cherry-MVI-chew.jpg.webp" },
    { alt: "Bariatric vitamin D capsules", url: "/legacy-blog/495__BA-vitamin-d-capsule-5000-IU-60-ct-500x500.jpg.webp" },
    { alt: "Procedure-specific vitamin kit", url: "/legacy-blog/vitamins__SADI-600x600-1.jpg.webp" },
  ];
  const productVisuals = products
    .map((product) => product.images.edges[0]?.node)
    .filter((image): image is NonNullable<typeof image> => Boolean(image))
    .map((image) => ({ alt: image.altText || "JourneyLite shop product", url: image.url }));
  const uniqueVisuals = [...productVisuals, ...fallbackVisuals].filter((image, index, images) => images.findIndex((item) => item.url === image.url) === index).slice(0, 3);

  return (
    <section className="jls-hero" style={{ background: "linear-gradient(90deg, #fff 0%, #f6f5f1 58%, #ebe6dd 100%)", borderBottom: "1px solid #e1e6e2", display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr", margin: "0 -24px", minHeight: 300, padding: "44px 72px 34px" }}>
      <div style={{ alignSelf: "center", maxWidth: 510 }}>
        <h1 className="jls-hero-title" style={{ color: "#052b1f", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 48, fontWeight: 400, lineHeight: 1.02, margin: "0 0 18px" }}>Everything you need for every step of your journey.</h1>
        <p style={{ color: "#3f4d46", fontSize: 17, lineHeight: 1.55, margin: "0 0 24px" }}>Premium vitamins, nutrition, and services chosen and recommended by our bariatric care team.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <a className="jls-hero-cta" href="#featured" style={{ background: "#004633", borderRadius: 7, color: "#fff", fontSize: 14, fontWeight: 800, padding: "13px 28px", textDecoration: "none" }}>Shop Products</a>
          <a href="#starter-kits" style={{ background: "#fff", border: "1px solid #ccd8d1", borderRadius: 7, color: "#0a2e21", fontSize: 14, fontWeight: 800, padding: "12px 26px", textDecoration: "none" }}>View Starter Kits</a>
        </div>
      </div>
      <div style={{ alignItems: "end", display: "flex", justifyContent: "center", minHeight: 275, position: "relative" }}>
        {uniqueVisuals.map((image, index) => {
          return (
            <div key={image.url} style={{ height: index === 1 ? 255 : 185, marginLeft: index === 0 ? 0 : -14, position: "relative", width: index === 1 ? 210 : 145, zIndex: index === 1 ? 2 : 1 }}>
              <Image alt={image.alt} fill sizes="220px" src={image.url} style={{ objectFit: "contain" }} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CategoryTiles({
  categories,
  selected,
  setSelected,
}: {
  categories: Array<{ id: string; label: string; icon: ComponentType<{ size?: number; strokeWidth?: number }>; products: ShopifyProduct[] }>;
  selected: string;
  setSelected: (value: string) => void;
}) {
  return (
    <section style={{ padding: "18px 0 8px" }}>
      <h2 style={blockTitleStyle}>Shop by Category</h2>
      <div className="jls-category-grid" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
        {categories.map((tile) => {
          const Icon = tile.icon;
          const active = selected === tile.id;
          return (
            <button className="jls-category" key={tile.id} onClick={() => setSelected(active ? "all" : tile.id)} style={{ alignItems: "center", background: active ? "#eef7f2" : "#fff", border: active ? "2px solid #0a4b38" : "1px solid #dfe6e2", borderRadius: 8, cursor: "pointer", display: "flex", flexDirection: "column", gap: 10, minHeight: 94, padding: 16 }}>
              <Icon size={30} strokeWidth={1.5} />
              <span style={{ fontSize: 13, fontWeight: 800 }}>{tile.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CollectionCard({ badge, title, copy, product, onSelect }: { badge: string; title: string; copy: string; product: ShopifyProduct; onSelect: (product: ShopifyProduct) => void }) {
  const image = product.images.edges[0]?.node;
  return (
    <button className="jls-collection" onClick={() => onSelect(product)} style={{ background: "#fff", border: "1px solid #dfe6e2", borderRadius: 8, color: "inherit", cursor: "pointer", display: "block", font: "inherit", overflow: "hidden", padding: 0, position: "relative", textAlign: "left", textDecoration: "none" }}>
      <span style={{ background: "#00624b", borderRadius: 4, color: "#fff", fontSize: 10, fontWeight: 800, left: 10, padding: "4px 7px", position: "absolute", textTransform: "uppercase", top: 10, zIndex: 2 }}>{badge}</span>
      <div style={{ background: "#f6f8f6", height: 120, position: "relative" }}>
        {image ? <Image alt={image.altText || product.title} fill sizes="260px" src={image.url} style={{ objectFit: "contain", padding: 12 }} /> : <ProductPlaceholder />}
      </div>
      <div style={{ padding: 14 }}>
        <h3 style={{ fontSize: 14, margin: "0 0 4px" }}>{title}</h3>
        <p style={{ color: "#4f5d55", fontSize: 12, lineHeight: 1.35, margin: "0 0 10px" }}>{copy}</p>
        <span style={{ color: "#004633", fontSize: 12, fontWeight: 800 }}>Read more {">"}</span>
      </div>
    </button>
  );
}

function CartPanel({ cartPreview, checkoutHref, suggestedProducts, total }: { cartPreview: ShopifyProduct[]; checkoutHref: string; suggestedProducts: ShopifyProduct[]; total: number }) {
  return (
    <div style={{ background: "#fff", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 124px)", padding: "26px 22px" }}>
      <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
        <h2 style={{ fontSize: 19, margin: 0 }}>Your Cart ({cartPreview.length})</h2>
        <X size={20} />
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {cartPreview.map((product) => {
          const image = product.images.edges[0]?.node;
          const price = product.priceRange.minVariantPrice;
          return (
            <div key={product.id} style={{ borderBottom: "1px solid #edf1ee", display: "grid", gap: 12, gridTemplateColumns: "76px 1fr", paddingBottom: 14 }}>
              <div style={{ background: "#f6f8f6", borderRadius: 7, minHeight: 76, position: "relative" }}>
                {image ? <Image alt={image.altText || product.title} fill sizes="76px" src={image.url} style={{ objectFit: "contain", padding: 8 }} /> : <ProductPlaceholder compact />}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.25, margin: "0 0 5px" }}>{product.title}</p>
                <p style={{ color: "#5d6b64", fontSize: 12, margin: "0 0 8px" }}>{productEyebrow(product)}</p>
                <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong style={{ fontSize: 13 }}>{fmtPrice(price.amount, price.currencyCode)}</strong>
                  <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
                    <button style={qtyButtonStyle}><Minus size={12} /></button>
                    <span style={{ fontSize: 13 }}>1</span>
                    <button style={qtyButtonStyle}><Plus size={12} /></button>
                    <Trash2 size={14} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background: "#eef4f1", borderRadius: 7, margin: "16px 0", padding: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 800, margin: "0 0 8px" }}>You&apos;re $20.03 away from free shipping!</p>
        <div style={{ background: "#fff", borderRadius: 999, height: 7, overflow: "hidden" }}><div style={{ background: "#00624b", height: "100%", width: "65%" }} /></div>
      </div>
      <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <strong>Estimated Total</strong>
        <strong>${total.toFixed(2)}</strong>
      </div>
      <a className="jls-checkout" href={checkoutHref} style={{ alignItems: "center", background: "#004633", borderRadius: 7, color: "#fff", display: "flex", fontSize: 15, fontWeight: 800, gap: 8, justifyContent: "center", padding: "14px 18px", textDecoration: "none" }}><LockKeyhole size={16} /> Checkout Securely</a>
      <a href={checkoutHref} style={{ color: "#004633", display: "block", fontSize: 14, fontWeight: 800, marginTop: 14, textAlign: "center", textDecoration: "none" }}>View Cart</a>
      {suggestedProducts.length > 0 ? (
        <div style={{ borderTop: "1px solid #edf1ee", marginTop: "auto", paddingTop: 18 }}>
          <h3 style={{ fontSize: 15, margin: "0 0 12px" }}>Suggested for you</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {suggestedProducts.map((product) => {
              const image = product.images.edges[0]?.node;
              const variant = product.variants.edges[0]?.node;
              const price = product.priceRange.minVariantPrice;
              const isFmlaPaperwork = /fmla|short-term|disability|paperwork/i.test(`${product.title} ${product.handle}`);

              return (
                <div key={product.id} style={{ alignItems: "center", border: "1px solid #e3e9e5", borderRadius: 8, display: "grid", gap: 10, gridTemplateColumns: "56px 1fr auto", padding: 10 }}>
                  <div style={{ background: "#f6f8f6", borderRadius: 6, height: 56, position: "relative" }}>
                    {image ? <Image alt={image.altText || product.title} fill sizes="56px" src={image.url} style={{ objectFit: "contain", padding: 6 }} /> : <ProductPlaceholder compact />}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.25, margin: "0 0 3px" }}>{product.title}</p>
                    <p style={{ color: "#52645a", fontSize: 11, margin: 0 }}>{fmtPrice(price.amount, price.currencyCode)}</p>
                  </div>
                  {variant && isFmlaPaperwork ? (
                    <Link href={`/fmla-short-term-disability-paperwork?variantId=${encodeURIComponent(variant.id)}`} style={formGateStyle}>Form</Link>
                  ) : variant ? (
                    <BuyBtn available={variant.availableForSale} label="Add" variantId={variant.id} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProductDetailModal({ product, onClose }: { product: ShopifyProduct; onClose: () => void }) {
  const variant = product.variants.edges[0]?.node ?? null;
  const price = product.priceRange.minVariantPrice;
  const image = product.images.edges[0]?.node ?? null;
  const description = conciseDescription(product) ?? "Care-team selected bariatric product for your nutrition, recovery, or administrative care needs.";
  const isFmlaPaperwork = /fmla|short-term|disability|paperwork/i.test(`${product.title} ${product.handle}`);

  return (
    <div aria-modal="true" role="dialog" style={{ alignItems: "center", background: "rgba(4, 20, 14, 0.55)", display: "flex", inset: 0, justifyContent: "center", padding: 20, position: "fixed", zIndex: 50 }}>
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 24px 70px rgba(0,0,0,0.24)", display: "grid", gap: 0, gridTemplateColumns: "minmax(260px, 0.8fr) minmax(300px, 1fr)", maxWidth: 860, overflow: "hidden", width: "100%" }}>
        <div style={{ background: "#f4f7f5", minHeight: 360, position: "relative" }}>
          {image ? <Image alt={image.altText || product.title} fill sizes="420px" src={image.url} style={{ objectFit: "contain", padding: 34 }} /> : <ProductPlaceholder />}
        </div>
        <div style={{ padding: 28, position: "relative" }}>
          <button aria-label="Close product details" onClick={onClose} style={{ alignItems: "center", background: "#fff", border: "1px solid #dfe6e2", borderRadius: 999, cursor: "pointer", display: "inline-flex", height: 34, justifyContent: "center", position: "absolute", right: 18, top: 18, width: 34 }}>
            <X size={18} />
          </button>
          <span style={badgeStyle}>{productEyebrow(product)}</span>
          <h2 style={{ color: "#071b13", fontSize: 28, lineHeight: 1.15, margin: "8px 44px 10px 0" }}>{product.title}</h2>
          <p style={{ color: "#46564e", fontSize: 15, lineHeight: 1.55, margin: "0 0 18px" }}>{description}</p>
          <div style={{ alignItems: "center", borderTop: "1px solid #e5ece8", display: "flex", gap: 14, justifyContent: "space-between", paddingTop: 18 }}>
            <strong style={{ fontSize: 22 }}>{fmtPrice(price.amount, price.currencyCode)}</strong>
            {variant && isFmlaPaperwork ? (
              <Link href={`/fmla-short-term-disability-paperwork?variantId=${encodeURIComponent(variant.id)}`} style={formGateStyle}>
                <FileText size={15} />
                Complete form before cart
              </Link>
            ) : variant ? (
              <BuyBtn available={variant.availableForSale} label="Add to cart" variantId={variant.id} />
            ) : null}
          </div>
          {isFmlaPaperwork ? <p style={{ background: "#eef7f2", borderRadius: 8, color: "#113d2d", fontSize: 13, lineHeight: 1.45, margin: "18px 0 0", padding: 12 }}>Next step: complete the paperwork form first. After the form is submitted, you will be sent to payment for the $30 fee.</p> : null}
        </div>
      </div>
    </div>
  );
}

function TrustBar() {
  const items = [
    { icon: ShieldCheck, title: "Care You Can Trust", copy: "Recommended by our bariatric specialists" },
    { icon: Package, title: "Quality Products", copy: "Premium brands we stand behind" },
    { icon: Truck, title: "Fast & Reliable", copy: "Quick shipping on all orders" },
    { icon: Heart, title: "Questions? We're Here", copy: "Call (513) 682-4803 Mon-Fri 8am-5pm EST" },
  ];
  return (
    <div className="jls-trust-grid" style={{ background: "#f2f7f4", border: "1px solid #e0e8e3", borderRadius: 8, display: "grid", gap: 12, gridTemplateColumns: "repeat(4, minmax(0, 1fr))", margin: "20px 0 10px", padding: "14px 18px" }}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.title} style={{ alignItems: "center", display: "flex", gap: 12 }}>
            <Icon size={24} strokeWidth={1.5} />
            <div><p style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>{item.title}</p><p style={{ color: "#364a40", fontSize: 12, lineHeight: 1.35, margin: "2px 0 0" }}>{item.copy}</p></div>
          </div>
        );
      })}
    </div>
  );
}

function ShopFooter() {
  return (
    <footer style={{ background: "#003f2d", color: "#fff", marginTop: 12 }}>
      <div style={{ display: "grid", gap: 46, gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr", padding: "24px", width: "100%" }}>
        <div>
          <Link href="/" style={{ alignItems: "center", color: "#fff", display: "inline-flex", fontSize: 14, fontWeight: 800, gap: 8, textDecoration: "none" }}><ArrowLeft size={15} /> Return to Main Site</Link>
          <p style={{ color: "#c8ded4", fontSize: 13, lineHeight: 1.5, marginTop: 16 }}>Continue exploring our care, resources, and patient information.</p>
        </div>
        <FooterLinks title="Shop" links={["Starter Kits", "Vitamins & Supplements", "Protein & Nutrition", "Meals", "Medical Services", "Forms & Admin"]} />
        <FooterLinks title="Resources" links={["Patient Guides", "Nutrition Tips", "Recipes", "Blog"]} />
        <FooterLinks title="Help" links={["FAQs", "Shipping & Returns", "Contact Us", "Store Policies"]} />
        <div><h3 style={footerTitleStyle}>JourneyLite Store</h3><p style={{ color: "#d8e8df", fontSize: 13, lineHeight: 1.5 }}>Supporting your journey before, during, and after surgery.</p></div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 style={footerTitleStyle}>{title}</h3>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {links.map((link) => <li key={link} style={{ color: "#d8e8df", fontSize: 13, lineHeight: 1.5 }}>{link}</li>)}
      </ul>
    </div>
  );
}

const showMoreBtn: CSSProperties = {
  alignItems: "center",
  background: "transparent",
  border: "1px solid #c2d9cc",
  borderRadius: 8,
  color: "#3b6d4e",
  cursor: "pointer",
  display: "flex",
  fontFamily: "inherit",
  fontSize: 13,
  gap: 6,
  justifyContent: "center",
  margin: "12px 0 16px",
  padding: 10,
  width: "100%",
};

const productCardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #dfe6e2",
  borderRadius: 10,
  display: "flex",
  flexDirection: "column",
  minHeight: 260,
  minWidth: 0,
  overflow: "hidden",
  transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
};

const productImageWrapStyle: CSSProperties = {
  background: "#f6f8f6",
  borderBottom: "1px solid #edf2ee",
  height: 126,
  position: "relative",
};

const badgeStyle: CSSProperties = {
  alignSelf: "flex-start",
  background: "#00624b",
  borderRadius: 999,
  color: "#fff",
  fontSize: 10,
  fontWeight: 800,
  marginBottom: 9,
  padding: "3px 8px",
  textTransform: "uppercase",
};

const descriptionStyle: CSSProperties = {
  color: "#596960",
  display: "-webkit-box",
  flex: 1,
  fontSize: 12,
  lineHeight: 1.45,
  margin: "0 0 12px",
  overflow: "hidden",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
};

const productFooterStyle: CSSProperties = {
  alignItems: "center",
  display: "flex",
  gap: 8,
  justifyContent: "space-between",
  marginTop: "auto",
};

const buyButtonStyle: CSSProperties = {
  alignItems: "center",
  background: "#004633",
  border: 0,
  borderRadius: 7,
  color: "#fff",
  cursor: "pointer",
  display: "inline-flex",
  fontFamily: "inherit",
  fontSize: 13,
  fontWeight: 800,
  gap: 6,
  justifyContent: "center",
  padding: "8px 13px",
};

const disabledButtonStyle: CSSProperties = {
  background: "#e8f0eb",
  border: 0,
  borderRadius: 7,
  color: "#9aafa5",
  cursor: "not-allowed",
  fontSize: 12,
  padding: "8px 12px",
};

const formGateStyle: CSSProperties = {
  alignItems: "center",
  background: "#004633",
  borderRadius: 7,
  color: "#fff",
  display: "inline-flex",
  fontSize: 12,
  fontWeight: 800,
  gap: 6,
  padding: "8px 12px",
  textDecoration: "none",
};

const headerActionStyle: CSSProperties = {
  alignItems: "center",
  background: "transparent",
  border: 0,
  color: "#071b13",
  cursor: "pointer",
  display: "inline-flex",
  font: "inherit",
  fontSize: 13,
  fontWeight: 700,
  gap: 9,
  padding: 0,
  textDecoration: "none",
};

const navButtonStyle: CSSProperties = {
  alignItems: "center",
  background: "#fff",
  color: "#071b13",
  display: "inline-flex",
  fontSize: 13,
  fontWeight: 800,
  gap: 8,
  minHeight: 36,
  padding: "0 12px",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const blockTitleStyle: CSSProperties = {
  color: "#071b13",
  fontSize: 19,
  fontWeight: 800,
  margin: "0 0 12px",
};

const viewAllStyle: CSSProperties = {
  color: "#004633",
  fontSize: 13,
  fontWeight: 800,
  textDecoration: "none",
};

const qtyButtonStyle: CSSProperties = {
  alignItems: "center",
  background: "#fff",
  border: "1px solid #dfe6e2",
  borderRadius: 5,
  display: "inline-flex",
  height: 28,
  justifyContent: "center",
  width: 28,
};

const footerTitleStyle: CSSProperties = {
  color: "#fff",
  fontSize: 14,
  margin: "0 0 10px",
};

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition, type ComponentType, type CSSProperties } from "react";
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

function spanFor(index: number, total: number, cols: number): number {
  if (total <= cols) return 1;
  const orphans = total % cols;
  if (orphans === 0) return 1;
  const orphanStart = total - orphans;
  if (index < orphanStart) return 1;
  if (cols === 4 && orphans === 2) return 2;
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

  function handleBuy() {
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

function PCard({ product, span = 1 }: { product: ShopifyProduct; span?: number }) {
  const variant = product.variants.edges[0]?.node ?? null;
  const price = product.priceRange.minVariantPrice;
  const maxPrice = product.priceRange.maxVariantPrice;
  const hasRange = price.amount !== maxPrice.amount;
  const description = conciseDescription(product);
  const image = product.images.edges[0]?.node ?? null;
  const isFmlaPaperwork = /fmla|short-term|disability|paperwork/i.test(`${product.title} ${product.handle}`);

  return (
    <article className="jls-product-card" style={{ ...productCardStyle, gridColumn: span > 1 ? `span ${span}` : undefined }}>
      <div style={productImageWrapStyle}>
        {image ? (
          <Image alt={image.altText || product.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 22vw" src={image.url} style={{ objectFit: "contain", padding: 14 }} />
        ) : (
          <Package size={38} />
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
              <Link href={`/fmla-short-term-disability-paperwork?variantId=${encodeURIComponent(variant.id)}`} style={formGateStyle}>
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
}: {
  products: ShopifyProduct[];
  cols: 3 | 4;
  defaultShow?: number;
  id: string;
  label: string;
  showMore: Record<string, boolean>;
  toggle: (id: string) => void;
}) {
  if (products.length === 0) return null;
  const expanded = showMore[id] ?? false;
  const visible = expanded ? products : products.slice(0, defaultShow);
  const hidden = products.length - visible.length;

  return (
    <>
      <div className={`jls-grid jls-g${cols}`} style={{ display: "grid", gap: 14, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {visible.map((product, index) => (
          <PCard key={product.id} product={product} span={spanFor(index, visible.length, cols)} />
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
  const [showMore, setShowMore] = useState<Record<string, boolean>>({});
  const [cartUrl, setCartUrl] = useState<string | null>(null);
  const [cartQty, setCartQty] = useState(0);

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

  const activeProducts = category === "all" ? products : categories.find((item) => item.id === category)?.products ?? products;
  const searchTerm = search.trim().toLowerCase();
  const searchedProducts = activeProducts.filter((product) => {
    if (!searchTerm) return true;
    return `${product.title} ${product.productType} ${product.tags.join(" ")}`.toLowerCase().includes(searchTerm);
  });

  const heroProducts = [multivitamins[0] ?? starterKits[0], protein[0], calcium[0] ?? longTermKits[0]].filter(Boolean) as ShopifyProduct[];
  const cartPreview = [multivitamins[0] ?? starterKits[0], protein[0], calcium[0] ?? longTermKits[0]].filter(Boolean) as ShopifyProduct[];
  const cartPreviewTotal = cartPreview.reduce((total, product) => total + Number(product.priceRange.minVariantPrice.amount), 0);
  const checkoutHref = cartUrl ?? (SHOPIFY_STORE_URL ? `${SHOPIFY_STORE_URL}/cart` : "/shop");
  const showSearchResults = category !== "all" || searchTerm.length > 0;

  const collections = [
    { badge: "Best seller", title: "Essential Vitamins", copy: "Daily vitamins recommended by our care team.", product: multivitamins[0] ?? longTermKits[0] ?? starterKits[0] },
    { badge: "Popular", title: "Protein Essentials", copy: "High-quality protein to support healing and weight loss.", product: protein[0] },
    { badge: "Care team pick", title: "Post-Op Essentials", copy: "Top products for a smooth recovery and lifelong success.", product: longTermKits[0] ?? calcium[0] },
    { badge: "Staff favorite", title: "Hydration & Wellness", copy: "Stay hydrated and feel your best every day.", product: clearLiquid[0] ?? protein[1] },
  ].filter((item) => item.product) as Array<{ badge: string; title: string; copy: string; product: ShopifyProduct }>;

  const sections = [
    { id: "starter-kits", title: "Starter Kits", subtitle: "Procedure-specific kits for the first phase of care", products: starterKits, cols: 4 as const },
    { id: "vitamins", title: "Vitamins & Supplements", subtitle: "Daily bariatric essentials recommended by your care team", products: [...multivitamins, ...calcium, ...b12VitD, ...supplements, ...longTermKits], cols: 4 as const },
    { id: "protein", title: "Protein & Nutrition", subtitle: "Shakes, bars, drinks, and recovery nutrition", products: protein, cols: 4 as const },
    { id: "meals", title: "Meals", subtitle: "Bariatric-friendly meals and snacks", products: meals, cols: 3 as const },
    { id: "services", title: "Medical Services", subtitle: "Administrative fees and visit payments", products: services, cols: 3 as const },
  ].filter((section) => section.products.length > 0);

  return (
    <>
      <style>{`
        .jls-shop-shell { min-height: 100vh; background: #f7f8f6; color: #071b13; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .jls-store-grid { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 26px; max-width: 1540px; margin: 0 auto; padding: 0 24px; }
        .jls-search:focus-within { border-color: #0a4b38; box-shadow: 0 0 0 3px rgba(10, 75, 56, 0.1); }
        .jls-nav-link:hover, .jls-icon-button:hover, .jls-category:hover, .jls-collection:hover { border-color: #adc8b9 !important; transform: translateY(-1px); }
        .jls-product-card:hover { border-color: #adc8b9 !important; box-shadow: 0 10px 24px rgba(13, 61, 36, 0.08); transform: translateY(-1px); }
        .jls-buybtn:hover:not(:disabled), .jls-checkout:hover, .jls-hero-cta:hover { background: #063a2a !important; }
        .jls-side-cart { position: sticky; top: 18px; align-self: start; }
        .jls-g4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        .jls-g3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        @media (max-width: 1180px) { .jls-store-grid { grid-template-columns: 1fr; } .jls-side-cart { position: static; } .jls-actions-extra { display: none !important; } }
        @media (max-width: 920px) { .jls-main-header { grid-template-columns: 1fr !important; } .jls-hero { grid-template-columns: 1fr !important; padding: 32px !important; } .jls-g4, .jls-g3 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } .jls-product-card { grid-column: auto !important; } }
        @media (max-width: 640px) { .jls-store-grid { padding: 0 14px; } .jls-top-strip-inner, .jls-main-header, .jls-nav-inner { padding-left: 16px !important; padding-right: 16px !important; } .jls-g4, .jls-g3, .jls-category-grid, .jls-collections, .jls-trust-grid { grid-template-columns: 1fr !important; } .jls-hero { margin-left: -14px !important; margin-right: -14px !important; padding: 24px !important; } .jls-hero-title { font-size: 34px !important; } .jls-side-cart { display: none; } }
      `}</style>

      <div className="jls-shop-shell">
        <TopStrip />
        <Header checkoutHref={checkoutHref} cartCount={cartQty || cartPreview.length} cartTotal={cartPreviewTotal} search={search} setSearch={setSearch} />

        <div className="jls-store-grid">
          <main>
            <Hero products={heroProducts} />
            <CategoryTiles categories={categories} selected={category} setSelected={setCategory} />

            {showSearchResults ? (
              <section id="featured" style={{ padding: "20px 0 8px" }}>
                <SectionHead title={category === "all" ? "Search Results" : categories.find((item) => item.id === category)?.label ?? "Products"} subtitle={`${searchedProducts.length} matching item${searchedProducts.length === 1 ? "" : "s"}`} />
                <PGrid cols={4} defaultShow={12} id="search-results" label="products" products={searchedProducts} showMore={showMore} toggle={toggle} />
              </section>
            ) : (
              <>
                <section id="featured" style={{ padding: "20px 0 8px" }}>
                  <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <h2 style={blockTitleStyle}>Featured Collections</h2>
                    <a href="#starter-kits" style={viewAllStyle}>View all collections →</a>
                  </div>
                  <div className="jls-collections" style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
                    {collections.map((collection) => <CollectionCard key={collection.title} {...collection} />)}
                  </div>
                </section>

                {sections.map((section) => (
                  <section id={section.id} key={section.id} style={{ padding: "22px 0 4px" }}>
                    <SectionHead subtitle={section.subtitle} title={section.title} />
                    <PGrid cols={section.cols} defaultShow={section.cols === 4 ? 8 : 6} id={section.id} label="products" products={section.products} showMore={showMore} toggle={toggle} />
                  </section>
                ))}
              </>
            )}

            <TrustBar />
          </main>

          <aside className="jls-side-cart">
            <CartPanel cartPreview={cartPreview} checkoutHref={checkoutHref} total={cartPreviewTotal} />
          </aside>
        </div>

        <ShopFooter />
      </div>
    </>
  );
}

function TopStrip() {
  return (
    <div style={{ background: "#003f2d", color: "#fff" }}>
      <div className="jls-top-strip-inner" style={{ alignItems: "center", display: "grid", gridTemplateColumns: "1fr auto 1fr", margin: "0 auto", maxWidth: 1540, padding: "10px 24px" }}>
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
  setSearch,
}: {
  checkoutHref: string;
  cartCount: number;
  cartTotal: number;
  search: string;
  setSearch: (value: string) => void;
}) {
  const navItems = ["Starter Kits", "Vitamins & Supplements", "Protein & Nutrition", "Meals", "Medical Services", "Forms & Admin"];
  const navTargets = ["starter-kits", "vitamins", "protein", "meals", "services", "services"];

  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #e0e6e2" }}>
      <div className="jls-main-header" style={{ alignItems: "center", display: "grid", gap: 24, gridTemplateColumns: "260px minmax(280px, 1fr) auto", margin: "0 auto", maxWidth: 1540, padding: "18px 24px" }}>
        <Link href="/" style={{ display: "inline-flex" }}>
          <Image alt="JourneyLite Bariatric Physicians" height={160} priority src="/journeylite-logo.svg" style={{ height: "auto", width: 198 }} width={560} />
        </Link>

        <label className="jls-search" style={{ alignItems: "center", background: "#fff", border: "1px solid #ccd8d1", borderRadius: 7, display: "flex", gap: 12, minHeight: 47, padding: "0 16px" }}>
          <Search size={20} />
          <input aria-label="Search products" onChange={(event) => setSearch(event.target.value)} placeholder="Search products, categories, or services..." style={{ border: 0, flex: 1, font: "inherit", outline: "none" }} value={search} />
        </label>

        <div style={{ alignItems: "center", display: "flex", gap: 18, justifyContent: "flex-end" }}>
          <button className="jls-icon-button jls-actions-extra" style={headerActionStyle}><ClipboardList size={20} /><span><strong>Procedure</strong><br />Not selected</span><ChevronDown size={14} /></button>
          <a className="jls-icon-button jls-actions-extra" href={SHOPIFY_STORE_URL ? `${SHOPIFY_STORE_URL}/account` : "#"} style={headerActionStyle}><UserRound size={20} /><span>Account</span></a>
          <button className="jls-icon-button jls-actions-extra" style={headerActionStyle}><Heart size={20} /><span>Favorites</span></button>
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
        <div className="jls-nav-inner" style={{ alignItems: "center", display: "flex", gap: 18, margin: "0 auto", maxWidth: 1540, overflowX: "auto", padding: "11px 24px" }}>
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
        {products.map((product, index) => {
          const image = product.images.edges[0]?.node;
          return (
            <div key={product.id} style={{ height: index === 1 ? 255 : 185, marginLeft: index === 0 ? 0 : -14, position: "relative", width: index === 1 ? 210 : 145, zIndex: index === 1 ? 2 : 1 }}>
              {image ? <Image alt={image.altText || product.title} fill sizes="220px" src={image.url} style={{ objectFit: "contain" }} /> : <Package size={90} />}
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

function CollectionCard({ badge, title, copy, product }: { badge: string; title: string; copy: string; product: ShopifyProduct }) {
  const image = product.images.edges[0]?.node;
  return (
    <a className="jls-collection" href="#featured" style={{ background: "#fff", border: "1px solid #dfe6e2", borderRadius: 8, color: "inherit", display: "block", overflow: "hidden", position: "relative", textDecoration: "none" }}>
      <span style={{ background: "#00624b", borderRadius: 4, color: "#fff", fontSize: 10, fontWeight: 800, left: 10, padding: "4px 7px", position: "absolute", textTransform: "uppercase", top: 10, zIndex: 2 }}>{badge}</span>
      <div style={{ background: "#f6f8f6", height: 120, position: "relative" }}>
        {image ? <Image alt={image.altText || product.title} fill sizes="260px" src={image.url} style={{ objectFit: "contain", padding: 12 }} /> : <Package size={42} />}
      </div>
      <div style={{ padding: 14 }}>
        <h3 style={{ fontSize: 14, margin: "0 0 4px" }}>{title}</h3>
        <p style={{ color: "#4f5d55", fontSize: 12, lineHeight: 1.35, margin: "0 0 10px" }}>{copy}</p>
        <span style={{ color: "#004633", fontSize: 12, fontWeight: 800 }}>Shop now {">"}</span>
      </div>
    </a>
  );
}

function CartPanel({ cartPreview, checkoutHref, total }: { cartPreview: ShopifyProduct[]; checkoutHref: string; total: number }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e1e7e3", borderRadius: 10, boxShadow: "0 12px 34px rgba(12, 42, 30, 0.12)", padding: 22 }}>
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
                {image ? <Image alt={image.altText || product.title} fill sizes="76px" src={image.url} style={{ objectFit: "contain", padding: 8 }} /> : <Package size={28} />}
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
      <div style={{ display: "grid", gap: 46, gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr", margin: "0 auto", maxWidth: 1540, padding: "24px" }}>
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

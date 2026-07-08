"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition, type ComponentType, type CSSProperties, type MouseEvent, type ReactNode } from "react";
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
  Sparkles,
  Stethoscope,
  Trash2,
  Truck,
  UserRound,
  Utensils,
  X,
} from "lucide-react";
import { addToCart, getCart, removeCartLine, updateCartLine } from "@/lib/shopify/actions";
import type { ShopifyCart, ShopifyProduct } from "@/lib/shopify/types";

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STORE_URL = SHOPIFY_STORE_DOMAIN ? `https://${SHOPIFY_STORE_DOMAIN}` : null;
const CART_ID_KEY = "journeylite_shopify_cart_id";
const CART_URL_KEY = "journeylite_shopify_checkout_url";
const CART_QTY_KEY = "journeylite_shopify_cart_qty";
const CART_UPDATED_EVENT = "journeylite-shopify-cart-updated";
const FREE_SHIPPING_TARGET = 150;
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

function formatProductPrice(product: ShopifyProduct) {
  const min = product.priceRange.minVariantPrice;
  const max = product.priceRange.maxVariantPrice;
  return `${min.amount !== max.amount ? "From " : ""}${fmtPrice(min.amount, min.currencyCode)}`;
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

function productBenefit(product: ShopifyProduct): string {
  const description = conciseDescription(product);
  if (description) return description.split(/[.!?]/)[0].slice(0, 92);
  const tag = getSectionTag(product);
  if (tag === "type-preop-kit") return "Procedure-specific essentials for the first phase of care.";
  if (tag === "type-long-term-kit") return "Refill support for long-term bariatric vitamin routines.";
  if (tag === "type-multivitamin") return "Daily bariatric vitamin support recommended after surgery.";
  if (tag === "type-calcium") return "Calcium support for post-op nutrition plans.";
  if (tag === "type-shake") return "Protein-forward nutrition for recovery and daily goals.";
  if (tag === "type-bar") return "Convenient protein support between meals.";
  if (tag === "type-snack") return "Bariatric-friendly meal support with simple portions.";
  if (tag === "type-service") return "Administrative support handled by the JourneyLite team.";
  return "Care-team selected for the bariatric journey.";
}

function cartSubtotal(cart: ShopifyCart | null) {
  return Number(cart?.cost?.subtotalAmount.amount ?? 0);
}

function cartLines(cart: ShopifyCart | null) {
  return cart?.lines.edges.map((edge) => edge.node) ?? [];
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
        window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: res.cart ?? null }));
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

function PCard({ product, span = 1, onSelect, badge }: { product: ShopifyProduct; span?: number; onSelect: (product: ShopifyProduct) => void; badge?: string }) {
  const variant = product.variants.edges[0]?.node ?? null;
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
        <div style={{ alignItems: "center", display: "flex", gap: 8, justifyContent: "space-between", marginBottom: 10 }}>
          <span style={badgeStyle}>{productEyebrow(product)}</span>
          {badge ? <span style={miniBadgeStyle}>{badge}</span> : null}
        </div>
        <h3 style={{ color: "#111f18", fontSize: 15, lineHeight: 1.25, margin: "0 0 7px" }}>{product.title}</h3>
        <p style={descriptionStyle}>{productBenefit(product)}</p>
        <div style={productFooterStyle}>
          <strong style={{ fontSize: 15 }}>{formatProductPrice(product)}</strong>
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
    <div style={{ borderBottom: "1px solid #dfe6e2", marginBottom: 18, paddingBottom: 12 }}>
      <h2 style={{ color: "#071b13", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 30, fontWeight: 400, letterSpacing: 0, margin: 0 }}>{title}</h2>
      {subtitle ? <p style={{ color: "#596960", fontSize: 14, lineHeight: 1.5, margin: "6px 0 0", maxWidth: 620 }}>{subtitle}</p> : null}
    </div>
  );
}

function CuratedSection({
  children,
  eyebrow,
  id,
  title,
  subtitle,
  viewAllLabel,
  onViewAll,
}: {
  children: ReactNode;
  eyebrow?: string;
  id: string;
  title: string;
  subtitle: string;
  viewAllLabel: string;
  onViewAll: () => void;
}) {
  return (
    <section id={id} style={{ padding: "24px 0 10px" }}>
      <div style={{ alignItems: "end", display: "flex", gap: 20, justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          {eyebrow ? <p style={{ color: "#00624b", fontSize: 11, fontWeight: 900, letterSpacing: 0.7, margin: "0 0 6px", textTransform: "uppercase" }}>{eyebrow}</p> : null}
          <h2 style={{ color: "#071b13", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 30, fontWeight: 400, lineHeight: 1.1, margin: 0 }}>{title}</h2>
          <p style={{ color: "#596960", fontSize: 14, lineHeight: 1.5, margin: "7px 0 0", maxWidth: 620 }}>{subtitle}</p>
        </div>
        <button onClick={onViewAll} style={viewAllButtonStyle}>{viewAllLabel} →</button>
      </div>
      {children}
    </section>
  );
}

function ProductGrid({ products, onSelect, badges = [] }: { products: ShopifyProduct[]; onSelect: (product: ShopifyProduct) => void; badges?: string[] }) {
  if (products.length === 0) return null;
  return (
    <div className="jls-grid jls-g4" style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
      {products.map((product, index) => (
        <PCard badge={badges[index]} key={product.id} onSelect={onSelect} product={product} />
      ))}
    </div>
  );
}

function ServiceGrid({ products, onSelect }: { products: ShopifyProduct[]; onSelect: (product: ShopifyProduct) => void }) {
  if (products.length === 0) return null;
  return (
    <div className="jls-services" style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
      {products.map((product) => {
        const variant = product.variants.edges[0]?.node ?? null;
        const image = product.images.edges[0]?.node ?? null;
        const isFmlaPaperwork = /fmla|short-term|disability|paperwork/i.test(`${product.title} ${product.handle}`);
        return (
          <article key={product.id} className="jls-product-card" style={{ ...productCardStyle, minHeight: 0 }}>
            <button onClick={() => onSelect(product)} style={{ background: "#f6f8f6", border: 0, cursor: "pointer", height: 140, padding: 0, position: "relative", width: "100%" }}>
              {image ? <Image alt={image.altText || product.title} fill sizes="360px" src={image.url} style={{ objectFit: "cover" }} /> : <ProductPlaceholder />}
            </button>
            <div style={{ padding: 16 }}>
              <span style={badgeStyle}>Medical service</span>
              <h3 style={{ color: "#111f18", fontSize: 16, lineHeight: 1.25, margin: "10px 0 8px" }}>{product.title}</h3>
              <p style={{ color: "#52645a", fontSize: 13, lineHeight: 1.45, margin: "0 0 14px" }}>{productBenefit(product)}</p>
              <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", gap: 12 }}>
                <strong>{formatProductPrice(product)}</strong>
                {variant && isFmlaPaperwork ? (
                  <Link href={`/fmla-short-term-disability-paperwork?variantId=${encodeURIComponent(variant.id)}`} style={formGateStyle}>Start form</Link>
                ) : variant ? (
                  <BuyBtn available={variant.availableForSale} label="Pay" variantId={variant.id} />
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function ShopClient({ products, initialCategory = "all" }: { products: ShopifyProduct[]; initialCategory?: string }) {
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [selectedProcedure, setSelectedProcedure] = useState("all");
  const [nutritionTab, setNutritionTab] = useState<"vitamins" | "protein" | "meals">("vitamins");
  const [cartQty, setCartQty] = useState(0);
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [cartVisible, setCartVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function syncCartState(event?: Event) {
      const customEvent = event as CustomEvent<ShopifyCart | null>;
      if (customEvent?.detail) {
        if (!cancelled) {
          setCart(customEvent.detail);
          setCartQty(customEvent.detail.totalQuantity);
          setCartVisible(customEvent.detail.totalQuantity > 0);
        }
        return;
      }

      const storedCartQty = Number(window.localStorage.getItem(CART_QTY_KEY) ?? "0") || 0;
      setCartQty(storedCartQty);

      const cartId = window.localStorage.getItem(CART_ID_KEY);
      if (!cartId) return;
      const result = await getCart(cartId);
      if (!cancelled && result.cart) {
        setCart(result.cart);
        setCartQty(result.cart.totalQuantity);
      }
    }

    syncCartState();
    window.addEventListener(CART_UPDATED_EVENT, syncCartState);
    window.addEventListener("storage", syncCartState);

    return () => {
      cancelled = true;
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

  const recommendedProducts = [multivitamins[0], protein[0], calcium[0], preOpDiet[0] ?? starterKits[0]].filter(Boolean).slice(0, 4) as ShopifyProduct[];
  const starterFeature = starterKits.slice(0, 4);
  const nutritionProducts = {
    vitamins: [...multivitamins, ...calcium, ...b12VitD, ...supplements, ...longTermKits].slice(0, 4),
    protein: protein.slice(0, 4),
    meals: meals.slice(0, 4),
  };
  const serviceProducts = services.slice(0, 3);
  const suggestedProducts = [protein[1] ?? protein[0], preOpDiet[0] ?? meals[0], supplements[0] ?? b12VitD[0]]
    .filter((product): product is ShopifyProduct => Boolean(product))
    .filter((product) => !cartLines(cart).some((line) => line.merchandise.product.handle === product.handle))
    .slice(0, 2);
  const showSearchResults = category !== "all" || searchTerm.length > 0 || selectedProcedure !== "all";

  function applyCartState(nextCart: ShopifyCart | null) {
    setCart(nextCart);
    if (!nextCart) {
      setCartQty(0);
      return;
    }
    setCartQty(nextCart.totalQuantity);
    setCartVisible(nextCart.totalQuantity > 0);
    window.localStorage.setItem(CART_ID_KEY, nextCart.id);
    window.localStorage.setItem(CART_URL_KEY, nextCart.checkoutUrl);
    window.localStorage.setItem(CART_QTY_KEY, String(nextCart.totalQuantity));
  }

  async function changeCartLine(lineId: string, quantity: number) {
    if (!cart?.id) return;
    const result = quantity <= 0 ? await removeCartLine(cart.id, lineId) : await updateCartLine(cart.id, lineId, quantity);
    if (result.cart) applyCartState(result.cart);
  }

  const showCartSidebar = cartVisible && cartQty > 0;

  return (
    <>
      <style>{`
        .jls-shop-shell { min-height: 100vh; background: #f7f8f6; color: #071b13; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .jls-store-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0; width: 100%; padding: 0 24px; }
        .jls-store-grid.has-cart { grid-template-columns: minmax(0, 1fr) 384px; padding-right: 0; }
        .jls-search:focus-within { border-color: #0a4b38; box-shadow: 0 0 0 3px rgba(10, 75, 56, 0.1); }
        .jls-nav-inner { scrollbar-width: none; }
        .jls-nav-inner::-webkit-scrollbar { display: none; }
        .jls-nav-link { flex: 0 0 auto; white-space: nowrap; }
        .jls-nav-link:hover, .jls-icon-button:hover, .jls-category:hover, .jls-collection:hover { border-color: #adc8b9 !important; transform: translateY(-1px); }
        .jls-product-card:hover { border-color: #adc8b9 !important; box-shadow: 0 10px 24px rgba(13, 61, 36, 0.08); transform: translateY(-1px); }
        .jls-buybtn:hover:not(:disabled), .jls-checkout:hover, .jls-hero-cta:hover { background: #063a2a !important; }
        .jls-side-cart { align-self: stretch; background: #fff; border-left: 1px solid #e1e7e3; box-shadow: -16px 0 34px rgba(12, 42, 30, 0.08); position: sticky; top: 0; }
        .jls-g5 { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }
        .jls-g4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        .jls-g3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        @media (max-width: 1320px) { .jls-g5 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; } }
        @media (max-width: 1180px) { .jls-store-grid, .jls-store-grid.has-cart { grid-template-columns: 1fr; padding: 0 24px; } .jls-side-cart { border: 1px solid #e1e7e3; box-shadow: none; position: static; } .jls-actions-extra { display: none !important; } }
        @media (max-width: 920px) { .jls-main-header { grid-template-columns: 1fr !important; } .jls-shop-nav { overflow: hidden; } .jls-nav-inner { gap: 10px !important; padding-bottom: 12px !important; padding-top: 12px !important; scroll-padding: 24px; } .jls-nav-link { border: 1px solid #d9e4de !important; border-radius: 999px !important; min-height: 42px; padding: 0 16px !important; } .jls-hero { background-image: linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 43%, rgba(255,255,255,0.5) 76%, rgba(255,255,255,0.1) 100%), url('/shop/shop-hero.webp') !important; background-position: center, 61% center !important; min-height: 390px !important; padding: 46px 36px !important; } .jls-hero-copy { max-width: 560px !important; } .jls-g5, .jls-g4, .jls-g3, .jls-services { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } .jls-product-card { grid-column: auto !important; } .jls-product-modal { grid-template-columns: 1fr !important; max-height: calc(100vh - 28px); overflow: auto; } .jls-product-modal-image { min-height: 240px !important; } }
        @media (max-width: 640px) { .jls-store-grid, .jls-store-grid.has-cart { padding: 0 14px; } .jls-top-strip-inner, .jls-main-header, .jls-nav-inner { padding-left: 16px !important; padding-right: 16px !important; } .jls-top-strip-inner { display: flex !important; justify-content: center !important; } .jls-top-strip-inner p, .jls-top-strip-inner span { display: none !important; } .jls-main-header { gap: 14px !important; padding-bottom: 12px !important; padding-top: 14px !important; } .jls-main-header > a { justify-content: center; } .jls-shop-actions { justify-content: space-between !important; width: 100%; } .jls-search { min-height: 44px !important; padding: 0 12px !important; } .jls-search input { min-width: 0; } .jls-nav-inner { gap: 8px !important; scroll-padding: 16px; } .jls-nav-link { font-size: 12px !important; min-height: 40px; padding: 0 13px !important; } .jls-g5, .jls-g4, .jls-g3, .jls-services, .jls-category-grid, .jls-collections, .jls-trust-grid { grid-template-columns: 1fr !important; } .jls-hero { background-image: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.96) 56%, #fff 100%), url('/shop/shop-hero.webp') !important; background-position: center, 64% top !important; background-repeat: no-repeat !important; background-size: 100% 100%, auto 292px !important; margin-left: -14px !important; margin-right: -14px !important; min-height: 0 !important; padding: 292px 20px 30px !important; } .jls-hero-copy { max-width: none !important; } .jls-hero-title { font-size: 38px !important; line-height: 1.02 !important; } .jls-hero-copy p:not(:first-child) { font-size: 15px !important; line-height: 1.5 !important; } .jls-hero-copy a { flex: 1 1 100%; justify-content: center; text-align: center; } .jls-side-cart { display: none; } .jls-product-modal { border-radius: 10px !important; } .jls-product-modal-content { padding: 22px !important; } }
        @media (max-width: 390px) { .jls-hero { background-size: 100% 100%, auto 252px !important; padding-top: 258px !important; } .jls-hero-title { font-size: 34px !important; } }
      `}</style>

      <div className="jls-shop-shell">
        <TopStrip />
        <Header cartCount={cartQty} cartTotal={cartSubtotal(cart)} search={search} selectedProcedure={selectedProcedure} setSearch={setSearch} setSelectedProcedure={(value) => {
          setSelectedProcedure(value);
          if (value !== "all") setCategory("all");
        }} />

        <div className={`jls-store-grid${showCartSidebar ? " has-cart" : ""}`}>
          <main>
            <Hero />
            <CategoryTiles categories={categories} selected={category} setSelected={setCategory} />

            {showSearchResults ? (
              <section id="featured" style={{ padding: "20px 0 8px" }}>
                <SectionHead title={selectedProcedure !== "all" ? `${selectedProcedureLabel} Products` : category === "all" ? "Search Results" : categories.find((item) => item.id === category)?.label ?? "Products"} subtitle={`${searchedProducts.length} matching item${searchedProducts.length === 1 ? "" : "s"}`} />
                <ProductGrid products={searchedProducts.slice(0, 12)} onSelect={setSelectedProduct} />
              </section>
            ) : (
              <>
                <CuratedSection eyebrow="Care team picks" id="featured" title="Recommended Products" subtitle="A short list of bariatric essentials chosen to reduce guesswork." viewAllLabel="View all products" onViewAll={() => setCategory("all")}>
                  <ProductGrid badges={["Best Seller", "Recommended", "Surgeon Recommended", "Starter Pick"]} products={recommendedProducts} onSelect={setSelectedProduct} />
                </CuratedSection>

                <CuratedSection id="starter-kits" title="Starter Kits" subtitle="Procedure-specific first-phase kits without the full catalog overload." viewAllLabel="View all starter kits" onViewAll={() => setCategory("starter")}>
                  <ProductGrid products={starterFeature} onSelect={setSelectedProduct} />
                </CuratedSection>

                <section id="nutrition" style={{ padding: "22px 0 8px" }}>
                  <SectionHead subtitle="Vitamins, protein, and meals in one focused shopping area." title="Nutrition" />
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    {(["vitamins", "protein", "meals"] as const).map((tab) => (
                      <button key={tab} onClick={() => setNutritionTab(tab)} style={{ background: nutritionTab === tab ? "#004633" : "#fff", border: "1px solid #cbd9d1", borderRadius: 999, color: nutritionTab === tab ? "#fff" : "#0a2e21", cursor: "pointer", font: "inherit", fontSize: 13, fontWeight: 800, padding: "9px 16px", textTransform: "capitalize" }}>
                        {tab}
                      </button>
                    ))}
                    <button onClick={() => setCategory(nutritionTab === "vitamins" ? "vitamins" : nutritionTab)} style={{ ...viewAllButtonStyle, marginLeft: "auto" }}>View All →</button>
                  </div>
                  <ProductGrid products={nutritionProducts[nutritionTab]} onSelect={setSelectedProduct} />
                </section>

                <CuratedSection id="services" title="Medical Services" subtitle="Administrative and clinical service payments presented separately from products." viewAllLabel="View all services" onViewAll={() => setCategory("services")}>
                  <ServiceGrid products={serviceProducts} onSelect={setSelectedProduct} />
                </CuratedSection>
              </>
            )}

            <TrustBar />
          </main>

          {showCartSidebar ? (
            <aside className="jls-side-cart">
              <CartPanel cart={cart} suggestedProducts={suggestedProducts} onChangeLine={changeCartLine} onClose={() => setCartVisible(false)} />
            </aside>
          ) : null}
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
  cartCount,
  cartTotal,
  search,
  selectedProcedure,
  setSearch,
  setSelectedProcedure,
}: {
  cartCount: number;
  cartTotal: number;
  search: string;
  selectedProcedure: string;
  setSearch: (value: string) => void;
  setSelectedProcedure: (value: string) => void;
}) {
  const [procedureOpen, setProcedureOpen] = useState(false);
  const navItems = [
    { label: "Starter Kits", href: "/shop/starter-kits" },
    { label: "Vitamins & Supplements", href: "/shop/vitamins-supplements" },
    { label: "Protein & Nutrition", href: "/shop/protein-nutrition" },
    { label: "Meals", href: "/shop/meals" },
    { label: "Medical Services", href: "/shop/medical-services" },
    { label: "Forms & Admin", href: "/shop/forms-admin" },
  ];
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

        <div className="jls-shop-actions" style={{ alignItems: "center", display: "flex", gap: 18, justifyContent: "flex-end" }}>
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
          <Link href="/shop/cart" style={{ alignItems: "center", color: "#071b13", display: "inline-flex", fontSize: 14, fontWeight: 800, gap: 10, textDecoration: "none" }}>
            <span style={{ position: "relative" }}>
              <ShoppingCart size={28} />
              <span style={{ background: "#0a4b38", borderRadius: 999, color: "#fff", fontSize: 11, fontWeight: 800, minWidth: 19, padding: "2px 6px", position: "absolute", right: -11, textAlign: "center", top: -9 }}>{cartCount}</span>
            </span>
            {cartTotal ? `$${cartTotal.toFixed(2)}` : "Cart"}
          </Link>
        </div>
      </div>

      <nav className="jls-shop-nav" style={{ borderTop: "1px solid #edf1ee" }}>
        <div className="jls-nav-inner" style={{ alignItems: "center", display: "flex", gap: 18, overflowX: "auto", padding: "11px 24px", width: "100%" }}>
          <Link className="jls-nav-link" href="/shop" style={{ ...navButtonStyle, border: "1px solid #ccd8d1", borderRadius: 6 }}><Menu size={16} /> Shop by Category</Link>
          {navItems.map((item) => (
            <Link className="jls-nav-link" href={item.href} key={item.href} style={navButtonStyle}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section
      className="jls-hero"
      style={{
        backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.9) 36%, rgba(255,255,255,0.18) 68%, rgba(255,255,255,0) 100%), url('/shop/shop-hero.webp')",
        backgroundPosition: "center",
        backgroundSize: "cover",
        borderBottom: "1px solid #e1e6e2",
        margin: "0 -24px",
        minHeight: 430,
        overflow: "hidden",
        padding: "72px 78px 58px",
      }}
    >
      <div className="jls-hero-copy" style={{ maxWidth: 640 }}>
        <p style={{ color: "#00624b", fontSize: 12, fontWeight: 900, letterSpacing: 0.9, margin: "0 0 12px", textTransform: "uppercase" }}>JourneyLite Store</p>
        <h1 className="jls-hero-title" style={{ color: "#052b1f", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 60, fontWeight: 400, lineHeight: 0.98, margin: "0 0 20px" }}>Bariatric essentials, curated by your care team.</h1>
        <p style={{ color: "#3f4d46", fontSize: 18, lineHeight: 1.6, margin: "0 0 28px", maxWidth: 540 }}>Shop procedure kits, vitamins, protein, meals, and administrative services selected to support each phase of care.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <a className="jls-hero-cta" href="#featured" style={{ background: "#004633", borderRadius: 7, color: "#fff", fontSize: 14, fontWeight: 800, padding: "14px 30px", textDecoration: "none" }}>Shop Recommended</a>
          <a href="#starter-kits" style={{ background: "#fff", border: "1px solid #ccd8d1", borderRadius: 7, color: "#0a2e21", fontSize: 14, fontWeight: 800, padding: "13px 28px", textDecoration: "none" }}>Find Starter Kits</a>
        </div>
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
    <section style={{ padding: "26px 0 10px" }}>
      <h2 style={blockTitleStyle}>Shop by Category</h2>
      <div className="jls-category-grid" style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
        {categories.map((tile) => {
          const Icon = tile.icon;
          const active = selected === tile.id;
          return (
            <button className="jls-category" key={tile.id} onClick={() => setSelected(active ? "all" : tile.id)} style={{ alignItems: "center", background: active ? "#eef7f2" : "#fff", border: active ? "2px solid #0a4b38" : "1px solid #dfe6e2", borderRadius: 10, boxShadow: active ? "0 12px 26px rgba(10, 75, 56, 0.10)" : "0 8px 18px rgba(12, 42, 30, 0.04)", cursor: "pointer", display: "flex", flexDirection: "column", gap: 12, minHeight: 112, padding: 18, transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s" }}>
              <span style={{ alignItems: "center", background: "#f2f7f4", borderRadius: 999, display: "flex", height: 48, justifyContent: "center", width: 48 }}>
                <Icon size={30} strokeWidth={1.5} />
              </span>
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

function CartPanel({
  cart,
  suggestedProducts,
  onChangeLine,
  onClose,
}: {
  cart: ShopifyCart | null;
  suggestedProducts: ShopifyProduct[];
  onChangeLine: (lineId: string, quantity: number) => void;
  onClose: () => void;
}) {
  const lines = cartLines(cart);
  const subtotal = cartSubtotal(cart);
  const displayTotal = subtotal;
  const remaining = Math.max(FREE_SHIPPING_TARGET - displayTotal, 0);
  const progress = Math.min((displayTotal / FREE_SHIPPING_TARGET) * 100, 100);

  return (
    <div style={{ background: "#fff", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 124px)", padding: "24px 22px" }}>
      <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
        <h2 style={{ fontSize: 19, margin: 0 }}>Your Cart ({cart?.totalQuantity ?? 0})</h2>
        <button aria-label="Close cart" onClick={onClose} style={{ alignItems: "center", background: "#fff", border: "1px solid #dfe6e2", borderRadius: 999, cursor: "pointer", display: "inline-flex", height: 32, justifyContent: "center", width: 32 }}>
          <X size={17} />
        </button>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {lines.length === 0 ? (
          <div style={{ background: "#f6f8f6", border: "1px solid #e3ebe6", borderRadius: 10, padding: 18, textAlign: "center" }}>
            <ShoppingCart size={28} strokeWidth={1.6} />
            <p style={{ fontSize: 14, fontWeight: 800, margin: "8px 0 4px" }}>Your cart is ready</p>
            <p style={{ color: "#5d6b64", fontSize: 12, lineHeight: 1.45, margin: 0 }}>Add a recommended product to start checkout.</p>
          </div>
        ) : null}
        {lines.map((line) => {
          const image = line.merchandise.image;
          const price = line.merchandise.price;
          const productTitle = line.merchandise.product.title;
          return (
            <div key={line.id} style={{ borderBottom: "1px solid #edf1ee", display: "grid", gap: 12, gridTemplateColumns: "74px 1fr", paddingBottom: 14 }}>
              <div style={{ background: "#f6f8f6", borderRadius: 7, minHeight: 76, position: "relative" }}>
                {image ? <Image alt={image.altText || productTitle} fill sizes="76px" src={image.url} style={{ objectFit: "contain", padding: 8 }} /> : <ProductPlaceholder compact />}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.25, margin: "0 0 5px" }}>{productTitle}</p>
                <p style={{ color: "#5d6b64", fontSize: 12, margin: "0 0 8px" }}>{line.merchandise.title !== "Default Title" ? line.merchandise.title : "JourneyLite Store"}</p>
                <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong style={{ fontSize: 13 }}>{price ? fmtPrice(price.amount, price.currencyCode) : ""}</strong>
                  <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
                    <button aria-label={`Decrease ${productTitle}`} onClick={() => onChangeLine(line.id, line.quantity - 1)} style={qtyButtonStyle}><Minus size={12} /></button>
                    <span style={{ fontSize: 13 }}>{line.quantity}</span>
                    <button aria-label={`Increase ${productTitle}`} onClick={() => onChangeLine(line.id, line.quantity + 1)} style={qtyButtonStyle}><Plus size={12} /></button>
                    <button aria-label={`Remove ${productTitle}`} onClick={() => onChangeLine(line.id, 0)} style={{ ...qtyButtonStyle, border: 0, width: 22 }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background: "#eef4f1", borderRadius: 9, margin: "16px 0", padding: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 800, margin: "0 0 8px" }}>{remaining > 0 ? `You're ${fmtPrice(String(remaining), "USD")} away from free shipping.` : "Free shipping unlocked."}</p>
        <div style={{ background: "#fff", borderRadius: 999, height: 7, overflow: "hidden" }}><div style={{ background: "#00624b", height: "100%", width: `${progress}%` }} /></div>
      </div>
      <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <strong>Estimated Total</strong>
        <strong>{fmtPrice(String(displayTotal), cart?.cost?.subtotalAmount.currencyCode ?? "USD")}</strong>
      </div>
      <div style={{ background: "#fff", bottom: 0, paddingBottom: 4, position: "sticky" }}>
        <Link className="jls-checkout" href="/shop/cart" style={{ alignItems: "center", background: "#004633", borderRadius: 7, color: "#fff", display: "flex", fontSize: 15, fontWeight: 800, gap: 8, justifyContent: "center", padding: "14px 18px", textDecoration: "none" }}><LockKeyhole size={16} /> Review Cart</Link>
      </div>
      {suggestedProducts.length > 0 ? (
        <div style={{ borderTop: "1px solid #edf1ee", marginTop: "auto", paddingTop: 18 }}>
          <h3 style={{ fontSize: 15, margin: "0 0 12px" }}>Frequently Bought Together</h3>
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
      <div className="jls-product-modal" style={{ background: "#fff", borderRadius: 12, boxShadow: "0 24px 70px rgba(0,0,0,0.24)", display: "grid", gap: 0, gridTemplateColumns: "minmax(260px, 0.8fr) minmax(300px, 1fr)", maxWidth: 860, overflow: "hidden", width: "100%" }}>
        <div className="jls-product-modal-image" style={{ background: "#f4f7f5", minHeight: 360, position: "relative" }}>
          {image ? <Image alt={image.altText || product.title} fill sizes="420px" src={image.url} style={{ objectFit: "contain", padding: 34 }} /> : <ProductPlaceholder />}
        </div>
        <div className="jls-product-modal-content" style={{ padding: 28, position: "relative" }}>
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
    { icon: ShieldCheck, title: "Bariatric team recommended", copy: "Products selected for JourneyLite patients." },
    { icon: Truck, title: "Fast nationwide shipping", copy: "Reliable fulfillment for care essentials." },
    { icon: Sparkles, title: "Trusted vitamins", copy: "Premium brands that support long-term routines." },
    { icon: Heart, title: "Patient support", copy: "Questions? Call (513) 682-4803." },
    { icon: LockKeyhole, title: "Secure checkout", copy: "Protected Shopify checkout for every order." },
  ];
  return (
    <section style={{ background: "#f2f7f4", border: "1px solid #e0e8e3", borderRadius: 12, margin: "30px 0 18px", padding: 24 }}>
      <h2 style={{ color: "#071b13", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 30, fontWeight: 400, margin: "0 0 18px" }}>Why JourneyLite?</h2>
      <div className="jls-trust-grid" style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} style={{ alignItems: "flex-start", display: "flex", gap: 12 }}>
              <span style={{ alignItems: "center", background: "#fff", borderRadius: 999, display: "flex", height: 38, justifyContent: "center", width: 38 }}>
                <Icon size={21} strokeWidth={1.6} />
              </span>
              <div><p style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>{item.title}</p><p style={{ color: "#364a40", fontSize: 12, lineHeight: 1.4, margin: "3px 0 0" }}>{item.copy}</p></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ShopFooter() {
  return (
    <footer style={{ background: "#003f2d", color: "#fff", marginTop: 12 }}>
      <div style={{ display: "grid", gap: 34, gridTemplateColumns: "1.4fr 1fr 1fr 1fr", padding: "22px 24px", width: "100%" }}>
        <div>
          <Link href="/" style={{ alignItems: "center", color: "#fff", display: "inline-flex", fontSize: 14, fontWeight: 800, gap: 8, textDecoration: "none" }}><ArrowLeft size={15} /> Return to Main Site</Link>
          <p style={{ color: "#c8ded4", fontSize: 13, lineHeight: 1.5, marginTop: 12, maxWidth: 320 }}>Supporting your journey before, during, and after surgery.</p>
        </div>
        <FooterLinks title="Shop" links={["Starter Kits", "Nutrition", "Medical Services"]} />
        <FooterLinks title="Help" links={["Shipping & Returns", "Contact Us", "Store Policies"]} />
        <FooterLinks title="Resources" links={["Patient Guides", "Blog", "Learn"]} />
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
  borderRadius: 12,
  display: "flex",
  flexDirection: "column",
  minHeight: 286,
  minWidth: 0,
  overflow: "hidden",
  transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
};

const productImageWrapStyle: CSSProperties = {
  background: "#f6f8f6",
  borderBottom: "1px solid #edf2ee",
  height: 158,
  position: "relative",
};

const badgeStyle: CSSProperties = {
  alignSelf: "flex-start",
  background: "#e9f4ee",
  borderRadius: 999,
  color: "#004633",
  fontSize: 10,
  fontWeight: 800,
  padding: "3px 8px",
  textTransform: "uppercase",
};

const miniBadgeStyle: CSSProperties = {
  background: "#00624b",
  borderRadius: 999,
  color: "#fff",
  fontSize: 10,
  fontWeight: 900,
  padding: "3px 8px",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const descriptionStyle: CSSProperties = {
  color: "#596960",
  display: "-webkit-box",
  flex: 1,
  fontSize: 13,
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

const viewAllButtonStyle: CSSProperties = {
  background: "transparent",
  border: 0,
  color: "#004633",
  cursor: "pointer",
  font: "inherit",
  fontSize: 13,
  fontWeight: 800,
  padding: 0,
  textDecoration: "none",
  whiteSpace: "nowrap",
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

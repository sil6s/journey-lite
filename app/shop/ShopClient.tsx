"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition, useCallback } from "react";
import {
  ArrowLeft,
  Headphones,
  Package,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Info,
  FileText,
  CheckCircle2,
  UserRound,
} from "lucide-react";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { addToCart } from "@/lib/shopify/actions";

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STORE_URL = SHOPIFY_STORE_DOMAIN ? `https://${SHOPIFY_STORE_DOMAIN}` : null;
const CART_ID_KEY = "journeylite_shopify_cart_id";
const CART_URL_KEY = "journeylite_shopify_checkout_url";
const CART_QTY_KEY = "journeylite_shopify_cart_qty";
const CART_UPDATED_EVENT = "journeylite-shopify-cart-updated";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Phase = "all" | "pre-op" | "post-op" | "long-term";
type ProteinFilter = "all" | "shake" | "bar" | "liquid";

// ─────────────────────────────────────────────────────────────────────────────
// Product categorization (derived from productType + handle)
// ─────────────────────────────────────────────────────────────────────────────

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

function getPhases(p: ShopifyProduct): Phase[] {
  const pt = p.productType;
  const h = p.handle;
  const tags = p.tags.map((tag) => tag.toLowerCase());
  const hasTag = (tag: string) => tags.includes(tag.toLowerCase());
  if ((pt === "Vitamin Kits" || pt === "Vitamins & Supplements") && (h.includes("starter-kit") || hasTag("Procedure Starter Kits"))) return ["pre-op"];
  if ((pt === "Vitamin Kits" || pt === "Vitamins & Supplements") && (h.includes("90-day") || h.includes("90days") || hasTag("Procedure Maintenance Kits"))) return ["long-term"];
  if (pt === "Pre-op Diet" || pt === "Diet Kits") {
    if (h.includes("clear-liquid") || h.includes("post-op") || hasTag("Post-Op Diet Kits")) return ["post-op"];
    return ["pre-op"];
  }
  if (pt === "Services") return ["all"];
  return ["post-op", "long-term"];
}

function matchesPhase(p: ShopifyProduct, phase: Phase): boolean {
  if (phase === "all") return true;
  return getPhases(p).includes(phase);
}

// ─────────────────────────────────────────────────────────────────────────────
// Surgery types
// ─────────────────────────────────────────────────────────────────────────────

const SURGERY_TYPES = [
  { key: "gastric-sleeve", label: "Gastric Sleeve", shortLabel: "Sleeve", note: "Most sleeve patients" },
  { key: "gastric-bypass", label: "Gastric Bypass", shortLabel: "Bypass", note: "Bypass-specific support" },
  { key: "sadi-sips", label: "SADI/SIPS", shortLabel: "SADI/SIPS", note: "Higher-malabsorption plan" },
  { key: "gastric-band", label: "Gastric Band", shortLabel: "Band", note: "Band procedure plan" },
  { key: "gastric-balloon", label: "Gastric Balloon", shortLabel: "Balloon", note: "Non-surgical balloon plan" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Grid orphan-span calculation
// ─────────────────────────────────────────────────────────────────────────────

function spanFor(index: number, total: number, cols: number): number {
  // If all products fit in one row (or fewer), no orphan manipulation
  if (total <= cols) return 1;
  const orphans = total % cols;
  if (orphans === 0) return 1;
  const orphanStart = total - orphans;

  if (cols === 4 && orphans === 1 && index >= total - 5) {
    return [2, 1, 1, 2, 2][index - (total - 5)];
  }

  if (index < orphanStart) return 1;
  // Orphan row rules per spec
  if (cols === 4) {
    if (orphans === 2) return 2;
    if (orphans === 3) return 1;
  }
  if (cols === 3) {
    if (orphans === 1 && index >= total - 4) {
      return [2, 1, 1, 2][index - (total - 4)];
    }
  }
  return 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Price formatter
// ─────────────────────────────────────────────────────────────────────────────

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
  if (tag === "type-other-vitamin") return "Supplement";
  if (tag === "type-shake") return "Shake / pudding";
  if (tag === "type-bar") return "Protein bar";
  if (tag === "type-drink") return "Protein drink";
  if (tag === "type-chip") return "Protein snack";
  if (tag === "type-snack") return "Meal";
  if (tag === "type-service") return "Service";
  return product.productType || "Product";
}

// ─────────────────────────────────────────────────────────────────────────────
// Buy button
// ─────────────────────────────────────────────────────────────────────────────

function BuyBtn({
  variantId,
  available,
  label = "Add to cart",
  featured = false,
}: {
  variantId: string;
  available: boolean;
  label?: string;
  featured?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const pad = featured ? "8px 18px" : "6px 12px";
  const fs = featured ? 13 : 12;
  const iconSz = featured ? 14 : 12;

  if (!available) {
    return (
      <button
        disabled
        style={{
          background: "#e8f0eb",
          color: "#9aafa5",
          border: "none",
          borderRadius: 7,
          padding: pad,
          fontSize: fs,
          fontWeight: 500,
          cursor: "not-allowed",
          whiteSpace: "nowrap",
        }}
      >
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
    <div className="jls-buy-wrap">
      <button
        className="jls-buybtn"
        onClick={handleBuy}
        disabled={isPending}
        style={{
          background: "#0D3D24",
          color: "#fff",
          border: "none",
          borderRadius: 7,
          padding: pad,
          fontSize: fs,
          fontWeight: 500,
          cursor: isPending ? "wait" : "pointer",
          whiteSpace: "nowrap",
          display: "inline-flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
          opacity: isPending ? 0.75 : 1,
          fontFamily: "inherit",
        }}
      >
        <ShoppingCart size={iconSz} />
        {isPending ? "Adding…" : label}
      </button>
      {error && (
        <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Product card
// ─────────────────────────────────────────────────────────────────────────────

function PCard({
  product,
  span = 1,
}: {
  product: ShopifyProduct;
  span?: number;
}) {
  const variant = product.variants.edges[0]?.node ?? null;
  const price = product.priceRange.minVariantPrice;
  const maxPrice = product.priceRange.maxVariantPrice;
  const hasRange = price.amount !== maxPrice.amount;
  const description = conciseDescription(product);
  const isFmlaPaperwork = /fmla|short-term|disability|paperwork/i.test(`${product.title} ${product.handle}`);

  return (
    <div
      className="jls-product-card"
      style={{
        background: "#fff",
        border: "1px solid #d4e3da",
        borderRadius: 8,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        minHeight: 158,
        gridColumn: span > 1 ? `span ${span}` : undefined,
      }}
    >
      <p
        style={{
          alignSelf: "flex-start",
          background: "#edf4ef",
          borderRadius: 999,
          color: "#3b6d4e",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.07em",
          margin: "0 0 10px",
          padding: "3px 8px",
          textTransform: "uppercase",
        }}
      >
        {productEyebrow(product)}
      </p>

      <p
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#1a3d2b",
          lineHeight: 1.3,
          margin: "0 0 8px",
        }}
      >
        {product.title}
      </p>

      {description && (
        <p
          style={{
            fontSize: 12,
            color: "#7a9a83",
            lineHeight: 1.45,
            margin: "0 0 10px",
            flex: 1,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
          }}
        >
          {description}
        </p>
      )}

      <div
        className="jls-product-footer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginTop: "auto",
          flexWrap: "nowrap",
          borderTop: "1px solid #edf2ee",
          paddingTop: 12,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#0D3D24",
            flexShrink: 0,
          }}
        >
          {hasRange ? "From " : ""}
          {fmtPrice(price.amount, price.currencyCode)}
        </span>
        {variant && (
          <BuyBtn
            variantId={variant.id}
            available={variant.availableForSale}
          />
        )}
      </div>
      {isFmlaPaperwork ? (
        <Link
          href="/fmla-short-term-disability-paperwork"
          style={{
            color: "#145c42",
            fontSize: 12,
            fontWeight: 600,
            marginTop: 10,
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          Complete form after payment
        </Link>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Product grid
// ─────────────────────────────────────────────────────────────────────────────

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
  cols: 2 | 3 | 4;
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
  const gridCols = cols;

  return (
    <>
      <div
        className={`jls-grid jls-g${gridCols}`}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gap: 14,
          marginBottom: hidden > 0 || expanded ? 8 : 16,
        }}
      >
        {visible.map((p, i) => (
          <PCard key={p.id} product={p} span={spanFor(i, visible.length, gridCols)} />
        ))}
      </div>

      {!expanded && hidden > 0 && (
        <button onClick={() => toggle(id)} style={showMoreBtn}>
          <ChevronDown size={14} />
          Show {hidden} more {label}
        </button>
      )}
      {expanded && products.length > defaultShow && (
        <button onClick={() => toggle(id)} style={showMoreBtn}>
          <ChevronUp size={14} />
          Show less
        </button>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section header
// ─────────────────────────────────────────────────────────────────────────────

function SectionHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div
      style={{
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: "1px solid #dce8e0",
      }}
    >
      <h2 style={{ fontSize: 17, fontWeight: 500, color: "#0D3D24", margin: 0 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 13, color: "#6b8f76", margin: "4px 0 0" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared style objects
// ─────────────────────────────────────────────────────────────────────────────

const showMoreBtn: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "1px solid #c2d9cc",
  borderRadius: 8,
  padding: 10,
  fontSize: 13,
  color: "#3b6d4e",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  marginTop: 4,
  marginBottom: 16,
  fontFamily: "inherit",
};

const subLabel: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  color: "#5a7a65",
  margin: "0 0 10px",
};

const divider: React.CSSProperties = {
  height: 1,
  background: "#d4e3da",
  margin: "20px 0 28px",
  border: "none",
};

// ─────────────────────────────────────────────────────────────────────────────
// Main client component
// ─────────────────────────────────────────────────────────────────────────────

export function ShopClient({ products }: { products: ShopifyProduct[] }) {
  const [phase, setPhase] = useState<Phase>("all");
  const [proteinFilter, setProteinFilter] = useState<ProteinFilter>("all");
  const [showMore, setShowMore] = useState<Record<string, boolean>>({});
  const [selectedSurgery, setSelectedSurgery] = useState("gastric-sleeve");
  const [cartUrl, setCartUrl] = useState<string | null>(null);
  const [cartQty, setCartQty] = useState(0);

  const toggle = useCallback(
    (id: string) => setShowMore((prev) => ({ ...prev, [id]: !prev[id] })),
    []
  );

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

  // ── Bucketed products ──────────────────────────────────────────────────────

  const byTag = (tag: string) =>
    products.filter((p) => getSectionTag(p) === tag && matchesPhase(p, phase));

  const starterKits = products.filter((p) => getSectionTag(p) === "type-preop-kit");
  const selectedKit = starterKits.find(
    (p) => p.handle === `${selectedSurgery}-starter-kit`
  );

  const longTermKits = products.filter(
    (p) => getSectionTag(p) === "type-long-term-kit" && matchesPhase(p, phase)
  );
  const preOpDiet = byTag("type-preop-diet");
  const clearLiquid = products.filter(
    (p) => getSectionTag(p) === "type-clear-liquid" && matchesPhase(p, phase)
  );
  const services = byTag("type-service");

  const multivitamins = byTag("type-multivitamin");
  const calcium = byTag("type-calcium");
  const b12VitD = byTag("type-b12-vitamin-d");
  const iron = byTag("type-iron");
  const otherVitamins = byTag("type-other-vitamin");
  const additionalSupplements = [...iron, ...otherVitamins];
  const shakes = byTag("type-shake");
  const bars = byTag("type-bar");
  const drinks = byTag("type-drink");
  const chips = byTag("type-chip");
  const snacks = byTag("type-snack");
  const otherProducts = byTag("type-other");

  const hasVitamins =
    multivitamins.length + calcium.length + b12VitD.length + additionalSupplements.length > 0;

  const showStarterCard = phase === "all" || phase === "pre-op";
  const showPreOpDiet = (phase === "all" || phase === "pre-op") && preOpDiet.length > 0;
  const showLongTerm = (phase === "all" || phase === "long-term") && longTermKits.length > 0;

  // Protein section products (filtered by tab)
  const allProtein = [...shakes, ...bars, ...drinks, ...chips, ...clearLiquid];
  const proteinFiltered =
    proteinFilter === "shake"
      ? shakes
      : proteinFilter === "bar"
      ? [...bars, ...chips]
      : proteinFilter === "liquid"
      ? [...drinks, ...clearLiquid]
      : allProtein;
  const hasProtein = allProtein.length > 0;

  // Phase hint copy
  const phaseHints: Partial<Record<Phase, string>> = {
    "pre-op":
      "Before surgery: These products support your body in the weeks leading up to your procedure. Start with a Starter Kit if you're unsure where to begin.",
    "post-op":
      "After surgery: Focus on chewable or liquid forms for the first several weeks. Your care team will guide your progression.",
    "long-term":
      "Long-term support: Maintain your results with these ongoing daily essentials recommended by your care team.",
  };

  const phaseLabels: Record<Phase, string> = {
    all: "All products",
    "pre-op": "Before surgery",
    "post-op": "After surgery",
    "long-term": "Long-term support",
  };

  const isEmpty =
    !showStarterCard &&
    !hasVitamins &&
    !hasProtein &&
    !showLongTerm &&
    !showPreOpDiet &&
    services.length === 0 &&
    snacks.length === 0 &&
    otherProducts.length === 0;

  return (
    <>
      {/* ─── Scoped styles ──────────────────────────────────────────────────── */}
      <style>{`
        .jls-phasetab { transition: color 0.15s, border-color 0.15s; }
        .jls-phasetab:hover { color: #d4ede0 !important; }
        .jls-ptab:hover { filter: brightness(0.92); }
        .jls-buybtn:hover:not(:disabled) { background: #1a5c38 !important; }
        .jls-shop-link:hover { border-color: #145c42 !important; color: #145c42 !important; background: #f0f5f2 !important; }
        .jls-showmore:hover { background: #e8f2ec !important; }
        .jls-surg:hover { filter: brightness(0.92); }
        .jls-back:hover { background: #eff6f2 !important; }
        .jls-cta-btn:hover { background: #1a5c38 !important; }
        .jls-return:hover { background: #1a5c38 !important; }
        .jls-product-card:hover { border-color: #b9d0c3 !important; box-shadow: 0 10px 22px rgba(25, 61, 43, 0.07); }
        @media (max-width: 1024px) {
          .jls-g4 { grid-template-columns: repeat(2, 1fr) !important; }
          .jls-g3 { grid-template-columns: repeat(2, 1fr) !important; }
          .jls-product-card { grid-column: auto !important; }
        }
        @media (max-width: 640px) {
          .jls-g4, .jls-g3 { grid-template-columns: 1fr !important; }
          .jls-grid { gap: 12px !important; }
          .jls-surgery-row { flex-wrap: wrap; }
          .jls-topbar { padding: 10px 16px !important; }
          .jls-hero { padding: 28px 16px 36px !important; }
          .jls-content { padding: 20px 16px 0 !important; }
          .jls-featcard { flex-direction: column !important; }
          .jls-featcard { padding: 18px !important; }
          .jls-topbar { align-items: flex-start !important; gap: 12px !important; }
          .jls-shop-actions { width: 100% !important; justify-content: space-between !important; }
          .jls-product-footer { align-items: stretch !important; flex-direction: column !important; gap: 10px !important; }
          .jls-buy-wrap, .jls-buybtn { width: 100% !important; }
          .jls-buybtn { padding: 10px 12px !important; }
          .jls-starter-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#f7f9f6",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div
          className="jls-topbar"
          style={{
            background: "#fff",
            borderBottom: "1px solid #dce4df",
            padding: "10px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 4,
            }}
          >
            <Image
              alt="JourneyLite Bariatric Physicians"
              src="/journeylite-logo.svg"
              width={560}
              height={160}
              priority
              style={{ width: 198, maxWidth: "54vw", height: "auto" }}
            />
          </Link>
          <div
            className="jls-shop-actions"
            style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}
          >
            {SHOPIFY_STORE_URL && (
              <>
                <a
                  className="jls-shop-link"
                  href={cartUrl ?? `${SHOPIFY_STORE_URL}/cart`}
                  style={{
                    background: "#fff",
                    border: "1px solid #dce4df",
                    color: "#314139",
                    borderRadius: 6,
                    padding: "7px 10px",
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <ShoppingCart size={14} />
                  Cart{cartQty > 0 ? ` (${cartQty})` : ""}
                </a>
                <a
                  className="jls-shop-link"
                  href={`${SHOPIFY_STORE_URL}/account`}
                  style={{
                    background: "#fff",
                    border: "1px solid #dce4df",
                    color: "#314139",
                    borderRadius: 6,
                    padding: "7px 10px",
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <UserRound size={14} />
                  Account
                </a>
              </>
            )}
            <Link
              className="jls-back"
              href="/"
              style={{
                background: "#f7faf8",
                border: "1px solid #dce4df",
                color: "#145c42",
                borderRadius: 6,
                padding: "7px 12px",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ArrowLeft size={14} />
              Main site
            </Link>
          </div>
        </div>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div
          className="jls-hero"
          style={{
            background: "#0D3D24",
            padding: "30px 32px 34px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#a8ccb5",
              margin: "0 0 12px",
            }}
          >
            Patient supplement store
          </p>
          <h1
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 26,
              fontWeight: "normal",
              color: "#fff",
              margin: "0 0 10px",
            }}
          >
            Everything you need, in one place
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#c2deca",
              maxWidth: 600,
              margin: "0 auto",
              lineHeight: 1.5,
            }}
          >
            Supplements and nutrition products recommended by your JourneyLite care team —
            organized by where you are in your journey.
          </p>
        </div>

        {/* ── Phase nav ───────────────────────────────────────────────────── */}
        <div
          style={{
            background: "#0a2e1b",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "center",
            padding: "0 24px",
            overflowX: "auto",
          }}
        >
          {(["all", "pre-op", "post-op", "long-term"] as Phase[]).map((p) => {
            const active = phase === p;
            return (
              <button
                key={p}
                className="jls-phasetab"
                onClick={() => setPhase(p)}
                style={{
                  color: active ? "#ffffff" : "#8fbfa0",
                  padding: "11px 18px",
                  fontSize: 13,
                  background: "transparent",
                  border: "none",
                  borderBottom: active
                    ? "2px solid #ffffff"
                    : "2px solid transparent",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                }}
              >
                {phaseLabels[p]}
              </button>
            );
          })}
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div
          className="jls-content"
          style={{
            padding: "32px 24px 0",
            width: "100%",
            maxWidth: 1080,
            margin: "0 auto",
          }}
        >
          {/* Phase hint banner */}
          {phaseHints[phase] && (
            <div
              style={{
                background: "#e8f2ec",
                borderLeft: "3px solid #0D3D24",
                borderRadius: "0 6px 6px 0",
                padding: "10px 16px",
                fontSize: 13,
                color: "#0D3D24",
                marginBottom: 28,
                lineHeight: 1.5,
              }}
            >
              {phaseHints[phase]}
            </div>
          )}

          {/* ── Starter kit featured card ────────────────────────────────── */}
          {showStarterCard && starterKits.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p style={subLabel}>Most popular option</p>
                  <h2
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#0D3D24",
                      margin: "0 0 6px",
                      lineHeight: 1.2,
                    }}
                  >
                    Start with a surgery-specific vitamin kit
                  </h2>
                  <p
                    style={{
                      maxWidth: 760,
                      fontSize: 14,
                      color: "#5a7a65",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    If you are not sure what to buy first, choose the starter kit
                    that matches your procedure. It bundles the first-month
                    vitamin essentials your care team commonly recommends.
                  </p>
                </div>
              </div>
              <div
                className="jls-featcard"
                style={{
                  background: "#fff",
                  border: "1px solid #d4e3da",
                  borderRadius: 8,
                  padding: 0,
                  display: "block",
                  overflow: "hidden",
                }}
              >
              <div
                className="jls-starter-layout"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.35fr 0.65fr",
                  gap: 0,
                }}
              >
              <div style={{ padding: "22px 24px" }}>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#0D3D24",
                    margin: "0 0 4px",
                  }}
                >
                  Choose the starter kit for your surgery
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#5a7a65",
                    margin: "0 0 18px",
                    lineHeight: 1.5,
                  }}
                >
                  Pick your procedure and the matching first-month kit updates automatically.
                </p>

                {/* Surgery selector */}
                <p style={{ ...subLabel, marginBottom: 8 }}>Select your procedure</p>
                <div
                  className="jls-surgery-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(132px, 1fr))",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  {SURGERY_TYPES.map((s) => {
                    const active = selectedSurgery === s.key;
                    return (
                      <button
                        key={s.key}
                        className="jls-surg"
                        onClick={() => setSelectedSurgery(s.key)}
                        style={{
                          background: active ? "#edf6f1" : "#fff",
                          color: "#17362a",
                          border: active ? "2px solid #145c42" : "1px solid #d4e3da",
                          borderRadius: 7,
                          padding: "10px 12px",
                          textAlign: "left",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          minHeight: 72,
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            fontSize: 13,
                            fontWeight: 700,
                            color: active ? "#0D3D24" : "#1f2c25",
                          }}
                        >
                          {s.shortLabel}
                          {active && <CheckCircle2 size={15} color="#145c42" />}
                        </span>
                        <span
                          style={{
                            display: "block",
                            marginTop: 4,
                            fontSize: 11,
                            lineHeight: 1.35,
                            color: "#6b8f76",
                          }}
                        >
                          {s.note}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

                {/* Selected kit details */}
                {selectedKit ? (
                  () => {
                    const variant = selectedKit.variants.edges[0]?.node;
                    const price = selectedKit.priceRange.minVariantPrice;
                    const surgery = SURGERY_TYPES.find((s) => s.key === selectedSurgery);
                    return (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "stretch",
                          justifyContent: "space-between",
                          flexDirection: "column",
                          gap: 14,
                          background: "#f7faf8",
                          borderLeft: "1px solid #dce8e0",
                          height: "100%",
                          padding: "22px 24px",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: 11,
                              color: "#5a7a65",
                              margin: "0 0 4px",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              fontWeight: 700,
                            }}
                          >
                            Matched kit for {surgery?.label}
                          </p>
                          <p
                            style={{
                              fontSize: 18,
                              color: "#0D3D24",
                              margin: "0 0 8px",
                              fontWeight: 700,
                              lineHeight: 1.25,
                            }}
                          >
                            {selectedKit.title}
                          </p>
                          <span
                            style={{
                              fontSize: 20,
                              fontWeight: 700,
                              color: "#0D3D24",
                            }}
                          >
                            {fmtPrice(price.amount, price.currencyCode)}
                          </span>
                        </div>
                        {variant && (
                          <BuyBtn
                            variantId={variant.id}
                            available={variant.availableForSale}
                            featured
                          />
                        )}
                      </div>
                    );
                  }
                )() : (
                  <p style={{ fontSize: 13, color: "#9aafa5" }}>
                    Kit not available for this surgery type.
                  </p>
                )}
              </div>
              </div>
            </section>
          )}

          {/* ── Pre-op diet kits ─────────────────────────────────────────── */}
          {showPreOpDiet && (
            <section style={{ marginBottom: 40 }}>
              <SectionHead
                title="Pre-Op Diet Kits"
                subtitle="BMI-matched meal replacement kits to prepare your liver before surgery"
              />
              <PGrid
                products={preOpDiet}
                cols={3}
                defaultShow={4}
                id="preop-diet"
                label="diet kits"
                showMore={showMore}
                toggle={toggle}
              />
            </section>
          )}

          {/* ── 90-day refill kits ───────────────────────────────────────── */}
          {showLongTerm && (
            <section style={{ marginBottom: 40 }}>
              <SectionHead
                title="90-Day Vitamin Refill Kits"
                subtitle="Ongoing supply packs matched to your surgery type — for after your first month"
              />
              <PGrid
                products={longTermKits}
                cols={4}
                defaultShow={5}
                id="long-term-kits"
                label="refill kits"
                showMore={showMore}
                toggle={toggle}
              />
            </section>
          )}

          {/* ── Vitamins & Supplements ───────────────────────────────────── */}
          {hasVitamins && (
            <section style={{ marginBottom: 40 }}>
              <SectionHead
                title="Vitamins & Supplements"
                subtitle="Individual supplements recommended for bariatric patients"
              />

              {/* Absorption order notice */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#fff8e8",
                  border: "1px solid #f0d080",
                  borderRadius: 20,
                  padding: "4px 12px",
                  fontSize: 11,
                  color: "#7a5800",
                  marginBottom: 20,
                }}
              >
                <Info size={12} />
                Ordered by absorption: chewable first, then capsules
              </div>

              {multivitamins.length > 0 && (
                <>
                  <p style={subLabel}>Multivitamins</p>
                  <div className="jls-g4">
                    <PGrid
                      products={multivitamins}
                      cols={4}
                      defaultShow={8}
                      id="multivitamins"
                      label="multivitamins"
                      showMore={showMore}
                      toggle={toggle}
                    />
                  </div>
                </>
              )}

              {calcium.length > 0 && (
                <>
                  {multivitamins.length > 0 && <hr style={divider} />}
                  <p style={subLabel}>Calcium</p>
                  <div className="jls-g3">
                    <PGrid
                      products={calcium}
                      cols={3}
                      defaultShow={4}
                      id="calcium"
                      label="calcium"
                      showMore={showMore}
                      toggle={toggle}
                    />
                  </div>
                </>
              )}

              {b12VitD.length > 0 && (
                <>
                  {(multivitamins.length > 0 || calcium.length > 0) && (
                    <hr style={divider} />
                  )}
                  <p style={subLabel}>B12 & Vitamin D</p>
                  <div className="jls-g4">
                    <PGrid
                      products={b12VitD}
                      cols={4}
                      defaultShow={4}
                      id="b12-vitd"
                      label="B12 & Vitamin D"
                      showMore={showMore}
                      toggle={toggle}
                    />
                  </div>
                </>
              )}

              {additionalSupplements.length > 0 && (
                <>
                  <hr style={divider} />
                  <p style={subLabel}>Additional Supplements</p>
                  <div className="jls-g3">
                    <PGrid
                      products={additionalSupplements}
                      cols={3}
                      defaultShow={4}
                      id="additional-supplements"
                      label="supplements"
                      showMore={showMore}
                      toggle={toggle}
                    />
                  </div>
                </>
              )}
            </section>
          )}

          {/* ── Protein Shakes & Bars ────────────────────────────────────── */}
          {hasProtein && (
            <section style={{ marginBottom: 40 }}>
              <SectionHead
                title="Protein Shakes & Bars"
                subtitle="High-protein nutrition to support your recovery and long-term health"
              />

              {/* Filter tabs */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {(
                  [
                    { key: "all" as ProteinFilter, label: "All", count: allProtein.length },
                    { key: "shake" as ProteinFilter, label: "Shakes", count: shakes.length },
                    { key: "bar" as ProteinFilter, label: "Bars & chips", count: bars.length + chips.length },
                    { key: "liquid" as ProteinFilter, label: "Drinks & liquid diet", count: drinks.length + clearLiquid.length },
                  ] as const
                )
                  .filter((t) => t.count > 0)
                  .map((t) => (
                    <button
                      key={t.key}
                      className="jls-ptab"
                      onClick={() => setProteinFilter(t.key)}
                      style={{
                        background:
                          proteinFilter === t.key ? "#0D3D24" : "#e8f2ec",
                        color: proteinFilter === t.key ? "#fff" : "#2a5a3a",
                        border: "none",
                        borderRadius: 20,
                        padding: "6px 14px",
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
              </div>

              <div className="jls-g4">
                <PGrid
                  products={proteinFiltered}
                  cols={4}
                  defaultShow={4}
                  id={`protein-${proteinFilter}`}
                  label="products"
                  showMore={showMore}
                  toggle={toggle}
                />
              </div>
            </section>
          )}

          {/* ── Program fees & services ─────────────────────────────────── */}
          {services.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <SectionHead
                title="Program Fees & Services"
                subtitle="Administrative fees and visit payments handled through secure Shopify checkout"
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <FileText size={16} color="#5a7a65" />
                <p style={{ fontSize: 12, color: "#5a7a65", margin: 0 }}>
                  Use these only when directed by the JourneyLite team.
                </p>
              </div>
              <PGrid
                products={services}
                cols={3}
                defaultShow={6}
                id="services"
                label="services"
                showMore={showMore}
                toggle={toggle}
              />
            </section>
          )}

          {/* ── Food & snacks ────────────────────────────────────────────── */}
          {snacks.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <SectionHead
                title="Food & Snacks"
                subtitle="Bariatric-friendly meals and snacks"
              />
              <div className="jls-g3">
                <PGrid
                  products={snacks}
                  cols={3}
                  defaultShow={4}
                  id="snacks"
                  label="snacks"
                  showMore={showMore}
                  toggle={toggle}
                />
              </div>
            </section>
          )}

          {/* ── Catch-all for future Shopify product types ──────────────── */}
          {otherProducts.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <SectionHead
                title="Other Products"
                subtitle="Additional JourneyLite shop items"
              />
              <div className="jls-g3">
                <PGrid
                  products={otherProducts}
                  cols={3}
                  defaultShow={6}
                  id="other-products"
                  label="products"
                  showMore={showMore}
                  toggle={toggle}
                />
              </div>
            </section>
          )}

          {/* ── Empty state ──────────────────────────────────────────────── */}
          {isEmpty && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 24px",
                color: "#7a9a83",
              }}
            >
              <Package
                size={40}
                color="#c2d9cc"
                style={{ marginBottom: 12, display: "block", margin: "0 auto 12px" }}
              />
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: "#3b6d4e",
                  marginBottom: 6,
                }}
              >
                No products for this phase yet
              </p>
              <p style={{ fontSize: 13 }}>
                Try &ldquo;All products&rdquo; to see everything we carry.
              </p>
            </div>
          )}

          {/* ── Care team CTA ─────────────────────────────────────────────── */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #d4e3da",
              borderRadius: 12,
              padding: "20px 20px 24px",
              marginBottom: 40,
            }}
          >
            <div
              style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: "#e8f2ec",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Headphones size={20} color="#0D3D24" />
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: "#0D3D24",
                    margin: "0 0 6px",
                  }}
                >
                  Not sure what to order?
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#5a7a65",
                    lineHeight: 1.6,
                    margin: "0 0 14px",
                  }}
                >
                  Your care team can help you choose the right supplements for
                  your procedure and health history.
                </p>
                <Link
                  className="jls-cta-btn"
                  href="/contact"
                  style={{
                    background: "#0D3D24",
                    color: "#fff",
                    border: "none",
                    borderRadius: 7,
                    padding: "8px 18px",
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                  }}
                >
                  Contact your care team
                </Link>
              </div>
            </div>
          </div>

          {/* ── Return button ────────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "0 24px",
              marginTop: 32,
              marginBottom: 48,
            }}
          >
            <a
              className="jls-return"
              href="https://journeylite.com"
              style={{
                background: "#0D3D24",
                color: "#fff",
                borderRadius: 40,
                padding: "12px 28px",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ArrowLeft size={16} />
              Return to JourneyLite.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

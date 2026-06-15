"use client";

import { useState, useTransition, useCallback } from "react";
import {
  Leaf,
  ArrowLeft,
  Headphones,
  Package,
  Pill,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { createCheckout } from "@/lib/shopify/actions";

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
  if (pt === "Vitamin Kits") {
    if (h.includes("starter-kit")) return "type-preop-kit";
    if (h.includes("90-day") || h.includes("90days")) return "type-long-term-kit";
    return "type-other";
  }
  if (pt === "Pre-op Diet") {
    if (h.includes("clear-liquid") || h.includes("post-op")) return "type-clear-liquid";
    return "type-preop-diet";
  }
  if (pt === "Multivitamins") return "type-multivitamin";
  if (pt === "Calcium") return "type-calcium";
  if (pt === "B12" || pt === "D Vitamins") return "type-b12-vitamin-d";
  if (pt === "Iron") return "type-iron";
  if (pt === "Other Vitamins") return "type-other-vitamin";
  if (pt === "Bars VLC" || pt === "Bars Crunchy") return "type-bar";
  if (pt === "Smoothies") return "type-shake";
  if (["Pasta & Potatoes", "Breakfast", "Soups", "Snacks"].includes(pt)) return "type-snack";
  return "type-other";
}

function getPhases(p: ShopifyProduct): Phase[] {
  const pt = p.productType;
  const h = p.handle;
  if (pt === "Vitamin Kits" && h.includes("starter-kit")) return ["pre-op"];
  if (pt === "Vitamin Kits" && (h.includes("90-day") || h.includes("90days"))) return ["long-term"];
  if (pt === "Pre-op Diet") {
    if (h.includes("clear-liquid") || h.includes("post-op")) return ["post-op"];
    return ["pre-op"];
  }
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
  { key: "gastric-sleeve", label: "Sleeve" },
  { key: "gastric-bypass", label: "Bypass" },
  { key: "sadi-sips", label: "SADI/SIPS" },
  { key: "gastric-band", label: "Band" },
  { key: "gastric-balloon", label: "Balloon" },
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
  if (index < orphanStart) return 1;
  // Orphan row rules per spec
  if (cols === 4) {
    if (orphans === 1) return 4;
    if (orphans === 2) return 2;
    if (orphans === 3) return 2;
  }
  if (cols === 3) {
    if (orphans === 1) return 3;
    if (orphans === 2) return 2; // each spans 2 in 3-col grid
  }
  return 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Price formatter
// ─────────────────────────────────────────────────────────────────────────────

function fmtPrice(amount: string, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(parseFloat(amount));
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
      const res = await createCheckout(variantId);
      if (res.error) setError(res.error);
      else if (res.checkoutUrl) window.location.href = res.checkoutUrl;
    });
  }

  return (
    <div>
      <button
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
          alignItems: "center",
          gap: 6,
          opacity: isPending ? 0.75 : 1,
          fontFamily: "inherit",
        }}
      >
        <ShoppingCart size={iconSz} />
        {isPending ? "Redirecting…" : label}
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
  const image = product.images.edges[0]?.node ?? null;
  const variant = product.variants.edges[0]?.node ?? null;
  const price = product.priceRange.minVariantPrice;
  const maxPrice = product.priceRange.maxVariantPrice;
  const hasRange = price.amount !== maxPrice.amount;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #d4e3da",
        borderRadius: 10,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        gridColumn: span > 1 ? `span ${span}` : undefined,
      }}
    >
      {/* Image */}
      <div
        style={{
          width: "100%",
          aspectRatio: span > 1 ? undefined : "1/1",
          maxHeight: span > 1 ? 120 : undefined,
          background: "#f0f5f2",
          borderRadius: 7,
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${image.url}&width=400`}
            alt={image.altText ?? product.title}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <Package size={28} color="#b8cfc6" />
        )}
      </div>

      {/* Name */}
      <p
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "#1a3d2b",
          lineHeight: 1.35,
          marginBottom: 4,
          margin: "0 0 4px",
        }}
      >
        {product.title}
      </p>

      {/* Description/meta */}
      {product.description && (
        <p
          style={{
            fontSize: 11,
            color: "#7a9a83",
            margin: "0 0 8px",
            flex: 1,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
          }}
        >
          {product.description}
        </p>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginTop: "auto",
          flexWrap: "nowrap",
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

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 14,
          marginBottom: hidden > 0 || expanded ? 8 : 16,
        }}
      >
        {visible.map((p, i) => (
          <PCard key={p.id} product={p} span={spanFor(i, visible.length, cols)} />
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

  const toggle = useCallback(
    (id: string) => setShowMore((prev) => ({ ...prev, [id]: !prev[id] })),
    []
  );

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

  const multivitamins = byTag("type-multivitamin");
  const calcium = byTag("type-calcium");
  const b12VitD = byTag("type-b12-vitamin-d");
  const iron = byTag("type-iron");
  const otherVitamins = byTag("type-other-vitamin");
  const shakes = byTag("type-shake");
  const bars = byTag("type-bar");
  const snacks = byTag("type-snack");

  const hasVitamins =
    multivitamins.length + calcium.length + b12VitD.length + iron.length + otherVitamins.length > 0;

  const showStarterCard = phase === "all" || phase === "pre-op";
  const showPreOpDiet = (phase === "all" || phase === "pre-op") && preOpDiet.length > 0;
  const showLongTerm = (phase === "all" || phase === "long-term") && longTermKits.length > 0;

  // Protein section products (filtered by tab)
  const allProtein = [...shakes, ...bars, ...clearLiquid];
  const proteinFiltered =
    proteinFilter === "shake"
      ? shakes
      : proteinFilter === "bar"
      ? bars
      : proteinFilter === "liquid"
      ? clearLiquid
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
    snacks.length === 0;

  return (
    <>
      {/* ─── Scoped styles ──────────────────────────────────────────────────── */}
      <style>{`
        .jls-phasetab { transition: color 0.15s, border-color 0.15s; }
        .jls-phasetab:hover { color: #d4ede0 !important; }
        .jls-ptab:hover { filter: brightness(0.92); }
        .jls-buybtn:hover:not(:disabled) { background: #1a5c38 !important; }
        .jls-showmore:hover { background: #e8f2ec !important; }
        .jls-surg:hover { filter: brightness(0.92); }
        .jls-back:hover { opacity: 0.9; }
        .jls-cta-btn:hover { background: #1a5c38 !important; }
        .jls-return:hover { background: #1a5c38 !important; }
        @media (max-width: 1024px) {
          .jls-g4 { grid-template-columns: repeat(2, 1fr) !important; }
          .jls-g3 { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .jls-g4, .jls-g3 { grid-template-columns: 1fr !important; }
          .jls-surgery-row { flex-wrap: wrap; }
          .jls-topbar { padding: 10px 16px !important; }
          .jls-hero { padding: 28px 16px 36px !important; }
          .jls-content { padding: 20px 16px 0 !important; }
          .jls-featcard { flex-direction: column !important; }
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
            background: "#0D3D24",
            padding: "12px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Leaf size={16} color="#a8ccb5" />
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 500 }}>
              JourneyLite Shop
            </span>
          </div>
          <a
            className="jls-back"
            href="https://journeylite.com"
            style={{
              background: "#fff",
              color: "#0D3D24",
              borderRadius: 6,
              padding: "7px 16px",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <ArrowLeft size={14} />
            Back to JourneyLite.com
          </a>
        </div>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div
          className="jls-hero"
          style={{
            background: "#0D3D24",
            padding: "40px 32px 48px",
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
              fontSize: 28,
              fontWeight: "normal",
              color: "#fff",
              margin: "0 0 14px",
            }}
          >
            Everything you need, in one place
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#c2deca",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.6,
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
            maxWidth: 1200,
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
            <div
              className="jls-featcard"
              style={{
                background: "#fff",
                border: "1px solid #d4e3da",
                borderRadius: 12,
                padding: "20px 24px",
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
                marginBottom: 24,
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: "#e8f2ec",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "#0D3D24",
                }}
              >
                <Pill size={22} />
              </div>

              {/* Body */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#0D3D24",
                    margin: "0 0 4px",
                  }}
                >
                  Vitamin Starter Kit
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#5a7a65",
                    margin: "0 0 14px",
                    lineHeight: 1.5,
                  }}
                >
                  Our most popular bundle — everything your care team recommends,
                  at a lower price than buying individually. 1-month supply.
                  Choose your surgery type:
                </p>

                {/* Surgery selector */}
                <div
                  className="jls-surgery-row"
                  style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}
                >
                  {SURGERY_TYPES.map((s) => (
                    <button
                      key={s.key}
                      className="jls-surg"
                      onClick={() => setSelectedSurgery(s.key)}
                      style={{
                        background:
                          selectedSurgery === s.key ? "#0D3D24" : "#e8f2ec",
                        color: selectedSurgery === s.key ? "#fff" : "#2a5a3a",
                        border: "none",
                        borderRadius: 20,
                        padding: "5px 13px",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Selected kit details */}
                {selectedKit ? (
                  () => {
                    const variant = selectedKit.variants.edges[0]?.node;
                    const price = selectedKit.priceRange.minVariantPrice;
                    return (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 12,
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: 12,
                              color: "#7a9a83",
                              margin: "0 0 2px",
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

              {iron.length > 0 && (
                <>
                  <hr style={divider} />
                  <p style={subLabel}>Iron</p>
                  <div className="jls-g3">
                    <PGrid
                      products={iron}
                      cols={3}
                      defaultShow={4}
                      id="iron"
                      label="iron"
                      showMore={showMore}
                      toggle={toggle}
                    />
                  </div>
                </>
              )}

              {otherVitamins.length > 0 && (
                <>
                  <hr style={divider} />
                  <p style={subLabel}>Other Supplements</p>
                  <div className="jls-g3">
                    <PGrid
                      products={otherVitamins}
                      cols={3}
                      defaultShow={4}
                      id="other-vitamins"
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
                    { key: "bar" as ProteinFilter, label: "Bars", count: bars.length },
                    { key: "liquid" as ProteinFilter, label: "Liquid diet", count: clearLiquid.length },
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
                <a
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
                </a>
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

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, LockKeyhole, Minus, Plus, ShieldCheck, ShoppingCart, Trash2, Truck } from "lucide-react";
import { getCart, removeCartLine, updateCartLine } from "@/lib/shopify/actions";
import type { ShopifyCart } from "@/lib/shopify/types";

const CART_ID_KEY = "journeylite_shopify_cart_id";
const CART_URL_KEY = "journeylite_shopify_checkout_url";
const CART_QTY_KEY = "journeylite_shopify_cart_qty";
const CART_UPDATED_EVENT = "journeylite-shopify-cart-updated";
const FREE_SHIPPING_TARGET = 150;

export function CartReviewClient() {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCart() {
      const cartId = window.localStorage.getItem(CART_ID_KEY);
      if (!cartId) {
        setLoading(false);
        return;
      }

      const result = await getCart(cartId);
      if (cancelled) return;
      if (result.cart) applyCartState(result.cart);
      else setError(result.error || "Could not load your cart.");
      setLoading(false);
    }

    loadCart();
    return () => {
      cancelled = true;
    };
  }, []);

  function applyCartState(nextCart: ShopifyCart | null) {
    setCart(nextCart);
    if (!nextCart) {
      window.localStorage.removeItem(CART_QTY_KEY);
      return;
    }
    window.localStorage.setItem(CART_ID_KEY, nextCart.id);
    window.localStorage.setItem(CART_URL_KEY, nextCart.checkoutUrl);
    window.localStorage.setItem(CART_QTY_KEY, String(nextCart.totalQuantity));
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: nextCart }));
  }

  async function changeLine(lineId: string, quantity: number) {
    if (!cart?.id) return;
    setUpdating(lineId);
    setError("");
    const result = quantity <= 0 ? await removeCartLine(cart.id, lineId) : await updateCartLine(cart.id, lineId, quantity);
    if (result.cart) applyCartState(result.cart);
    else setError(result.error || "Could not update your cart.");
    setUpdating(null);
  }

  const lines = cart?.lines.edges.map((edge) => edge.node) ?? [];
  const subtotal = Number(cart?.cost?.subtotalAmount.amount ?? 0);
  const currency = cart?.cost?.subtotalAmount.currencyCode ?? "USD";
  const checkoutHref = cart?.checkoutUrl ?? "/shop";
  const remaining = Math.max(FREE_SHIPPING_TARGET - subtotal, 0);
  const progress = Math.min((subtotal / FREE_SHIPPING_TARGET) * 100, 100);

  return (
    <main className="min-h-screen bg-[#f7f8f6] text-[#071b13]">
      <div className="border-b border-[#e0e6e2] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 lg:px-8">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href="/shop">
            <ArrowLeft className="size-4" />
            Continue shopping
          </Link>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#53635b]">
            <LockKeyhole className="size-4 text-[#145c42]" />
            Secure checkout powered by Shopify
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#00624b]">JourneyLite Store</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-[#052b1f] md:text-5xl">Review your cart</h1>
          <p className="mt-3 text-base leading-7 text-[#53635b]">Confirm your items before continuing to the final secure Shopify checkout.</p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-[#dce4df] bg-white p-8 text-sm text-[#53635b] shadow-sm">Loading your cart...</div>
        ) : lines.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="overflow-hidden rounded-xl border border-[#dce4df] bg-white shadow-sm">
              <div className="border-b border-[#e7eee9] px-5 py-4">
                <h2 className="text-lg font-semibold text-[#153f2b]">Items ({cart?.totalQuantity ?? 0})</h2>
              </div>
              <div className="divide-y divide-[#edf1ee]">
                {lines.map((line) => {
                  const image = line.merchandise.image;
                  const price = line.merchandise.price;
                  const title = line.merchandise.product.title;
                  return (
                    <div className="grid gap-4 p-5 sm:grid-cols-[96px_1fr_auto]" key={line.id}>
                      <div className="relative min-h-24 rounded-lg bg-[#f6f8f6]">
                        {image ? (
                          <Image alt={image.altText || title} fill sizes="96px" src={image.url} style={{ objectFit: "contain", padding: 10 }} />
                        ) : (
                          <div className="flex h-full min-h-24 items-center justify-center text-[#145c42]">
                            <ShoppingCart className="size-7" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold leading-6 text-[#193f2c]">{title}</p>
                        <p className="mt-1 text-sm text-[#64736b]">{line.merchandise.title !== "Default Title" ? line.merchandise.title : "JourneyLite Store"}</p>
                        <p className="mt-3 text-sm font-semibold text-[#193f2c]">{price ? formatMoney(price.amount, price.currencyCode) : ""}</p>
                      </div>
                      <div className="flex items-center gap-3 sm:justify-end">
                        <button aria-label={`Decrease ${title}`} className={qtyButtonClass} disabled={updating === line.id} onClick={() => changeLine(line.id, line.quantity - 1)}>
                          <Minus className="size-3.5" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold">{line.quantity}</span>
                        <button aria-label={`Increase ${title}`} className={qtyButtonClass} disabled={updating === line.id} onClick={() => changeLine(line.id, line.quantity + 1)}>
                          <Plus className="size-3.5" />
                        </button>
                        <button aria-label={`Remove ${title}`} className="inline-flex size-9 items-center justify-center rounded-md text-[#53635b] transition hover:bg-red-50 hover:text-red-700" disabled={updating === line.id} onClick={() => changeLine(line.id, 0)}>
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="h-fit rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#153f2b]">Order summary</h2>
              <div className="mt-5 rounded-lg bg-[#eef4f1] p-4">
                <p className="text-sm font-semibold text-[#193f2c]">
                  {remaining > 0 ? `${formatMoney(String(remaining), currency)} away from free shipping.` : "Free shipping unlocked."}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-[#00624b]" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="mt-5 space-y-3 border-b border-[#edf1ee] pb-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#53635b]">Subtotal</span>
                  <strong>{formatMoney(String(subtotal), currency)}</strong>
                </div>
                <p className="text-xs leading-5 text-[#64736b]">Shipping and taxes are calculated during final checkout.</p>
              </div>
              {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
              <a className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#004633] px-5 text-sm font-bold text-white transition hover:bg-[#063a2a]" href={checkoutHref}>
                <LockKeyhole className="size-4" />
                Continue to Secure Checkout
              </a>
              <Link className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[#cbd7d0] bg-white px-5 text-sm font-semibold text-[#17362a] transition hover:border-[#145c42] hover:text-[#145c42]" href="/shop">
                Keep Shopping
              </Link>
              <div className="mt-5 grid gap-3 border-t border-[#edf1ee] pt-5 text-sm text-[#53635b]">
                <p className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#145c42]" />
                  Care-team selected bariatric products and services.
                </p>
                <p className="flex items-start gap-2">
                  <Truck className="mt-0.5 size-4 shrink-0 text-[#145c42]" />
                  Reliable shipping for eligible store items.
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

function EmptyCart() {
  return (
    <div className="rounded-xl border border-dashed border-[#cbd7d0] bg-white p-10 text-center shadow-sm">
      <ShoppingCart className="mx-auto size-10 text-[#9aafa5]" />
      <h2 className="mt-4 text-xl font-semibold text-[#153f2b]">Your cart is empty</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#53635b]">Add products or services from the JourneyLite Store before continuing to checkout.</p>
      <Link className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[#145c42] px-5 text-sm font-semibold text-white transition hover:bg-[#0f4d37]" href="/shop">
        Shop Products
      </Link>
    </div>
  );
}

function formatMoney(amount: string, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(amount));
}

const qtyButtonClass = "inline-flex size-9 items-center justify-center rounded-md border border-[#dce4df] bg-white text-[#193f2c] transition hover:border-[#145c42] hover:text-[#145c42] disabled:opacity-50";

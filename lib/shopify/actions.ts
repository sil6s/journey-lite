"use server";

import { storefrontFetch } from "./client";
import { CART_CREATE_MUTATION } from "./queries";
import type { CartCreateMutation } from "./types";

export async function createCheckout(variantId: string): Promise<{ checkoutUrl?: string; error?: string }> {
  try {
    const data = await storefrontFetch<CartCreateMutation>(CART_CREATE_MUTATION, {
      lines: [{ merchandiseId: variantId, quantity: 1 }],
    });

    if (data.cartCreate.userErrors.length > 0) {
      return { error: data.cartCreate.userErrors[0].message };
    }

    return { checkoutUrl: data.cartCreate.cart.checkoutUrl };
  } catch (e) {
    console.error("[shopify] createCheckout:", e);
    return { error: "Could not initiate checkout. Please try again." };
  }
}

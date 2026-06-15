"use server";

import { storefrontFetch } from "./client";
import { CART_CREATE_MUTATION, CART_LINES_ADD_MUTATION } from "./queries";
import type { CartCreateMutation, CartLinesAddMutation } from "./types";

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

type AddToCartResult = {
  cartId?: string;
  checkoutUrl?: string;
  totalQuantity?: number;
  error?: string;
};

export async function addToCart(
  variantId: string,
  cartId?: string | null
): Promise<AddToCartResult> {
  const lines = [{ merchandiseId: variantId, quantity: 1 }];

  try {
    if (cartId) {
      const data = await storefrontFetch<CartLinesAddMutation>(CART_LINES_ADD_MUTATION, {
        cartId,
        lines,
      });

      const error = data.cartLinesAdd.userErrors[0]?.message;
      if (!error) {
        return {
          cartId: data.cartLinesAdd.cart.id,
          checkoutUrl: data.cartLinesAdd.cart.checkoutUrl,
          totalQuantity: data.cartLinesAdd.cart.totalQuantity,
        };
      }
    }

    const data = await storefrontFetch<CartCreateMutation>(CART_CREATE_MUTATION, { lines });
    const error = data.cartCreate.userErrors[0]?.message;
    if (error) return { error };

    return {
      cartId: data.cartCreate.cart.id,
      checkoutUrl: data.cartCreate.cart.checkoutUrl,
      totalQuantity: data.cartCreate.cart.totalQuantity,
    };
  } catch (e) {
    console.error("[shopify] addToCart:", e);
    return { error: "Could not add this item to your cart. Please try again." };
  }
}

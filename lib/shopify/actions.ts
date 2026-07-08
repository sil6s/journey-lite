"use server";

import { storefrontFetch } from "./client";
import { CART_CREATE_MUTATION, CART_LINES_ADD_MUTATION, CART_LINES_REMOVE_MUTATION, CART_LINES_UPDATE_MUTATION, CART_QUERY } from "./queries";
import type { CartCreateMutation, CartLinesAddMutation, CartLinesRemoveMutation, CartLinesUpdateMutation, CartQuery, ShopifyCart } from "./types";

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
  cart?: ShopifyCart;
  error?: string;
};

export async function addToCart(
  variantId: string,
  cartId?: string | null,
  attributes?: Array<{ key: string; value: string }>
): Promise<AddToCartResult> {
  const lines = [{ merchandiseId: variantId, quantity: 1, ...(attributes?.length ? { attributes } : {}) }];

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
          cart: data.cartLinesAdd.cart,
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
      cart: data.cartCreate.cart,
    };
  } catch (e) {
    console.error("[shopify] addToCart:", e);
    return { error: "Could not add this item to your cart. Please try again." };
  }
}

export async function getCart(cartId: string): Promise<{ cart?: ShopifyCart; error?: string }> {
  try {
    const data = await storefrontFetch<CartQuery>(CART_QUERY, { cartId });
    if (!data.cart) return { error: "Cart was not found." };
    return { cart: data.cart };
  } catch (e) {
    console.error("[shopify] getCart:", e);
    return { error: "Could not load your cart." };
  }
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<{ cart?: ShopifyCart; error?: string }> {
  try {
    const data = await storefrontFetch<CartLinesUpdateMutation>(CART_LINES_UPDATE_MUTATION, {
      cartId,
      lines: [{ id: lineId, quantity }],
    });
    const error = data.cartLinesUpdate.userErrors[0]?.message;
    if (error) return { error };
    return { cart: data.cartLinesUpdate.cart };
  } catch (e) {
    console.error("[shopify] updateCartLine:", e);
    return { error: "Could not update your cart." };
  }
}

export async function removeCartLine(cartId: string, lineId: string): Promise<{ cart?: ShopifyCart; error?: string }> {
  try {
    const data = await storefrontFetch<CartLinesRemoveMutation>(CART_LINES_REMOVE_MUTATION, {
      cartId,
      lineIds: [lineId],
    });
    const error = data.cartLinesRemove.userErrors[0]?.message;
    if (error) return { error };
    return { cart: data.cartLinesRemove.cart };
  } catch (e) {
    console.error("[shopify] removeCartLine:", e);
    return { error: "Could not remove this item." };
  }
}

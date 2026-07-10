import type { Metadata } from "next";
import { getReactPageMetadata } from "@/lib/site/overrides";
import { CartReviewClient } from "./CartReviewClient";

const fallbackMetadata: Metadata = {
  title: "Review Cart | JourneyLite Store",
  description: "Review your JourneyLite Store cart before continuing to secure checkout.",
};

export function generateMetadata() {
  return getReactPageMetadata("/shop/cart", fallbackMetadata);
}

export default function ShopCartPage() {
  return <CartReviewClient />;
}

import { CartReviewClient } from "./CartReviewClient";

export const metadata = {
  title: "Review Cart | JourneyLite Store",
  description: "Review your JourneyLite Store cart before continuing to secure checkout.",
};

export default function ShopCartPage() {
  return <CartReviewClient />;
}

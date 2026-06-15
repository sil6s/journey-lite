import { ShoppingBag } from "lucide-react";
import { ShopClient } from "./ShopClient";
import { storefrontFetch } from "@/lib/shopify/client";
import { PRODUCTS_QUERY } from "@/lib/shopify/queries";
import type { ProductsQuery, ShopifyProduct } from "@/lib/shopify/types";

export const revalidate = 60;

export default async function ShopPage() {
  let products: ShopifyProduct[] = [];
  let fetchError: string | null = null;

  try {
    const data = await storefrontFetch<ProductsQuery>(PRODUCTS_QUERY, { first: 250 });
    products = data.products.edges.map((edge) => edge.node);
  } catch (error) {
    console.error("[shop] failed to fetch products:", error);
    fetchError = error instanceof Error ? error.message : "Unknown error";
  }

  if (fetchError) {
    return (
      <main className="min-h-screen bg-[#f7f9f6] px-5 py-12">
        <div className="mx-auto max-w-3xl rounded-lg border border-red-100 bg-red-50 p-8 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-red-300" />
          <h1 className="mt-4 text-xl font-semibold text-red-800">Could not load products</h1>
          <p className="mt-2 text-sm text-red-700">{fetchError}</p>
        </div>
      </main>
    );
  }

  return <ShopClient products={products} />;
}

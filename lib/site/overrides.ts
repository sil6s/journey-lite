import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { client } from "@/src/lib/sanity/client";
import { reactPageOverrideByPathQuery } from "@/src/lib/sanity/queries";
import type { ReactPageOverride } from "@/src/lib/sanity/types";

export async function getReactPageOverride(path: string) {
  noStore();
  return client.fetch<ReactPageOverride | null>(reactPageOverrideByPathQuery, { path });
}

export async function getReactPageMetadata(path: string, fallback: Metadata): Promise<Metadata> {
  const override = await getReactPageOverride(path).catch(() => null);
  if (!override) return fallback;

  const robots = override.robots ?? "index,follow";
  const noindex = robots.includes("noindex");
  const nofollow = robots.includes("nofollow");

  return {
    ...fallback,
    title: override.seoTitle || fallback.title,
    description: override.seoDescription || fallback.description,
    alternates: override.canonicalUrl ? { canonical: override.canonicalUrl } : fallback.alternates,
    robots: {
      index: !noindex,
      follow: !nofollow,
    },
    openGraph: {
      title: override.ogTitle || override.seoTitle || String(fallback.title ?? ""),
      description: override.ogDescription || override.seoDescription || String(fallback.description ?? ""),
    },
  };
}

import type { MetadataRoute } from "next";
import { servicePages } from "./components/serviceData";
import { client } from "@/src/lib/sanity/client";
import { postSlugsQuery } from "@/src/lib/sanity/queries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://journeylite.com";

const staticRoutes = [
  "",
  "/blog",
  "/contact",
  "/our-team",
  "/gastric-balloon",
  "/bariatric-metrics",
  "/medications",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const blogPosts = await getBlogPosts();

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: now,
      changeFrequency: route === "/blog" ? ("daily" as const) : ("weekly" as const),
      priority: route === "" ? 1 : 0.8,
    })),
    ...servicePages.map((service) => ({
      url: `${siteUrl}/services/${service.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt || now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

async function getBlogPosts() {
  try {
    return await client.fetch<{ slug: string; publishedAt?: string; updatedAt?: string }[]>(
      postSlugsQuery,
      {},
      { next: { revalidate: 3600 } },
    );
  } catch {
    return [];
  }
}

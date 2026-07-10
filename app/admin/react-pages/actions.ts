"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/src/lib/sanity/client";
import { adminReactPageOverridesQuery } from "@/src/lib/sanity/queries";
import type { ReactPageOverride } from "@/src/lib/sanity/types";

export async function fetchReactPageOverrides() {
  return adminClient.fetch<ReactPageOverride[]>(adminReactPageOverridesQuery);
}

export async function saveReactPageOverrideAction(data: Partial<ReactPageOverride> & { _id?: string; title: string; path: string }) {
  const doc = {
    _type: "reactPageOverride",
    title: data.title,
    path: normalizePath(data.path),
    status: data.status ?? "active",
    adminWarning: data.adminWarning,
    eyebrow: data.eyebrow,
    headline: data.headline,
    summary: data.summary,
    contentBlocks: data.contentBlocks ?? [],
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    focusKeyword: data.focusKeyword,
    canonicalUrl: data.canonicalUrl,
    robots: data.robots ?? "index,follow",
    ogTitle: data.ogTitle,
    ogDescription: data.ogDescription,
    structuredDataType: data.structuredDataType ?? "WebPage",
  };

  if (data._id) {
    await adminClient.patch(data._id).set(doc).commit();
  } else {
    await adminClient.create(doc);
  }

  revalidatePath(data.path);
  revalidatePath("/admin/react-pages");
  revalidatePath("/admin/seo");
}

function normalizePath(path: string) {
  const trimmed = path.trim() || "/";
  if (trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

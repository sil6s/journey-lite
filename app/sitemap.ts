/**
 * Localized sitemap.
 *
 * SEO indexing strategy:
 * ─────────────────────
 * • English pages         → always indexed
 * • Spanish (es) manual   → always indexed
 * • Spanish (es) AI CMS   → indexed (indexAiTranslations = true in config)
 * • Arabic, Chinese, etc. → AI-translated CMS pages EXCLUDED from sitemap
 *   (they're served with noindex robots tag — per config.indexAiTranslations = false)
 *
 * Manually-curated pages (homepage, procedure pages, etc.) are included for
 * ALL enabled locales since they have human-reviewed translations.
 *
 * Change indexAiTranslations in lib/i18n/config.ts to opt a language in/out.
 */

import type { MetadataRoute } from "next";
import { client } from "@/src/lib/sanity/client";
import { postSlugsQuery } from "@/src/lib/sanity/queries";
import {
  publicLocales,
  shouldIndexAiTranslations,
  type SupportedLocale,
} from "@/lib/i18n/config";
import { servicePages } from "./components/serviceData";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://journeylite.com";
const now = new Date();

// ── Paths for manually-translated pages (indexed for all locales) ─────────────
// These are high-value pages that have been human-reviewed in each language.
const MANUAL_PATHS = [
  "",                           // homepage
  "/about",
  "/about/our-team",
  "/about/physicians",
  "/about/dietitians",
  "/about/surgery-center",
  "/about/history",
  "/about/locations",
  "/contact",
  "/gastric-balloon",
  "/bariatric-metrics",
  "/medications",
  "/patient-stories",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function localizedUrl(locale: SupportedLocale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}/${locale}${clean === "/" ? "" : clean}`;
}

// ── Sitemap ───────────────────────────────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getBlogPosts();
  const entries: MetadataRoute.Sitemap = [];

  // ── 1. Manual / curated pages — all enabled locales ────────────────────────
  for (const locale of publicLocales as SupportedLocale[]) {
    for (const path of MANUAL_PATHS) {
      entries.push({
        url: localizedUrl(locale, path),
        lastModified: now,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1.0 : 0.8,
      });
    }

    // Service/procedure pages
    for (const service of servicePages) {
      entries.push({
        url: `${SITE_URL}/${locale}/services/${service.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  // ── 2. Blog / CMS posts — only locales where AI translations are indexed ────
  for (const locale of publicLocales as SupportedLocale[]) {
    // English always; other locales only if indexAiTranslations = true
    if (locale !== "en" && !shouldIndexAiTranslations(locale)) continue;

    for (const post of blogPosts) {
      entries.push({
        url: `${SITE_URL}/${locale}/blog/${post.slug}`,
        lastModified: post.updatedAt ?? post.publishedAt ?? now,
        changeFrequency: "monthly",
        priority: locale === "en" ? 0.7 : 0.6,
      });
    }
  }

  // ── 3. Blog index pages ─────────────────────────────────────────────────────
  for (const locale of publicLocales as SupportedLocale[]) {
    entries.push({
      url: localizedUrl(locale, "/blog"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  return entries;
}

async function getBlogPosts(): Promise<
  { slug: string; publishedAt?: string; updatedAt?: string }[]
> {
  try {
    return await client.fetch(postSlugsQuery, {}, { next: { revalidate: 3600 } });
  } catch {
    return [];
  }
}

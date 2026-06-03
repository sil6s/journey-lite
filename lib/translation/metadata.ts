/**
 * Localized metadata builder.
 *
 * Two modes:
 *  • Manual pages  — SEO title/description come from static config or i18next
 *  • AI-translated — SEO title/description come from translation_cache
 *
 * Both produce full hreflang alternates.
 *
 * Usage in a [locale]/resources/[slug]/page.tsx:
 *
 *   export async function generateMetadata({ params }) {
 *     const { locale, slug } = await params
 *     const doc = await fetchSanityDoc(slug)
 *     const cached = await getCachedTranslation(doc._id, locale, hash)
 *
 *     return buildCmsPageMetadata({
 *       locale,
 *       slug,
 *       title: cached?.translated_title ?? doc.title,
 *       description: cached?.translated_seo_description ?? doc.seoDescription,
 *       ogImageUrl: doc.featuredImage ? urlFor(doc.featuredImage).width(1200).url() : undefined,
 *       isAiTranslated: locale !== "en" && !!cached,
 *     })
 *   }
 */

import type { Metadata } from "next";
import { publicLocales, shouldIndexAiTranslations, type SupportedLocale } from "@/lib/i18n/config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://journeylite.com";
const SITE_NAME = "JourneyLite";

// ── Helpers ───────────────────────────────────────────────────────────────────

function canonicalUrl(locale: SupportedLocale, path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}/${locale}${cleanPath}`;
}

function hreflangAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of publicLocales) {
    alternates[locale] = canonicalUrl(locale as SupportedLocale, path);
  }
  alternates["x-default"] = canonicalUrl("en", path);
  return alternates;
}

// ── CMS page metadata (AI-translated blog posts, resources, etc.) ─────────────

type CmsPageMetadataArgs = {
  locale: SupportedLocale;
  /** Path without locale prefix, e.g. "/resources/gastric-sleeve-recovery" */
  path: string;
  title: string;
  description?: string;
  ogImageUrl?: string;
  /** True when this page's content was AI-auto-translated */
  isAiTranslated: boolean;
};

export function buildCmsPageMetadata({
  locale,
  path,
  title,
  description,
  ogImageUrl,
  isAiTranslated,
}: CmsPageMetadataArgs): Metadata {
  const canonical = canonicalUrl(locale, path);
  const shouldIndex = locale === "en" || !isAiTranslated || shouldIndexAiTranslations(locale);

  return {
    title: `${title} | ${SITE_NAME}`,
    description: description ?? undefined,
    alternates: {
      canonical,
      languages: hreflangAlternates(path),
    },
    openGraph: {
      title,
      description: description ?? undefined,
      url: canonical,
      siteName: SITE_NAME,
      locale: locale.replace("-", "_"),
      type: "article",
      images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
    },
    robots: shouldIndex
      ? { index: true, follow: true }
      : { index: false, follow: true }, // noindex AI-translated non-priority locales
  };
}

// ── Manual page metadata (homepage, procedure pages, etc.) ────────────────────

type ManualPageMetadataArgs = {
  locale: SupportedLocale;
  /** Path without locale prefix, e.g. "/procedures/gastric-sleeve" */
  path: string;
  title: string;
  description?: string;
  ogImageUrl?: string;
};

export function buildManualPageMetadata({
  locale,
  path,
  title,
  description,
  ogImageUrl,
}: ManualPageMetadataArgs): Metadata {
  const canonical = canonicalUrl(locale, path);

  return {
    title: `${title} | ${SITE_NAME}`,
    description: description ?? undefined,
    alternates: {
      canonical,
      languages: hreflangAlternates(path),
    },
    openGraph: {
      title,
      description: description ?? undefined,
      url: canonical,
      siteName: SITE_NAME,
      locale: locale.replace("-", "_"),
      type: "website",
      images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TranslationsProvider } from "@/lib/i18n/client";
import { getTranslationsWithResources } from "@/lib/i18n/server";
import {
  getLanguageEntry,
  getTextDirection,
  i18nNamespaces,
  isValidLocale,
  publicLocales,
  type SupportedLocale,
} from "@/lib/i18n/config";

// ── Static params for build-time generation ───────────────────────────────────
export function generateStaticParams() {
  return publicLocales.map((locale) => ({ locale }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const lang = getLanguageEntry(locale);

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://journeylite.com"
    ),
    alternates: {
      languages: Object.fromEntries(
        publicLocales.map((l) => [l, `/${l}`])
      ),
    },
    // OpenGraph locale
    openGraph: { locale: locale.replace("-", "_") },
    other: {
      // Tell browsers the text direction for this locale
      "og:locale": locale,
    },
  };
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 404 for unknown locale segments (e.g. /xyz/...)
  if (!isValidLocale(locale)) notFound();

  const dir = getTextDirection(locale);

  // Pre-load ALL namespaces server-side so they're available to any client
  // component in the tree without additional fetches.
  const { resources } = await getTranslationsWithResources(
    locale as SupportedLocale,
    [...i18nNamespaces]
  );

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        {/* hreflang alternates — important for multilingual SEO */}
        {publicLocales.map((l) => (
          <link
            key={l}
            rel="alternate"
            hrefLang={l}
            href={`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://journeylite.com"}/${l}`}
          />
        ))}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={process.env.NEXT_PUBLIC_SITE_URL ?? "https://journeylite.com"}
        />
      </head>
      <body>
        {/*
         * TranslationsProvider hydrates react-i18next on the client with the
         * resources already loaded on the server — zero extra fetches.
         */}
        <TranslationsProvider
          locale={locale as SupportedLocale}
          namespaces={[...i18nNamespaces]}
          resources={resources}
        >
          {children}
        </TranslationsProvider>
      </body>
    </html>
  );
}

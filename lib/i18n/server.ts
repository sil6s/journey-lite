/**
 * Server-side i18n helper for Next.js App Router Server Components.
 *
 * Usage in a Server Component:
 *   const t = await getTranslations("es", "navigation")
 *   // or multiple namespaces:
 *   const { t, resources } = await getTranslationsWithResources("es", ["common", "forms"])
 */
import { createInstance, type TFunction } from "i18next";
import { readFileSync } from "fs";
import path from "path";
import {
  defaultLocale,
  defaultNamespace,
  type I18nNamespace,
  type SupportedLocale,
} from "./config";

const localesDir = path.join(process.cwd(), "locales");

/** Load a single locale/namespace JSON file. Returns {} on missing file. */
function loadNamespace(locale: string, ns: string): Record<string, unknown> {
  try {
    const filePath = path.join(localesDir, locale, `${ns}.json`);
    return JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * Returns a `t()` function for the given locale and namespace(s).
 * Always falls back to English when a key is missing.
 *
 * This creates a fresh i18next instance per call — safe for concurrent
 * server-component rendering and not shared across requests.
 */
export async function getTranslations(
  locale: SupportedLocale,
  namespace: I18nNamespace | I18nNamespace[] = defaultNamespace,
): Promise<TFunction> {
  const namespaces = Array.isArray(namespace) ? namespace : [namespace];
  const instance = createInstance();

  const resources: Record<string, Record<string, unknown>> = {};

  for (const ns of namespaces) {
    // Load the requested locale
    resources[locale] ??= {};
    resources[locale][ns] = loadNamespace(locale, ns);

    // Always load English as fallback
    if (locale !== defaultLocale) {
      resources[defaultLocale] ??= {};
      resources[defaultLocale][ns] = loadNamespace(defaultLocale, ns);
    }
  }

  await instance.init({
    lng: locale,
    fallbackLng: defaultLocale,
    defaultNS: namespaces[0],
    ns: namespaces,
    resources,
    interpolation: { escapeValue: false },
  });

  return instance.getFixedT(locale, namespaces[0]);
}

/**
 * Like getTranslations() but also returns the raw resources object.
 * Used by the [locale]/layout to hydrate the client-side provider.
 */
export async function getTranslationsWithResources(
  locale: SupportedLocale,
  namespaces: I18nNamespace[],
): Promise<{
  t: TFunction;
  resources: Record<string, Record<string, unknown>>;
}> {
  const instance = createInstance();
  const resources: Record<string, Record<string, unknown>> = {};

  for (const ns of namespaces) {
    resources[locale] ??= {};
    resources[locale][ns] = loadNamespace(locale, ns);
    if (locale !== defaultLocale) {
      resources[defaultLocale] ??= {};
      resources[defaultLocale][ns] = loadNamespace(defaultLocale, ns);
    }
  }

  await instance.init({
    lng: locale,
    fallbackLng: defaultLocale,
    defaultNS: namespaces[0],
    ns: namespaces,
    resources,
    interpolation: { escapeValue: false },
  });

  return {
    t: instance.getFixedT(locale, namespaces[0]),
    resources,
  };
}

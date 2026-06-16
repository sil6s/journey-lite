/**
 * Server-side i18n helper for Next.js App Router Server Components.
 *
 * Usage in a Server Component:
 *   const t = await getTranslations("es", "navigation")
 *   // or multiple namespaces:
 *   const { t, resources } = await getTranslationsWithResources("es", ["common", "forms"])
 */
import { createInstance, type Resource, type ResourceLanguage, type TFunction } from "i18next";
import { readFileSync } from "fs";
import path from "path";
import {
  defaultLocale,
  defaultNamespace,
  type I18nNamespace,
  type SupportedLocale,
} from "./config";
import { applyOverrides, getOverrides } from "@/lib/translation/locale-overrides";

const localesDir = path.join(process.cwd(), "locales");

/** Load a single locale/namespace JSON file. Returns {} on missing file. */
function loadNamespaceFile(locale: string, ns: string): ResourceLanguage {
  try {
    const filePath = path.join(localesDir, locale, `${ns}.json`);
    return JSON.parse(readFileSync(filePath, "utf-8")) as ResourceLanguage;
  } catch {
    return {};
  }
}

/**
 * Load a locale/namespace, merging in AI-translated strings saved by the
 * admin "Auto translate" action. locales/*.json is baked into the deployed
 * bundle (read-only at runtime), so those overrides live in Supabase instead
 * — see lib/translation/locale-overrides.ts.
 */
async function loadNamespace(locale: string, ns: string): Promise<ResourceLanguage> {
  const base = loadNamespaceFile(locale, ns);
  if (locale === defaultLocale) return base; // English is the source, never overridden
  const overrides = await getOverrides(locale, ns);
  return applyOverrides(base as Record<string, unknown>, overrides) as ResourceLanguage;
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

  const resources: Resource = {};

  for (const ns of namespaces) {
    // Load the requested locale
    resources[locale] ??= {};
    resources[locale][ns] = await loadNamespace(locale, ns);

    // Always load English as fallback
    if (locale !== defaultLocale) {
      resources[defaultLocale] ??= {};
      resources[defaultLocale][ns] = await loadNamespace(defaultLocale, ns);
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
  resources: Resource;
}> {
  const instance = createInstance();
  const resources: Resource = {};

  for (const ns of namespaces) {
    resources[locale] ??= {};
    resources[locale][ns] = await loadNamespace(locale, ns);
    if (locale !== defaultLocale) {
      resources[defaultLocale] ??= {};
      resources[defaultLocale][ns] = await loadNamespace(defaultLocale, ns);
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

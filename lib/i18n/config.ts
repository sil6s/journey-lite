/**
 * Central i18n configuration for JourneyLite.
 *
 * This file is imported by middleware, server helpers, client provider,
 * language switcher, metadata utilities, and sitemap generation.
 * Change it here and it takes effect everywhere.
 */

export type SupportedLocale =
  | "en" | "es" | "ar" | "zh" | "fr"
  | "de" | "vi" | "hi" | "ko" | "ru";

export type LanguageEntry = {
  id: SupportedLocale;
  title: string;        // English name (for admin/logs)
  nativeName: string;   // Name as written in the language itself
  isDefault?: boolean;
  enabled: boolean;
  dir: "ltr" | "rtl";
  /** Index AI-translated CMS pages for this locale. Default: false. */
  indexAiTranslations?: boolean;
};

export const supportedLanguages: LanguageEntry[] = [
  { id: "en", title: "English",    nativeName: "English",      isDefault: true, enabled: true,  dir: "ltr", indexAiTranslations: true  },
  { id: "es", title: "Spanish",    nativeName: "Español",                       enabled: true,  dir: "ltr", indexAiTranslations: true  },
  { id: "ar", title: "Arabic",     nativeName: "العربية",                       enabled: true,  dir: "rtl", indexAiTranslations: false },
  { id: "zh", title: "Chinese",    nativeName: "中文",                           enabled: true,  dir: "ltr", indexAiTranslations: false },
  { id: "fr", title: "French",     nativeName: "Français",                      enabled: true,  dir: "ltr", indexAiTranslations: false },
  { id: "de", title: "German",     nativeName: "Deutsch",                       enabled: true,  dir: "ltr", indexAiTranslations: false },
  { id: "vi", title: "Vietnamese", nativeName: "Tiếng Việt",                    enabled: true,  dir: "ltr", indexAiTranslations: false },
  { id: "hi", title: "Hindi",      nativeName: "हिन्दी",                         enabled: true,  dir: "ltr", indexAiTranslations: false },
  { id: "ko", title: "Korean",     nativeName: "한국어",                          enabled: true,  dir: "ltr", indexAiTranslations: false },
  { id: "ru", title: "Russian",    nativeName: "Русский",                       enabled: true,  dir: "ltr", indexAiTranslations: false },
];

// ── Derived helpers ────────────────────────────────────────────────────────────

export const defaultLocale: SupportedLocale = "en";

/** All locale IDs that are publicly shown (enabled = true). */
export const publicLocales = supportedLanguages
  .filter((l) => l.enabled)
  .map((l) => l.id);

/** Locale IDs as a type-safe Set for fast membership checks. */
const localeSet = new Set<string>(publicLocales);

export function isValidLocale(value: string): value is SupportedLocale {
  return localeSet.has(value);
}

export function getLanguageEntry(locale: SupportedLocale): LanguageEntry {
  return supportedLanguages.find((l) => l.id === locale)!;
}

export function getTextDirection(locale: SupportedLocale): "ltr" | "rtl" {
  return getLanguageEntry(locale).dir;
}

export function shouldIndexAiTranslations(locale: SupportedLocale): boolean {
  return getLanguageEntry(locale).indexAiTranslations ?? false;
}

// ── Namespace list ─────────────────────────────────────────────────────────────

/**
 * All i18next namespaces used in the project.
 * Add new namespaces here so the server/client helpers know to load them.
 */
export const i18nNamespaces = [
  "common",
  "navigation",
  "forms",
  "calculators",
  "footer",
  "disclaimers",
] as const;

export type I18nNamespace = (typeof i18nNamespaces)[number];

export const defaultNamespace: I18nNamespace = "common";

// ── Cookie / header names ──────────────────────────────────────────────────────

/** Cookie that remembers the user's chosen locale. */
export const LOCALE_COOKIE = "jl_locale";

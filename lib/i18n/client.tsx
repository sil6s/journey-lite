"use client";

/**
 * Client-side i18n provider for Next.js App Router Client Components.
 *
 * The locale layout (app/[locale]/layout.tsx) pre-loads all namespaces
 * server-side and passes them to this provider as serialized JSON.
 * Client components then call useTranslation() as normal.
 *
 * Usage in a Client Component:
 *   import { useTranslation } from "react-i18next"
 *   const { t } = useTranslation("forms")
 */
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { type PropsWithChildren, useMemo } from "react";
import { defaultLocale, defaultNamespace, type SupportedLocale } from "./config";

type TranslationsProviderProps = PropsWithChildren<{
  locale: SupportedLocale;
  namespaces: string[];
  /** Pre-loaded resources from the server — shape: { [locale]: { [ns]: { key: value } } } */
  resources: Record<string, Record<string, unknown>>;
}>;

export function TranslationsProvider({
  locale,
  namespaces,
  resources,
  children,
}: TranslationsProviderProps) {
  // Create a stable i18next instance — memoised so it doesn't re-init on every render.
  const i18n = useMemo(() => {
    const instance = createInstance();
    // Synchronous init is fine because all resources are already in memory.
    instance.use(initReactI18next).init({
      lng: locale,
      fallbackLng: defaultLocale,
      defaultNS: namespaces[0] ?? defaultNamespace,
      ns: namespaces,
      resources,
      interpolation: { escapeValue: false },
      // Disable backend plugins — resources come from server
      initImmediate: false,
    });
    return instance;
  }, [locale, namespaces, resources]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

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
import { createInstance, type Resource } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { type PropsWithChildren, useMemo } from "react";
import { defaultLocale, defaultNamespace, type SupportedLocale } from "./config";

type TranslationsProviderProps = PropsWithChildren<{
  locale: SupportedLocale;
  namespaces: string[];
  /** Pre-loaded resources from the server — shape: { [locale]: { [ns]: { key: value } } } */
  resources: Resource;
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

    // Register the react-i18next plugin first (mutates and returns the instance).
    // We deliberately call .use() and .init() on SEPARATE statements rather than
    // chaining them — TypeScript's overload resolution fails on the chained form
    // because the .use() return type shadows the init() overload signatures.
    instance.use(initReactI18next);

    // resources is typed as Resource on both sides, but TypeScript's deep
    // structural check flags the nested `unknown` from JSON parsing.
    // The `as Resource` cast is safe: the server always serialises well-formed
    // i18next resource objects before passing them as props.
    instance.init({
      lng: locale,
      fallbackLng: defaultLocale,
      defaultNS: namespaces[0] ?? defaultNamespace,
      ns: namespaces,
      resources: resources as Resource,
      interpolation: { escapeValue: false },
      // All resources are in memory — no async backend needed
      initImmediate: false,
    });

    return instance;
  }, [locale, namespaces, resources]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

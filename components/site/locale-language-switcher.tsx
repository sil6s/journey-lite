"use client";

import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { defaultLocale, isValidLocale, LOCALE_COOKIE, type SupportedLocale } from "@/lib/i18n/config";

function readLocaleFromPath(pathname: string): SupportedLocale | null {
  const maybeLocale = pathname.split("/").filter(Boolean)[0];
  return maybeLocale && isValidLocale(maybeLocale) ? maybeLocale : null;
}

function readLocaleCookie(): SupportedLocale {
  if (typeof document === "undefined") return defaultLocale;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)`));
  const val = match?.[1];
  return val && isValidLocale(val) ? val : defaultLocale;
}

export function LocaleLanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const locale = readLocaleFromPath(pathname) ?? readLocaleCookie();

  return <LanguageSwitcher locale={locale} pathname={pathname} compact={compact} />;
}

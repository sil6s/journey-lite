"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { defaultLocale, isValidLocale, LOCALE_COOKIE, type SupportedLocale } from "@/lib/i18n/config";

function readLocaleCookie(): SupportedLocale {
  if (typeof document === "undefined") return defaultLocale;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)`));
  const val = match?.[1];
  return val && isValidLocale(val) ? val : defaultLocale;
}

export function LocaleLanguageSwitcher() {
  const pathname = usePathname();
  const [locale, setLocale] = useState<SupportedLocale>(defaultLocale);

  useEffect(() => {
    setLocale(readLocaleCookie());
  }, [pathname]); // re-read when path changes (switcher may have just set a new cookie)

  return <LanguageSwitcher locale={locale} pathname={pathname} />;
}

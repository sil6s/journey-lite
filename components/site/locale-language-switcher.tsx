"use client";

import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { SupportedLocale } from "@/lib/i18n/config";

export function LocaleLanguageSwitcher({ locale }: { locale: SupportedLocale }) {
  const pathname = usePathname();
  return <LanguageSwitcher locale={locale} pathname={pathname} />;
}

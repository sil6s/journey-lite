"use client";

/**
 * TranslationDisclaimer
 *
 * Shown on AI-auto-translated CMS pages (blog posts, resources, FAQs, etc.).
 * NOT shown on manually-curated pages (homepage, procedure pages, etc.).
 *
 * Reads from the "disclaimers" i18next namespace so the disclaimer itself
 * appears in the user's selected language.
 *
 * Usage in a CMS page (Server Component wrapper recommended):
 *
 *   import { TranslationDisclaimer } from "@/components/translation-disclaimer"
 *
 *   // Show only when the content was AI-translated and locale !== "en"
 *   {isAutoTranslated && locale !== "en" && (
 *     <TranslationDisclaimer
 *       locale={locale}
 *       englishHref="/en/resources/some-article"
 *       language={getLanguageEntry(locale).nativeName}
 *     />
 *   )}
 */

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { type SupportedLocale } from "@/lib/i18n/config";

type Props = {
  locale: SupportedLocale;
  /** Full URL of the English version, e.g. "/en/resources/gastric-sleeve-recovery" */
  englishHref: string;
  /** Native name of the current language, e.g. "Español" */
  language: string;
  /** Extra Tailwind classes */
  className?: string;
};

export function TranslationDisclaimer({
  locale,
  englishHref,
  language,
  className = "",
}: Props) {
  const { t } = useTranslation("disclaimers");

  // Don't render for English — it's always the source
  if (locale === "en") return null;

  return (
    <aside
      role="note"
      aria-label={t("translation.autoTranslated")}
      className={[
        "my-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3",
        "text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200",
        className,
      ].join(" ")}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-medium">
          {t("translation.autoTranslated")}
        </p>
        <p className="text-amber-800 dark:text-amber-300">
          {t("translation.reviewNote")}
        </p>
        <p>
          {t("translation.contactForGuidance")}
        </p>
        <p className="mt-2">
          <Link
            href={englishHref}
            className="font-medium underline underline-offset-2 hover:no-underline"
          >
            {t("translation.viewEnglish")} →
          </Link>
        </p>
      </div>
    </aside>
  );
}

/**
 * Server-component-friendly wrapper.
 * Renders the disclaimer without needing a client boundary at the page level.
 * Uses the pre-loaded translations from the locale layout's TranslationsProvider.
 */
export function TranslationDisclaimerServer({
  locale,
  englishHref,
  language,
  className,
}: Props) {
  // This is still a client component internally (useTranslation),
  // but it's fine to import from Server Components — Next.js handles the boundary.
  return (
    <TranslationDisclaimer
      locale={locale}
      englishHref={englishHref}
      language={language}
      className={className}
    />
  );
}

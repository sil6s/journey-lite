/**
 * Locale-prefixed homepage placeholder.
 *
 * This is the entry point for /en, /es, /ar, etc.
 * Replace the body of this file with your actual homepage content,
 * or compose it from the existing app/page.tsx components.
 *
 * Example usage of server-side translations:
 *   const t = await getTranslations(locale, "common")
 *   t("actions.requestAppointment") → "Request an Appointment" (en)
 *                                  → "Solicitar una cita"       (es)
 */
import { notFound } from "next/navigation";
import { getTranslations } from "@/lib/i18n/server";
import { isValidLocale, type SupportedLocale } from "@/lib/i18n/config";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const t = await getTranslations(locale as SupportedLocale, "common");

  return (
    <main>
      {/*
       * Replace with your real homepage content.
       * The existing app/page.tsx content can be imported here,
       * passing `locale` and `t` as props.
       */}
      <h1>{t("site.tagline")}</h1>
      <p>{t("actions.scheduleConsultation")}</p>
    </main>
  );
}

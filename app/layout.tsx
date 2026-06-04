import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist } from "next/font/google";
import Script from "next/script";
import { cookies, headers } from "next/headers";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/site/providers";
import { StaticPageTranslator } from "@/components/site/static-page-translator";
import { isValidLocale, getTextDirection, defaultLocale, type SupportedLocale } from "@/lib/i18n/config";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "da46081a-defc-433f-94d1-173ae1d844bf";

export const metadata: Metadata = {
  title: "JourneyLite Physicians",
  description: "Weight loss surgery and medical weight loss care.",
  icons: {
    icon: "/icon.svg",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const headerLocale = headerStore.get("x-locale");
  const raw = headerLocale ?? cookieStore.get("jl_locale")?.value;
  const locale: SupportedLocale = raw && isValidLocale(raw) ? raw : defaultLocale;
  const dir = getTextDirection(locale);

  return (
    <html lang={locale} dir={dir} className={cn("font-sans", geist.variable)}>
      <head>
        {turnstileSiteKey ? <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" /> : null}
        <Script defer src="https://cloud.umami.is/script.js" data-website-id={umamiWebsiteId} strategy="afterInteractive" />
      </head>
      <body className={`${inter.variable} ${playfair.variable}`}>
        <Providers>
          {children}
          <StaticPageTranslator />
        </Providers>
      </body>
    </html>
  );
}

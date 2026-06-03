import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist } from "next/font/google";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/site/providers";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        {turnstileSiteKey ? <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" /> : null}
        <Script defer src="https://cloud.umami.is/script.js" data-website-id={umamiWebsiteId} strategy="afterInteractive" />
      </head>
      <body className={`${inter.variable} ${playfair.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist } from "next/font/google";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/site/providers";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

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
        {recaptchaSiteKey ? <Script src={`https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`} strategy="afterInteractive" /> : null}
      </head>
      <body className={`${inter.variable} ${playfair.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JourneyLite Physicians",
  description: "Weight loss surgery and medical weight loss care.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

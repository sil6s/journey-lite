import './globals.css'

export const metadata = {
  metadataBase: new URL('https://journeylite.com'),
  title: {
    default: 'JourneyLite | Weight Loss Surgery in Ohio, Indiana & Kentucky',
    template: '%s | JourneyLite'
  },
  description: 'JourneyLite offers gastric sleeve, gastric bypass, SADI surgery, Lap Band, and medical weight loss (WeGovy, Zepbound) at 5 locations in Ohio, Indiana & Kentucky. Board-certified surgeons with 6,000+ procedures.',
  keywords: ['weight loss surgery', 'gastric sleeve', 'gastric bypass', 'bariatric surgery Cincinnati', 'SADI surgery', 'Lap Band', 'WeGovy', 'Zepbound', 'bariatric surgeon Ohio'],
  authors: [{ name: 'JourneyLite Physicians' }],
  creator: 'JourneyLite',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://journeylite.com',
    siteName: 'JourneyLite',
    title: 'JourneyLite | Weight Loss Surgery Experts',
    description: 'Safe, effective, affordable weight loss surgery and medical weight loss. Gastric Sleeve, Bypass, SADI, GLP-1s. Cincinnati, Columbus, Dayton, Indianapolis & Northern Kentucky.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'JourneyLite Weight Loss Surgery' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JourneyLite | Weight Loss Surgery',
    description: 'Expert bariatric surgery & medical weight loss in OH, IN & KY.',
    images: ['/og-image.jpg']
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: 'https://journeylite.com' }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalOrganization",
              "name": "JourneyLite",
              "url": "https://journeylite.com",
              "telephone": "(855) 865-7144",
              "medicalSpecialty": "Bariatric Surgery",
              "description": "JourneyLite offers gastric sleeve, gastric bypass, SADI, and medical weight loss across Ohio, Indiana, and Kentucky.",
              "address": [
                { "@type": "PostalAddress", "addressLocality": "Cincinnati", "addressRegion": "OH", "addressCountry": "US" },
                { "@type": "PostalAddress", "addressLocality": "Columbus", "addressRegion": "OH", "addressCountry": "US" },
                { "@type": "PostalAddress", "addressLocality": "Dayton", "addressRegion": "OH", "addressCountry": "US" },
                { "@type": "PostalAddress", "addressLocality": "Indianapolis", "addressRegion": "IN", "addressCountry": "US" }
              ],
              "sameAs": ["https://www.facebook.com/journeylite"]
            })
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}

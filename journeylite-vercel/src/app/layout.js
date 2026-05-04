import './globals.css'

export const metadata = {
  metadataBase: new URL('https://journeylite.com'),
  title: { default: 'JourneyLite | Medical Weight Loss & Bariatric Care', template: '%s | JourneyLite' },
  description: 'Modern, patient-first bariatric surgery and medical weight loss care in Ohio, Indiana, and Kentucky.',
}

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalBusiness',
      name: 'JourneyLite',
      url: 'https://journeylite.com',
      telephone: '+1-855-865-7144',
      areaServed: ['Ohio', 'Indiana', 'Kentucky'],
    },
    {
      '@type': 'Physician',
      name: 'JourneyLite Bariatric Team',
      medicalSpecialty: 'Bariatric',
      worksFor: { '@type': 'MedicalBusiness', name: 'JourneyLite' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is gastric sleeve?', acceptedAnswer: { '@type': 'Answer', text: 'Gastric sleeve is a minimally invasive bariatric surgery that reduces stomach size to support durable weight loss.' } },
      ],
    },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </body>
    </html>
  )
}

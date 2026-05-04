import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-12">
      <div className="container-shell grid gap-8 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-brand-700">JourneyLite</p>
          <p className="mt-3 text-sm text-gray-600">Trusted bariatric and medical weight loss in Ohio, Indiana, and Kentucky.</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">Top Services</p>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><Link href="/weight-loss-surgery-ohio">Weight Loss Surgery Ohio</Link></li>
            <li><Link href="/gastric-sleeve-ohio">Gastric Sleeve Ohio</Link></li>
            <li><Link href="/weight-loss-medications">Weight Loss Medications</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">Contact</p>
          <a href="tel:+18558657144" className="mt-3 block text-sm font-medium text-brand-700">(855) 865-7144</a>
          <p className="mt-2 text-sm text-gray-600">Mon–Fri • 8am–5pm</p>
        </div>
      </div>
    </footer>
  )
}

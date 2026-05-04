import Link from 'next/link'

const navItems = [
  ['Services', '#services'],
  ['Results', '#results'],
  ['Locations', '#locations'],
  ['FAQs', '#faqs'],
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/90 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight text-brand-700">JourneyLite</Link>
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {navItems.map(([label, href]) => (
            <a key={label} href={href} className="text-sm font-medium text-gray-700 transition hover:text-brand-700">{label}</a>
          ))}
        </nav>
        <Link href="/appointment" className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500">Book Consultation</Link>
      </div>
    </header>
  )
}

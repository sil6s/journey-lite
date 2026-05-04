import Link from 'next/link'

const nav = [
  ['Procedures', '#services'],
  ['Medications', '/weight-loss-medications'],
  ['Pricing', '/pricing'],
  ['Locations', '#locations'],
  ['Doctors', '#doctors'],
]

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="container-shell grid h-16 grid-cols-[auto_1fr_auto] items-center gap-6">
        <Link href="/" className="text-lg font-bold text-[#1f5f2e]">JourneyLite</Link>
        <nav aria-label="Primary" className="hidden justify-center gap-6 md:flex">
          {nav.map(([label, href]) => <Link key={label} href={href} className="text-sm font-medium text-gray-700 hover:text-[#1f5f2e]">{label}</Link>)}
        </nav>
        <Link href="/appointment" className="rounded border border-[#0b5ed7] bg-[#0b5ed7] px-4 py-2 text-sm font-semibold text-white">Book Consultation</Link>
      </div>
    </header>
  )
}

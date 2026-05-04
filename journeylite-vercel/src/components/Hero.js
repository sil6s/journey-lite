import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#eef7f0] to-white py-20 md:py-28">
      <div className="pointer-events-none absolute -right-20 top-10 h-80 w-80 rounded-full bg-[#cfe8d2]/60 blur-2xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-[#d8e8ff]/60 blur-2xl" />

      <div className="container-shell relative grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1f5f2e]">Weight Loss Surgery Ohio</p>
          <h1 className="mt-4 max-w-xl text-5xl font-extrabold leading-[1.05] text-[#0f172a] md:text-6xl lg:text-7xl">
            Weight Loss Care Built for Lasting, Measurable Results
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-700">
            20+ years experience. 10,000+ procedures. Trusted bariatric and medical weight loss care across Ohio, Kentucky, and Indiana.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/appointment" className="border border-[#0b5ed7] bg-[#0b5ed7] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#094caf]">
              Book Consultation
            </Link>
            <Link href="/pricing" className="border border-[#1f5f2e] px-6 py-3.5 text-sm font-semibold text-[#1f5f2e] transition hover:bg-[#1f5f2e] hover:text-white">
              View Pricing
            </Link>
          </div>

          <p className="mt-6 text-sm font-semibold text-gray-700">MBSAQIP Accredited Center of Excellence</p>
        </div>

        <div className="relative">
          <div className="absolute -right-10 top-8 h-[26rem] w-[26rem] rounded-full bg-[#dbe8f8]" />
          <div className="relative z-10 -mb-6 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl lg:-mr-4">
            <img src="/images/hero-doctor.svg" alt="JourneyLite surgeon" className="aspect-[4/5] w-full rounded-xl object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}

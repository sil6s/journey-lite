import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container-shell grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1f5f2e]">Weight Loss Surgery Ohio</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-[#111827] md:text-5xl">Weight Loss Surgery That Actually Works</h1>
          <p className="mt-4 max-w-xl text-lg text-gray-700">20+ years experience. 10,000+ procedures. Trusted across Ohio, Kentucky, and Indiana.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/appointment" className="rounded border border-[#0b5ed7] bg-[#0b5ed7] px-5 py-3 font-semibold text-white">Book Consultation</Link>
            <Link href="/pricing" className="rounded border border-[#1f5f2e] px-5 py-3 font-semibold text-[#1f5f2e]">View Pricing</Link>
          </div>
          <p className="mt-5 text-sm font-semibold text-gray-700">MBSAQIP Accredited Center of Excellence</p>
        </div>
        <div className="rounded border border-gray-200 bg-[#f7f7f5] p-4">
          <div className="aspect-[4/3] w-full rounded bg-gray-200" role="img" aria-label="Doctor placeholder image" />
        </div>
      </div>
    </section>
  )
}

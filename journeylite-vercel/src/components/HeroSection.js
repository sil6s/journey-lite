import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="container-shell grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="inline-flex rounded-full bg-brand-50 px-4 py-1 text-sm font-semibold text-brand-700">Trusted Bariatric Experts</p>
          <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">Lasting Weight Loss Starts Here</h1>
          <p className="mt-4 text-lg text-gray-600">Surgical & non-surgical weight loss solutions tailored to you.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/appointment" className="rounded-full bg-brand-700 px-6 py-3 font-semibold text-white">Book Consultation</Link>
            <a href="#services" className="rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700">Explore Options</a>
          </div>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-brand-50 to-white p-8 shadow-soft">
          <div className="aspect-[4/3] rounded-2xl bg-gray-200" aria-label="Healthy lifestyle placeholder image" />
        </div>
      </div>
    </section>
  )
}

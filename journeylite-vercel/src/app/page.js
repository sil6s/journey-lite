import Header from '../components/Header'
import Hero from '../components/Hero'
import TrustBar from '../components/TrustBar'
import ServicesGrid from '../components/ServicesGrid'
import DoctorsSection from '../components/DoctorsSection'
import Testimonials from '../components/Testimonials'
import Locations from '../components/Locations'
import FAQ from '../components/FAQ'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Weight Loss Surgery Ohio | JourneyLite',
  description: 'Trusted bariatric surgery and medical weight loss care in Ohio, Kentucky, and Indiana.',
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="bg-white text-[#111827]">
        <Hero />
        <TrustBar />
        <ServicesGrid />
        <DoctorsSection />
        <Testimonials />
        <Locations />

        <section className="bg-white py-24">
          <div className="container-shell">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1f5f2e]">Why Choose JourneyLite</p>
            <h2 className="mt-4 max-w-3xl text-5xl font-extrabold text-[#0f172a]">Proven surgical excellence with genuinely personal support.</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-2xl font-bold">Experienced Bariatric Team</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-700">Our surgeons and clinical teams focus exclusively on evidence-based weight loss treatment with transparent planning and measurable outcomes.</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Full Journey Partnership</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-700">From consultation to long-term follow-up, patients receive coordinated support for surgery, nutrition, and sustainable lifestyle change.</p>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/appointment" className="border border-[#0b5ed7] bg-[#0b5ed7] px-6 py-3 font-semibold text-white hover:bg-[#094caf]">Book Consultation</Link>
              <Link href="/pricing" className="border border-[#1f5f2e] px-6 py-3 font-semibold text-[#1f5f2e] hover:bg-[#1f5f2e] hover:text-white">View Pricing</Link>
            </div>
          </div>
        </section>

        <FAQ />
        <CTASection />
      </main>
      <a href="tel:+18888957328" className="fixed bottom-4 right-4 border border-[#0b5ed7] bg-[#0b5ed7] px-4 py-3 text-sm font-semibold text-white shadow-md md:hidden">Call Now</a>
      <Footer />
    </>
  )
}

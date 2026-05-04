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
        <section className="bg-[#f3f4f6] py-20">
          <div className="container-shell rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:p-10">
            <h2 className="text-4xl font-bold md:text-5xl">Why Choose Us</h2>
            <ul className="mt-6 grid max-w-3xl gap-3 text-gray-700 md:grid-cols-2">
              <li>Experienced surgeons</li>
              <li>Personalized treatment plans</li>
              <li>Full journey support</li>
              <li>Accredited center</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/appointment" className="border border-[#0b5ed7] bg-[#0b5ed7] px-6 py-3 font-semibold text-white hover:bg-[#094caf]">Book Consultation</Link>
              <Link href="/pricing" className="border border-[#1f5f2e] px-6 py-3 font-semibold text-[#1f5f2e] hover:bg-[#1f5f2e] hover:text-white">See Transparent Pricing</Link>
            </div>
          </div>
        </section>
        <Locations />
        <FAQ />
        <CTASection />
      </main>
      <a href="tel:+18888957328" className="fixed bottom-4 right-4 rounded border border-[#0b5ed7] bg-[#0b5ed7] px-4 py-3 text-sm font-semibold text-white shadow-md md:hidden">Call Now</a>
      <Footer />
    </>
  )
}

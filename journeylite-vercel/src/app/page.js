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

export const metadata = {
  title: 'Weight Loss Surgery Ohio | JourneyLite',
  description: 'Trusted bariatric surgery and medical weight loss care in Ohio, Kentucky, and Indiana.',
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="bg-[#f7f7f5] text-[#111827]">
        <Hero />
        <TrustBar />
        <ServicesGrid />
        <DoctorsSection />
        <Testimonials />
        <Locations />
        <section className="py-16">
          <div className="container-shell">
            <h2 className="text-3xl font-bold">Why Choose Us</h2>
            <ul className="mt-4 grid gap-3 text-gray-700 md:grid-cols-2">
              <li>Experienced surgeons</li>
              <li>Personalized treatment plans</li>
              <li>Full journey support</li>
              <li>Accredited center</li>
            </ul>
          </div>
        </section>
        <FAQ />
        <CTASection />
      </main>
      <a href="tel:+18888957328" className="fixed bottom-4 right-4 rounded border border-[#0b5ed7] bg-[#0b5ed7] px-4 py-3 text-sm font-semibold text-white md:hidden">Call Now</a>
      <Footer />
    </>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export const metadata = {
  title: 'Weight Loss Surgery Ohio | JourneyLite',
  description: 'JourneyLite offers gastric sleeve, gastric bypass, SADI, and medical weight loss options across Ohio with trusted surgeons and personalized care.',
  alternates: { canonical: 'https://journeylite.com/weight-loss-surgery-ohio' },
}

const services = [
  ['Gastric Sleeve', 'Most requested minimally invasive bariatric procedure.', '/gastric-sleeve-ohio'],
  ['Gastric Bypass', 'Powerful metabolic surgery for long-term health change.', '/weight-loss-surgery-ohio'],
  ['Lap Band', 'Adjustable option for select candidates.', '/weight-loss-surgery-ohio'],
  ['SADI', 'Advanced single-anastomosis duodenal switch.', '/weight-loss-surgery-ohio'],
  ['Gastric Balloon', 'Incision-free option for moderate weight loss.', '/weight-loss-surgery-ohio'],
  ['Medications (GLP-1)', 'Physician-led Wegovy/Zepbound pathways.', '/weight-loss-medications'],
]

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative isolate overflow-hidden bg-white py-16 md:py-24">
          <div className="container-shell grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="inline-flex rounded-full bg-brand-50 px-4 py-1 text-sm font-semibold text-brand-700">MBSAQIP Accredited Center</p>
              <h1 className="mt-5 text-4xl font-bold leading-tight text-ink md:text-5xl">Lasting Weight Loss Starts Here</h1>
              <p className="mt-4 max-w-xl text-lg text-gray-600">Surgical & non-surgical weight loss solutions tailored to you across Ohio, Indiana, and Kentucky.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/appointment" className="rounded-full bg-brand-700 px-6 py-3 font-semibold text-white">Book Consultation</Link>
                <a href="#services" className="rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700">Explore Options</a>
              </div>
            </div>
            <div className="relative">
              <Image src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d" alt="Healthy patient and physician" width={900} height={700} className="h-auto w-full rounded-3xl object-cover shadow-soft" priority />
            </div>
          </div>
        </section>

        <section className="bg-brand-700 py-6 text-white">
          <div className="container-shell grid gap-6 text-center sm:grid-cols-3">
            <p><strong>20+ years</strong> experience</p><p><strong>10,000+</strong> procedures</p><p><strong>MBSAQIP</strong> accredited center</p>
          </div>
        </section>

        <section id="services" className="py-16 md:py-20">
          <div className="container-shell">
            <h2 className="text-3xl font-bold">Treatment Options Built Around You</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map(([title, body, href]) => (
                <article key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-2xl">⚕️</div>
                  <h3 className="mt-3 text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{body}</p>
                  <Link href={href} className="mt-4 inline-block text-sm font-semibold text-brand-700">Learn More →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="results" className="bg-white py-16">
          <div className="container-shell grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl bg-brand-50 p-6">
              <h2 className="text-2xl font-bold">Real Patient Transformations</h2>
              <p className="mt-3 text-gray-700">“I lost 115 lbs and gained confidence, energy, and control of my health.”</p>
              <p className="mt-2 text-sm font-semibold text-brand-700">— Verified JourneyLite Patient • ★★★★★</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold">Simple First Step</h3>
              <form className="mt-4 grid gap-3">
                <input className="rounded-xl border border-gray-300 px-4 py-3" placeholder="Name" />
                <input className="rounded-xl border border-gray-300 px-4 py-3" placeholder="Phone" />
                <input className="rounded-xl border border-gray-300 px-4 py-3" placeholder="Preferred Location" />
                <select className="rounded-xl border border-gray-300 px-4 py-3"><option>Interest</option><option>Gastric Sleeve</option></select>
                <button className="rounded-xl bg-brand-700 px-4 py-3 font-semibold text-white">Request Appointment</button>
              </form>
            </div>
          </div>
        </section>

        <section id="locations" className="py-16">
          <div className="container-shell">
            <h2 className="text-3xl font-bold">Locations</h2>
            <p className="mt-2 text-gray-600">Cincinnati • Columbus • Dayton • Indianapolis • Kentucky</p>
            <div className="mt-6 rounded-2xl bg-gray-200 p-14 text-center text-gray-600">Interactive map placeholder</div>
          </div>
        </section>

        <section id="faqs" className="bg-white py-16">
          <div className="container-shell max-w-4xl">
            <h2 className="text-3xl font-bold">Weight Loss Education</h2>
            <div className="mt-6 space-y-4">
              {['What is gastric sleeve?', 'Surgery vs medication', 'Who qualifies?'].map((q) => <details key={q} className="rounded-xl border border-gray-200 bg-gray-50 p-4"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 text-gray-600">Educational content placeholder with internal links to treatment pages.</p></details>)}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container-shell rounded-3xl bg-brand-700 p-8 text-center text-white md:p-12">
            <h2 className="text-3xl font-bold">Take the first step today</h2>
            <p className="mt-3">Book your consultation or call our care team now.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/appointment" className="rounded-full bg-white px-6 py-3 font-semibold text-brand-700">Book Appointment</Link>
              <a href="tel:+18558657144" className="rounded-full border border-white px-6 py-3 font-semibold">Call Now</a>
            </div>
          </div>
        </section>
      </main>
      <a href="tel:+18558657144" className="fixed bottom-4 right-4 rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-soft md:hidden">Call Now</a>
      <Footer />
    </>
  )
}

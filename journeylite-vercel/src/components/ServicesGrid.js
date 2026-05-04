import Link from 'next/link'

const services = [
  ['Gastric Sleeve', 'Minimally invasive procedure with strong long-term outcomes.', '/gastric-sleeve-ohio'],
  ['Gastric Bypass', 'Comprehensive metabolic surgery for severe obesity.', '/weight-loss-surgery-ohio'],
  ['Lap Band', 'Adjustable surgical option for selected candidates.', '/weight-loss-surgery-ohio'],
  ['SADI', 'Advanced procedure for higher-BMI cases and revisions.', '/weight-loss-surgery-ohio'],
  ['Gastric Balloon', 'Non-surgical option paired with physician supervision.', '/weight-loss-surgery-ohio'],
  ['Medications', 'GLP-1 based medical weight loss programs.', '/weight-loss-medications'],
]

export default function ServicesGrid() {
  return (
    <section id="services" className="bg-[#f3f4f6] py-20 md:py-24">
      <div className="container-shell">
        <h2 className="max-w-2xl text-4xl font-bold text-[#111827] md:text-5xl">Procedures and Medical Options</h2>
        <p className="mt-4 max-w-2xl text-gray-700">Personalized surgical and non-surgical plans designed to support long-term weight loss and health improvement.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(([title, description, href]) => (
            <article key={title} className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <h3 className="text-2xl font-semibold text-[#111827]">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">{description}</p>
              <Link href={href} className="mt-5 inline-block text-sm font-semibold text-[#0b5ed7]">Learn More</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

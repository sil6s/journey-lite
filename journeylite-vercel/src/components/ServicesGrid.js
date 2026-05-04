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
    <section id="services" className="py-16 md:py-20">
      <div className="container-shell">
        <h2 className="text-3xl font-bold text-[#111827]">Procedures and Medical Options</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(([title, description, href]) => (
            <article key={title} className="rounded border border-gray-200 bg-white p-5">
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-gray-700">{description}</p>
              <Link href={href} className="mt-4 inline-block text-sm font-semibold text-[#0b5ed7]">Learn More</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

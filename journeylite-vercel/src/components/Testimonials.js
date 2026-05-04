import Link from 'next/link'

const results = [
  ['115 lbs', 'Health markers improved and confidence restored.', 'Sarah, Cincinnati', '/images/results/1.svg'],
  ['92 lbs', 'Clear process and consistent support at every step.', 'Mark, Columbus', '/images/results/2.svg'],
  ['140 lbs', 'Significant metabolic improvement within months.', 'James, Indianapolis', '/images/results/3.svg'],
]

export default function Testimonials() {
  return (
    <>
      <section className="bg-[#f3f6f4] py-24">
        <div className="container-shell">
          <h2 className="text-5xl font-extrabold text-[#0f172a]">Featured Results</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {results.map(([lost, quote, person, image], idx) => (
              <article key={person} className={`bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${idx === 1 ? 'md:-mt-6' : ''}`}>
                <img src={image} alt={person} className="h-48 w-full object-cover" />
                <p className="mt-6 text-5xl font-black leading-none text-[#1f5f2e]">{lost}</p>
                <p className="mt-3 max-w-[24ch] text-sm leading-relaxed text-gray-700">{quote}</p>
                <p className="mt-4 text-sm font-bold text-[#111827]">{person}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0f2f5f] py-20 text-white">
        <div className="container-shell grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">Patient Highlight</p>
            <h3 className="mt-4 max-w-xl text-4xl font-bold leading-tight">“I am really satisfied with my team. We have no regrets.”</h3>
            <p className="mt-5 max-w-lg text-white/85">From first consultation through long-term follow-up, JourneyLite delivers surgical excellence with genuine support.</p>
            <Link href="/about" className="mt-8 inline-block border border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white hover:text-[#0f2f5f]">View All Success Stories</Link>
          </div>
          <div className="relative">
            <div className="absolute -left-8 -top-8 h-40 w-40 bg-[#1d4f93]" />
            <img src="/images/results/2.jpg" alt="Patient success" className="relative z-10 ml-auto h-[360px] w-full max-w-md object-cover shadow-xl" />
          </div>
        </div>
      </section>
    </>
  )
}

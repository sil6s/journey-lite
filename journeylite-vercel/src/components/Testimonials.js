import Link from 'next/link'

const items = [
  ['115 lbs', 'I finally have my health back.', 'Sarah, Cincinnati', '/images/results/1.svg'],
  ['92 lbs', 'The process was clear and supportive.', 'Mark, Columbus', '/images/results/2.svg'],
  ['140 lbs', 'My diabetes improved within months.', 'James, Indianapolis', '/images/results/3.svg'],
]

export default function Testimonials() {
  return (
    <section className="bg-white py-20 md:py-24">
      <div className="container-shell">
        <h2 className="text-4xl font-bold text-[#111827] md:text-5xl">Featured Results</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map(([lost, quote, person, image]) => (
            <article key={person} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <img src={image} alt={person} className="mb-4 h-44 w-full rounded-lg object-cover" />
              <p className="text-4xl font-bold text-[#1f5f2e]">{lost}</p>
              <p className="mt-2 max-w-xs text-sm text-gray-700">{quote}</p>
              <p className="mt-3 text-sm font-semibold text-gray-800">{person}</p>
            </article>
          ))}
        </div>
        <Link href="/about" className="mt-8 inline-block border border-[#0b5ed7] bg-[#0b5ed7] px-6 py-3 font-semibold text-white hover:bg-[#094caf]">View All Success Stories</Link>
      </div>
    </section>
  )
}

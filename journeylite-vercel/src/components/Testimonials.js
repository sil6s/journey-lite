import Link from 'next/link'

const items = [
  ['115 lbs', 'I finally have my health back.', 'Sarah, Cincinnati'],
  ['92 lbs', 'The process was clear and supportive.', 'Mark, Columbus'],
  ['140 lbs', 'My diabetes improved within months.', 'James, Indianapolis'],
]

export default function Testimonials() {
  return (
    <section className="py-16">
      <div className="container-shell">
        <h2 className="text-3xl font-bold">Featured Results</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map(([lost, quote, person]) => <article key={person} className="rounded border border-gray-200 bg-white p-5"><p className="text-3xl font-bold text-[#1f5f2e]">{lost}</p><p className="mt-2 text-sm text-gray-700">{quote}</p><p className="mt-3 text-sm font-semibold text-gray-800">{person}</p></article>)}
        </div>
        <Link href="/about" className="mt-6 inline-block rounded border border-[#0b5ed7] bg-[#0b5ed7] px-5 py-3 text-sm font-semibold text-white">View All Success Stories</Link>
      </div>
    </section>
  )
}

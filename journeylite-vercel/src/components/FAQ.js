const faqs = [
  ['Do I qualify for surgery?', 'Most patients qualify based on BMI and health history. Your consultation confirms candidacy.'],
  ['Surgery vs medication?', 'Surgery typically delivers the strongest long-term results; medications can be effective for select cases.'],
  ['What happens at consultation?', 'You meet the care team, review options, and get a clear treatment plan.'],
]

export default function FAQ() {
  return (
    <section className="py-16">
      <div className="container-shell max-w-4xl">
        <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
        <div className="mt-6 space-y-3">
          {faqs.map(([q, a]) => <details key={q} className="rounded border border-gray-200 bg-white p-4"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 text-sm text-gray-700">{a}</p></details>)}
        </div>
      </div>
    </section>
  )
}

const faqs = [
  'What is gastric sleeve?',
  'Surgery vs medication: which is right for me?',
  'Who qualifies for weight loss treatment?',
]

export default function FAQAccordion() {
  return (
    <section id="faqs" className="py-16">
      <h2 className="text-3xl font-bold">Educational Guides</h2>
      <div className="mt-6 space-y-4">
        {faqs.map((q) => (
          <details key={q} className="rounded-xl border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer font-semibold">{q}</summary>
            <p className="mt-2 text-gray-600">Placeholder educational content with internal links.</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export default function TestimonialCarousel() {
  const testimonials = [
    '“I lost 100+ lbs and got my health back.”',
    '“The team made every step simple and supportive.”',
    '“Finally found a plan that worked for me long-term.”',
  ]

  return (
    <section id="results" className="rounded-2xl bg-brand-50 p-6">
      <h2 className="text-2xl font-bold">Before & After Success Stories</h2>
      <div className="mt-4 space-y-3">
        {testimonials.map((quote) => <p key={quote} className="text-gray-700">{quote} <span className="text-brand-700">★★★★★</span></p>)}
      </div>
    </section>
  )
}

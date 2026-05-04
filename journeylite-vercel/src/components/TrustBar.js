export default function TrustBar() {
  const items = ['6,000+ Gastric Sleeves', '10,000+ Procedures', '20+ Years Experience', '5 Locations']
  return (
    <section className="bg-[#1f5f2e] py-6 text-white">
      <div className="container-shell grid gap-4 text-center sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => <p key={item} className="text-sm font-semibold md:text-base">{item}</p>)}
      </div>
    </section>
  )
}

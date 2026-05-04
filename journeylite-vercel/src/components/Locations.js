const locations = [
  ['Cincinnati', 'Advanced bariatric surgery and ongoing follow-up programs.'],
  ['Columbus', 'Consultation and treatment planning with dedicated support teams.'],
  ['Dayton', 'Comprehensive weight loss care across surgical and medical options.'],
  ['Indianapolis', 'Regional access to JourneyLite specialists and long-term care.'],
  ['Northern Kentucky', 'Convenient tri-state access for consultation and aftercare.'],
]

export default function Locations() {
  return (
    <section id="locations" className="bg-[#f8fbf9] py-24">
      <div className="container-shell grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1f5f2e]">Locations</p>
          <h2 className="mt-3 text-5xl font-extrabold text-[#0f172a]">Care close to home.</h2>
          <div className="mt-8 space-y-5">
            {locations.map(([name, desc]) => (
              <div key={name} className="border-b border-gray-200 pb-4">
                <h3 className="text-xl font-bold text-[#111827]">{name}</h3>
                <p className="mt-1 max-w-md text-sm text-gray-700">{desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-hidden border border-gray-200 shadow-sm">
          <iframe title="JourneyLite Cincinnati Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5680.080262517875!2d-84.42302649999999!3d39.25538349999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88405216ab789477%3A0x15598e1c0b36dbbf!2sJourney%20Lite%20of%20Cincinnati!5e1!3m2!1sen!2sus!4v1777924538034!5m2!1sen!2sus" className="h-full min-h-[430px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </section>
  )
}

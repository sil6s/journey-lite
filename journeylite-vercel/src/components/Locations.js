const locations = ['Cincinnati', 'Columbus', 'Dayton', 'Indianapolis', 'Northern Kentucky']

export default function Locations() {
  return (
    <section id="locations" className="bg-white py-16">
      <div className="container-shell grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">Locations</h2>
          <div className="mt-5 space-y-3">
            {locations.map((loc) => <details key={loc} className="rounded border border-gray-200 p-4"><summary className="cursor-pointer font-semibold">{loc}</summary><p className="mt-2 text-sm text-gray-700">Consultations and follow-up care available.</p></details>)}
          </div>
        </div>
        <div className="min-h-[360px] overflow-hidden rounded border border-gray-200">
          <iframe title="JourneyLite Cincinnati Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5680.080262517875!2d-84.42302649999999!3d39.25538349999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88405216ab789477%3A0x15598e1c0b36dbbf!2sJourney%20Lite%20of%20Cincinnati!5e1!3m2!1sen!2sus!4v1777924538034!5m2!1sen!2sus" className="h-full min-h-[360px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </section>
  )
}

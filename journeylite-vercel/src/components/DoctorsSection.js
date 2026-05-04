import Link from 'next/link'

const doctors = [
  {
    name: 'Dr. Trace W. Curry, MD',
    role: 'Medical Director, Bariatric Surgery',
    rating: '5.0 · 97 Reviews',
    stats: ['21+ Years', '6,000+ Sleeves', 'OH · KY · IN Licensed'],
    bio: 'Board-certified general surgeon with over two decades of experience performing advanced laparoscopic and bariatric procedures.',
    image: '/images/doctors/curry.svg',
    profileHref: '/about',
  },
  {
    name: 'Dr. James Augusta, DO, FACOS',
    role: 'Bariatric & Minimally Invasive Surgeon',
    rating: '5.0 · Top Patient Satisfaction',
    stats: ['Advanced Laparoscopy', 'Revisional Expertise', 'Long-term Follow-up'],
    bio: 'Board-certified surgeon known for precision, compassionate care, and evidence-based approaches to sustained transformation.',
    image: '/images/doctors/augusta.svg',
    profileHref: '/about',
  },
]

export default function DoctorsSection() {
  return (
    <section id="doctors" className="bg-[#f0f7f2] py-20 md:py-24">
      <div className="container-shell">
        <h2 className="max-w-3xl text-4xl font-bold text-[#111827] md:text-5xl">Meet Your Surgeons</h2>
        <p className="mt-4 max-w-2xl text-gray-700">Experienced specialists guiding every phase of your care with proven outcomes and compassionate support.</p>

        <div className="mt-10 grid gap-7">
          {doctors.map((doctor) => (
            <article key={doctor.name} className="grid gap-6 rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md md:grid-cols-[220px_1fr] md:items-center">
              <img src={doctor.image} alt={doctor.name} className="h-56 w-full rounded-xl object-cover" />
              <div>
                <span className="inline-flex border border-[#facc15] bg-[#fef9c3] px-3 py-1 text-xs font-semibold text-[#854d0e]">⭐ {doctor.rating}</span>
                <h3 className="mt-4 text-3xl font-extrabold text-[#0f172a]">{doctor.name}</h3>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-[#1f5f2e]">{doctor.role}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {doctor.stats.map((stat) => <span key={stat} className="border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">{stat}</span>)}
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-700">{doctor.bio}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={doctor.profileHref} className="border border-[#1f5f2e] px-4 py-2 text-sm font-semibold text-[#1f5f2e] hover:bg-[#1f5f2e] hover:text-white">View Full Profile</Link>
                  <Link href="/appointment" className="border border-[#0b5ed7] bg-[#0b5ed7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#094caf]">Book Consultation</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

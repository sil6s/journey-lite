import Link from 'next/link'

const doctors = [
  {
    name: 'Dr. Trace W. Curry, MD',
    credentials: 'Medical Director, Bariatric Surgery',
    rating: '5.0 rating (97 reviews)',
    highlight: 'Patients’ Top Choice',
    details: ['21+ years experience', '6,000+ gastric sleeve procedures', 'Triple licensed (OH, KY, IN)'],
    bio: 'Board-certified general surgeon focused on high-precision bariatric care and long-term patient outcomes.',
    image: '/images/doctors/curry.svg',
  },
  {
    name: 'Dr. James Augusta, DO, FACOS',
    credentials: 'Bariatric Specialist & Minimally Invasive Surgeon',
    rating: 'Patient-trusted specialist',
    highlight: 'Surgical Expertise: Sleeve, Bypass, SADI-S, Revisional Surgery',
    details: ['Advanced laparoscopic techniques', 'Comprehensive pre/post-op support', 'Outcome-focused treatment plans'],
    bio: 'Known for meticulous technique, clear communication, and personalized surgical strategy.',
    quote: '“My goal is not just a successful operation — it is helping patients reclaim the life they want.”',
    image: '/images/doctors/augusta.svg',
  },
]

export default function DoctorsSection() {
  return (
    <section id="doctors" className="bg-white py-24">
      <div className="container-shell">
        <div className="grid gap-8">
          {doctors.map((doctor, idx) => (
            <article key={doctor.name} className={`grid gap-8 border border-gray-200 bg-[#fdfefe] p-8 shadow-sm md:grid-cols-[280px_1fr] ${idx === 1 ? 'md:ml-10' : ''}`}>
              <img src={doctor.image} alt={doctor.name} className="h-[320px] w-full object-cover" />
              <div>
                <span className="inline-block border border-[#cdd9cf] bg-[#f0f7f2] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#1f5f2e]">{doctor.rating}</span>
                <h2 className="mt-4 text-4xl font-extrabold leading-tight text-[#0f172a]">{doctor.name}</h2>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.13em] text-[#1f5f2e]">{doctor.credentials}</p>
                <p className="mt-4 max-w-3xl text-base font-semibold text-[#1f2937]">{doctor.highlight}</p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700">{doctor.bio}</p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {doctor.details.map((detail) => <p key={detail} className="text-sm font-medium text-gray-700">{detail}</p>)}
                </div>
                {doctor.quote && <blockquote className="mt-5 border-l-2 border-[#1f5f2e] pl-4 text-sm italic text-gray-700">{doctor.quote}</blockquote>}
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/about" className="border border-[#1f5f2e] px-5 py-2.5 text-sm font-semibold text-[#1f5f2e] hover:bg-[#1f5f2e] hover:text-white">View Full Profile</Link>
                  <Link href="/appointment" className="border border-[#0b5ed7] bg-[#0b5ed7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#094caf]">Book Consultation</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

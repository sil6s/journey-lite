import Link from 'next/link'

export default function DoctorsSection() {
  return (
    <section id="doctors" className="bg-white py-16 md:py-20">
      <div className="container-shell">
        <h2 className="text-3xl font-bold">Meet Your Surgeons</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded border border-gray-200 p-6">
            <h3 className="text-2xl font-bold">Dr. Trace W. Curry, MD</h3><p className="mt-1 text-sm font-semibold text-gray-700">Medical Director, Bariatric Surgery</p>
            <p className="mt-3 text-sm text-gray-700">Patients' Top Choice · 5.0 Rating (97 Reviews) · 21+ Years Experience</p>
            <p className="mt-2 text-sm text-gray-700">6,000+ gastric sleeves · Triple licensed: OH, KY, IN</p>
            <p className="mt-3 text-sm text-gray-700">Board-certified general surgeon with over two decades of experience. Dr. Curry has performed thousands of advanced laparoscopic procedures and is recognized for pioneering non-surgical weight loss treatments in Ohio.</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700"><li>Vanderbilt University School of Medicine</li><li>Residency: TriHealth Good Samaritan Hospital</li><li>Licensed: Ohio, Kentucky, Indiana (active through 2027)</li></ul>
            <div className="mt-5 flex gap-3"><Link href="/about" className="rounded border border-[#1f5f2e] px-4 py-2 text-sm font-semibold text-[#1f5f2e]">View Full Profile</Link><Link href="/appointment" className="rounded border border-[#0b5ed7] bg-[#0b5ed7] px-4 py-2 text-sm font-semibold text-white">Book Consultation</Link></div>
          </article>
          <article className="rounded border border-gray-200 p-6">
            <h3 className="text-2xl font-bold">Dr. James Augusta, DO, FACOS</h3><p className="mt-1 text-sm font-semibold text-gray-700">Bariatric & Minimally Invasive Surgeon</p>
            <p className="mt-3 text-sm text-gray-700">Specialist in Gastric Sleeve, Bypass, and Revisional Surgery</p>
            <p className="mt-3 text-sm text-gray-700">Board-certified general surgeon specializing in advanced laparoscopic and bariatric procedures. Known for precision and patient-centered care, Dr. Augusta focuses on long-term transformation.</p>
            <p className="mt-3 text-sm text-gray-700">Core Expertise: Gastric Sleeve · Gastric Bypass · SADI-S · Revisional Surgery</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700"><li>Residency: Grandview Medical Center</li><li>Medical School: Pikeville College of Osteopathic Medicine</li><li>Board Certified: American Osteopathic Board of Surgery</li></ul>
            <blockquote className="mt-3 border-l-2 border-gray-300 pl-3 text-sm text-gray-700">“My goal isn’t just a successful operation — it’s seeing patients living a life they didn’t think was possible.”</blockquote>
            <div className="mt-5 flex gap-3"><Link href="/about" className="rounded border border-[#1f5f2e] px-4 py-2 text-sm font-semibold text-[#1f5f2e]">Meet Dr. Augusta</Link><Link href="/appointment" className="rounded border border-[#0b5ed7] bg-[#0b5ed7] px-4 py-2 text-sm font-semibold text-white">Schedule Consultation</Link></div>
          </article>
        </div>
      </div>
    </section>
  )
}

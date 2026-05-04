import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="py-16">
      <div className="container-shell rounded border border-[#1f5f2e] bg-[#1f5f2e] p-8 text-center text-white md:p-10">
        <h2 className="text-3xl font-bold">Start Your Weight Loss Journey Today</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/appointment" className="rounded border border-[#0b5ed7] bg-[#0b5ed7] px-5 py-3 font-semibold text-white">Book Consultation</Link>
          <a href="tel:+18888957328" className="rounded border border-white px-5 py-3 font-semibold text-white">Call (888) 895-7328</a>
        </div>
      </div>
    </section>
  )
}

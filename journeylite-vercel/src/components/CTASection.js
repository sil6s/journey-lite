import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="bg-[#f0f7f2] py-20">
      <div className="container-shell rounded-2xl border border-[#1f5f2e]/20 bg-[#1f5f2e] p-10 text-center text-white shadow-xl md:p-12">
        <h2 className="text-4xl font-bold md:text-5xl">Start Your Weight Loss Journey Today</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/85">Meet with an experienced specialist and get a clear, personalized path forward.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/appointment" className="border border-[#0b5ed7] bg-[#0b5ed7] px-6 py-3 font-semibold text-white hover:bg-[#094caf]">Book Consultation</Link>
          <a href="tel:+18888957328" className="border border-white px-6 py-3 font-semibold text-white hover:bg-white hover:text-[#1f5f2e]">Call (888) 895-7328</a>
        </div>
      </div>
    </section>
  )
}

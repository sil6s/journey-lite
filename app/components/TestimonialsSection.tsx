import Link from "next/link";
import { client } from "@/src/lib/sanity/client";
import { featuredTestimonialsQuery } from "@/src/lib/sanity/queries";
import type { TestimonialCard } from "@/src/lib/sanity/types";
import { TestimonialCard as TestimonialCardComponent } from "./TestimonialCard";

export async function TestimonialsSection() {
  const testimonials: TestimonialCard[] = await client.fetch(featuredTestimonialsQuery, {}, { next: { revalidate: 60 } });

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="bg-[#f7f8f6] py-16 lg:py-20" id="patient-stories">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="eyebrow">Patient stories</p>
          <h2 className="section-title">Real patients. Real results.</h2>
          <p className="section-intro">
            Hear from JourneyLite patients who compared their options, chose a care path, and committed to the follow-up
            that makes results last.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCardComponent key={t._id} testimonial={t} />
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            className="inline-flex items-center justify-center rounded-lg bg-[#0f3e2e] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f3e2e]"
            href="/patient-stories"
          >
            Read All Patient Stories
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-lg border border-[#0f3e2e] px-5 py-2.5 text-sm font-semibold text-[#0f3e2e] transition hover:bg-[#edf4ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f3e2e]"
            href="/contact"
          >
            Book a Consultation
          </Link>
        </div>

        <p className="mt-6 max-w-3xl text-xs leading-6 text-[#64736b]">
          Results vary by patient. Individual outcomes depend on procedure, adherence to follow-up care, medical
          history, and lifestyle factors. Stories shared with patient permission.
        </p>
      </div>
    </section>
  );
}

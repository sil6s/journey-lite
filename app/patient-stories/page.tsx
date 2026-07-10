import type { Metadata } from "next";
import { client } from "@/src/lib/sanity/client";
import { allTestimonialsQuery } from "@/src/lib/sanity/queries";
import type { TestimonialCard } from "@/src/lib/sanity/types";
import { TestimonialCard as TestimonialCardComponent } from "@/app/components/TestimonialCard";
import { getReactPageMetadata } from "@/lib/site/overrides";

export const revalidate = 60;

const fallbackMetadata: Metadata = {
  title: "Patient Stories | JourneyLite Physicians",
  description:
    "Read real patient stories from JourneyLite weight loss surgery and medical weight loss patients across Ohio, Kentucky, and Indiana.",
};

export function generateMetadata() {
  return getReactPageMetadata("/patient-stories", fallbackMetadata);
}

export default async function PatientStoriesPage() {
  const testimonials: TestimonialCard[] = await client.fetch(allTestimonialsQuery);

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow">Patient stories</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-[#1e2b24] md:text-6xl">
            Real patients. Real results.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#516059]">
            Hear from JourneyLite patients who compared their options, chose a care path, and committed to the follow-up
            that makes results last.
          </p>
        </div>

        {testimonials.length === 0 ? (
          <p className="mt-12 text-sm text-[#64736b]">Patient stories coming soon.</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCardComponent key={t._id} testimonial={t} />
            ))}
          </div>
        )}

        <p className="mt-10 max-w-3xl text-xs leading-6 text-[#64736b]">
          Results vary by patient. Individual outcomes depend on procedure, adherence to follow-up care, medical
          history, and lifestyle factors. Stories shared with patient permission.
        </p>
      </div>
    </main>
  );
}

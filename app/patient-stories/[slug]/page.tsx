import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client } from "@/src/lib/sanity/client";
import { testimonialBySlugQuery, testimonialSlugsQuery } from "@/src/lib/sanity/queries";
import { urlFor } from "@/src/lib/sanity/image";
import type { TestimonialFull } from "@/src/lib/sanity/types";
import { BeforeAfterSlider } from "@/app/components/BeforeAfterSlider";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs: { slug: string }[] = await client.fetch(testimonialSlugsQuery);
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const testimonial: TestimonialFull | null = await client.fetch(testimonialBySlugQuery, { slug });
  if (!testimonial) return {};
  return {
    title: `${testimonial.name}'s Story — ${testimonial.procedure} | JourneyLite`,
    description: `${testimonial.name} lost ${testimonial.weightLost} lbs with ${testimonial.procedure} at JourneyLite Physicians.`,
  };
}

export default async function TestimonialStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const testimonial: TestimonialFull | null = await client.fetch(testimonialBySlugQuery, { slug });

  if (!testimonial) notFound();

  const beforeSrc = testimonial.beforePhoto?.asset
    ? urlFor(testimonial.beforePhoto).width(900).height(675).url()
    : "";
  const afterSrc = testimonial.afterPhoto?.asset
    ? urlFor(testimonial.afterPhoto).width(900).height(675).url()
    : "";

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-4xl px-5 py-14 lg:px-8 lg:py-20">
        <Link
          className="inline-flex items-center text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline"
          href="/patient-stories"
        >
          ← All Patient Stories
        </Link>

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#dce4df] shadow-xl shadow-[#20372b]/8">
          <BeforeAfterSlider
            afterAlt={testimonial.afterPhoto?.alt ?? `${testimonial.name} after ${testimonial.procedure}`}
            afterSrc={afterSrc}
            aspectRatio="16/9"
            beforeAlt={testimonial.beforePhoto?.alt ?? `${testimonial.name} before ${testimonial.procedure}`}
            beforeSrc={beforeSrc}
          />

          <div className="p-6 lg:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#0f3e2e] px-4 py-1.5 text-sm font-bold text-white">
                Lost {testimonial.weightLost} lbs
              </span>
              <span className="rounded-full bg-[#edf4ef] px-4 py-1.5 text-sm font-semibold text-[#145c42]">
                {testimonial.procedure}
              </span>
            </div>

            <h1 className="mt-5 font-serif text-4xl leading-tight text-[#1e2b24] md:text-5xl">
              {testimonial.name}&apos;s Story
            </h1>

            {testimonial.fullStory && testimonial.fullStory.length > 0 ? (
              <div className="prose prose-green mt-8 max-w-none text-[#24352c] prose-headings:font-serif prose-headings:text-[#1e2b24] prose-p:leading-8 prose-p:text-[#53635b]">
                <PortableText value={testimonial.fullStory} />
              </div>
            ) : (
              <p className="mt-8 text-sm text-[#64736b]">Full story coming soon.</p>
            )}

            <div className="mt-10 flex flex-col gap-3 border-t border-[#dce4df] pt-8 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center rounded-lg bg-[#0f3e2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#145c42]"
                href="/contact"
              >
                Book a Consultation
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-lg border border-[#0f3e2e] px-5 py-2.5 text-sm font-semibold text-[#0f3e2e] transition hover:bg-[#edf4ef]"
                href="/patient-stories"
              >
                Read More Stories
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs leading-6 text-[#64736b]">
          Results vary by patient. Individual outcomes depend on procedure, adherence to follow-up care, medical
          history, and lifestyle factors. Story shared with patient permission.
        </p>
      </div>
    </main>
  );
}

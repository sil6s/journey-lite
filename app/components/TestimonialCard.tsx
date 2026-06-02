import Link from "next/link";
import { urlFor } from "@/src/lib/sanity/image";
import type { TestimonialCard as TestimonialCardType } from "@/src/lib/sanity/types";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

export function TestimonialCard({ testimonial }: { testimonial: TestimonialCardType }) {
  const beforeSrc = testimonial.beforePhoto?.asset
    ? urlFor(testimonial.beforePhoto).width(600).height(450).url()
    : "";
  const afterSrc = testimonial.afterPhoto?.asset
    ? urlFor(testimonial.afterPhoto).width(600).height(450).url()
    : "";

  const firstName = testimonial.name.split(" ")[0];

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-[#dce4df] bg-white shadow-sm shadow-[#20372b]/5">
      <div className="relative">
        <BeforeAfterSlider
          afterAlt={testimonial.afterPhoto?.alt ?? `${testimonial.name} after ${testimonial.procedure}`}
          afterSrc={afterSrc}
          beforeAlt={testimonial.beforePhoto?.alt ?? `${testimonial.name} before ${testimonial.procedure}`}
          beforeSrc={beforeSrc}
        />
        {/* Weight lost badge overlapping slider and card body */}
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
          <span className="whitespace-nowrap rounded-full bg-[#0f3e2e] px-4 py-1.5 text-sm font-bold text-white shadow-lg">
            Lost {testimonial.weightLost} lbs
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 pt-8">
        <p className="text-base font-semibold text-[#1f2c25]">{testimonial.name}</p>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#145c42]">
          {testimonial.procedure}
        </p>
        <p className="mt-3 text-sm italic leading-7 text-[#53635b]">&ldquo;{testimonial.shortQuote}&rdquo;</p>
        <Link
          className="mt-auto inline-flex pt-5 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
          href={`/patient-stories/${testimonial.slug}`}
        >
          Read {firstName}&apos;s story →
        </Link>
      </div>
    </article>
  );
}

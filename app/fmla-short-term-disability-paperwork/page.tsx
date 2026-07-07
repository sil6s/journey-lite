import type { Metadata } from "next";
import { CTAButton, SiteFooter, SiteHeader } from "../components/marketing";
import { FmlaPaperworkForm } from "./FmlaPaperworkForm";

export const metadata: Metadata = {
  title: "FMLA & Short-Term Disability Paperwork | JourneyLite",
  description: "Complete JourneyLite's FMLA or short-term disability paperwork request before paying the administrative fee.",
};

export default function FmlaShortTermDisabilityPaperworkPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[#f7faf7]">
        <section className="border-b border-[#dce4df] bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
            <div>
              <p className="eyebrow">FMLA / Short-Term Disability Paperwork</p>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-[#1f2c25] md:text-5xl">
                Complete your paperwork request
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#53635b]">
                Our practice charges a $30 fee for completing and submitting FMLA or short-term disability paperwork.
                Please complete this form first; the fee will be added to your cart after successful submission.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <CTAButton href="#fmla-form">Start Form</CTAButton>
                <CTAButton href="mailto:ma@curryweightloss.com" variant="secondary">
                  Email Medical Assistants
                </CTAButton>
              </div>
            </div>
            <div className="rounded-lg border border-[#dce4df] bg-[#f8fbf9] p-5">
              <h2 className="text-lg font-semibold text-[#1f2c25]">Before you submit</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#53635b]">
                <li>Complete the form below before paying the $30 administrative fee.</li>
                <li>Upload a PDF copy of your form if JourneyLite has not already received it.</li>
                <li>You may also fax your paperwork to 513-559-1235.</li>
                <li>For questions or issues, email ma@curryweightloss.com.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="px-5 py-12 lg:px-8 lg:py-16" id="fmla-form">
          <div className="mx-auto max-w-3xl">
            <FmlaPaperworkForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

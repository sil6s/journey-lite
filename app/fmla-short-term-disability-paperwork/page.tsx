import type { Metadata } from "next";
import { CTAButton, SiteFooter, SiteHeader } from "../components/marketing";
import { FmlaPaperworkForm, FmlaPaymentShortcut } from "./FmlaPaperworkForm";

export const metadata: Metadata = {
  title: "FMLA & Short-Term Disability Paperwork | JourneyLite",
  description: "Complete JourneyLite's FMLA or short-term disability paperwork request before paying the administrative fee.",
};

export default async function FmlaShortTermDisabilityPaperworkPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const variantId = typeof params.variantId === "string" ? params.variantId : undefined;

  return (
    <>
      <SiteHeader />
      <main className="bg-[#f7faf7]">
        <section className="border-b border-[#dce4df] bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
            <div>
              <p className="eyebrow">FMLA / Short-Term Disability Paperwork</p>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-[#1f2c25] md:text-5xl">
                Submit the form first, then pay the $30 fee.
              </h1>
              <div className="mt-5 rounded-lg border border-[#f1c27d] bg-[#fff7ed] p-4 text-sm font-semibold leading-6 text-[#7c3f12]">
                You must submit this form before paying the $30 paperwork fee. After submission, you will be redirected or shown the payment option.
              </div>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#53635b]">
                Our practice charges a $30 fee for completing and submitting FMLA or short-term disability paperwork. Both the request form and payment are required before processing begins.
              </p>
              <div className="mt-7 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-[#c9ded2] bg-[#f8fbf9] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#145c42]">Step 1</p>
                  <h2 className="mt-2 text-lg font-semibold text-[#1f2c25]">Submit paperwork request form</h2>
                  <p className="mt-2 text-sm leading-6 text-[#53635b]">Start here if you have not submitted your paperwork request yet.</p>
                  <div className="mt-4">
                    <CTAButton href="#fmla-form">Start Paperwork Request</CTAButton>
                  </div>
                </div>
                <div id="already-submitted-payment">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#145c42]">Step 2</p>
                  <FmlaPaymentShortcut variantId={variantId} />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-[#dce4df] bg-[#f8fbf9] p-5">
              <h2 className="text-lg font-semibold text-[#1f2c25]">How this works</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#53635b]">
                <li>Complete this form and upload your FMLA or disability paperwork.</li>
                <li>Submit the form.</li>
                <li>Pay the $30 paperwork fee.</li>
                <li>Our team reviews the request after both the form and payment are received.</li>
                <li>Completed paperwork is sent using the contact method you provide.</li>
              </ul>
              <div className="mt-5 rounded-lg bg-white p-4 text-sm leading-6 text-[#53635b]">
                Questions or upload issues? Email <a className="font-semibold text-[#145c42] underline-offset-4 hover:underline" href="mailto:ma@curryweightloss.com">ma@curryweightloss.com</a>.
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-12 lg:px-8 lg:py-16" id="fmla-form">
          <div className="mx-auto max-w-3xl">
            <div className="mb-5 rounded-lg border border-[#dce4df] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#145c42]">Step 1 of 2</p>
              <h2 className="mt-2 text-xl font-semibold text-[#1f2c25]">Paperwork request form</h2>
              <p className="mt-2 text-sm leading-6 text-[#53635b]">Submit this request first. The next step is the $30 payment.</p>
            </div>
            <FmlaPaperworkForm />
            <div className="mt-8 rounded-lg border border-[#dce4df] bg-white p-5">
              <h2 className="text-lg font-semibold text-[#1f2c25]">Quick questions</h2>
              <div className="mt-4 grid gap-4 text-sm leading-6 text-[#53635b]">
                <div>
                  <h3 className="font-semibold text-[#1f2c25]">What if I already paid?</h3>
                  <p className="mt-1">Submit the form anyway so our team can match your payment with your paperwork request.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1f2c25]">What if I forgot to upload my paperwork?</h3>
                  <p className="mt-1">Email your PDF to ma@curryweightloss.com or fax it to 513-559-1235.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1f2c25]">Where will my completed forms be sent?</h3>
                  <p className="mt-1">We send completed forms to the fax number or email address you provide in this request.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

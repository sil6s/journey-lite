import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/marketing";
import { FmlaPaperworkForm, FmlaPaymentShortcut } from "./FmlaPaperworkForm";
import { getReactPageMetadata } from "@/lib/site/overrides";

const fallbackMetadata: Metadata = {
  title: "FMLA & Short-Term Disability Paperwork | JourneyLite",
  description: "Complete JourneyLite's FMLA or short-term disability paperwork request before paying the administrative fee.",
};

export function generateMetadata() {
  return getReactPageMetadata("/fmla-short-term-disability-paperwork", fallbackMetadata);
}

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
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-5 py-14 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <p className="eyebrow">FMLA / Short-Term Disability Paperwork</p>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-[#1f2c25] md:text-5xl">
                Complete Your FMLA or Disability Paperwork Request
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#53635b]">
                This takes about 3-5 minutes. You&apos;ll complete your paperwork request first. After submission, you&apos;ll continue to the required $30 paperwork payment.
              </p>
              <div className="mt-8">
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#145c42] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-[#145c42]/20 transition hover:bg-[#0f4d37]"
                  href="#fmla-form"
                >
                  Start Request
                </Link>
                <FmlaPaymentShortcut variantId={variantId} />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#dce4df] bg-white px-5 py-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <WorkflowProgress />
          </div>
        </section>

        <section className="px-5 py-12 lg:px-8 lg:py-14" id="fmla-form">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#145c42]">Step 1 of 2</p>
              <div className="mt-2 flex flex-wrap items-end justify-between gap-3 border-b border-[#dce4df] pb-5">
                <div>
                  <h2 className="font-serif text-3xl leading-tight text-[#1f2c25]">Complete Your Request</h2>
                  <p className="mt-2 text-sm text-[#53635b]">Estimated time: 3-5 minutes</p>
                </div>
                <p className="max-w-xs text-sm leading-6 text-[#53635b]">After submitting this form you&apos;ll automatically continue to the next step.</p>
              </div>
            </div>
            <FmlaPaperworkForm />
            <FmlaFaq />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function WorkflowProgress() {
  return (
    <div aria-label="Paperwork request progress" className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-[#145c42] text-sm font-bold text-white">1</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#145c42]">Step 1</p>
          <p className="font-semibold text-[#1f2c25]">Paperwork Request</p>
          <p className="text-xs text-[#53635b]">Active</p>
        </div>
      </div>
      <div className="hidden h-px w-40 bg-[#cddad2] md:block" />
      <div className="flex items-center gap-3 text-[#53635b]">
        <span className="flex size-9 items-center justify-center rounded-full border border-[#cddad2] bg-white text-sm font-bold">2</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em]">Step 2</p>
          <p className="font-semibold text-[#1f2c25]">Payment</p>
          <p className="text-xs">Upcoming</p>
        </div>
      </div>
    </div>
  );
}

function FmlaFaq() {
  const items = [
    ["What if I already paid?", "Submit the request so our team can match it to your payment."],
    ["What if I forgot to upload my paperwork?", "Email your PDF to ma@curryweightloss.com or fax it to 513-559-1235."],
    ["Where will my paperwork be sent?", "We send completed forms to the fax number or email address you provide."],
    ["How long does processing take?", "Processing starts after both required items are received. Our team will contact you if anything is missing."],
  ];

  return (
    <section className="mt-10 border-t border-[#dce4df] pt-8">
      <h2 className="text-lg font-semibold text-[#1f2c25]">Questions</h2>
      <div className="mt-4 divide-y divide-[#dce4df] rounded-lg border border-[#dce4df] bg-white">
        {items.map(([question, answer]) => (
          <details className="group p-4" key={question}>
            <summary className="cursor-pointer list-none text-sm font-semibold text-[#1f2c25] marker:hidden">
              <span className="flex items-center justify-between gap-4">
                {question}
                <span className="text-lg text-[#145c42] group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-6 text-[#53635b]">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

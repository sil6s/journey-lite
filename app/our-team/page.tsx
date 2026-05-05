import type { Metadata } from "next";
import Link from "next/link";
import {
  CTAButton,
  PhysicianProfileCard,
  ReviewBadge,
  ReviewGrid,
  Section,
  SiteFooter,
  SiteHeader,
} from "../components/marketing";
import { phoneHref, physicianCards } from "../components/data";

export const metadata: Metadata = {
  title: "Our Team | JourneyLite Bariatric Surgery and Medical Weight Loss Physicians",
  description:
    "Meet the JourneyLite bariatric surgery and medical weight loss team, including Dr. Trace Curry and Dr. James Augusta.",
};

const internalLinks = [
  ["Gastric Sleeve", "/#gastric-sleeve"],
  ["Gastric Bypass", "/#gastric-bypass"],
  ["Gastric Balloon", "/gastric-balloon"],
  ["Weight Loss Medications", "/#medications"],
  ["Locations", "/#locations"],
  ["Pricing", "/#pricing"],
];

export default function OurTeamPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[#f7f8f6]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-20">
            <div>
              <p className="eyebrow">Our Team</p>
              <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] text-[#1e2b24] md:text-6xl">
                Meet the JourneyLite bariatric surgery and medical weight loss team.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#516059]">
                JourneyLite patients are supported by physicians focused on bariatric surgery, minimally invasive weight
                loss care, non-surgical procedures, medical weight loss, and patient-centered follow-up across Ohio,
                Kentucky, and Indiana.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <CTAButton href="/#quiz">Book Consultation</CTAButton>
                <CTAButton href="/#locations" variant="secondary">
                  View Locations
                </CTAButton>
                <CTAButton href="/#compare" variant="secondary">
                  Compare Weight Loss Options
                </CTAButton>
              </div>
            </div>
            <aside className="rounded-2xl border border-[#d6e1da] bg-white p-6 shadow-xl shadow-[#20372b]/10">
              <p className="eyebrow">Cincinnati bariatric surgeons</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#1f2c25]">
                Experienced weight loss physicians with surgical and medical care paths.
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#53635b]">
                Use this page to review physician backgrounds, specialties, education, licensure details where provided,
                and care areas before scheduling a consultation.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {internalLinks.map(([label, href]) => (
                  <Link
                    className="rounded-md border border-[#dce4df] bg-[#f8fbf9] px-3 py-2 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                    href={href}
                    key={label}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <Section
          eyebrow="Physician profiles"
          intro="These expanded profiles organize biography, credentials, specialties, education, experience, and contact details in a more readable format."
          title="Bariatric surgery and medical weight loss care"
          tone="white"
        >
          <div className="mt-8 grid gap-8">
            {physicianCards.map((physician) => (
              <PhysicianProfileCard expanded key={physician.name} physician={physician} />
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Patient trust"
          intro="Public review excerpts can help prospective patients understand the communication and care experience other patients describe."
          title="5.0 rating from 481 Google reviews"
          tone="soft"
        >
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
            <ReviewBadge />
            <div className="rounded-xl border border-[#dce4df] bg-white p-6">
              <h3 className="text-2xl font-semibold text-[#1f2c25]">
                JourneyLite Physicians / Dr. James Augusta Weight Loss Center
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#53635b]">
                Google review excerpts are shown with first names only and shortened for readability. The external review
                listing opens in a new tab from the badge link.
              </p>
            </div>
          </div>
          <ReviewGrid />
        </Section>

        <section className="bg-[#0f3e2e] py-16 text-white lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="eyebrow text-[#b9d2c5]">Talk with a physician</p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
              Ready to talk with a JourneyLite physician?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8e6de]">
              Schedule a consultation to compare surgical, non-surgical, and medication-supported weight loss options
              with the JourneyLite team.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTAButton href="/#quiz" variant="light">
                Book Consultation
              </CTAButton>
              <CTAButton href={phoneHref} variant="outline">
                Call JourneyLite
              </CTAButton>
              <CTAButton href="/#locations" variant="outline">
                View Locations
              </CTAButton>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

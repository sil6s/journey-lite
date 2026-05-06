import type { Metadata } from "next";
import Link from "next/link";
import { ContactExperience } from "./ContactForm";
import { CTAButton, FAQAccordion, Section, SiteFooter, SiteHeader } from "../components/marketing";
import { cincinnatiLocation, locationGroups, phoneHref, phoneNumber } from "../components/data";

export const metadata: Metadata = {
  title: "Weight Loss Consultation Ohio | Contact JourneyLite",
  description:
    "Contact JourneyLite to request a weight loss consultation, ask about pricing, insurance, medications, surgery, or regional locations.",
};

const contactFaqs = [
  {
    question: "How soon will JourneyLite contact me after I submit the form?",
    answer:
      "Response timing can vary by request volume and office schedule. If your concern is urgent, call the appropriate office directly. If it is an emergency, call 911.",
  },
  {
    question: "Can I use this form to book a consultation?",
    answer:
      "Yes. Select request a consultation and share your preferred location, contact method, and treatment interests so the team can help route your next step.",
  },
  {
    question: "Should I use this form for a medical emergency?",
    answer:
      "No. This form is not for emergency or urgent medical needs. Call 911 for emergencies and call the office directly for urgent post-operative concerns.",
  },
  {
    question: "Can I ask about pricing before scheduling?",
    answer:
      "Yes. Select pricing or financing and include the treatment you are comparing. Pricing can depend on procedure type, facility needs, insurance, financing, medication choice, and follow-up.",
  },
  {
    question: "Can I ask about insurance coverage?",
    answer:
      "Yes. Include your insurance provider and the treatment you are interested in if known. Coverage depends on plan rules, medical criteria, documentation, and authorization.",
  },
  {
    question: "Which location should I choose?",
    answer:
      "Choose the location most convenient for you. If you are not sure, select the phone or not sure option and JourneyLite can help route your request.",
  },
  {
    question: "Can I ask about weight loss medications through this form?",
    answer:
      "Yes. Choose prescription weight loss medication, injectable medication, or oral medication and include any pricing, coverage, or eligibility questions.",
  },
  {
    question: "What information should I include in my message?",
    answer:
      "Include your general goals, treatment interest, pricing or insurance questions, and preferred timing. Do not include urgent medical concerns, payment information, or unnecessary sensitive details.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: contactFaqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://journeylite.com/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Contact JourneyLite",
      item: "https://journeylite.com/contact",
    },
  ],
};

const medicalBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "JourneyLite Physicians",
  telephone: phoneNumber,
  medicalSpecialty: ["Bariatric surgery", "Medical weight loss", "Weight management"],
  areaServed: ["Ohio", "Kentucky", "Indiana"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "10475 Reading Road",
    addressLocality: "Cincinnati",
    addressRegion: "OH",
    postalCode: "45241",
    addressCountry: "US",
  },
};

const prepDetails = [
  {
    title: "Consultation or procedure questions",
    copy:
      "Share the option you are considering, your preferred location, and whether you want help comparing surgery, gastric balloon care, or medication-supported treatment.",
  },
  {
    title: "Pricing, financing, or insurance",
    copy:
      "Include the service you are comparing and whether you are asking about self-pay pricing, financing, insurance requirements, medication costs, or revision surgery.",
  },
  {
    title: "Existing patient questions",
    copy:
      "Use the form for non-urgent questions only. For urgent post-operative or medical concerns, call the office directly or seek emergency care.",
  },
];

const oldContentNotes = [
  [
    "Surgery preparation",
    "JourneyLite preparation guidance points patients toward pre-op history forms, medication review, insurance cards, and notifying the team about illness or medication changes before a procedure.",
  ],
  [
    "Pricing and financing",
    "Existing pricing pages explain self-pay package questions, financing partners, insurance variability, and the need to confirm current details during consultation.",
  ],
  [
    "Medication costs",
    "Medication content separates office visit costs from prescription costs, insurance coverage, lab needs, and long-term follow-up questions.",
  ],
  [
    "Procedure-specific questions",
    "Gastric balloon instructions and gastric band revision content add useful context for prep, follow-up, conversions, and complexity questions.",
  ],
];

const sourceCards = [
  {
    title: "Obesity as a chronic condition",
    copy: "CDC context can help patients understand why medical weight management is often approached as long-term care, not a quick transaction.",
    href: "https://www.cdc.gov/obesity/adult-obesity-facts/index.html",
    label: "CDC adult obesity facts",
  },
  {
    title: "Health risks and medical context",
    copy: "CDC information on obesity-related health risks supports medically responsible conversations about eligibility and treatment goals.",
    href: "https://www.cdc.gov/obesity/php/about/consequences.html",
    label: "CDC obesity health risks",
  },
  {
    title: "Bariatric surgery types",
    copy: "NIDDK explains common bariatric procedure categories that patients may compare before requesting a consultation.",
    href: "https://www.niddk.nih.gov/health-information/weight-management/bariatric-surgery/types",
    label: "NIDDK bariatric surgery types",
  },
  {
    title: "Procedure education",
    copy: "ASMBS patient education explains how bariatric procedures can differ in anatomy, follow-up, and candidacy considerations.",
    href: "https://asmbs.org/patients/bariatric-surgery-procedures/",
    label: "ASMBS bariatric surgery procedures",
  },
];

export default function ContactPage() {
  const secondaryLocations = locationGroups.flatMap((group) => group.locations);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-5 pb-8 pt-10 lg:px-8 lg:pb-10 lg:pt-12">
            <div className="max-w-4xl">
              <p className="eyebrow">Contact JourneyLite</p>
              <h1 className="mt-4 font-serif text-4xl leading-[1.08] text-[#1e2b24] md:text-5xl">
                Contact JourneyLite for weight loss surgery, medication, and pricing questions.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[#516059]">
                Tell us what you need, and the JourneyLite team can route your request to the right person for
                consultation scheduling, pricing, financing, insurance, medication, surgery, or existing patient questions.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <CTAButton href="#contact-form">Request Consultation</CTAButton>
                <CTAButton href={phoneHref} variant="secondary">
                  Call {phoneNumber}
                </CTAButton>
                <CTAButton href="/services/pricing-financing" variant="secondary">
                  Pricing & Financing
                </CTAButton>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#8a3b22]">
                For urgent medical concerns, call the office directly or seek emergency care.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#f3f6f1] py-10 lg:py-12">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <ContactExperience />
          </div>
        </section>

        <section className="bg-white py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="eyebrow">Before you submit</p>
                <h2 className="mt-3 font-serif text-4xl leading-tight text-[#1f2c25]">
                  Include only the details that help the team respond.
                </h2>
                <p className="mt-4 text-base leading-7 text-[#53635b]">
                  The form is intentionally short. JourneyLite can follow up for medical history, benefit checks, financing
                  details, surgical preparation, or documentation when those details are needed.
                </p>
                <p className="mt-4 text-sm leading-6 text-[#53635b]">
                  Existing JourneyLite content on preparing for surgery, pricing, medication costs, gastric balloon
                  instructions, gastric band revision, and Katy&apos;s VSG story informed these contact paths. Individual
                  patient stories are not a guarantee of results.
                </p>
              </div>
              <div className="grid gap-4">
                {prepDetails.map((item) => (
                  <article className="rounded-lg border border-[#dce4df] bg-[#fafbf9] p-5" key={item.title}>
                    <h3 className="text-lg font-semibold text-[#1f2c25]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#53635b]">{item.copy}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-10 overflow-hidden rounded-xl border border-[#dce4df] bg-white">
              <div className="border-b border-[#dce4df] bg-[#f7f8f6] px-5 py-4">
                <h3 className="text-xl font-semibold text-[#1f2c25]">Common topics patients ask about</h3>
                <p className="mt-1 text-sm leading-6 text-[#53635b]">
                  These examples are adapted from JourneyLite&apos;s existing patient education and pricing content.
                </p>
              </div>
              <div className="divide-y divide-[#e6ece8]">
                {oldContentNotes.map(([topic, detail]) => (
                  <div className="grid gap-2 px-5 py-4 md:grid-cols-[220px_1fr]" key={topic}>
                    <p className="text-sm font-semibold text-[#1f2c25]">{topic}</p>
                    <p className="text-sm leading-6 text-[#53635b]">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTAButton href="/services/compare-weight-loss-options" variant="secondary">
                Compare Treatment Options
              </CTAButton>
              <CTAButton href="/services/pricing-financing" variant="secondary">
                Review Pricing & Financing
              </CTAButton>
              <CTAButton href="/services/gastric-band-revision" variant="secondary">
                Gastric Band Revision
              </CTAButton>
            </div>
          </div>
        </section>

        <section className="bg-[#f7f8f6] py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-3xl">
              <p className="eyebrow">Trusted medical context</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight text-[#1f2c25]">
                Sources that support responsible treatment conversations.
              </h2>
              <p className="mt-4 text-base leading-7 text-[#53635b]">
                These references are not a substitute for medical evaluation, but they provide credible context for
                weight management, bariatric surgery, and treatment comparison questions.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {sourceCards.map((source) => (
                <article className="flex h-full flex-col rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm" key={source.title}>
                  <h3 className="text-lg font-semibold text-[#1f2c25]">{source.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-[#53635b]">{source.copy}</p>
                  <a
                    className="mt-5 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline"
                    href={source.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {source.label}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Section
          eyebrow="Locations"
          intro="Choose a location in the form, call directly, or use directions if you already know which office is most convenient."
          title="Find the JourneyLite location near you"
          tone="light"
        >
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <LocationContactCard
              address={`${cincinnatiLocation.address1}, ${cincinnatiLocation.address2}`}
              directions={cincinnatiLocation.directions}
              phone={cincinnatiLocation.panels[0].voice}
              phoneHref={cincinnatiLocation.panels[0].voiceHref}
              title={cincinnatiLocation.shortTitle}
            />
            {secondaryLocations.map((location) => (
              <LocationContactCard
                address={`${location.address1}, ${location.address2}`}
                directions={location.directions}
                key={`${location.city}-${location.state}`}
                phone={location.phone}
                phoneHref={`tel:+1${location.phone.replace(/\D/g, "")}`}
                title={`${location.city}, ${location.state}`}
              />
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Contact FAQs"
          intro="Answers to common questions about appointment requests, pricing questions, insurance questions, and urgent care reminders."
          title="Contact and appointment request FAQs"
          tone="white"
        >
          <FAQAccordion items={contactFaqs} />
        </Section>

        <section className="bg-[#0f3e2e] py-16 text-white lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="eyebrow text-[#b9d2c5]">Next step</p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
              Ready to compare your weight loss options?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8e6de]">
              JourneyLite can help you understand surgical, non-surgical, and medication-supported paths based on your
              goals, health history, and next steps.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTAButton href="#contact-form" variant="light">
                Book Consultation
              </CTAButton>
              <CTAButton href={phoneHref} variant="outline">
                Call {phoneNumber}
              </CTAButton>
              <CTAButton href="/services/compare-weight-loss-options" variant="outline">
                Compare Options
              </CTAButton>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalBusinessSchema) }} />
    </>
  );
}

function LocationContactCard({
  title,
  address,
  phone,
  phoneHref,
  directions,
}: {
  title: string;
  address: string;
  phone: string;
  phoneHref: string;
  directions: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm">
      <h3 className="text-xl font-semibold text-[#1f2c25]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#53635b]">{address}</p>
      <a className="mt-3 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href={phoneHref}>
        {phone}
      </a>
      <div className="mt-auto flex flex-col gap-2 pt-5">
        <CTAButton href={phoneHref}>Call Location</CTAButton>
        <CTAButton href={directions} variant="secondary">
          Get Directions
        </CTAButton>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#cbd7d0] bg-white px-5 py-3 text-sm font-semibold text-[#17362a] transition hover:border-[#145c42] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
          href="/#locations"
        >
          View Location Page
        </Link>
      </div>
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ContactExperience, ContactInternalLinks, EmergencyNotice } from "./ContactForm";
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

export default function ContactPage() {
  const secondaryLocations = locationGroups.flatMap((group) => group.locations);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[#f7f8f6]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-20">
            <div>
              <p className="eyebrow">Contact JourneyLite</p>
              <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] text-[#1e2b24] md:text-6xl">
                Start your weight loss journey with the right next step.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#516059]">
                Request a weight loss consultation in Ohio, ask a question, compare treatment options, or contact a
                specific JourneyLite location. This form does not replace medical advice or emergency care.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CTAButton href="#contact-form">Request Consultation</CTAButton>
                <CTAButton href={phoneHref} variant="secondary">
                  Call {phoneNumber}
                </CTAButton>
              </div>
            </div>
            <aside className="rounded-2xl border border-[#d6e1da] bg-white p-6 shadow-2xl shadow-[#20372b]/10">
              <p className="eyebrow">Trusted regional care</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["10,000+", "procedures"],
                  ["6,000+", "gastric sleeves"],
                  ["20+", "years experience"],
                  ["5", "regional locations"],
                ].map(([value, label]) => (
                  <div className="rounded-lg border border-[#dce4df] bg-[#f8fbf9] p-4" key={label}>
                    <p className="font-serif text-4xl text-[#145c42]">{value}</p>
                    <p className="mt-2 text-sm font-semibold text-[#53635b]">{label}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="bg-white py-10">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <EmergencyNotice />
          </div>
        </section>

        <section className="bg-[#edf4ef] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <ContactExperience />
          </div>
        </section>

        <Section
          eyebrow="Helpful links"
          intro="Use these links if you want to compare options before or after submitting a request."
          title="Explore JourneyLite services before your consultation"
          tone="white"
        >
          <ContactInternalLinks />
        </Section>

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

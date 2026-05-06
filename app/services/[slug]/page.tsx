import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CTAButton,
  FAQAccordion,
  ReviewBadge,
  ReviewGrid,
  Section,
  SiteFooter,
  SiteHeader,
} from "../../components/marketing";
import { ServiceDiagram } from "../../components/ServiceVisuals";
import { phoneHref, phoneNumber, physicianCards } from "../../components/data";
import { servicePageMap, servicePages, serviceSlugs } from "../../components/serviceData";
import type { ServicePageData } from "../../components/serviceData";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const pricingFaqItems = [
  {
    question: "Are these prices current?",
    answer:
      "These self-pay examples are based on JourneyLite pricing information already used in the site content. Pricing may change and can vary by eligibility, procedure type, facility needs, testing, anesthesia, aftercare, medications, insurance rules, and financing terms. JourneyLite can confirm current pricing during consultation.",
  },
  {
    question: "What is included in self-pay surgery pricing?",
    answer:
      "Package details can vary, but JourneyLite surgical pricing information has included items such as surgery, anesthesia, EKG, and one year of office aftercare. Patients should ask exactly what is included for their procedure before comparing prices.",
  },
  {
    question: "What is not included?",
    answer:
      "Labs, imaging, outside medical clearance, prescriptions, travel, hotel needs, complications, unrelated care, and insurance-specific requirements may be separate. The consultation is the right time to confirm what applies to your plan or self-pay package.",
  },
  {
    question: "Does insurance cover bariatric surgery?",
    answer:
      "Some insurance plans cover bariatric surgery for eligible patients, but requirements vary. Plans may require BMI criteria, medical necessity documentation, comorbidity history, supervised weight-loss attempts, and prior authorization.",
  },
  {
    question: "Can I finance bariatric surgery?",
    answer:
      "Financing may be available through lenders such as Kemba Credit Union, CareCredit, and Prosper Healthcare Lending. Approval, terms, interest rates, and monthly payment amounts depend on lender rules and patient qualification.",
  },
  {
    question: "Are medication costs included in office visits?",
    answer:
      "No. JourneyLite pricing information lists medication visit fees separately from the medication itself. Medication cost depends on the prescription, pharmacy, dose, availability, insurance coverage, and whether follow-up or lab monitoring is needed.",
  },
  {
    question: "Why does revision surgery cost more?",
    answer:
      "Revision surgery often depends on prior procedure type, anatomy, scar tissue, imaging, operative complexity, facility setting, and whether the plan is a removal, conversion, or corrective procedure. Some revisions may need a staged approach.",
  },
  {
    question: "Is gastric balloon usually self-pay?",
    answer:
      "Many gastric balloon programs are self-pay, but benefits vary by plan. Patients should confirm whether the price includes placement, removal, follow-up visits, nutrition support, medication needs, and program support.",
  },
  {
    question: "How do I confirm my exact cost?",
    answer:
      "Schedule a pricing consultation with JourneyLite. The team can help compare self-pay, insurance, financing, surgery, medication, balloon, and revision pathways based on your medical history and goals.",
  },
  {
    question: "Should I choose surgery, medication, or both?",
    answer:
      "That decision should be made after medical evaluation. Some patients compare surgery, gastric balloon, medication-supported care, or a combined long-term plan depending on eligibility, health history, cost, and follow-up needs.",
  },
];

const selfPayPricingRows = [
  {
    option: "Gastric sleeve",
    price: "$10,000 promotional pricing",
    notes: "Confirm current eligibility, package details, and included services.",
    href: "/services/gastric-sleeve",
    cta: "Confirm Sleeve Pricing",
  },
  {
    option: "Lap Band",
    price: "$11,999",
    notes: "Confirm current availability and package details.",
    href: "/services/lap-band-surgery",
    cta: "Ask About Lap Band",
  },
  {
    option: "SIPS / SADI",
    price: "$15,900",
    notes: "More complex surgical option; evaluation required.",
    href: "/services/sadi-surgery",
    cta: "Confirm SADI Pricing",
  },
  {
    option: "Gastric bypass",
    price: "$16,900",
    notes: "Evaluation required; coverage and self-pay details vary.",
    href: "/services/gastric-bypass",
    cta: "Confirm Bypass Pricing",
  },
  {
    option: "Orbera or Spatz gastric balloon",
    price: "$6,500",
    notes: "Non-surgical balloon option; confirm placement, removal, and follow-up details.",
    href: "/services/pricing-financing#self-pay-pricing",
    cta: "Ask About Balloon Cost",
  },
  {
    option: "Medication visits",
    price: "Initial visit $199; follow-up $129",
    notes: "Medication cost is separate from office visits.",
    href: "/services/pricing-financing#self-pay-pricing",
    cta: "Ask About Medication Costs",
  },
];

const paymentPathways = [
  {
    title: "Self-pay",
    copy: "Compare package examples and confirm what is included before choosing a procedure.",
    bullets: ["Surgery, anesthesia, and aftercare may be bundled", "Revisions or hospital cases can cost more"],
    href: "/contact",
    cta: "Confirm Current Pricing",
  },
  {
    title: "Insurance",
    copy: "Coverage depends on plan benefits, medical criteria, documentation, and authorization.",
    bullets: ["BMI and medical necessity rules may apply", "Deductibles and co-insurance vary"],
    href: "/contact",
    cta: "Check Insurance Steps",
  },
  {
    title: "Financing",
    copy: "Financing may help qualified patients spread eligible treatment costs over time.",
    bullets: ["Terms depend on lender approval", "Kemba, CareCredit, and Prosper are listed options"],
    href: "#financing",
    cta: "Explore Financing",
  },
  {
    title: "Medication cost",
    copy: "Medication visits, prescriptions, labs, and follow-up should be reviewed separately.",
    bullets: ["Initial and follow-up visits are separate", "Prescription cost depends on medication and coverage"],
    href: "/services/pricing-financing#self-pay-pricing",
    cta: "Ask About Medication Costs",
  },
  {
    title: "Revision surgery",
    copy: "Revision pricing varies more because anatomy, imaging, and procedure complexity differ.",
    bullets: ["Band removal or conversion may be different", "Sleeve or bypass revisions need separate review"],
    href: "/services/gastric-band-revision",
    cta: "Review Revision Costs",
  },
];

const costFactors = [
  "Procedure type",
  "Insurance coverage",
  "Required pre-op testing",
  "Facility setting",
  "Surgeon and anesthesia fees",
  "Follow-up care",
  "Medication needs",
  "Revision complexity",
  "Travel or location considerations",
  "Financing terms",
];

const pricingSources = [
  {
    source: "CDC",
    title: "Obesity care is medical care",
    summary:
      "CDC describes obesity as a common, serious, and costly chronic disease, which supports comparing treatment, coverage, and follow-up as medical decisions.",
    href: "https://www.cdc.gov/obesity/adult-obesity-facts/index.html",
    label: "CDC adult obesity facts",
  },
  {
    source: "NIDDK",
    title: "Treatment options differ",
    summary:
      "NIDDK explains bariatric surgery types and prescription medication options, helping patients understand why cost varies by care path.",
    href: "https://www.niddk.nih.gov/health-information/weight-management/bariatric-surgery/types",
    label: "NIDDK types of weight-loss surgery",
  },
  {
    source: "ASMBS",
    title: "Procedure choice affects follow-up",
    summary:
      "ASMBS explains that bariatric procedures differ in anatomy, digestion, hunger, fullness, and follow-up needs.",
    href: "https://asmbs.org/patients/bariatric-surgery-procedures/",
    label: "ASMBS bariatric surgery procedures",
  },
  {
    source: "FDA",
    title: "Medication coverage is separate",
    summary:
      "FDA medication information describes Zepbound as a prescription option used with reduced-calorie diet and increased physical activity for eligible adults.",
    href: "https://www.fda.gov/news-events/press-announcements/fda-approves-new-medication-chronic-weight-management",
    label: "FDA Zepbound approval announcement",
  },
];

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = servicePageMap[slug];
  if (!service) return {};

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: {
      canonical: `/services/${service.slug}`,
    },
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = servicePageMap[slug];
  if (!service) notFound();

  const pageFaqs = service.slug === "pricing-financing" ? pricingFaqItems : service.faqs;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pageFaqs.map((item) => ({
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
        name: "Services",
        item: "https://journeylite.com/services",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: service.title,
        item: `https://journeylite.com/services/${service.slug}`,
      },
    ],
  };

  const medicalBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "JourneyLite Physicians",
    telephone: "877-442-2263",
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

  const medicalWebPageSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: service.metaTitle,
    description: service.metaDescription,
    url: `https://journeylite.com/services/${service.slug}`,
    about: service.title,
    medicalAudience: "Patient",
    reviewedBy: {
      "@type": "MedicalOrganization",
      name: "JourneyLite Physicians",
    },
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    serviceType: service.category,
    description: service.heroSummary,
    areaServed: ["Ohio", "Cincinnati", "Dayton", "Columbus", "Northern Kentucky", "Indianapolis"],
    provider: {
      "@type": "MedicalOrganization",
      name: "JourneyLite Physicians",
      telephone: phoneNumber,
    },
  };

  const medicalProcedureSchema =
    service.category === "Pricing and Comparison"
      ? null
      : {
          "@context": "https://schema.org",
          "@type": "MedicalProcedure",
          name: service.title,
          description: service.heroSummary,
          howPerformed: service.diagramDescription,
          preparation: service.processSteps[0],
          followup: service.quickFacts.find((fact) => fact.label === "Follow-up needs")?.value,
          provider: {
            "@type": "MedicalOrganization",
            name: "JourneyLite Physicians",
            telephone: phoneNumber,
          },
        };

  const related = service.relatedServices
    .map((slug) => servicePages.find((page) => page.slug === slug))
    .filter(Boolean)
    .slice(0, 4);

  if (service.slug === "pricing-financing") {
    return (
      <PricingFinancingPage
        breadcrumbSchema={breadcrumbSchema}
        faqSchema={faqSchema}
        medicalBusinessSchema={medicalBusinessSchema}
        medicalWebPageSchema={medicalWebPageSchema}
        service={service}
        serviceSchema={serviceSchema}
      />
    );
  }

  return (
    <>
      <SiteHeader />
      <main id="overview">
        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_0.78fr] lg:items-center lg:px-8 lg:py-14">
            <div>
              <p className="eyebrow">{getHeroEyebrow(service)}</p>
              <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-[1.04] text-[#1e2b24] md:text-5xl xl:text-6xl">
                {service.h1}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[#516059] md:text-lg">{service.heroSummary}</p>
              {service.status ? (
                <p className="mt-4 rounded-lg border border-[#d8c88b] bg-[#fffdf4] px-4 py-3 text-sm font-semibold leading-6 text-[#5e5235]">
                  {service.status}
                </p>
              ) : null}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <CTAButton href="/contact">Book Consultation</CTAButton>
                <CTAButton href="/services/compare-weight-loss-options" variant="secondary">
                  Compare Options
                </CTAButton>
                <CTAButton href="/services/pricing-financing" variant="secondary">
                  Check Insurance & Financing
                </CTAButton>
              </div>
              <HeroTrustChips service={service} />
            </div>

            <figure className="overflow-hidden rounded-2xl border border-[#dce4df] bg-[#f7f8f6] shadow-sm">
              <div className="relative aspect-[4/3]">
                <Image
                  alt={service.productImageAlt}
                  className="object-cover"
                  fill
                  priority
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  src={service.productImage}
                />
              </div>
              <figcaption className="border-t border-[#dce4df] bg-white px-5 py-4 text-sm leading-6 text-[#53635b]">
                {service.productImageCaption}
              </figcaption>
            </figure>
          </div>
        </section>

        <ServiceMiniNav />

        <AtAGlance service={service} />

        <ContextStats service={service} />

        <CtaStrip
          copy="Not sure if this is the right option? Compare treatment paths before narrowing your next step."
          primaryLabel="Compare Treatment Options"
          primaryHref="/services/compare-weight-loss-options"
          secondaryLabel="Book Consultation"
          secondaryHref="/contact"
          tertiaryLabel="View Pricing"
          tertiaryHref="/services/pricing-financing"
        />

        <Section
          id="quick-answer"
          eyebrow={service.primaryKeyword}
          intro="This page explains the treatment in plain English so you can prepare better questions for a JourneyLite consultation."
          title={`Quick answer: what is ${service.title}?`}
          tone="soft"
        >
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.72fr]">
            <div className="space-y-4 text-base leading-8 text-[#53635b]">
              {service.whatIs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <aside className="rounded-xl border border-[#dce4df] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#1f2c25]">Useful related pages</h2>
              <div className="mt-4 grid gap-3">
                {related.map((item) =>
                  item ? (
                    <Link
                      className="rounded-lg border border-[#dce4df] bg-[#f8fbf9] p-4 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                      href={`/services/${item.slug}`}
                      key={item.slug}
                    >
                      {item.title}
                    </Link>
                  ) : null,
                )}
              </div>
            </aside>
          </div>
        </Section>

        <Section
          id="how-it-works"
          eyebrow="What happens"
          intro="A simplified visual and step-by-step overview can make the treatment easier to discuss with your provider."
          title={`What actually happens during ${service.title}?`}
          tone="white"
        >
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <ServiceDiagram service={service} />
            <ProcessCards steps={service.processSteps.slice(0, 6)} />
          </div>
          <p className="mt-5 rounded-lg border border-[#d8c88b] bg-[#fffdf4] p-4 text-sm leading-6 text-[#5e5235]">
            {service.diagramCaption} {service.visualDisclaimer}
          </p>
        </Section>

        <Section
          eyebrow="Mechanism"
          intro={service.diagramAccessibleSummary}
          title="How this supports weight loss"
          tone="light"
        >
          <MechanismCards items={service.supportingVisuals} />
        </Section>

        <Section
          id="candidates"
          eyebrow="Fit and eligibility"
          intro="These lists are educational. They do not determine eligibility or replace a provider evaluation."
          title="Who may be a candidate?"
          tone="white"
        >
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <Checklist title="May be worth discussing if..." items={service.candidateFit} />
            <Checklist title="May not be the best fit if..." items={service.notCandidateFit} />
          </div>
        </Section>

        <CtaStrip
          copy={`Want to understand whether ${service.title.toLowerCase()} fits your history, goals, and coverage?`}
          primaryLabel="Book Consultation"
          primaryHref="/contact"
          secondaryLabel="Find a Location"
          secondaryHref="/#locations"
          tertiaryLabel="Call JourneyLite"
          tertiaryHref={phoneHref}
        />

        <Section
          id="benefits-risks"
          eyebrow="Balanced decision-making"
          intro="A good treatment page should explain both the potential upside and the responsibilities that come with care."
          title="Benefits and considerations"
          tone="soft"
        >
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <Checklist title="Potential benefits" items={service.benefits} />
            <Checklist title="Important considerations" items={service.considerations} />
          </div>
        </Section>

        <Section
          id="research"
          eyebrow="Research-backed context"
          intro="Research provides context, but individual results vary. A JourneyLite provider can interpret these findings against your health history and goals."
          title={`What research says about ${service.title.toLowerCase()}`}
          tone="white"
        >
          <ResearchCards service={service} />
        </Section>

        <CtaStrip
          copy="Research gives context. Your plan should still be personal."
          primaryLabel="Talk With JourneyLite"
          primaryHref="/contact"
          secondaryLabel="Compare Options"
          secondaryHref="/services/compare-weight-loss-options"
          tertiaryLabel="View Sources"
          tertiaryHref="#research"
        />

        <Section
          id="pricing"
          eyebrow="Cost and coverage"
          intro="Pricing and insurance depend on the treatment path, medical needs, plan rules, and follow-up requirements."
          title="Pricing, insurance, and financing"
          tone="soft"
        >
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {service.pricingNotes.map((note) => (
              <article className="rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm" key={note}>
                <p className="text-sm leading-6 text-[#53635b]">{note}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CTAButton href="/services/pricing-financing">Check Insurance & Financing</CTAButton>
            <CTAButton href="/contact" variant="secondary">
              Ask About This Option
            </CTAButton>
          </div>
        </Section>

        <Section
          eyebrow="Care timeline"
          intro="JourneyLite care is designed around evaluation, treatment planning, and follow-up support."
          title="What the process looks like"
          tone="white"
        >
          <ProcessTimeline steps={service.processSteps} />
        </Section>

        <Section
          id="compare"
          eyebrow="Compare options"
          intro={`Patients often compare ${service.title.toLowerCase()} with a small set of related JourneyLite options before deciding what to discuss next.`}
          title={`How ${service.title} compares with other options`}
          tone="light"
        >
          <ComparisonCards rows={service.comparisonRows} />
        </Section>

        <Section
          eyebrow="Consultation prep"
          intro="These questions can help you use the consultation well, especially if you are comparing more than one treatment path."
          title="Questions to ask during consultation"
          tone="white"
        >
          <ConsultationQuestions service={service} />
        </Section>

        <Section
          eyebrow="Ohio, Kentucky, and Indiana"
          intro={service.locationCopy}
          title={`${service.title} support across the region`}
          tone="soft"
        >
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CTAButton href="/#locations" variant="secondary">
              Find a Location
            </CTAButton>
            <CTAButton href="/contact">Contact JourneyLite</CTAButton>
          </div>
        </Section>

        <Section
          eyebrow="Care team"
          intro={service.physicianFocus}
          title="Physician-led care and follow-up"
          tone="white"
        >
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {physicianCards.slice(0, 2).map((physician) => (
              <article className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm" key={physician.name}>
                <div className="flex items-start gap-4">
                  <Image
                    alt={physician.avatarAlt}
                    className="h-16 w-16 rounded-full object-cover"
                    height={80}
                    src={physician.imageSrc}
                    width={80}
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-[#1f2c25]">{physician.name}</h2>
                    <p className="mt-1 text-sm font-semibold text-[#355346]">{physician.primaryTitle}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#53635b]">{physician.credibility}</p>
                <Link className="mt-4 inline-flex text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href={`/our-team/${physician.slug}`}>
                  {physician.cta}
                </Link>
              </article>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Patient confidence"
          intro="Patient feedback can help show the communication, follow-up, and care experience patients describe. Reviews do not guarantee outcomes."
          title="A care experience built around follow-up"
          tone="white"
        >
          <div className="mt-8">
            <ReviewBadge />
          </div>
          <ReviewGrid />
          {service.patientStory ? (
            <article className="mt-6 rounded-lg border border-[#d9c77b] bg-[#fffdf4] p-5">
              <p className="eyebrow">Individual patient story</p>
              <h3 className="mt-3 text-xl font-semibold text-[#1f2c25]">{service.patientStory.title}</h3>
              <blockquote className="mt-3 text-lg font-semibold leading-7 text-[#355346]">
                &ldquo;{service.patientStory.quote}&rdquo;
              </blockquote>
              <p className="mt-3 text-sm leading-6 text-[#53635b]">{service.patientStory.detail}</p>
              <p className="mt-3 text-xs leading-5 text-[#64736b]">{service.patientStory.disclaimer}</p>
            </article>
          ) : null}
        </Section>

        <CtaStrip
          copy="Still comparing options? Review the full treatment guide or ask JourneyLite to help narrow the next conversation."
          primaryLabel="View All Weight-Loss Options"
          primaryHref="/services/compare-weight-loss-options"
          secondaryLabel="Book Consultation"
          secondaryHref="/contact"
          tertiaryLabel="Call JourneyLite"
          tertiaryHref={phoneHref}
        />

        <Section
          id="faq"
          eyebrow="FAQs"
          intro={`Common questions about ${service.title.toLowerCase()} and how JourneyLite helps patients compare next steps.`}
          title={`${service.title} frequently asked questions`}
          tone="white"
        >
          <FAQAccordion items={service.faqs} />
        </Section>

        <section className="bg-[#0f3e2e] py-16 text-white lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="eyebrow text-[#b9d2c5]">Personalized next step</p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
              Find out if {service.title} is right for you.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8e6de]">
              The right weight-loss path depends on your health history, goals, comfort level, coverage, and long-term
              plan. JourneyLite can help you compare your options and choose the next step with medical guidance.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTAButton href="/contact" variant="light">
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalWebPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      {medicalProcedureSchema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalProcedureSchema) }} />
      ) : null}
    </>
  );
}

function PricingFinancingPage({
  breadcrumbSchema,
  faqSchema,
  medicalBusinessSchema,
  medicalWebPageSchema,
  service,
  serviceSchema,
}: {
  breadcrumbSchema: object;
  faqSchema: object;
  medicalBusinessSchema: object;
  medicalWebPageSchema: object;
  service: ServicePageData;
  serviceSchema: object;
}) {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Pricing content migration: old surgery pricing, medication pricing, financing, and preparation details are reorganized into patient-facing pricing sections. */}
        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_0.62fr] lg:items-center lg:px-8 lg:py-14">
            <div>
              <p className="eyebrow">Pricing and financing</p>
              <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-[1.04] text-[#1e2b24] md:text-5xl xl:text-6xl">
                Weight Loss Surgery Cost & Financing in Ohio
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[#516059] md:text-lg">
                Compare self-pay pricing, insurance coverage, financing, and medication cost options with JourneyLite.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <CTAButton href="#self-pay-pricing">View Self-Pay Pricing</CTAButton>
                <CTAButton href="/contact" variant="secondary">
                  Check Insurance or Financing Options
                </CTAButton>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#64736b]">
                Serving patients across Ohio, Kentucky, and Indiana with physician-led evaluation, surgery center care,
                and practical guidance for self-pay, insurance, and financing questions.
              </p>
            </div>
            <aside className="rounded-xl border border-[#dce4df] bg-white p-6 shadow-sm">
              <p className="eyebrow">Start here</p>
              <ol className="mt-4 space-y-3 text-sm font-semibold leading-6 text-[#355346]">
                {[
                  "Compare self-pay prices",
                  "Check insurance requirements",
                  "Review financing options",
                  "Schedule a consultation",
                ].map((item, index) => (
                  <li className="flex gap-3 rounded-lg bg-[#f8fbf9] p-3" key={item}>
                    <span className="text-[#145c42]">{index + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </section>

        <section className="border-y border-[#dce4df] bg-[#f8fbf9] py-5">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <p className="max-w-3xl text-sm font-semibold leading-6 text-[#355346]">
              Need a fast answer? Start with the self-pay table, then use consultation to confirm eligibility, coverage,
              package details, and financing next steps.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <CTAButton href="#self-pay-pricing">View Prices</CTAButton>
              <CTAButton href="/contact" variant="secondary">
                Schedule Pricing Consultation
              </CTAButton>
            </div>
          </div>
        </section>

        <Section
          eyebrow="Self-pay pricing"
          intro="The following self-pay pricing examples are based on JourneyLite's existing pricing information and should be confirmed during consultation because pricing, eligibility, package details, and included services can vary."
          title="Self-pay pricing at a glance"
          tone="white"
        >
          <div id="self-pay-pricing" className="mt-8 overflow-hidden rounded-lg border border-[#dce4df] bg-white shadow-sm">
            <div className="border-b border-[#dce4df] p-5">
              <h2 className="text-xl font-semibold text-[#1f2c25]">Common self-pay price ranges and package examples</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#53635b]">
                Use these examples as a starting point. Your exact cost depends on medical evaluation, package details,
                insurance or financing requirements, and current program availability.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[920px] w-full border-collapse text-left text-sm">
                <thead className="bg-[#0f3e2e] text-white">
                  <tr>
                    {["Procedure / Program", "Example self-pay price", "Notes", "Next step"].map((heading) => (
                      <th className="px-4 py-4 font-semibold" key={heading}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1ee]">
                  {selfPayPricingRows.map((row) => (
                    <tr key={row.option}>
                      <td className="px-4 py-4 font-semibold text-[#1f2c25]">{row.option}</td>
                      <td className="px-4 py-4 font-semibold text-[#145c42]">{row.price}</td>
                      <td className="px-4 py-4 text-[#53635b]">{row.notes}</td>
                      <td className="px-4 py-4">
                        <Link className="font-semibold text-[#145c42] underline-offset-4 hover:underline" href={row.href}>
                          {row.cta}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-5 rounded-lg border border-[#d8c88b] bg-[#fffdf4] p-4 text-sm leading-6 text-[#5e5235]">
            Pricing may change and may vary based on medical history, procedure type, facility needs, testing,
            anesthesia, aftercare, medications, and financing or insurance requirements. JourneyLite can confirm the
            most current pricing during consultation.
          </p>
        </Section>

        <Section
          eyebrow="Payment paths"
          intro="Choose the path that best matches how you expect to pay, then confirm details with JourneyLite."
          title="Choose your payment path"
          tone="soft"
        >
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {paymentPathways.map((pathway) => (
              <article className="flex h-full flex-col rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm" key={pathway.title}>
                <h2 className="text-lg font-semibold text-[#1f2c25]">{pathway.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#53635b]">{pathway.copy}</p>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-[#53635b]">
                  {pathway.bullets.map((bullet) => (
                    <li className="border-t border-[#edf1ee] pt-2" key={bullet}>
                      {bullet}
                    </li>
                  ))}
                </ul>
                <Link className="mt-auto inline-flex pt-5 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href={pathway.href}>
                  {pathway.cta}
                </Link>
              </article>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Cost drivers"
          intro="Most final pricing questions come back to a small set of variables."
          title="What affects final cost?"
          tone="white"
        >
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {costFactors.map((factor) => (
              <div className="rounded-lg border border-[#dce4df] bg-white p-4 text-sm font-semibold leading-6 text-[#355346] shadow-sm" key={factor}>
                {factor}
              </div>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Surgery pricing"
          intro="Surgical pricing should be reviewed by procedure, because package details and facility needs can differ."
          title="Surgery and balloon pricing"
          tone="soft"
        >
          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
            <div className="space-y-4 text-base leading-8 text-[#53635b]">
              <p>
                Gastric sleeve, gastric bypass, Lap Band, SIPS/SADI, and gastric balloon pricing should each be
                confirmed separately. Package examples may include surgery center, anesthesia, EKG, and aftercare
                elements, but the exact package depends on the procedure and patient needs.
              </p>
              <p>
                Revision surgery and hospital cases may cost more than primary self-pay procedures. If insurance is
                involved, deductibles, co-insurance, authorization, and network rules can affect the final patient cost.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <CTAButton href="/contact">Confirm Current Pricing</CTAButton>
                <CTAButton href="/services/compare-weight-loss-options" variant="secondary">
                  Compare Treatment Options
                </CTAButton>
              </div>
            </div>
            <Checklist
              title="Surgery price questions"
              items={[
                "What is included in the package?",
                "Are anesthesia, EKG, and aftercare included?",
                "Are labs, imaging, prescriptions, or clearances separate?",
                "Does pricing change for revisions or hospital cases?",
                "How long is follow-up included?",
              ]}
            />
          </div>
        </Section>

        <section className="bg-white py-12 lg:py-16">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 lg:grid-cols-2 lg:px-8">
            <article className="rounded-xl border border-[#dce4df] bg-white p-6 shadow-sm">
              <p className="eyebrow">Insurance</p>
              <h2 className="mt-3 text-2xl font-semibold text-[#1f2c25]">Does insurance cover weight loss surgery?</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-[#53635b]">
                <p>
                  Coverage depends on the insurance plan, employer benefits, medical necessity rules, BMI criteria,
                  comorbidity documentation, supervised weight-loss history, and prior authorization.
                </p>
                <p>
                  The <a className="font-semibold text-[#145c42] underline-offset-4 hover:underline" href="https://www.cdc.gov/obesity/adult-obesity-facts/index.html" rel="noopener noreferrer" target="_blank">CDC describes obesity as a chronic disease</a>, and
                  the <a className="font-semibold text-[#145c42] underline-offset-4 hover:underline" href="https://www.niddk.nih.gov/health-information/weight-management/bariatric-surgery/types" rel="noopener noreferrer" target="_blank"> NIDDK explains bariatric surgery types</a>. Your plan documents still determine coverage.
                </p>
              </div>
              <Link className="mt-5 inline-flex text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href="/contact">
                Check Insurance Steps
              </Link>
            </article>

            <article id="financing" className="rounded-xl border border-[#dce4df] bg-white p-6 shadow-sm">
              <p className="eyebrow">Financing</p>
              <h2 className="mt-3 text-2xl font-semibold text-[#1f2c25]">Financing weight loss surgery or medication</h2>
              <p className="mt-4 text-sm leading-7 text-[#53635b]">
                Financing may help qualified patients spread eligible treatment costs over time. JourneyLite pricing
                information includes lender options such as Kemba Credit Union, CareCredit, and Prosper Healthcare
                Lending. Approval, terms, payment amount, interest, and promotional eligibility are determined by the
                lender.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a className="text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href="https://www.carecredit.com/apply/" rel="noopener noreferrer" target="_blank">
                  CareCredit
                </a>
                <a className="text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href="https://www.prosper.com/personal-loans/healthcare-financing/" rel="noopener noreferrer" target="_blank">
                  Prosper Healthcare Lending
                </a>
                <Link className="text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href="/contact">
                  Explore Financing
                </Link>
              </div>
            </article>
          </div>
        </section>

        <section className="bg-[#f7f8f6] py-12 lg:py-16">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 lg:grid-cols-2 lg:px-8">
            <article className="rounded-xl border border-[#dce4df] bg-white p-6 shadow-sm">
              <p className="eyebrow">Medication pricing</p>
              <h2 className="mt-3 text-2xl font-semibold text-[#1f2c25]">Medication visits and prescription cost</h2>
              <p className="mt-4 text-sm leading-7 text-[#53635b]">
                JourneyLite pricing information lists medication visits separately from the medication itself: initial
                medication visit $199 and follow-up visits $129. Medication cost depends on the prescription, pharmacy,
                dose, availability, coverage, and follow-up needs.
              </p>
              <p className="mt-4 text-sm leading-7 text-[#53635b]">
                Examples in JourneyLite medication pricing content include phentermine around $10 to $30 per month,
                Qsymia and Contrave around $100 per month, plus separate Wegovy and Zepbound self-pay ranges that should
                be confirmed during consultation.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <CTAButton href="/services/pricing-financing#self-pay-pricing" variant="secondary">
                  Ask About Medication Costs
                </CTAButton>
                <CTAButton href="/medications#injectable-medications" variant="secondary">
                  Compare Injections
                </CTAButton>
              </div>
            </article>

            <article className="rounded-xl border border-[#dce4df] bg-white p-6 shadow-sm">
              <p className="eyebrow">Revision pricing</p>
              <h2 className="mt-3 text-2xl font-semibold text-[#1f2c25]">Revision surgery needs separate pricing review</h2>
              <p className="mt-4 text-sm leading-7 text-[#53635b]">
                Revision pricing varies more because it depends on prior procedure type, current anatomy, imaging, reflux
                or swallowing symptoms, band or port issues, scar tissue, facility needs, and whether the plan is a
                removal, conversion, or corrective operation.
              </p>
              <p className="mt-4 text-sm leading-7 text-[#53635b]">
                Examples include gastric band removal, band-to-sleeve, band-to-bypass, sleeve revision, bypass revision,
                and corrective procedures after prior bariatric surgery. Some cases may be handled in one operation;
                others may need a staged plan.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <CTAButton href="/services/gastric-band-revision" variant="secondary">
                  Review Revision Costs
                </CTAButton>
                <CTAButton href="/services/gastric-sleeve-revision" variant="secondary">
                  Sleeve Revision
                </CTAButton>
              </div>
            </article>
          </div>
        </section>

        <Section
          eyebrow="Package details"
          intro="Before comparing prices, confirm what the quoted price includes and what may be separate."
          title="What is included and what may be separate?"
          tone="white"
        >
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <Checklist
              title="May be included"
              items={["Surgeon fees", "Facility fees", "Anesthesia", "EKG or selected pre-op testing", "One year of office aftercare", "Nutrition or follow-up support"]}
            />
            <Checklist
              title="May be separate"
              items={["Labs or imaging", "Outside medical clearance", "Prescriptions", "Complications or unrelated care", "Insurance-specific requirements", "Travel or hotel needs unless specifically included"]}
            />
            <Checklist
              title="Before choosing by price alone"
              items={[
                "Compare provider experience and facility setting",
                "Ask about anesthesia and pre-op readiness",
                "Confirm aftercare and nutrition support",
                "Review medication instructions and monitoring",
                "Ask who to contact after treatment",
                "Complete required medical history forms before surgery",
              ]}
            />
          </div>
        </Section>

        <Section
          eyebrow="Trusted sources"
          intro="These references provide treatment and coverage context without replacing a personalized cost review."
          title="Trusted sources for treatment and coverage context"
          tone="soft"
        >
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pricingSources.map((card) => (
              <article className="flex h-full flex-col rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm" key={card.href}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64736b]">{card.source}</p>
                <h2 className="mt-2 text-lg font-semibold text-[#1f2c25]">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#53635b]">{card.summary}</p>
                <a className="mt-auto inline-flex pt-4 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href={card.href} rel="noopener noreferrer" target="_blank">
                  {card.label}
                </a>
              </article>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="FAQs"
          intro="Clear answers to common pricing, insurance, financing, and payment-path questions."
          title="Weight loss surgery cost and financing FAQs"
          tone="white"
        >
          <FAQAccordion items={pricingFaqItems} />
        </Section>

        <section className="bg-[#0f3e2e] py-16 text-white lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="eyebrow text-[#b9d2c5]">Next step</p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
              Find out which payment path fits your weight loss goals
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8e6de]">
              Schedule a consultation to compare insurance, self-pay, financing, surgery, balloon, revision, and
              medication-supported paths with JourneyLite.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTAButton href="/contact" variant="light">
                Schedule Consultation
              </CTAButton>
              <CTAButton href="/contact" variant="outline">
                Request Pricing and Financing Help
              </CTAButton>
              <CTAButton href={phoneHref} variant="outline">
                Call JourneyLite
              </CTAButton>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalWebPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
    </>
  );
}

function getHeroEyebrow(service: ServicePageData) {
  if (service.category === "Surgical Weight Loss") return "Surgical weight loss option";
  if (service.category === "Non-Surgical Weight Loss") return "Non-surgical weight loss option";
  return service.category;
}

function getQuickFact(service: ServicePageData, labels: string[]) {
  return service.quickFacts.find((fact) => labels.includes(fact.label))?.value;
}

function HeroTrustChips({ service }: { service: ServicePageData }) {
  const chips = [
    service.category === "Surgical Weight Loss" ? "Physician-led bariatric care" : "Physician-led evaluation",
    getQuickFact(service, ["Follow-up needs"]) ? "Structured follow-up" : "Care team guidance",
    "Regional locations",
    "Insurance and financing review",
  ];

  return (
    <div className="mt-6 flex flex-wrap gap-2" aria-label="JourneyLite service page trust indicators">
      {chips.map((chip) => (
        <span className="rounded-full border border-[#cbd7d0] bg-[#f8fbf9] px-3 py-1.5 text-xs font-semibold text-[#355346]" key={chip}>
          {chip}
        </span>
      ))}
    </div>
  );
}

function ServiceMiniNav() {
  const links = [
    ["Overview", "#overview"],
    ["How it works", "#how-it-works"],
    ["Candidates", "#candidates"],
    ["Benefits & risks", "#benefits-risks"],
    ["Research", "#research"],
    ["Pricing", "#pricing"],
    ["Compare", "#compare"],
    ["FAQ", "#faq"],
  ];

  return (
    <nav className="sticky top-[64px] z-30 border-y border-[#dce4df] bg-white/95 backdrop-blur" aria-label="Service page sections">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 lg:px-8">
        {links.map(([label, href]) => (
          <Link
            className="shrink-0 rounded-full border border-[#dce4df] bg-white px-3 py-2 text-xs font-semibold text-[#355346] transition hover:border-[#145c42] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
            href={href}
            key={href}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function AtAGlance({ service }: { service: ServicePageData }) {
  const facts = [
    {
      title: "Treatment type",
      value: getQuickFact(service, ["Treatment type"]) ?? service.category,
    },
    {
      title: "Typical timing / recovery",
      value: getQuickFact(service, ["Recovery or adjustment"]) ?? getQuickFact(service, ["Typical timing"]) ?? "Timing and recovery vary by treatment plan.",
    },
    {
      title: "Follow-up",
      value: getQuickFact(service, ["Follow-up needs"]) ?? "Follow-up helps track progress, nutrition, symptoms, and next steps.",
    },
    {
      title: "Best discussed by patients who...",
      value: getQuickFact(service, ["Fit profile", "Typical use case"]) ?? "Patients comparing weight-loss options with medical guidance.",
    },
  ];

  return (
    <Section
      eyebrow="At a glance"
      intro="A short summary first, then the deeper treatment guide below."
      title="Key details before you compare options"
      tone="white"
    >
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {facts.map((fact) => (
          <article className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm" key={fact.title}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#355346]">{fact.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#53635b]">{fact.value}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function ContextStats({ service }: { service: ServicePageData }) {
  if (!service.trustStats.length) return null;

  return (
    <section className="border-y border-[#dce4df] bg-[#f8fbf9] py-8">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {service.trustStats.slice(0, 4).map((stat) => (
            <article className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm" key={`${stat.value}-${stat.label}`}>
              <p className="font-serif text-3xl leading-none text-[#145c42]">{stat.value}</p>
              <h2 className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#355346]">{stat.label}</h2>
              {stat.microcopy ? <p className="mt-2 text-xs leading-5 text-[#64736b]">{stat.microcopy}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaStrip({
  copy,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  tertiaryHref,
  tertiaryLabel,
}: {
  copy: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  tertiaryHref: string;
  tertiaryLabel: string;
}) {
  return (
    <section className="border-y border-[#dce4df] bg-[#f8fbf9] py-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="max-w-3xl text-sm font-semibold leading-6 text-[#355346]">{copy}</p>
        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <CTAButton href={primaryHref}>{primaryLabel}</CTAButton>
          <CTAButton href={secondaryHref} variant="secondary">
            {secondaryLabel}
          </CTAButton>
          <CTAButton href={tertiaryHref} variant="secondary">
            {tertiaryLabel}
          </CTAButton>
        </div>
      </div>
    </section>
  );
}

function ProcessCards({ steps }: { steps: string[] }) {
  return (
    <div className="grid content-start gap-4 sm:grid-cols-2">
      {steps.map((step, index) => (
        <article className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm" key={step}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dfece5] text-sm font-bold text-[#145c42]">
            {index + 1}
          </span>
          <p className="mt-4 text-sm leading-6 text-[#53635b]">{step}</p>
        </article>
      ))}
    </div>
  );
}

function MechanismCards({ items }: { items: ServicePageData["supportingVisuals"] }) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm" key={item.title}>
          <h2 className="text-lg font-semibold text-[#1f2c25]">{item.title}</h2>
          <p className="mt-3 text-sm leading-6 text-[#53635b]">{item.description}</p>
        </article>
      ))}
    </div>
  );
}

function ResearchCards({ service }: { service: ServicePageData }) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {service.researchCards.map((card) => (
        <article className="flex h-full flex-col rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm" key={card.href}>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64736b]">{card.source}</p>
          <h2 className="mt-2 text-lg font-semibold text-[#1f2c25]">{card.title}</h2>
          <p className="mt-3 text-sm leading-6 text-[#53635b]">{card.summary}</p>
          <p className="mt-4 rounded-lg bg-[#f8fbf9] p-3 text-sm leading-6 text-[#355346]">
            What this means: use the research as context, then confirm fit with an individual medical evaluation.
          </p>
          <a
            className="mt-auto inline-flex pt-4 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
            href={card.href}
            rel={card.href.startsWith("/") ? undefined : "noopener noreferrer"}
            target={card.href.startsWith("/") ? undefined : "_blank"}
          >
            {card.linkLabel}
          </a>
        </article>
      ))}
    </div>
  );
}

function ProcessTimeline({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {steps.map((step, index) => (
        <li className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm" key={step}>
          <p className="font-serif text-4xl leading-none text-[#145c42]">{index + 1}</p>
          <p className="mt-4 text-sm leading-6 text-[#53635b]">{step}</p>
        </li>
      ))}
    </ol>
  );
}

function ComparisonCards({ rows }: { rows: ServicePageData["comparisonRows"] }) {
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-2">
      {rows.map((row) => (
        <article className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm" key={row.option}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64736b]">{row.type}</p>
              <h2 className="mt-2 text-xl font-semibold text-[#1f2c25]">{row.option}</h2>
            </div>
            <Link className="shrink-0 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href={row.href}>
              Compare this option
            </Link>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#53635b]">
            <span className="font-semibold text-[#1f2c25]">Why patients ask: </span>
            {row.bestFor}
          </p>
          <p className="mt-3 text-sm leading-6 text-[#53635b]">
            <span className="font-semibold text-[#1f2c25]">Key difference: </span>
            {row.considerations}
          </p>
        </article>
      ))}
    </div>
  );
}

function ConsultationQuestions({ service }: { service: ServicePageData }) {
  const questions = [
    `How does ${service.title.toLowerCase()} compare with my other choices?`,
    "What results are realistic for someone with my history?",
    "What follow-up will I need after treatment?",
    "What are the main risks, side effects, or tradeoffs?",
    "What happens if I regain weight or my progress stalls?",
    "How does insurance, self-pay pricing, or financing work?",
  ];

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {questions.map((question) => (
        <div className="rounded-xl border border-[#dce4df] bg-white p-5 text-sm font-semibold leading-6 text-[#355346] shadow-sm" key={question}>
          {question}
        </div>
      ))}
    </div>
  );
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-xl border border-[#dce4df] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#1f2c25]">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-[#53635b]">
        {items.map((item) => (
          <li className="border-b border-[#edf1ee] pb-3 last:border-0 last:pb-0" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

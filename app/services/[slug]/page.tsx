import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CTAButton,
  FAQAccordion,
  PhysicianProfileCard,
  ReviewBadge,
  ReviewGrid,
  Section,
  SiteFooter,
  SiteHeader,
} from "../../components/marketing";
import { ServiceComparisonDiagram, ServiceDiagram, ServiceHeroVisual } from "../../components/ServiceVisuals";
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
      <main>
        <section className="bg-[#f7f8f6]">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 lg:grid-cols-[1fr_0.88fr] lg:items-center lg:px-8 lg:py-12">
            <div>
              <p className="eyebrow">{service.category}</p>
              <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-[1.04] text-[#1e2b24] md:text-5xl xl:text-6xl">
                {service.h1}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[#516059] md:text-lg">{service.heroSummary}</p>
              <p className="mt-4 max-w-3xl rounded-lg border border-[#cbd9d1] bg-white px-4 py-3 text-sm font-semibold leading-6 text-[#355346]">
                {service.trustLine}
              </p>
              {service.status ? (
                <p className="mt-3 rounded-lg border border-[#d8c88b] bg-[#fffdf4] px-4 py-3 text-sm font-semibold leading-6 text-[#5e5235]">
                  {service.status}
                </p>
              ) : null}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <CTAButton href="/contact">Book Consultation</CTAButton>
                <CTAButton href="/services/compare-weight-loss-options" variant="secondary">
                  Compare Treatment Options
                </CTAButton>
                <CTAButton href="/services/pricing-financing" variant="secondary">
                  Check Insurance & Financing
                </CTAButton>
              </div>
              <p className="mt-3 max-w-2xl text-xs leading-5 text-[#64736b]">
                Most patients start with a consultation to confirm eligibility, insurance requirements, and the best
                treatment path.
              </p>
            </div>

            <ServiceHeroVisual service={service} />
          </div>
        </section>

        <section className="border-y border-[#dce4df] bg-white py-6">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {service.trustStats.map((stat) => (
                <article className="rounded-lg border border-[#dce4df] bg-[#f8fbf9] p-5" key={`${stat.value}-${stat.label}`}>
                  <p className="font-serif text-3xl leading-none text-[#145c42]">{stat.value}</p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#355346]">{stat.label}</p>
                  {stat.microcopy ? <p className="mt-2 text-xs leading-5 text-[#64736b]">{stat.microcopy}</p> : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        <DecisionCta
          copy="Not sure which option fits? A consultation can help compare surgical, non-surgical, and medication-supported paths."
          tertiaryHref="/services/pricing-financing"
          tertiaryLabel="View Pricing"
        />

        <Section
          eyebrow="Quick answer"
          intro={`${service.primaryKeyword} questions usually come down to fit, safety, cost, and follow-up. These facts give you a starting point before consultation.`}
          title="Key facts to know before choosing a path"
          tone="white"
        >
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {service.quickFacts.map((fact, index) => (
              <article className="rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm" key={fact.label}>
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dfece5] text-sm font-bold text-[#145c42]">
                    {index + 1}
                  </span>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#355346]">{fact.label}</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#53635b]">{fact.value}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section
          eyebrow={service.primaryKeyword}
          intro={`JourneyLite uses this section to explain ${service.title.toLowerCase()} in plain language, without guarantees or pressure.`}
          title={`What is ${service.title}?`}
          tone="soft"
        >
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <div className="space-y-4 text-base leading-8 text-[#53635b]">
              {service.whatIs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="grid gap-3">
              {related.map((item) =>
                item ? (
                  <Link
                    className="rounded-lg border border-[#dce4df] bg-white p-4 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                    href={`/services/${item.slug}`}
                    key={item.slug}
                  >
                    {item.title}
                  </Link>
                ) : null,
              )}
              <Link
                className="rounded-lg border border-[#dce4df] bg-white p-4 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                href="/contact"
              >
                Request consultation
              </Link>
              <Link
                className="rounded-lg border border-[#dce4df] bg-white p-4 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                href="/blog"
              >
                Blog and patient resources
              </Link>
            </div>
          </div>
        </Section>

        <Section
          eyebrow="How it works"
          intro="This visual is simplified to help patients understand the main idea before talking with a provider."
          title={`How ${service.title.toLowerCase()} works`}
          tone="white"
        >
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <ServiceDiagram service={service} />
            <div className="grid content-start gap-4">
              {service.supportingVisuals.map((item) => (
                <article className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm" key={item.title}>
                  <h3 className="text-lg font-semibold text-[#1f2c25]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#53635b]">{item.description}</p>
                </article>
              ))}
              <article className="rounded-xl border border-[#d8c88b] bg-[#fffdf4] p-5 text-sm leading-6 text-[#5e5235]">
                <h3 className="text-lg font-semibold text-[#1f2c25]">Visual note</h3>
                <p className="mt-2">{service.diagramCaption}</p>
                <p className="mt-2">{service.visualDisclaimer}</p>
              </article>
            </div>
          </div>
        </Section>

        <Section
          eyebrow="Is this right for me?"
          intro="The lists below help organize your questions. They do not determine eligibility."
          title="Who may be a candidate?"
          tone="white"
        >
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <Checklist title="May be a fit if..." items={service.candidateFit} />
            <Checklist title="May not be a fit if..." items={service.notCandidateFit} />
          </div>
        </Section>

        <DecisionCta
          copy={`A consultation can confirm whether ${service.title.toLowerCase()} fits your medical history, goals, and coverage requirements.`}
          tertiaryHref="/#locations"
          tertiaryLabel="Find a Location"
        />

        <Section
          eyebrow="Balanced expectations"
          intro="JourneyLite pages are designed to help patients understand both upside and responsibility."
          title="Benefits and considerations"
          tone="light"
        >
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <Checklist title="Potential benefits" items={service.benefits} />
            <Checklist title="Important considerations" items={service.considerations} />
          </div>
        </Section>

        <DecisionCta
          copy="Balanced decision-making matters. Compare benefits, limitations, costs, recovery, and follow-up before choosing a path."
          tertiaryHref="/services/compare-weight-loss-options"
          tertiaryLabel="Compare Options"
        />

        <Section
          eyebrow="Research-backed context"
          intro="Medical decisions should be grounded in reliable information and individual evaluation. These sources provide context for discussion with JourneyLite."
          title={`What research says about ${service.title.toLowerCase()}`}
          tone="white"
        >
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {service.researchCards.map((card) => (
              <article className="flex h-full flex-col rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm" key={card.href}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64736b]">{card.source}</p>
                <h2 className="mt-2 text-lg font-semibold text-[#1f2c25]">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#53635b]">{card.summary}</p>
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
          <div className="mt-5 rounded-lg border border-[#dce4df] bg-[#f8fbf9] p-4 text-sm leading-6 text-[#53635b]">
            <p className="font-semibold text-[#1f2c25]">JourneyLite content migration note</p>
            <p className="mt-1">{service.migrationNote}</p>
          </div>
        </Section>

        <Section
          eyebrow="Pricing and coverage"
          intro="Exact pricing and coverage cannot be determined from a web page alone, but patients can prepare for the right questions."
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
            <CTAButton href="/services/pricing-financing" variant="secondary">
              View Pricing & Financing
            </CTAButton>
            <CTAButton href="/contact">Ask About Cost</CTAButton>
          </div>
        </Section>

        <Section
          eyebrow="Legacy patient education"
          intro="Useful details from the old JourneyLite site were preserved and reorganized into this cleaner service-page pattern."
          title="Patient education details carried forward"
          tone="white"
        >
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {service.legacyHighlights.map((item) => (
              <article className="rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm" key={item}>
                <p className="text-sm leading-6 text-[#53635b]">{item}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="JourneyLite process"
          intro="Every care path starts with evaluation and ends with support, not a one-time transaction."
          title="What the process looks like"
          tone="white"
        >
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {service.processSteps.map((step, index) => (
              <article className="rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm" key={step}>
                <p className="font-serif text-4xl leading-none text-[#145c42]">{index + 1}</p>
                <p className="mt-4 text-sm leading-6 text-[#53635b]">{step}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Compare options"
          intro={`Compare ${service.title.toLowerCase()} with related JourneyLite options before your visit.`}
          title={`${service.title} compared with related options`}
          tone="light"
        >
          <ServiceComparisonDiagram service={service} />
          <div className="mt-8 overflow-hidden rounded-lg border border-[#dce4df] bg-white shadow-sm">
            <table className="hidden w-full border-collapse text-left text-sm md:table">
              <thead className="bg-[#0f3e2e] text-white">
                <tr>
                  {["Option", "Type", "Best for", "Key considerations", ""].map((heading) => (
                    <th className="px-4 py-4 font-semibold" key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1ee]">
                {service.comparisonRows.map((row) => (
                  <tr key={row.option}>
                    <td className="px-4 py-4 font-semibold text-[#1f2c25]">{row.option}</td>
                    <td className="px-4 py-4 text-[#53635b]">{row.type}</td>
                    <td className="px-4 py-4 text-[#53635b]">{row.bestFor}</td>
                    <td className="px-4 py-4 text-[#53635b]">{row.considerations}</td>
                    <td className="px-4 py-4">
                      <Link className="font-semibold text-[#145c42] underline-offset-4 hover:underline" href={row.href}>
                        Learn
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="grid gap-4 p-4 md:hidden">
              {service.comparisonRows.map((row) => (
                <article className="rounded-lg border border-[#dce4df] p-4" key={row.option}>
                  <h2 className="font-semibold text-[#1f2c25]">{row.option}</h2>
                  <p className="mt-2 text-sm text-[#53635b]">{row.type}</p>
                  <p className="mt-3 text-sm leading-6 text-[#53635b]">{row.bestFor}</p>
                  <Link className="mt-4 inline-flex font-semibold text-[#145c42]" href={row.href}>
                    Learn more
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </Section>

        <DecisionCta
          copy={`Compare ${service.title.toLowerCase()} with related JourneyLite options, then use consultation to choose the most appropriate next step.`}
          tertiaryHref="/services/pricing-financing"
          tertiaryLabel="View Pricing"
        />

        <Section
          eyebrow="Ohio, Kentucky, and Indiana"
          intro={service.locationCopy}
          title={`${service.title} support across the region`}
          tone="white"
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
          title="Meet the physicians behind JourneyLite"
          tone="soft"
        >
          <div className="mt-8 grid gap-6">
            {physicianCards.slice(0, 2).map((physician) => (
              <PhysicianProfileCard key={physician.name} physician={physician} />
            ))}
          </div>
        </Section>

        <DecisionCta
          copy="Physician-led evaluation helps match the treatment path to your history, anatomy, medications, goals, and follow-up needs."
          tertiaryHref="/our-team"
          tertiaryLabel="Meet Physicians"
        />

        <Section
          eyebrow="Patient confidence"
          intro="JourneyLite pairs educational content with physician-led evaluation, follow-up, and a documented patient experience."
          title="Reviews and patient trust"
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

        <Section
          eyebrow="FAQs"
          intro={`Common questions about ${service.title.toLowerCase()} and how JourneyLite helps patients compare next steps.`}
          title={`${service.title} frequently asked questions`}
          tone="white"
        >
          <FAQAccordion items={service.faqs} />
        </Section>

        <DecisionCta
          copy={`Still comparing? JourneyLite can help you decide whether ${service.title.toLowerCase()} or another treatment path deserves the next conversation.`}
          tertiaryHref="/#locations"
          tertiaryLabel="Find a Location"
        />

        <section className="bg-[#0f3e2e] py-16 text-white lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="eyebrow text-[#b9d2c5]">Personalized next step</p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
              Find out if {service.title} is right for you.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8e6de]">
              Schedule a consultation with JourneyLite to compare your options, review pricing and coverage, and build a
              plan around your goals.
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
                <CTAButton href="/services/injectable-weight-loss-medications" variant="secondary">
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

function DecisionCta({
  copy,
  tertiaryHref,
  tertiaryLabel,
}: {
  copy: string;
  tertiaryHref: string;
  tertiaryLabel: string;
}) {
  return (
    <section className="border-y border-[#dce4df] bg-[#f8fbf9] py-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="max-w-3xl text-sm font-semibold leading-6 text-[#355346]">{copy}</p>
        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <CTAButton href="/contact">Book Consultation</CTAButton>
          <CTAButton href={phoneHref} variant="secondary">
            Call JourneyLite
          </CTAButton>
          <CTAButton href={tertiaryHref} variant="secondary">
            {tertiaryLabel}
          </CTAButton>
        </div>
      </div>
    </section>
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

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
import { physicianCards } from "../../components/data";
import { journeyLiteProofStats, servicePageMap, servicePages, serviceSlugs } from "../../components/serviceData";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((item) => ({
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

  const related = service.relatedServices
    .map((slug) => servicePages.find((page) => page.slug === slug))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[#f7f8f6]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-8 lg:py-20">
            <div>
              <p className="eyebrow">{service.category}</p>
              <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] text-[#1e2b24] md:text-6xl">
                {service.h1}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#516059]">{service.heroSummary}</p>
              {service.status ? (
                <p className="mt-5 rounded-lg border border-[#cbd9d1] bg-white p-4 text-sm font-semibold leading-6 text-[#355346]">
                  {service.status}
                </p>
              ) : null}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <CTAButton href="/contact">Book Consultation</CTAButton>
                <CTAButton href="/services/compare-weight-loss-options" variant="secondary">
                  Compare Weight Loss Options
                </CTAButton>
                <CTAButton href="/services/pricing-financing" variant="secondary">
                  View Pricing
                </CTAButton>
              </div>
            </div>

            <ServiceHeroVisual service={service} />
          </div>
        </section>

        <section className="border-y border-[#dce4df] bg-white py-8">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {journeyLiteProofStats.map((stat) => (
                <article className="rounded-xl border border-[#dce4df] bg-[#f8fbf9] p-5" key={stat.value}>
                  <p className="font-serif text-4xl leading-none text-[#145c42]">{stat.label}</p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#53635b]">{stat.value}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

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

        <Section
          eyebrow="Research snapshot"
          intro="Medical decisions should be grounded in reliable information and individual evaluation. These external sources provide context for discussion with JourneyLite."
          title="Stats and research to discuss with your provider"
          tone="white"
        >
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {service.citations.map((citation) => (
              <article className="rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm" key={citation.href}>
                <h2 className="text-lg font-semibold text-[#1f2c25]">{citation.label}</h2>
                <p className="mt-3 text-sm leading-6 text-[#53635b]">
                  Use this source for background context. JourneyLite will apply research cautiously because outcomes,
                  risks, and eligibility vary by patient.
                </p>
                <a
                  className="mt-4 inline-flex text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                  href={citation.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  View source
                </a>
              </article>
            ))}
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
        </Section>

        <Section
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
              Schedule a consultation with JourneyLite to compare your options, review pricing and coverage, and build a
              plan around your goals.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTAButton href="/contact" variant="light">
                Book Consultation
              </CTAButton>
              <CTAButton href="tel:+18774422263" variant="outline">
                Call 877-442-2263
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

import type { Metadata } from "next";
import Link from "next/link";
import {
  ComparisonTable,
  CTAButton,
  FAQAccordion,
  FeatureCard,
  FinalCTA,
  Section,
  SiteFooter,
  SiteHeader,
} from "../components/marketing";
import { faqItems } from "../components/data";

export const metadata: Metadata = {
  title: "Gastric Balloon for Non-Surgical Weight Loss | JourneyLite Physicians",
  description:
    "Learn about gastric balloon treatment, a non-surgical weight loss option with medical follow-up from JourneyLite Physicians in Ohio, Kentucky, and Indiana.",
};

const balloonFaqs = [
  {
    question: "What is a gastric balloon?",
    answer:
      "A gastric balloon is a temporary, non-surgical weight loss device placed in the stomach endoscopically. It can help eligible patients feel fuller with smaller portions while they work on nutrition and habit changes with medical support.",
  },
  {
    question: "How long does the balloon stay in place?",
    answer:
      "Timing depends on the specific balloon program and provider recommendation. Your JourneyLite team reviews the placement, follow-up, and removal timeline during consultation.",
  },
  {
    question: "Is gastric balloon better than gastric sleeve?",
    answer:
      "Neither option is automatically better for every patient. Gastric balloon is non-surgical and temporary, while gastric sleeve is a surgical tool intended for more durable weight loss support in eligible patients.",
  },
  {
    question: "Can I use medications with a gastric balloon?",
    answer:
      "Some patients may discuss medication-supported care before or after balloon treatment. A provider needs to review your medical history, current medications, and goals before recommending a plan.",
  },
  ...faqItems.slice(1, 3),
];

const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: balloonFaqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function GastricBalloonPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[#f7f8f6]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-20">
            <div>
              <p className="eyebrow">Non-surgical weight loss option</p>
              <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] text-[#1e2b24] md:text-6xl">
                Gastric Balloon for Non-Surgical Weight Loss
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#516059]">
                Gastric balloon treatment is a non-surgical option designed to help eligible patients feel fuller,
                reduce portion sizes, and build healthier habits with medical support from JourneyLite Physicians.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CTAButton href="/#quiz">Book Consultation</CTAButton>
                <CTAButton href="/#compare" variant="secondary">
                  Compare Options
                </CTAButton>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  "Non-surgical option",
                  "Endoscopic placement",
                  "Personalized follow-up",
                  "Regional care in Ohio, Kentucky, and Indiana",
                ].map((chip) => (
                  <span className="rounded-full border border-[#cbd7d0] bg-white px-3 py-2 text-xs font-semibold text-[#355346]" key={chip}>
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <aside className="rounded-2xl border border-[#d6e1da] bg-white p-5 shadow-2xl shadow-[#20372b]/10">
              <div className="rounded-xl bg-[#edf4ef] p-6">
                <p className="eyebrow">At a glance</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#1f2c25]">
                  A temporary tool paired with clinical guidance.
                </h2>
                <dl className="mt-6 grid gap-3">
                  {[
                    ["Care type", "Non-surgical, endoscopic placement"],
                    ["Goal", "Support fullness, portions, and habit change"],
                    ["Follow-up", "Nutrition guidance and provider monitoring"],
                    ["Fit", "Determined by BMI, history, and consultation"],
                  ].map(([term, detail]) => (
                    <div className="rounded-lg bg-white p-4" key={term}>
                      <dt className="text-sm font-semibold text-[#1f2c25]">{term}</dt>
                      <dd className="mt-1 text-sm leading-6 text-[#53635b]">{detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </section>

        <Section
          eyebrow="Gastric balloon in Ohio, Kentucky, and Indiana"
          intro="JourneyLite helps patients across the region compare gastric balloon treatment with surgical and medication-supported weight loss options."
          title="What is a gastric balloon?"
          tone="white"
        >
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <div className="space-y-4 text-base leading-8 text-[#53635b]">
              <p>
                A gastric balloon is a non-surgical weight loss option placed in the stomach during an endoscopic
                procedure. The balloon takes up space in the stomach, which may help patients feel fuller sooner and
                practice smaller portions while receiving medical support.
              </p>
              <p>
                The balloon is temporary, and it is not a stand-alone solution. Patients still need nutrition guidance,
                follow-up, and a plan for maintaining habits after removal. A JourneyLite consultation helps determine
                whether this option fits your BMI, health history, goals, and comfort level.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                ["Gastric Sleeve", "/#gastric-sleeve"],
                ["Gastric Bypass", "/#gastric-bypass"],
                ["Weight Loss Medications", "/#medications"],
                ["Pricing", "/#pricing"],
                ["Locations", "/#locations"],
              ].map(([label, href]) => (
                <Link
                  className="rounded-lg border border-[#dce4df] bg-[#f8fbf9] p-4 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                  href={href}
                  key={label}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </Section>

        <Section
          eyebrow="How it works"
          intro="The process is structured around preparation, placement, follow-up, removal, and longer-term habit support."
          title="How the gastric balloon works"
          tone="soft"
        >
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["1. Consultation", "Review BMI, health history, goals, prior attempts, and whether a non-surgical option is clinically appropriate."],
              ["2. Placement", "If eligible, the balloon is placed endoscopically. Your team explains preparation and recovery expectations beforehand."],
              ["3. Supported weight loss", "The balloon may help with fullness while you work on portions, protein, hydration, and sustainable eating habits."],
              ["4. Removal and next plan", "The balloon is removed later, and your team helps plan the next phase of lifestyle, medical, or procedural support."],
            ].map(([title, body]) => (
              <FeatureCard key={title} title={title}>
                <p>{body}</p>
              </FeatureCard>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Patient fit"
          intro="A consultation is needed to determine fit. Gastric balloon may be useful for some patients, but it is not right for everyone."
          title="Who may be a good candidate?"
          tone="white"
        >
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[
              ["May fit patients who want less invasive care", "Patients who are not ready for surgery may want a temporary, non-surgical tool paired with provider support."],
              ["May fit patients building healthier routines", "The balloon can support fullness while patients practice smaller portions and stronger nutrition habits."],
              ["May not fit every medical history", "Prior stomach surgery, certain GI conditions, pregnancy, or other health factors may affect eligibility."],
            ].map(([title, body]) => (
              <FeatureCard key={title} title={title}>
                <p>{body}</p>
              </FeatureCard>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Benefits and considerations"
          intro="Responsible decision-making means looking at both why patients consider gastric balloon and what they should understand before choosing it."
          title="Benefits and considerations"
          tone="light"
        >
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <FeatureCard title="Potential benefits">
              <ul className="space-y-2">
                <li>May help patients feel fuller with smaller portions.</li>
                <li>Does not require bariatric surgery or intestinal rerouting.</li>
                <li>Can support habit change when paired with nutrition follow-up.</li>
                <li>May be appealing for patients seeking a temporary tool.</li>
              </ul>
            </FeatureCard>
            <FeatureCard title="Important considerations">
              <ul className="space-y-2">
                <li>It is temporary and requires a plan for life after removal.</li>
                <li>Side effects, tolerance, and eligibility vary by patient.</li>
                <li>Weight loss depends on adherence, follow-up, habits, and health history.</li>
                <li>It may not be the best fit for higher weight loss goals.</li>
              </ul>
            </FeatureCard>
          </div>
        </Section>

        <Section
          eyebrow="Gastric balloon vs gastric sleeve"
          intro="Patients often compare balloon treatment with gastric sleeve, gastric bypass, and medications. The best option depends on eligibility and goals."
          title="Gastric balloon vs gastric sleeve vs medications"
          tone="white"
        >
          <ComparisonTable compact />
        </Section>

        <Section
          eyebrow="Treatment timeline"
          intro="Your exact timeline depends on evaluation and provider recommendation, but most patients can think about treatment in three phases."
          title="What to expect before, during, and after treatment"
          tone="soft"
        >
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Before", "You meet with JourneyLite to review health history, goals, prior weight loss attempts, pricing questions, and whether gastric balloon is appropriate."],
              ["During", "The balloon is placed endoscopically. Your care team explains preparation, early adjustment, hydration, nutrition, and when to contact the office."],
              ["After", "Follow-up focuses on portion control, protein, habits, progress, and planning for balloon removal and longer-term weight maintenance."],
            ].map(([title, body]) => (
              <FeatureCard key={title} title={title}>
                <p>{body}</p>
              </FeatureCard>
            ))}
          </div>
          <div className="mt-8 rounded-lg border border-[#cbd7d0] bg-white p-5">
            <h3 className="text-xl font-semibold text-[#1f2c25]">Gastric balloon cost and pricing</h3>
            <p className="mt-3 text-sm leading-6 text-[#53635b]">
              Pricing can vary based on program details, follow-up, and individual needs. Review the JourneyLite{" "}
              <Link className="font-semibold text-[#145c42] underline-offset-4 hover:underline" href="/#pricing">
                pricing section
              </Link>{" "}
              and schedule a consultation for current details.
            </p>
          </div>
        </Section>

        <Section eyebrow="Frequently asked questions" title="Gastric balloon FAQs" tone="white">
          <FAQAccordion items={balloonFaqs} />
        </Section>

        <FinalCTA />
      </main>
      <SiteFooter />
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} type="application/ld+json" />
    </>
  );
}

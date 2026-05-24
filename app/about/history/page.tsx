import type { Metadata } from "next";
import { AboutHero, CardGrid, CTASection, FaqList, LinkCardGrid } from "../components";
import { historyFaqs, historyTimeline, legacyHighlights, qualityRecognitions } from "../data";
import { Section, SiteFooter, SiteHeader } from "../../components/marketing";

export const metadata: Metadata = {
  title: "JourneyLite History | 20 Years of Bariatric Surgery Excellence",
  description:
    "Explore JourneyLite's 20-year history of bariatric surgery innovation, outpatient surgery leadership, gastric balloon firsts, accreditation milestones, and patient support.",
};

const historyLinks = [
  {
    title: "Meet the physicians",
    copy: "Learn about the bariatric surgeons and clinical leadership behind JourneyLite's surgical and non-surgical programs.",
    href: "/about/physicians",
    cta: "View physicians",
  },
  {
    title: "Explore the surgery center",
    copy: "See how JourneyLite Surgery Center supports Cincinnati outpatient bariatric surgery and related care.",
    href: "/about/surgery-center",
    cta: "View surgery center",
  },
  {
    title: "Compare weight loss options",
    copy: "Review surgical, non-surgical, and medical weight loss paths before requesting an appointment.",
    href: "/services/compare-weight-loss-options",
    cta: "Compare options",
  },
];

export default function HistoryPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AboutHero
          eyebrow="JourneyLite History"
          intro="JourneyLite's history includes bariatric surgery experience, outpatient innovation, gastric balloon firsts, quality designations, and long-term support for patients across the region."
          primaryCta={["Meet Our Team", "/about/our-team"]}
          secondaryCta={["Learn About the Surgery Center", "/about/surgery-center"]}
          title="20 years of bariatric excellence and innovation"
        />
        <Section
          eyebrow="Legacy"
          intro="JourneyLite's bariatric history includes surgical innovation, national quality designations, outpatient care leadership, gastric balloon firsts, and a care philosophy shaped by long-term patient support."
          title="A bariatric program built around innovation and patient support"
          tone="white"
        >
          <CardGrid items={legacyHighlights} />
        </Section>
        <Section
          eyebrow="Timeline"
          intro="This timeline summarizes key milestones in JourneyLite's development as a regional bariatric surgery and medical weight loss program."
          title="Bariatric care milestones"
          tone="light"
        >
          <ol className="mt-8 grid gap-4 md:grid-cols-2">
            {historyTimeline.map(([year, event]) => (
              <li className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm shadow-[#20372b]/5" key={`${year}-${event}`}>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#145c42]">{year}</p>
                <p className="mt-2 text-sm leading-7 text-[#53635b]">{event}</p>
              </li>
            ))}
          </ol>
        </Section>
        <Section
          eyebrow="Accreditations"
          intro="JourneyLite's quality recognitions help patients understand the standards behind the Cincinnati outpatient surgery center and bariatric program."
          title="Center of Excellence designations and quality recognitions"
          tone="white"
        >
          <CardGrid items={qualityRecognitions} />
        </Section>
        <Section
          eyebrow="Frequently asked questions"
          intro="Curious about JourneyLite's history, experience, and what makes the program different? These answers cover common patient questions."
          title="JourneyLite history and bariatric excellence FAQ"
          tone="light"
        >
          <FaqList items={historyFaqs} />
        </Section>
        <Section
          eyebrow="Explore next"
          intro="JourneyLite's history is most useful when it helps patients understand the team, the surgery center, and the care options available now."
          title="Connect JourneyLite's bariatric history to today's care options"
          tone="light"
        >
          <LinkCardGrid items={historyLinks} />
        </Section>
        <CTASection
          copy="JourneyLite's history is one part of the decision. The next step is a personalized discussion about your goals, medical history, and treatment options."
          primary={["Request an Appointment", "/contact"]}
          secondary={["Compare Weight Loss Options", "/services/compare-weight-loss-options"]}
          title="Ready to explore your options?"
        />
      </main>
      <SiteFooter />
    </>
  );
}

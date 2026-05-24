import type { Metadata } from "next";
import { AboutHero, CardGrid, CTASection } from "../components";
import { physicianSeoCards, qualityRecognitions } from "../data";
import { PhysicianProfileCard, Section, SiteFooter, SiteHeader } from "../../components/marketing";
import { physicianCards } from "../../components/data";

export const metadata: Metadata = {
  title: "JourneyLite Physicians | Bariatric Surgeons & Clinical Leadership",
  description:
    "Meet JourneyLite's bariatric physicians, including Dr. Trace Curry and Dr. James Augusta, serving surgical and medical weight loss patients.",
};

const physicianFocus: [string, string][] = [
  ["Surgical expertise", "Evaluation for gastric sleeve, gastric bypass, Lap Band, SADI-S, revision procedures, and related surgical needs."],
  ["Outpatient bariatric experience", "JourneyLite has a long history of outpatient bariatric innovation and same-day surgical care where appropriate."],
  ["Revision procedures", "The physicians evaluate patients with prior bariatric surgery who need renewed options or symptom-focused review."],
  ["Coordinated follow-up support", "Physician care connects with dietitian guidance, patient support, and long-term follow-up."],
  ["Quality recognitions", "JourneyLite's program has earned multiple bariatric and ambulatory surgery quality designations."],
];

export default function PhysiciansPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AboutHero
          eyebrow="JourneyLite Physicians"
          title="Physician-led weight loss care with bariatric experience"
          intro="JourneyLite's physicians help patients compare surgical, non-surgical, and medical weight loss options with a focus on safety, experience, and long-term support."
          secondaryCta={["Meet Our Dietitians", "/about/dietitians"]}
        />
        <Section eyebrow="Clinical leadership" title="Meet JourneyLite's bariatric physicians" tone="white">
          <div className="mt-8 grid gap-8">
            {physicianCards.map((physician) => (
              <PhysicianProfileCard expanded key={physician.name} physician={physician} />
            ))}
          </div>
        </Section>
        <Section
          eyebrow="Physician-led care"
          intro="JourneyLite physicians work within a broader care team that includes registered dietitians, clinical support, and patient service representatives."
          title="How the physician team supports patients"
          tone="light"
        >
          <CardGrid items={physicianFocus} />
        </Section>
        <Section
          eyebrow="Bariatric physician services"
          intro="Patients often arrive with questions about which procedure is safest, whether medication support is enough, how revisions work, and what follow-up will look like."
          title="Focused guidance for surgical, non-surgical, and medical weight loss decisions"
          tone="white"
        >
          <CardGrid items={physicianSeoCards} />
        </Section>
        <Section eyebrow="Quality recognitions" title="Program designations and quality history" tone="light">
          <CardGrid items={qualityRecognitions} />
        </Section>
        <CTASection
          copy="Schedule a consultation to discuss surgical, non-surgical, and medical weight loss options with the JourneyLite team."
          primary={["Request an Appointment", "/contact"]}
          secondary={["Compare Weight Loss Options", "/services/compare-weight-loss-options"]}
          title="Talk with a JourneyLite physician"
        />
      </main>
      <SiteFooter />
    </>
  );
}

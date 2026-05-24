import type { Metadata } from "next";
import { AboutHero, CardGrid, CTASection, FaqList } from "../components";
import { historyFaqs, qualityRecognitions, surgeryCenterHighlights } from "../data";
import { Section, SiteFooter, SiteHeader } from "../../components/marketing";

export const metadata: Metadata = {
  title: "JourneyLite Surgery Center | Cincinnati Outpatient Bariatric Surgery Center",
  description:
    "Learn about JourneyLite Surgery Center, a Cincinnati outpatient bariatric surgery center with AAAHC accreditation, MBSAQIP recognition, revisions, gastric balloons, and patient safety focus.",
};

const procedureCards: [string, string][] = [
  ["Bariatric surgery", "Gastric sleeve, gastric bypass, Lap Band, SADI-S, and related bariatric procedures where appropriate."],
  ["Revision procedures", "Evaluation and surgical planning for select patients with prior bariatric procedures."],
  ["Gastric balloon care", "Support for incisionless gastric balloon options and coordinated aftercare."],
  ["General surgery", "Gallbladder removal and hernia repair may be addressed when clinically appropriate."],
  ["Body contouring coordination", "Body contouring and plastic surgery experience may be part of long-term weight loss conversations."],
  ["Connected follow-up", "Patients can connect surgery center care with physician visits, dietitian guidance, and regional office support."],
];

const patientExperienceCards: [string, string][] = [
  ["Before surgery", "Patients receive procedure-specific instructions, medical screening steps, nutrition guidance, and scheduling support before their surgery date."],
  ["Day of surgery", "The outpatient model is designed for clear arrival instructions, efficient surgical workflows, anesthesia coordination, and recovery monitoring."],
  ["After surgery", "Follow-up connects patients back to the JourneyLite physician team, dietitians, education portal, and long-term support resources."],
];

export default function SurgeryCenterPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AboutHero
          eyebrow="JourneyLite Surgery Center"
          intro="JourneyLite Surgery Center is a 9,500-square-foot outpatient surgical center in Cincinnati designed to provide safe, efficient, high-quality surgical care in a convenient ambulatory setting."
          imageAlt="JourneyLite Surgery Center at Evendale Healthcare Center in Cincinnati"
          imageCaption="JourneyLite Surgery Center is located at 10475 Reading Road in Cincinnati."
          imageSrc="/journey-lite-evendale-office.jpg"
          primaryCta={["Request an Appointment", "/contact"]}
          secondaryCta={["View Locations", "/about/locations"]}
          title="Cincinnati outpatient bariatric surgery center"
        />
        <Section
          eyebrow="Outpatient surgery center model"
          intro="The surgery center was built around bariatric experience, efficient outpatient workflows, patient safety processes, and convenient access to JourneyLite's broader care team."
          title="A focused setting for bariatric and related surgical care"
          tone="white"
        >
          <CardGrid items={procedureCards} />
        </Section>
        <Section
          eyebrow="Surgery center highlights"
          intro="Patients comparing Cincinnati weight loss surgery centers can use these details to understand how JourneyLite connects facility care, physician evaluation, nutrition support, and follow-up."
          title="What patients can expect from JourneyLite Surgery Center"
          tone="light"
        >
          <CardGrid items={surgeryCenterHighlights} />
        </Section>
        <Section
          eyebrow="Patient experience"
          intro="Outpatient bariatric care works best when patients know what happens before, during, and after the procedure."
          title="A clearer process from preparation through follow-up"
          tone="white"
        >
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {patientExperienceCards.map(([title, copy]) => (
              <article className="rounded-xl border border-[#dce4df] bg-[#f8fbf9] p-6 shadow-sm" key={title}>
                <h3 className="text-xl font-semibold text-[#1f2c25]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#53635b]">{copy}</p>
              </article>
            ))}
          </div>
        </Section>
        <Section eyebrow="Accreditations and quality" title="Quality designations and safety focus" tone="light">
          <CardGrid items={qualityRecognitions} />
        </Section>
        <Section
          eyebrow="Frequently asked questions"
          intro="These answers help patients understand JourneyLite's outpatient bariatric surgery center, accreditation history, and support model."
          title="JourneyLite Surgery Center FAQ"
          tone="white"
        >
          <FaqList items={historyFaqs.slice(3)} />
        </Section>
        <CTASection
          copy="Use the Cincinnati office and surgery center information to plan your consultation, procedure questions, and next steps with the JourneyLite team."
          primary={["Request an Appointment", "/contact"]}
          secondary={["View Locations", "/about/locations"]}
          title="Learn whether outpatient surgical care is right for you"
        />
      </main>
      <SiteFooter />
    </>
  );
}

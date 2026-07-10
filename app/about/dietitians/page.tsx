import type { Metadata } from "next";
import { AboutHero, CardGrid, CTASection, DietitianCard, FaqList } from "../components";
import { dietitianFaqs, dietitianSeoCards, dietitianSupport, dietitians } from "../data";
import { Section, SiteFooter, SiteHeader } from "../../components/marketing";
import { getReactPageMetadata } from "@/lib/site/overrides";

const fallbackMetadata: Metadata = {
  title: "JourneyLite Dietitians | Registered Dietitians for Weight Loss",
  description:
    "Meet JourneyLite's registered dietitians providing bariatric nutrition, GLP-1 support, meal planning, protein guidance, and long-term weight loss support.",
};

export function generateMetadata() {
  return getReactPageMetadata("/about/dietitians", fallbackMetadata);
}

const supportCards: [string, string][] = [
  ["Pre-op and post-op nutrition guidance", "Clear diet-stage education before and after weight loss surgery."],
  ["Surgical and non-surgical support", "Nutrition planning for bariatric surgery, gastric balloons, and medical weight loss."],
  ["Protein strategies", "Practical ways to protect protein intake and reduce muscle loss during weight loss."],
  ["Hydration and vitamin guidance", "Support for fluids, supplements, tolerance, and common bariatric nutrition questions."],
  ["GLP-1 nutrition support", "Meal structure and side-effect-aware planning for medication-supported weight loss."],
  ["Long-term habits", "Help with stalls, cravings, busy schedules, and maintenance routines."],
];

export default function DietitiansPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AboutHero
          eyebrow="Registered Dietitians"
          intro="At JourneyLite, nutrition guidance is provided by experienced, licensed and registered dietitians who specialize in weight loss surgery, medical weight loss, and long-term lifestyle change."
          primaryCta={["Email Our Dietitian Team", "mailto:rd@curryweightloss.com"]}
          secondaryCta={["Request an Appointment", "/contact"]}
          title="Meet Our Registered Dietitians"
        />
        <Section eyebrow="Why dietitian support matters" title="Weight loss nutrition needs more than generic advice" tone="white">
          <CardGrid items={supportCards} />
        </Section>
        <Section
          eyebrow="Bariatric nutrition services"
          intro="JourneyLite dietitians help patients make food, fluid, vitamin, and protein choices that fit the realities of surgery, gastric balloons, GLP-1 medications, busy schedules, and long-term maintenance."
          title="Registered dietitians for weight loss surgery and medical weight loss"
          tone="light"
        >
          <CardGrid items={dietitianSeoCards} />
        </Section>
        <Section
          eyebrow="Real nutrition expertise"
          intro="Registered dietitians complete formal education, supervised practice, credentialing, licensure requirements where applicable, and ongoing professional development. For bariatric and medical weight loss patients, that training matters because nutrition affects safety, tolerance, muscle preservation, vitamins, hydration, and long-term results."
          title="Registered dietitians, not generic nutrition advice"
          tone="white"
        >
          <div className="mt-8 grid gap-8">
            {dietitians.map((dietitian) => (
              <DietitianCard dietitian={dietitian} key={dietitian.email} />
            ))}
          </div>
        </Section>
        <Section eyebrow="How our dietitians help" title="Practical support across each phase" tone="white">
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dietitianSupport.map((item) => (
              <div className="rounded-lg border border-[#dce4df] bg-[#f8fbf9] p-4 text-sm font-semibold leading-6 text-[#355346]" key={item}>
                {item}
              </div>
            ))}
          </div>
        </Section>
        <Section eyebrow="Dietitian FAQ" title="Common questions about bariatric dietitian support" tone="light">
          <FaqList items={dietitianFaqs} />
        </Section>
        <CTASection
          copy="Get RD/LD support for bariatric surgery nutrition, medical weight loss, protein goals, hydration, vitamins, and sustainable meal planning."
          primary={["Request an Appointment", "/contact"]}
          secondary={["Email a Dietitian", "mailto:rd@curryweightloss.com"]}
          title="Nutrition support for your weight loss journey"
        />
      </main>
      <SiteFooter />
    </>
  );
}

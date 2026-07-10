import type { Metadata } from "next";
import Link from "next/link";
import { AboutHero, CardGrid, CTASection, DietitianCard, PathwayCard } from "../components";
import { dietitians } from "../data";
import { PhysicianProfileCard, Section, SiteFooter, SiteHeader } from "../../components/marketing";
import { physicianCards } from "../../components/data";
import { getReactPageMetadata } from "@/lib/site/overrides";

const fallbackMetadata: Metadata = {
  title: "JourneyLite Team | Physicians, Dietitians & Weight Loss Support",
  description:
    "Meet the JourneyLite team, including bariatric surgeons, registered dietitians, medical providers, and support staff focused on long-term weight loss care.",
};

export function generateMetadata() {
  return getReactPageMetadata("/about/our-team", fallbackMetadata);
}

const teamSupportCards: [string, string][] = [
  ["Bariatric surgery team", "Surgeons, clinical staff, and patient support professionals help patients prepare for procedures and understand follow-up."],
  ["Registered dietitians for weight loss", "RD/LD guidance supports weight loss surgery nutrition, GLP-1 nutrition, gastric balloon nutrition, vitamins, and meal planning."],
  ["Medical weight loss support", "Providers and support staff help patients understand medications, non-surgical options, maintenance, pricing, and appointment next steps."],
];

export default function OurTeamPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AboutHero
          eyebrow="Our Team"
          title="Meet the JourneyLite Team"
          intro="JourneyLite patients are supported by more than one provider. Our team includes bariatric surgeons, registered dietitians, medical providers, patient service representatives, and clinical staff who help guide each step of the weight loss journey."
          primaryCta={["Request an Appointment", "/contact"]}
          secondaryCta={["Meet Our Physicians", "/about/physicians"]}
        />
        <Section
          eyebrow="Physicians and clinical leadership"
          intro="JourneyLite physicians help patients compare surgical, non-surgical, and medical weight loss options with a focus on safety, experience, and long-term support."
          title="Bariatric surgery and medical weight loss leadership"
          tone="white"
        >
          <div className="mt-8 grid gap-8">
            {physicianCards.map((physician) => (
              <PhysicianProfileCard expanded key={physician.name} physician={physician} />
            ))}
          </div>
          <Link className="mt-6 inline-flex text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href="/about/physicians">
            View physician page
          </Link>
        </Section>
        <Section
          eyebrow="Registered dietitians"
          intro="The RD/LD team supports bariatric nutrition, medical weight loss nutrition, protein goals, hydration, vitamins, meal planning, and long-term habits."
          title="Nutrition support from licensed and registered dietitians"
          tone="light"
        >
          <div className="mt-8 grid gap-8">
            {dietitians.map((dietitian) => (
              <DietitianCard dietitian={dietitian} key={dietitian.email} />
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link className="text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href="mailto:rd@curryweightloss.com">
              Email dietitian team: rd@curryweightloss.com
            </Link>
            <Link className="text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href="/about/dietitians">
              View dietitian page
            </Link>
          </div>
        </Section>
        <Section eyebrow="Care support" title="Support teams that help the process move clearly" tone="white">
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <PathwayCard
              copy="Medical weight loss providers support GLP-1 medications, oral weight loss medications, non-surgical programs, maintenance support, and ongoing monitoring."
              cta="Explore medications"
              href="/medications"
              title="Medical Weight Loss Providers"
            />
            <PathwayCard
              copy="Patient service representatives help with appointment options, insurance questions, self-pay pricing, financing, and next steps."
              cta="Request appointment"
              href="/contact"
              title="Patient Service Representatives"
            />
            <PathwayCard
              copy="Clinical and surgical support staff help patients prepare for treatment, understand instructions, and navigate the before-and-after details of care."
              cta="Learn about the surgery center"
              href="/about/surgery-center"
              title="Clinical and Surgical Support Staff"
            />
          </div>
        </Section>
        <Section
          eyebrow="Coordinated care"
          intro="JourneyLite's team structure is designed so patients can move between consultation, nutrition support, surgery center care, education, and long-term follow-up without starting over each time."
          title="How the full JourneyLite team works together"
          tone="light"
        >
          <CardGrid items={teamSupportCards} />
        </Section>
        <CTASection
          copy="A coordinated team can help you understand options, prepare for treatment, and stay supported after your first visit."
          primary={["Request an Appointment", "/contact"]}
          secondary={["Compare Weight Loss Options", "/services/compare-weight-loss-options"]}
          title="Ready to connect with JourneyLite?"
        />
      </main>
      <SiteFooter />
    </>
  );
}

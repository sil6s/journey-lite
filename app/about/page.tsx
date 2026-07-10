import type { Metadata } from "next";
import Link from "next/link";
import { AboutHero, CardGrid, CTASection, LinkCardGrid, PathwayCard, StatStrip } from "./components";
import {
  aboutCarePathways,
  aboutStats,
  differentiators,
  legacyHighlights,
  locations,
  qualityRecognitions,
  surgeryCenterHighlights,
} from "./data";
import { PhysicianProfileCard, Section, SiteFooter, SiteHeader } from "../components/marketing";
import { physicianCards } from "../components/data";
import { getReactPageMetadata } from "@/lib/site/overrides";

const fallbackMetadata: Metadata = {
  title: "About JourneyLite | 20 Years of Bariatric Surgery & Medical Weight Loss",
  description:
    "Meet JourneyLite's bariatric surgeons, registered dietitians, surgery center team, accreditations, and 20-year history of weight loss surgery innovation.",
};

export function generateMetadata() {
  return getReactPageMetadata("/about", fallbackMetadata);
}

export default function AboutPage() {
  const drCurry = physicianCards.find((physician) => physician.slug === "dr-trace-curry");

  return (
    <>
      <SiteHeader />
      <main>
        <AboutHero
          eyebrow="About JourneyLite"
          title="A connected team for surgical, medical, and long-term weight loss care"
          intro="JourneyLite brings together experienced bariatric surgeons, medical providers, registered dietitians, and patient support professionals to help patients choose the right path and stay supported before, during, and after treatment."
          imageAlt="JourneyLite Surgery Center at Evendale Healthcare Center in Cincinnati"
          imageCaption="JourneyLite's Cincinnati main office and outpatient surgery center anchor care for patients across Ohio, Kentucky, and Indiana."
          imageSrc="/journey-lite-evendale-office.jpg"
          secondaryCta={["Meet Our Team", "/about/our-team"]}
        />
        <StatStrip stats={aboutStats} />
        <Section
          eyebrow="What makes JourneyLite different"
          title="Nearly two decades of bariatric surgery and medical weight loss care"
          intro="JourneyLite Physicians and JourneyLite Surgery Center were built around weight loss patients, with regional offices, a Cincinnati outpatient surgery center, registered dietitian support, and a long history of bariatric innovation."
          tone="white"
        >
          <CardGrid items={differentiators} />
        </Section>
        <Section
          eyebrow="20-year bariatric history"
          title="A history of firsts, quality standards, and long-term patient support"
          intro="Since its founding in 2007 by Dr. Trace Curry, JourneyLite has focused on minimally invasive bariatric surgery, outpatient innovation, gastric balloon therapy, medical weight management, and coordinated support before and after treatment."
          tone="light"
        >
          <CardGrid items={legacyHighlights} />
        </Section>
        <Section
          eyebrow="Care pathways"
          title="Explore JourneyLite services, support, and next steps"
          intro="Use these pages to move from a broad overview into the JourneyLite team, weight loss options, nutrition support, pricing, and locations."
          tone="light"
        >
          <LinkCardGrid items={aboutCarePathways} />
        </Section>
        <Section
          eyebrow="Meet the team"
          title="Find the right JourneyLite team for your next step"
          intro="Start with the care area that matches your question, then move between physicians, dietitians, surgery center details, and history as needed."
          tone="light"
        >
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <PathwayCard
              copy="Meet the surgeons and clinical leaders who guide JourneyLite's surgical, non-surgical, and medical weight loss programs."
              cta="Meet Our Physicians"
              href="/about/physicians"
              title="Physicians and Clinical Leadership"
            />
            <PathwayCard
              copy="Meet the RD/LD team helping patients with protein goals, hydration, vitamins, meal planning, GLP-1 nutrition, gastric balloon nutrition, and post-op diet progression."
              cta="Meet Our Dietitians"
              href="/about/dietitians"
              title="Registered Dietitians"
            />
          </div>
        </Section>
        <Section
          eyebrow="JourneyLite Surgery Center"
          title="A Cincinnati outpatient surgery center designed around bariatric care"
          intro="JourneyLite Surgery Center is a 9,500-square-foot outpatient surgical center in Cincinnati designed to provide safe, efficient, high-quality surgical care in a convenient ambulatory setting."
          tone="white"
        >
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="rounded-2xl border border-[#dce4df] bg-[#f8fbf9] p-6">
              <p className="text-sm leading-7 text-[#53635b]">
                The surgery center supports bariatric procedures, revisional bariatric care, gastric balloon care,
                general surgery, and body contouring where appropriate. It is connected to JourneyLite&apos;s broader care
                model, including dietitian guidance, physician follow-up, patient education, and regional office access.
              </p>
              <Link className="mt-5 inline-flex text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href="/about/surgery-center">
                Learn About the Surgery Center
              </Link>
            </div>
            <CardGrid items={surgeryCenterHighlights.slice(0, 3)} />
          </div>
        </Section>
        <Section
          eyebrow="Accreditations and quality"
          title="Nationally recognized bariatric and ambulatory surgery quality standards"
          intro="JourneyLite's accreditations and payer designations reflect a program built around patient safety, outcomes monitoring, clinical quality, and comprehensive bariatric care."
          tone="light"
        >
          <CardGrid items={qualityRecognitions} />
        </Section>
        <Section eyebrow="Locations" title="Regional access to JourneyLite care" tone="white">
          <div className="mt-8 flex flex-wrap gap-3">
            {locations.map((location) => (
              <span className="rounded-full border border-[#cbd7d0] bg-[#f8fbf9] px-4 py-2 text-sm font-semibold text-[#355346]" key={location}>
                {location}
              </span>
            ))}
          </div>
          <Link className="mt-6 inline-flex text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href="/about/locations">
            View Locations
          </Link>
        </Section>
        {drCurry ? (
          <Section
            eyebrow="Founder and medical director"
            intro="JourneyLite was founded by Dr. Trace Curry, a board-certified general surgeon and Cincinnati native whose bariatric experience helped shape the practice's outpatient surgery center, long-term support model, and focus on weight loss patients."
            title="Medical leadership from Dr. Trace Curry"
            tone="light"
          >
            <div className="mt-8">
              <PhysicianProfileCard expanded physician={drCurry} />
            </div>
          </Section>
        ) : null}
        <CTASection
          copy="Whether you are considering weight loss surgery, a gastric balloon, GLP-1 medications, or need help deciding which option is best, our team can help you take the next step."
          primary={["Request an Appointment", "/contact"]}
          secondary={["Compare Weight Loss Options", "/services/compare-weight-loss-options"]}
          title="Ready to meet with the JourneyLite team?"
        />
      </main>
      <SiteFooter />
    </>
  );
}

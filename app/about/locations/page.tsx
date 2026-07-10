import type { Metadata } from "next";
import { AboutHero, CTASection } from "../components";
import { LocationCards, Section, SiteFooter, SiteHeader } from "../../components/marketing";
import { getReactPageMetadata } from "@/lib/site/overrides";

const fallbackMetadata: Metadata = {
  title: "JourneyLite Locations | Cincinnati, Columbus, Dayton, Kentucky & Indiana",
  description:
    "Find JourneyLite locations serving Cincinnati, Columbus, Dayton, Northern Kentucky, Indianapolis, and surrounding communities for weight loss surgery and medical weight loss.",
};

export function generateMetadata() {
  return getReactPageMetadata("/about/locations", fallbackMetadata);
}

export default function AboutLocationsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AboutHero
          eyebrow="JourneyLite Locations"
          intro="JourneyLite serves patients across Ohio, Kentucky, Indiana, and surrounding communities with a Cincinnati main office and outpatient surgery center plus regional office access."
          primaryCta={["Request an Appointment", "/contact"]}
          secondaryCta={["Call JourneyLite", "tel:+18774422263"]}
          title="Locations for weight loss surgery and medical weight loss care"
        />
        <Section
          eyebrow="Regional care"
          intro="Use this page to find the Cincinnati surgery center and regional JourneyLite office details for bariatric surgery, gastric balloon care, prescription weight loss medications, and follow-up support."
          title="Find a JourneyLite location"
          tone="white"
        >
          <LocationCards />
        </Section>
        <CTASection
          copy="Request an appointment and the JourneyLite team can help you choose the location, care path, and next step that fits your goals."
          primary={["Request an Appointment", "/contact"]}
          secondary={["Compare Weight Loss Options", "/services/compare-weight-loss-options"]}
          title="Ready to plan your visit?"
        />
      </main>
      <SiteFooter />
    </>
  );
}

import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/marketing";
import { MetricsDashboard } from "./MetricsDashboard";
import { getReactPageMetadata } from "@/lib/site/overrides";

const fallbackMetadata: Metadata = {
  title: "Personalized Bariatric Assessment | Surgery Eligibility & BMI Analysis | JourneyLite",
  description:
    "Get your personalized bariatric assessment in 30 seconds. See your BMI analysis, surgery eligibility, procedure recommendations, and a clear next step — all private, all in your browser.",
};

export function generateMetadata() {
  return getReactPageMetadata("/bariatric-metrics", fallbackMetadata);
}

export default function BariatricMetricsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <MetricsDashboard />
      </main>
      <SiteFooter />
    </>
  );
}

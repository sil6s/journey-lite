import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/marketing";
import { MetricsDashboard } from "./MetricsDashboard";

export const metadata: Metadata = {
  title: "Bariatric Metrics Calculator | BMI & Weight-Loss Progress | JourneyLite",
  description:
    "Calculate BMI, percent total weight loss, excess weight loss, and goal progress with JourneyLite's free bariatric metrics calculator. Private — nothing leaves your browser.",
};

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

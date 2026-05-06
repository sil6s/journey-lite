import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/marketing";
import { MetricsDashboard } from "./MetricsDashboard";

export const metadata: Metadata = {
  title: "Bariatric Metrics Dashboard | BMI, %TWL & Weight-Loss Options",
  description:
    "Understand BMI, percent total weight loss, excess weight loss, goal progress, and weight regain with JourneyLite's patient-friendly bariatric metrics dashboard.",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    ["What is BMI?", "BMI is a height-and-weight screening number used as one part of weight-loss care conversations."],
    ["What is percent total weight loss?", "%TWL shows what share of your starting body weight you have lost."],
    ["What is excess weight loss?", "%EWL compares weight lost with the amount above a BMI 25 reference weight."],
    ["Can these numbers tell me which procedure I need?", "No. These results are educational only and do not replace consultation with a qualified medical provider."],
  ].map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

const medicalWebPageSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  name: "Bariatric Metrics Dashboard",
  description:
    "Patient education page explaining BMI, total weight loss, excess weight loss, goal progress, and weight regain metrics.",
  medicalAudience: "Patient",
  reviewedBy: {
    "@type": "Organization",
    name: "JourneyLite Bariatric Physicians",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://journeylite.com/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Bariatric Metrics Dashboard",
      item: "https://journeylite.com/bariatric-metrics",
    },
  ],
};

export default function BariatricMetricsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <MetricsDashboard />
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalWebPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}

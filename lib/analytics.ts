export type AnalyticsSummary = {
  pageViews: number;
  visitors: number;
  ctaClicks: number;
  conversions: number;
  topPages: Array<{ path: string; title: string; views: number; change: number }>;
  blogPerformance: Array<{ title: string; views: number; averageTime: string }>;
  trafficSources: Array<{ source: string; visitors: number }>;
  trend: Array<{ date: string; views: number; visitors: number }>;
};

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  // TODO: Connect GA4, Vercel Analytics, Plausible, or Search Console here.
  // Keep this server-side so analytics credentials are never exposed to the browser.
  return {
    pageViews: 18420,
    visitors: 6910,
    ctaClicks: 318,
    conversions: 74,
    topPages: [
      { path: "/", title: "Homepage", views: 5210, change: 8 },
      { path: "/services/gastric-sleeve", title: "Gastric Sleeve", views: 2760, change: 12 },
      { path: "/medications", title: "Medication Weight Loss", views: 2210, change: 5 },
      { path: "/blog", title: "Blog", views: 1410, change: -2 },
    ],
    blogPerformance: [
      { title: "Compare surgical and non-surgical options", views: 940, averageTime: "3:42" },
      { title: "Prescription weight loss medication questions", views: 780, averageTime: "3:18" },
      { title: "Preparing for a bariatric consultation", views: 610, averageTime: "2:54" },
    ],
    trafficSources: [
      { source: "Organic search", visitors: 3920 },
      { source: "Direct", visitors: 1510 },
      { source: "Referral", visitors: 870 },
      { source: "Paid / social", visitors: 610 },
    ],
    trend: [
      { date: "May 1", views: 420, visitors: 180 },
      { date: "May 5", views: 520, visitors: 220 },
      { date: "May 9", views: 610, visitors: 260 },
      { date: "May 13", views: 590, visitors: 250 },
      { date: "May 17", views: 720, visitors: 310 },
      { date: "May 21", views: 760, visitors: 330 },
    ],
  };
}

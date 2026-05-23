export type AnalyticsSummary = {
  provider: "umami";
  liveConnected: boolean;
  pageViews: number;
  visitors: number;
  ctaClicks: number;
  conversions: number;
  topPages: Array<{ path: string; title: string; views: number; change: number }>;
  blogPerformance: Array<{ title: string; views: number; averageTime: string }>;
  trafficSources: Array<{ source: string; visitors: number }>;
  trend: Array<{ date: string; views: number; visitors: number }>;
};

type UmamiStats = {
  pageviews?: number;
  visitors?: number;
  visits?: number;
};

type UmamiPoint = {
  x?: string;
  y?: number;
};

type UmamiPageviews = {
  pageviews?: UmamiPoint[];
  sessions?: UmamiPoint[];
};

type UmamiMetric = {
  x?: string;
  y?: number;
};

const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "da46081a-defc-433f-94d1-173ae1d844bf";
const endpoint = process.env.UMAMI_API_CLIENT_ENDPOINT || "https://api.umami.is/v1";

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const apiKey = process.env.UMAMI_API_KEY;
  if (!apiKey) return emptySummary(false);

  try {
    const endAt = Date.now();
    const startAt = endAt - 30 * 24 * 60 * 60 * 1000;
    const params = { startAt: String(startAt), endAt: String(endAt) };
    const [stats, pageviews, paths, referrers] = await Promise.all([
      umamiFetch<UmamiStats>(`/websites/${websiteId}/stats`, params, apiKey),
      umamiFetch<UmamiPageviews>(`/websites/${websiteId}/pageviews`, { ...params, unit: "day", timezone: "America/New_York" }, apiKey),
      umamiFetch<UmamiMetric[]>(`/websites/${websiteId}/metrics`, { ...params, type: "path", limit: "8" }, apiKey),
      umamiFetch<UmamiMetric[]>(`/websites/${websiteId}/metrics`, { ...params, type: "referrer", limit: "6" }, apiKey),
    ]);

    const trend = (pageviews.pageviews ?? []).map((point) => ({
      date: point.x ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(point.x)) : "",
      views: point.y ?? 0,
      visitors: pageviews.sessions?.find((session) => session.x === point.x)?.y ?? 0,
    }));
    const topPages = (paths ?? []).map((item) => ({
      path: item.x || "/",
      title: item.x || "Unknown page",
      views: item.y ?? 0,
      change: 0,
    }));
    const trafficSources = (referrers ?? []).map((item) => ({
      source: item.x || "Direct",
      visitors: item.y ?? 0,
    }));

    const hasData = Boolean((stats.pageviews ?? 0) > 0 || (stats.visitors ?? 0) > 0 || trend.length || topPages.length);
    if (!hasData) return emptySummary(false);

    return {
      provider: "umami",
      liveConnected: true,
      pageViews: stats.pageviews ?? 0,
      visitors: stats.visitors ?? 0,
      ctaClicks: 0,
      conversions: 0,
      topPages,
      blogPerformance: topPages
        .filter((page) => page.path.startsWith("/blog"))
        .map((page) => ({ title: page.title, views: page.views, averageTime: "—" })),
      trafficSources,
      trend,
    };
  } catch {
    return emptySummary(false);
  }
}

async function umamiFetch<T>(path: string, params: Record<string, string>, apiKey: string): Promise<T> {
  const url = new URL(`${endpoint.replace(/\/$/, "")}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-umami-api-key": apiKey,
    },
    next: { revalidate: 300 },
  });
  if (!response.ok) throw new Error(`Umami API error ${response.status}`);
  return (await response.json()) as T;
}

function emptySummary(liveConnected: boolean): AnalyticsSummary {
  return {
    provider: "umami",
    liveConnected,
    pageViews: 0,
    visitors: 0,
    ctaClicks: 0,
    conversions: 0,
    topPages: [],
    blogPerformance: [],
    trafficSources: [],
    trend: [],
  };
}

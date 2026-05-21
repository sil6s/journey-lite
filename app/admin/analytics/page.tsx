import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { getAnalyticsSummary } from "@/lib/analytics";

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsSummary();
  return <AnalyticsDashboard data={data} />;
}

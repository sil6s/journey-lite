import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { getAnalyticsSummary } from "@/lib/analytics";

export default async function AdminHomePage() {
  const data = await getAnalyticsSummary();
  return <AnalyticsDashboard data={data} />;
}

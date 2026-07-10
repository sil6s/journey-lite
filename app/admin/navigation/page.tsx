import { NavigationManager } from "@/components/admin/navigation-manager";
import { fetchSiteSettings } from "./actions";

export const metadata = { title: "Navbar — JourneyLite Admin" };
export const dynamic = "force-dynamic";

export default async function AdminNavigationPage() {
  const settings = await fetchSiteSettings().catch(() => null);
  return <NavigationManager settings={settings} />;
}

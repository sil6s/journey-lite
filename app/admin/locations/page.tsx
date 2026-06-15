import { fetchLocations } from "@/app/admin/people/actions";
import { LocationsClient } from "./LocationsClient";

export const metadata = { title: "Locations — JourneyLite Admin" };
export const dynamic = "force-dynamic";

export default async function AdminLocationsPage() {
  const locations = await fetchLocations().catch(() => []);
  return <LocationsClient initialLocations={locations} />;
}

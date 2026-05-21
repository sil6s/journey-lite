import { LocalContentManager } from "@/components/admin/local-content-manager";
import { getLocationRows } from "@/lib/admin/content";

export default function AdminLocationsPage() {
  return (
    <LocalContentManager
      title="Locations"
      description="Manage address, phone, hours, map links, appointment links, and local SEO details."
      createLabel="Add location"
      rows={getLocationRows().map((location) => ({
        id: `${location.city}-${location.phone}`,
        title: `${location.city}, ${location.state}`,
        description: [location.address1, location.address2].filter(Boolean).join(", "),
        group: location.group,
        href: "/#locations",
        status: "Published",
        meta: location.phone,
      }))}
    />
  );
}

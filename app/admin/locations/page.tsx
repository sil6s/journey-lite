import { EditableDirectoryManager } from "@/components/admin/editable-directory-manager";
import { getManagedLocations } from "@/lib/admin/content";

export default async function AdminLocationsPage() {
  const locations = await getManagedLocations();
  return (
    <EditableDirectoryManager
      title="Locations"
      description="Manage address, phone, hours, map links, appointment links, and local SEO details."
      createLabel="Add location"
      type="location"
      rows={locations.map((location) => ({
        id: location.slug || location._id || `${location.city}-${location.phone}`,
        _id: location._id,
        source: location.source ?? "sanity",
        type: "location",
        title: location.name || `${location.city}, ${location.state}`,
        description: [location.address1, location.address2].filter(Boolean).join(", "),
        group: location.serviceArea || location.state,
        href: "/#locations",
        status: location.status ?? "published",
        meta: location.phone,
        fields: {
          name: location.name || "",
          city: location.city || "",
          state: location.state || "",
          address1: location.address1 || "",
          address2: location.address2 || "",
          phone: location.phone || "",
          hours: location.hours || "",
          mapLink: location.mapLink || "",
          appointmentLink: location.appointmentLink || "/contact",
          serviceArea: location.serviceArea || "",
          seoTitle: location.seoTitle || "",
          seoDescription: location.seoDescription || "",
          status: location.status ?? "published",
        },
      }))}
    />
  );
}

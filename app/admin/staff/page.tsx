import { EditableDirectoryManager } from "@/components/admin/editable-directory-manager";
import { getManagedStaffProfiles } from "@/lib/admin/content";

export default async function AdminStaffPage() {
  const staff = await getManagedStaffProfiles();
  return (
    <EditableDirectoryManager
      title="Staff / Providers"
      description="Review provider profile cards, credentials, bios, images, and related service focus."
      createLabel="Add provider"
      type="staff"
      rows={staff.map((person) => ({
        id: person.slug || person._id || person.name,
        _id: person._id,
        source: person.source ?? "sanity",
        type: "staff",
        title: person.name,
        description: person.primaryTitle,
        group: person.primaryTitle,
        href: "/our-team",
        status: person.status ?? "published",
        meta: person.email || person.clinicalFocus?.slice(0, 3).join(", "),
        fields: {
          name: person.name || "",
          displayName: person.displayName || "",
          primaryTitle: person.primaryTitle || "",
          email: person.email || "",
          bio: person.bio || "",
          clinicalFocus: person.clinicalFocus?.join("\n") || "",
          education: person.education?.join("\n") || "",
          credentials: person.credentials?.join("\n") || "",
          imageAlt: person.imageAlt || "",
          seoTitle: person.seoTitle || "",
          seoDescription: person.seoDescription || "",
          status: person.status ?? "published",
        },
      }))}
    />
  );
}

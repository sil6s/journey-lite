import { LocalContentManager } from "@/components/admin/local-content-manager";
import { physicianCards } from "@/app/components/data";

export default function AdminStaffPage() {
  return (
    <LocalContentManager
      title="Staff / Providers"
      description="Review provider profile cards, credentials, bios, images, and related service focus."
      createLabel="Add provider"
      rows={physicianCards.map((person) => ({
        id: person.slug,
        title: person.name,
        description: person.bio,
        group: person.primaryTitle,
        href: "/our-team",
        status: "Published",
        meta: person.clinicalFocus.join(", "),
      }))}
    />
  );
}

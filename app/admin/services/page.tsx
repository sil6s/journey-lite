import { LocalContentManager } from "@/components/admin/local-content-manager";
import { SeoHelperPanel } from "@/components/admin/seo-helper-panel";
import { getServiceRows } from "@/lib/admin/content";

export default function AdminServicesPage() {
  const rows = getServiceRows().map((service) => ({
    id: service.id ?? service.title,
    title: service.title,
    description: service.description,
    group: service.group,
    href: service.href,
    status: "Published",
    meta: service.bestFor ?? service.cta,
  }));

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <LocalContentManager
        title="Services"
        description="Manage service cards and page-oriented fields. Full Sanity-backed editing can be connected when service schemas are added."
        rows={rows}
        createLabel="Add service"
      />
      <SeoHelperPanel suggestedSchema="Service" />
    </div>
  );
}

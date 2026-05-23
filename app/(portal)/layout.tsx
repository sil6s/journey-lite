import { PortalNav } from "@/components/lms/PortalNav";
import { PortalDisclaimer } from "@/components/lms/PortalDisclaimer";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f8f6]">
      <PortalNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      <PortalDisclaimer />
    </div>
  );
}

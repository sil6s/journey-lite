import Link from "next/link";
import { Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/admin/empty-state";

export default function AdminMediaPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Media Library</h1>
        <p className="mt-2 text-muted-foreground">Manage Sanity assets and image alt text from Studio.</p>
      </div>
      <EmptyState icon={Images} title="Use Studio for media assets" description="Sanity already manages image uploads, asset metadata, and article images. A guided media library can be added once asset workflows are finalized." />
      <Button asChild>
        <Link href="/studio">Open Sanity Studio</Link>
      </Button>
    </div>
  );
}

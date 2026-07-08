import { FormsClient } from "./FormsClient";
import { fetchFormDefinitions } from "@/app/admin/content/actions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { FormSubmissionListItem } from "@/components/admin/form-submissions-manager";

export const metadata = { title: "Forms — JourneyLite Admin" };
export const dynamic = "force-dynamic";

export default async function AdminFormsPage() {
  const [forms, submissions] = await Promise.all([
    fetchFormDefinitions().catch(() => []),
    (async () => {
      try {
        const db = getSupabaseAdminClient();
        const { data } = await db
          .from("form_submissions")
          .select("id,form_key,form_name,page_slug,status,submitted_at,data,metadata,admin_notes")
          .order("submitted_at", { ascending: false })
          .limit(200);
        return (data ?? []) as FormSubmissionListItem[];
      } catch { return [] as FormSubmissionListItem[]; }
    })(),
  ]);

  return <FormsClient forms={forms} submissions={submissions} />;
}

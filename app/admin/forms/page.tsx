import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSubmissionsManager, type FormSubmissionListItem } from "@/components/admin/form-submissions-manager";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminFormsPage() {
  let submissions: FormSubmissionListItem[] = [];
  let errorMessage = "";

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("form_submissions")
      .select("id,form_key,form_name,page_slug,status,submitted_at,data,admin_notes")
      .order("submitted_at", { ascending: false })
      .limit(50);

    if (error) errorMessage = error.message;
    else submissions = data ?? [];
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Could not load form submissions.";
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <CardTitle>Forms / Submissions</CardTitle>
            <CardDescription>Manage Supabase-stored submissions from Sanity-defined website forms.</CardDescription>
          </div>
          <Button asChild variant="outline">
            <Link href="/studio/structure/formDefinition">Edit form definitions</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>
          ) : (
            <FormSubmissionsManager submissions={submissions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

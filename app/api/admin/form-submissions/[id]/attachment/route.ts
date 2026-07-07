import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "form-uploads";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteProps) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  const { data: submission, error: submissionError } = await supabase
    .from("form_submissions")
    .select("data")
    .eq("id", id)
    .single();

  if (submissionError || !submission) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const upload = getUploadMetadata(submission.data);
  if (!upload?.path) {
    return NextResponse.json({ error: "No attachment found for this submission." }, { status: 404 });
  }

  const { data: file, error } = await supabase.storage.from(BUCKET).download(upload.path);
  if (error || !file) {
    console.error("[form-submissions] Attachment download failed:", error);
    return NextResponse.json({ error: "Could not download attachment." }, { status: 500 });
  }

  return new NextResponse(file, {
    headers: {
      "Content-Type": upload.type || "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFilename(upload.originalName || "fmla-form.pdf")}"`,
      "Cache-Control": "no-store",
    },
  });
}

function getUploadMetadata(data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const upload = (data as { upload?: unknown }).upload;
  if (!upload || typeof upload !== "object" || Array.isArray(upload)) return null;
  return upload as { path?: string; originalName?: string; type?: string };
}

function safeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 160) || "fmla-form.pdf";
}

import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "form-uploads";
const MAX_FILE_SIZE = 50 * 1024 * 1024;

type UploadRequest = {
  fileName?: string;
  fileSize?: number;
  fileType?: string;
};

export async function POST(req: NextRequest) {
  let body: UploadRequest;
  try {
    body = (await req.json()) as UploadRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const fileName = body.fileName?.trim() || "fmla-form.pdf";
  const fileType = body.fileType || "application/pdf";
  const fileSize = Number(body.fileSize ?? 0);

  if (fileType !== "application/pdf" && !fileName.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF uploads are accepted." }, { status: 400 });
  }

  if (!fileSize || fileSize > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "PDF must be 50 MB or smaller." }, { status: 400 });
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 120) || "fmla-form.pdf";
  const path = `fmla-paperwork/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data?.token) {
    console.error("[fmla-paperwork] Signed upload URL failed:", error);
    return NextResponse.json({ error: "Could not prepare the PDF upload." }, { status: 500 });
  }

  return NextResponse.json({ path, token: data.token });
}

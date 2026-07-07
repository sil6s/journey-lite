import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { client } from "@/src/lib/sanity/client";
import { formDefinitionByKeyQuery } from "@/src/lib/sanity/queries";
import type { FormDefinition } from "@/src/lib/sanity/types";

const BUCKET = "form-uploads";
const DEFAULT_MAX_MB = 10;
const ABSOLUTE_MAX_BYTES = 50 * 1024 * 1024;

type UploadRequest = {
  formKey?: string;
  fieldKey?: string;
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

  const formKey = body.formKey?.trim();
  const fieldKey = body.fieldKey?.trim();
  if (!formKey || !fieldKey) return NextResponse.json({ error: "Missing form or field key." }, { status: 400 });

  const form = await client.fetch<FormDefinition | null>(formDefinitionByKeyQuery, { key: formKey }, { next: { revalidate: 0 } });
  if (!form || form.status !== "active") return NextResponse.json({ error: "This form is not available." }, { status: 404 });

  const field = form.fields?.find((item) => item.key === fieldKey && item.type === "file");
  if (!field) return NextResponse.json({ error: "Upload field not found." }, { status: 404 });

  const fileName = body.fileName?.trim() || "upload";
  const fileType = body.fileType || "application/octet-stream";
  const fileSize = Number(body.fileSize ?? 0);
  const maxBytes = Math.min((field.maxFileSizeMb || DEFAULT_MAX_MB) * 1024 * 1024, ABSOLUTE_MAX_BYTES);
  const accepted = field.acceptedFileTypes?.filter(Boolean) ?? ["application/pdf"];

  if (!fileSize || fileSize > maxBytes) {
    return NextResponse.json({ error: `File must be ${Math.round(maxBytes / 1024 / 1024)} MB or smaller.` }, { status: 400 });
  }

  if (accepted.length && !accepted.includes(fileType)) {
    return NextResponse.json({ error: "This file type is not accepted." }, { status: 400 });
  }

  const safeFormKey = formKey.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
  const safeFieldKey = fieldKey.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 120) || "upload";
  const path = `site-forms/${safeFormKey}/${safeFieldKey}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data?.token) {
    console.error("[forms] Signed upload URL failed:", error);
    return NextResponse.json({ error: "Could not prepare the upload." }, { status: 500 });
  }

  return NextResponse.json({ path, token: data.token });
}

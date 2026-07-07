const FORM_UPLOADS_BUCKET = "form-uploads";
const FORM_UPLOADS_MAX_BYTES = 50 * 1024 * 1024;

export async function ensureFormUploadsBucket() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for storage setup.");
  }

  const response = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: FORM_UPLOADS_BUCKET,
      name: FORM_UPLOADS_BUCKET,
      public: false,
      file_size_limit: FORM_UPLOADS_MAX_BYTES,
      allowed_mime_types: ["application/pdf"],
    }),
  });

  if (response.ok || response.status === 409) return;

  const detail = await response.text().catch(() => "");
  throw new Error(`Could not ensure ${FORM_UPLOADS_BUCKET} bucket: ${response.status} ${detail.slice(0, 160)}`);
}

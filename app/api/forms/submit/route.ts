import { NextRequest, NextResponse } from "next/server";
import { sendFormSubmissionEmail } from "@/lib/email";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import { client } from "@/src/lib/sanity/client";
import { formDefinitionByKeyQuery } from "@/src/lib/sanity/queries";
import type { FormDefinition, FormFieldDefinition } from "@/src/lib/sanity/types";

type Payload = {
  formKey?: string;
  formId?: string;
  pageSlug?: string;
  values?: Record<string, unknown>;
};

export async function POST(req: NextRequest) {
  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const formKey = payload.formKey?.trim();
  if (!formKey || !payload.values || typeof payload.values !== "object") {
    return NextResponse.json({ error: "Missing form key or values." }, { status: 400 });
  }

  const form = await client.fetch<FormDefinition | null>(formDefinitionByKeyQuery, { key: formKey }, { next: { revalidate: 0 } });
  if (!form || form.status !== "active") {
    return NextResponse.json({ error: "This form is not available." }, { status: 404 });
  }

  const honeypotField = form.spamProtection?.honeypotFieldName || "website";
  if (form.spamProtection?.honeypot !== false && payload.values[honeypotField]) {
    return NextResponse.json({ ok: true });
  }

  const validation = validateSubmission(form, payload.values);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const metadata = {
    userAgent: req.headers.get("user-agent"),
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip"),
    submittedPath: payload.pageSlug ? `/${payload.pageSlug}` : null,
  };

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("form_submissions").insert({
    form_key: form.key,
    form_name: form.name,
    page_slug: payload.pageSlug || null,
    data: validation.data as Json,
    metadata: metadata as Json,
  });

  if (error) {
    console.error("[forms] Supabase insert failed:", error);
    return NextResponse.json({ error: "Could not save this submission." }, { status: 500 });
  }

  try {
    await sendFormSubmissionEmail({
      formName: form.name,
      pageSlug: payload.pageSlug,
      data: validation.data,
      to: form.notificationEmails ?? [],
      replyTo: findEmailValue(form.fields ?? [], validation.data),
    });
  } catch (err) {
    console.error("[forms] Notification email failed:", err);
  }

  try {
    await maybeSendToBrevo(form, validation.data);
  } catch (err) {
    console.error("[forms] Brevo sync failed:", err);
  }

  return NextResponse.json({ ok: true, redirectUrl: form.redirectUrl || null });
}

function validateSubmission(form: FormDefinition, values: Record<string, unknown>) {
  const fields = form.fields ?? [];
  const allowedKeys = new Set(fields.map((field) => field.key).filter(Boolean));
  allowedKeys.add(form.spamProtection?.honeypotFieldName || "website");

  for (const key of Object.keys(values)) {
    if (!allowedKeys.has(key)) return { ok: false as const, error: `Unknown field: ${key}` };
  }

  const data: Record<string, unknown> = {};
  for (const field of fields) {
    if (!field.key || field.type === "hidden") {
      if (field.key && field.defaultValue) data[field.key] = field.defaultValue;
      continue;
    }

    const value = values[field.key];
    const empty = isEmpty(value);
    if (field.required && empty) return { ok: false as const, error: `${field.label || field.key} is required.` };
    if (empty) {
      data[field.key] = field.type === "checkboxGroup" ? [] : field.type === "checkbox" || field.type === "consent" ? false : "";
      continue;
    }

    const normalized = normalizeValue(field, value);
    if (normalized.error) return { ok: false as const, error: normalized.error };
    data[field.key] = normalized.value;
  }

  return { ok: true as const, data };
}

function normalizeValue(field: FormFieldDefinition, value: unknown): { value?: unknown; error?: string } {
  const label = field.label || field.key || "Field";

  if (field.type === "checkbox" || field.type === "consent") {
    if (typeof value !== "boolean") return { error: `${label} must be true or false.` };
    return { value };
  }

  if (field.type === "checkboxGroup") {
    if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) return { error: `${label} has invalid selections.` };
    const allowed = new Set((field.options ?? []).map((option) => option.value || option.label).filter(Boolean));
    const invalid = value.find((item) => allowed.size && !allowed.has(item));
    if (invalid) return { error: `${label} includes an invalid option.` };
    return { value };
  }

  if (field.type === "file") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return { error: `${label} must be an uploaded file.` };
    const upload = value as { path?: unknown; originalName?: unknown; size?: unknown; type?: unknown };
    if (typeof upload.path !== "string" || !upload.path.startsWith("site-forms/")) return { error: `${label} has invalid upload metadata.` };
    if (typeof upload.originalName !== "string" || typeof upload.type !== "string" || typeof upload.size !== "number") {
      return { error: `${label} has invalid upload metadata.` };
    }
    const maxBytes = Math.min((field.maxFileSizeMb || 10) * 1024 * 1024, 50 * 1024 * 1024);
    const accepted = field.acceptedFileTypes?.filter(Boolean) ?? ["application/pdf"];
    if (upload.size > maxBytes) return { error: `${label} is too large.` };
    if (accepted.length && !accepted.includes(upload.type)) return { error: `${label} file type is not accepted.` };
    return { value: upload };
  }

  const stringValue = String(value ?? "").trim();

  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) return { error: `${label} must be a valid email address.` };
  if (field.type === "phone" && stringValue.replace(/\D/g, "").length < 10) return { error: `${label} must be a valid phone number.` };
  if (field.type === "number" && Number.isNaN(Number(stringValue))) return { error: `${label} must be a number.` };
  if (field.type === "date" && Number.isNaN(Date.parse(stringValue))) return { error: `${label} must be a valid date.` };

  if (["select", "radio"].includes(field.type)) {
    const allowed = new Set((field.options ?? []).map((option) => option.value || option.label).filter(Boolean));
    if (allowed.size && !allowed.has(stringValue)) return { error: `${label} includes an invalid option.` };
  }

  if (field.validation?.minLength && stringValue.length < field.validation.minLength) return { error: `${label} is too short.` };
  if (field.validation?.maxLength && stringValue.length > field.validation.maxLength) return { error: `${label} is too long.` };
  if (field.validation?.pattern) {
    try {
      if (!new RegExp(field.validation.pattern).test(stringValue)) return { error: `${label} is invalid.` };
    } catch {
      console.warn(`[forms] Ignoring invalid validation pattern for ${field.key}`);
    }
  }

  return { value: stringValue };
}

function isEmpty(value: unknown) {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "boolean") return !value;
  return !String(value ?? "").trim();
}

function findEmailValue(fields: FormFieldDefinition[], data: Record<string, unknown>) {
  const emailField = fields.find((field) => field.type === "email" && field.key);
  const value = emailField?.key ? data[emailField.key] : undefined;
  return typeof value === "string" ? value : undefined;
}

async function maybeSendToBrevo(form: FormDefinition, data: Record<string, unknown>) {
  const apiKey = process.env.BREVO_API_KEY;
  const email = findEmailValue(form.fields ?? [], data);
  if (!apiKey || !email || !form.brevoListId) return;

  await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      listIds: [form.brevoListId],
      updateEnabled: true,
      attributes: Object.fromEntries(Object.entries(data).filter(([, value]) => typeof value === "string")),
    }),
  });
}

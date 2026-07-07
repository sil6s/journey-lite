import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/auth/turnstile";
import { sendFormSubmissionEmail } from "@/lib/email";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

type UploadMetadata = {
  path: string;
  originalName: string;
  size: number;
  type: string;
};

type FmlaPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  confirmEmail?: string;
  dob?: string;
  phone?: string;
  jobType?: string;
  employer?: string;
  sendCompletedTo?: string;
  permissionToTransmit?: boolean;
  paymentAcknowledged?: boolean;
  additionalInformation?: string;
  upload?: UploadMetadata | null;
  website?: string;
  turnstileToken?: string;
};

export async function POST(req: NextRequest) {
  let payload: FmlaPayload;
  try {
    payload = (await req.json()) as FmlaPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validation = validatePayload(payload);
  if (!validation.ok) {
    if ("spam" in validation) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const remoteIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined;
  const turnstile = await verifyTurnstileToken(payload.turnstileToken, "fmla_paperwork", remoteIp);
  if (!turnstile.ok) {
    console.warn("[fmla-paperwork] Turnstile failed:", turnstile.reason);
    if (!turnstile.bypassed) {
      return NextResponse.json({ error: "Security check failed. Please refresh and try again." }, { status: 400 });
    }
  }

  const metadata = {
    userAgent: req.headers.get("user-agent"),
    ip: remoteIp,
    submittedPath: "/fmla-short-term-disability-paperwork",
    securityCheck: turnstile.bypassed ? "Turnstile bypassed" : "Turnstile verified",
  };

  const supabase = getSupabaseAdminClient();
  const { data: inserted, error } = await supabase.from("form_submissions").insert({
    form_key: "fmla-short-term-disability-paperwork",
    form_name: "FMLA/Short-Term Disability Paperwork",
    page_slug: "fmla-short-term-disability-paperwork",
    data: validation.data as Json,
    metadata: metadata as Json,
  }).select("id").single();

  if (error) {
    console.error("[fmla-paperwork] Supabase insert failed:", error);
    return NextResponse.json({ error: "Could not save this submission." }, { status: 500 });
  }

  const upload = isUploadMetadata(validation.data.upload) ? validation.data.upload : null;
  const emailData = inserted?.id && upload
    ? {
        ...validation.data,
        upload: {
          ...upload,
          adminDownloadUrl: `/api/admin/form-submissions/${inserted.id}/attachment`,
        },
      }
    : validation.data;

  try {
    await sendFormSubmissionEmail({
      formName: "FMLA/Short-Term Disability Paperwork",
      pageSlug: "fmla-short-term-disability-paperwork",
      data: emailData,
      to: ["ma@curryweightloss.com"],
      replyTo: typeof validation.data.email === "string" ? validation.data.email : undefined,
    });
  } catch (err) {
    console.error("[fmla-paperwork] Notification email failed:", err);
  }

  return NextResponse.json({ ok: true });
}

function validatePayload(payload: FmlaPayload):
  | { ok: true; data: Record<string, string | boolean | UploadMetadata | null> }
  | { ok: false; spam: true }
  | { ok: false; error: string } {
  if (String(payload.website ?? "").trim()) return { ok: false, spam: true };

  const required: Array<keyof FmlaPayload> = [
    "firstName",
    "lastName",
    "email",
    "confirmEmail",
    "dob",
    "phone",
    "jobType",
    "employer",
    "sendCompletedTo",
  ];

  for (const key of required) {
    if (!String(payload[key] ?? "").trim()) {
      return { ok: false, error: `${fieldLabel(key)} is required.` };
    }
  }

  const email = String(payload.email ?? "").trim();
  const confirmEmail = String(payload.confirmEmail ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Email must be valid." };
  if (email.toLowerCase() !== confirmEmail.toLowerCase()) return { ok: false, error: "Email and confirmation email must match." };
  if (!isValidUsPhone(String(payload.phone ?? "").replace(/\D/g, ""))) return { ok: false, error: "Phone must be valid." };
  const dobDate = new Date(`${String(payload.dob)}T00:00:00`);
  if (Number.isNaN(dobDate.getTime()) || dobDate > new Date()) return { ok: false, error: "Date of birth must be valid." };
  if (!isValidEmailOrFax(String(payload.sendCompletedTo ?? "").trim())) return { ok: false, error: "Send completed form to must be a valid email address or fax number." };
  if (!payload.permissionToTransmit) return { ok: false, error: "Permission to transmit is required." };
  if (!payload.paymentAcknowledged) return { ok: false, error: "Payment acknowledgement is required." };

  if (payload.upload) {
    if (!payload.upload.path?.startsWith("fmla-paperwork/") || payload.upload.type !== "application/pdf") {
      return { ok: false, error: "Uploaded file metadata is invalid." };
    }
    if (!payload.upload.size || payload.upload.size > 50 * 1024 * 1024) {
      return { ok: false, error: "PDF must be 50 MB or smaller." };
    }
  }

  return {
    ok: true,
    data: {
      firstName: String(payload.firstName).trim(),
      lastName: String(payload.lastName).trim(),
      email,
      dob: String(payload.dob).trim(),
      phone: String(payload.phone).trim(),
      jobType: String(payload.jobType).trim(),
      employer: String(payload.employer).trim(),
      sendCompletedTo: String(payload.sendCompletedTo).trim(),
      permissionToTransmit: true,
      paymentAcknowledged: true,
      upload: payload.upload ?? null,
      additionalInformation: String(payload.additionalInformation ?? "").trim(),
    },
  };
}

function fieldLabel(key: keyof FmlaPayload) {
  const labels: Record<string, string> = {
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    confirmEmail: "Confirm email",
    dob: "Date of birth",
    phone: "Phone",
    jobType: "Job type",
    employer: "Employer",
    sendCompletedTo: "Send completed form to fax/email",
  };
  return labels[key] || key;
}

function isUploadMetadata(value: unknown): value is UploadMetadata {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && "path" in value);
}

function isValidUsPhone(digits: string) {
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

function isValidEmailOrFax(value: string) {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
  return isValidUsPhone(value.replace(/\D/g, ""));
}

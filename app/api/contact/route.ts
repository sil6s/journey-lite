import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptchaToken } from "@/lib/auth/recaptcha";

interface ContactPayload {
  // Treatment step
  treatmentInterest?: string;
  location?: string;
  // Contact fields (full form)
  contactReason?: string;
  contactSubreason?: string;
  // Shared
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  bestTime?: string;
  preferredContactMethod?: string;
  insuranceProvider?: string;
  preferredAppointmentTimeframe?: string;
  referralSource?: string;
  message?: string;
  consent?: boolean;
  textConsent?: boolean;
  // Meta
  sourcePage?: string;
  submittedAt?: string;
  recaptchaToken?: string;
  website?: string; // honeypot
}

export async function POST(req: NextRequest) {
  let body: ContactPayload;
  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot
  if (body.website) {
    return NextResponse.json({ ok: true }); // silently drop
  }

  // Basic required field check
  if (!body.firstName?.trim() || (!body.email?.trim() && !body.phone?.trim())) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // reCAPTCHA Enterprise verification
  const captcha = await verifyRecaptchaToken(body.recaptchaToken, "CONSULTATION_REQUEST");
  if (!captcha.ok) {
    console.warn("[contact] reCAPTCHA failed:", captcha.reason);
    if (!captcha.bypassed) {
      return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 400 });
    }
  }

  // Format the submission for logging / email / CRM
  const submission = {
    name: `${body.firstName} ${body.lastName}`.trim(),
    email: body.email ?? "",
    phone: body.phone ?? "",
    treatmentInterest: body.treatmentInterest ?? body.contactReason ?? "",
    location: body.location ?? "",
    bestTime: body.bestTime ?? body.preferredContactMethod ?? "",
    message: body.message ?? "",
    sourcePage: body.sourcePage ?? "unknown",
    submittedAt: body.submittedAt ?? new Date().toISOString(),
    recaptchaScore: captcha.score ?? null,
  };

  // --- Email notification ---
  // To activate email, set CONTACT_NOTIFY_EMAIL + SMTP env vars and uncomment:
  //
  // const { sendLeadEmail } = await import("@/lib/email");
  // await sendLeadEmail(submission);
  //
  // Required env vars:
  //   CONTACT_NOTIFY_EMAIL=your@email.com
  //   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
  //   (or use Resend: RESEND_API_KEY)

  // Log in dev / server stdout
  if (process.env.NODE_ENV !== "production" || process.env.LOG_LEADS === "true") {
    console.log("[contact] New lead submission:", JSON.stringify(submission, null, 2));
  }

  // --- CRM / webhook integration point ---
  // await fetch(process.env.CRM_WEBHOOK_URL!, { method: "POST", body: JSON.stringify(submission) });

  return NextResponse.json({ ok: true });
}

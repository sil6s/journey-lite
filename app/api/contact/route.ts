import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptchaToken } from "@/lib/auth/recaptcha";
import { sendLeadEmail } from "@/lib/email";

interface ContactPayload {
  // Treatment step
  treatmentInterest?: string;
  location?: string;
  // Contact fields (full form)
  contactReason?: string;
  contactSubreason?: string;
  appointmentInterest?: string;
  revisionProcedures?: string[];
  informationTopics?: string[];
  researchStage?: string;
  otherDetails?: string;
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
  const leadDetails = [
    body.contactReason ? `Request type: ${body.contactReason}` : null,
    body.appointmentInterest ? `Appointment interest: ${body.appointmentInterest}` : null,
    body.revisionProcedures?.length ? `Prior procedure(s): ${body.revisionProcedures.join(", ")}` : null,
    body.informationTopics?.length ? `Information topics: ${body.informationTopics.join(", ")}` : null,
    body.researchStage ? `Research stage: ${body.researchStage}` : null,
    body.otherDetails ? `Other details: ${body.otherDetails}` : null,
    body.message ? `Message: ${body.message}` : null,
    typeof body.textConsent === "boolean" ? `SMS consent: ${body.textConsent ? "Yes" : "No"}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const submission = {
    name: `${body.firstName} ${body.lastName}`.trim(),
    email: body.email ?? "",
    phone: body.phone ?? "",
    treatmentInterest: body.treatmentInterest ?? body.appointmentInterest ?? body.contactReason ?? "",
    location: body.location ?? "",
    bestTime: body.bestTime ?? body.preferredContactMethod ?? "",
    message: leadDetails,
    sourcePage: body.sourcePage ?? "unknown",
    submittedAt: body.submittedAt ?? new Date().toISOString(),
    recaptchaScore: captcha.score ?? null,
  };

  // Send email notification
  try {
    await sendLeadEmail({
      ...submission,
      contactReason: body.contactReason,
      appointmentInterest: body.appointmentInterest,
      revisionProcedures: body.revisionProcedures,
      informationTopics: body.informationTopics,
      researchStage: body.researchStage,
      otherDetails: body.otherDetails,
      message: body.message,
      preferredContactMethod: body.preferredContactMethod,
      textConsent: body.textConsent,
    });
  } catch (err) {
    console.error("[contact] Email send failed:", err);
    // Don't fail the request — submission still succeeded
  }

  if (process.env.NODE_ENV !== "production" || process.env.LOG_LEADS === "true") {
    console.log("[contact] Lead submission:", JSON.stringify(submission, null, 2));
  }

  return NextResponse.json({ ok: true });
}

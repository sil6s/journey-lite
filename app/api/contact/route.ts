import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/auth/turnstile";
import { sendLeadEmail } from "@/lib/email";

interface ContactPayload {
  treatmentInterest?: string;
  location?: string;
  contactReason?: string;
  contactSubreason?: string;
  appointmentInterest?: string;
  revisionProcedures?: string[];
  informationTopics?: string[];
  researchStage?: string;
  otherDetails?: string;
  firstName: string;
  lastName: string;
  dob?: string;
  heightFt?: string;
  heightIn?: string;
  weight?: string;
  bmi?: string;
  address?: string;
  insuranceProvider?: string;
  referralSource?: string;
  proceduresOfInterest?: string[];
  email?: string;
  phone?: string;
  bestTime?: string;
  preferredContactMethod?: string;
  preferredAppointmentTimeframe?: string;
  message?: string;
  consent?: boolean;
  textConsent?: boolean;
  sourcePage?: string;
  submittedAt?: string;
  turnstileToken?: string;
  website?: string;
  generalInquiry?: boolean;
}

export async function POST(req: NextRequest) {
  let body: ContactPayload;
  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  if (!body.firstName?.trim() || (!body.email?.trim() && !body.phone?.trim())) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const turnstile = await verifyTurnstileToken(
    body.turnstileToken,
    "consultation_request",
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  );
  if (!turnstile.ok) {
    console.warn("[contact] Turnstile failed:", turnstile.reason);
    if (!turnstile.bypassed) {
      return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 400 });
    }
  }

  const submission = {
    name: `${body.firstName} ${body.lastName}`.trim(),
    email: body.email ?? "",
    phone: body.phone ?? "",
    dob: body.dob ?? "",
    heightFt: body.heightFt ?? "",
    heightIn: body.heightIn ?? "",
    weight: body.weight ?? "",
    bmi: body.bmi ?? "",
    address: body.address ?? "",
    insuranceProvider: body.insuranceProvider ?? "",
    referralSource: body.referralSource ?? "",
    proceduresOfInterest: body.proceduresOfInterest ?? [],
    treatmentInterest: body.treatmentInterest ?? body.appointmentInterest ?? body.contactReason ?? "",
    location: body.location ?? "",
    bestTime: body.bestTime ?? "",
    sourcePage: body.sourcePage ?? "unknown",
    submittedAt: body.submittedAt ?? new Date().toISOString(),
    securityCheck: turnstile.bypassed ? "Turnstile bypassed" : "Turnstile verified",
    contactReason: body.contactReason,
    appointmentInterest: body.appointmentInterest,
    revisionProcedures: body.revisionProcedures,
    informationTopics: body.informationTopics,
    researchStage: body.researchStage,
    otherDetails: body.otherDetails,
    message: body.message,
    preferredContactMethod: body.preferredContactMethod,
    textConsent: body.textConsent,
    generalInquiry: body.generalInquiry,
  };

  try {
    await sendLeadEmail(submission);
  } catch (err) {
    console.error("[contact] Email send failed:", err);
  }

  if (process.env.NODE_ENV !== "production" || process.env.LOG_LEADS === "true") {
    console.log("[contact] Lead submission:", JSON.stringify(submission, null, 2));
  }

  return NextResponse.json({ ok: true });
}

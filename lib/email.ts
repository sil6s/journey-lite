import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface LeadSubmission {
  name: string;
  email: string;
  phone: string;
  treatmentInterest: string;
  location: string;
  bestTime: string;
  sourcePage: string;
  submittedAt: string;
  recaptchaScore: number | null;
  // structured fields
  contactReason?: string;
  appointmentInterest?: string;
  revisionProcedures?: string[];
  informationTopics?: string[];
  researchStage?: string;
  otherDetails?: string;
  message?: string;
  preferredContactMethod?: string;
  textConsent?: boolean;
}

const BASE_URL = "https://journeylite.com";

const serviceLinks: Record<string, { label: string; href: string }> = {
  "Surgical Weight Loss": { label: "Surgical Weight Loss Info", href: `${BASE_URL}/services` },
  "Revision of Prior Weight Loss Surgery": { label: "Revision Surgery Info", href: `${BASE_URL}/services` },
  "Gastric Balloon": { label: "Gastric Balloon Info", href: `${BASE_URL}/gastric-balloon` },
  "Medical Weight Loss (Adipex, WeGovy, etc)": { label: "Medications Info", href: `${BASE_URL}/medications` },
  "Combination Surgical & Medical": { label: "Compare Options", href: `${BASE_URL}/services` },
  "General Surgery": { label: "Our Team", href: `${BASE_URL}/our-team` },
  "Gastric Sleeve": { label: "Gastric Sleeve Info", href: `${BASE_URL}/services` },
  "Gastric Bypass": { label: "Gastric Bypass Info", href: `${BASE_URL}/services` },
  "SADI Surgery": { label: "SADI Surgery Info", href: `${BASE_URL}/services` },
  "Injectable GLP-1's": { label: "Medications Info", href: `${BASE_URL}/medications` },
  "Oral GLP-1's": { label: "Medications Info", href: `${BASE_URL}/medications` },
  "Pricing/Self-Pay Options": { label: "Pricing & Financing", href: `${BASE_URL}/services/pricing-financing` },
  "Insurance Coverage": { label: "Insurance Info", href: `${BASE_URL}/contact` },
};

function colors(type: "appointment" | "information" | "cancel" | "general") {
  if (type === "appointment") return { header: "#0f3e2e", accent: "#145c42", badge: "#edf6f0", badgeText: "#143d2c", label: "Appointment Request" };
  if (type === "information") return { header: "#1e3a5f", accent: "#1d4ed8", badge: "#eff6ff", badgeText: "#1e3a5f", label: "Information Request" };
  if (type === "cancel") return { header: "#7f1d1d", accent: "#dc2626", badge: "#fff5f5", badgeText: "#7f1d1d", label: "Cancel Appointment" };
  return { header: "#374151", accent: "#4b5563", badge: "#f9fafb", badgeText: "#374151", label: "General Inquiry" };
}

function row(label: string, value: string | undefined | null) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:8px 12px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;white-space:nowrap;vertical-align:top;width:160px;">${label}</td>
      <td style="padding:8px 12px;font-size:14px;color:#111827;vertical-align:top;">${value.replace(/\n/g, "<br>")}</td>
    </tr>`;
}

function button(label: string, href: string, bg = "#145c42") {
  return `<a href="${href}" style="display:inline-block;background:${bg};color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:8px;margin:4px 6px 4px 0;">${label}</a>`;
}

function buildEmail(data: LeadSubmission): { subject: string; html: string } {
  const isAppointment = data.contactReason === "Appointment Request";
  const isInformation = data.contactReason === "Information Request";
  const isCancel = data.appointmentInterest === "Cancel Appointment";

  const type = isCancel ? "cancel" : isAppointment ? "appointment" : isInformation ? "information" : "general";
  const c = colors(type);

  const submittedAt = data.submittedAt
    ? new Date(data.submittedAt).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short", timeZone: "America/New_York" })
    : "Unknown";

  // Subject line
  const interestLabel = data.appointmentInterest || data.informationTopics?.join(", ") || data.treatmentInterest || "General";
  const locationLabel = data.location ? ` — ${data.location}` : "";
  const subject = `[${c.label}] ${data.name}${locationLabel} — ${interestLabel}`;

  // Relevant page links
  const linkEntries: string[] = [];
  if (data.appointmentInterest && serviceLinks[data.appointmentInterest]) {
    const sl = serviceLinks[data.appointmentInterest];
    linkEntries.push(button(sl.label, sl.href, c.accent));
  }
  if (data.informationTopics?.length) {
    for (const topic of data.informationTopics.slice(0, 3)) {
      const sl = serviceLinks[topic];
      if (sl) linkEntries.push(button(sl.label, sl.href, c.accent));
    }
  }
  linkEntries.push(button("View Contact Page", `${BASE_URL}/contact`, "#374151"));
  linkEntries.push(button("Our Team", `${BASE_URL}/our-team`, "#374151"));

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${c.label}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr>
    <td style="background:${c.header};border-radius:12px 12px 0 0;padding:28px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.6);">JourneyLite Physicians</p>
            <h1 style="margin:6px 0 0;font-size:22px;font-weight:700;color:#ffffff;">${c.label}</h1>
          </td>
          <td align="right" valign="top">
            <span style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:20px;padding:4px 14px;font-size:11px;font-weight:700;color:#ffffff;white-space:nowrap;">${data.sourcePage === "consult-overlay" ? "Overlay Form" : "Contact Page"}</span>
          </td>
        </tr>
      </table>
      <p style="margin:14px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Received ${submittedAt}</p>
    </td>
  </tr>

  <!-- Patient contact card -->
  <tr>
    <td style="background:#ffffff;padding:0 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:#f8fbf9;border:1px solid #dce7e0;border-radius:10px;overflow:hidden;">
        <tr>
          <td style="background:${c.accent};padding:10px 16px;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Patient Contact</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:8px;">
                  <p style="margin:0;font-size:20px;font-weight:700;color:#111827;">${data.name}</p>
                </td>
              </tr>
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0">
                    ${data.email ? `<tr><td style="padding:3px 0;"><a href="mailto:${data.email}" style="font-size:14px;color:${c.accent};text-decoration:none;font-weight:600;">✉ ${data.email}</a></td></tr>` : ""}
                    ${data.phone ? `<tr><td style="padding:3px 0;"><a href="tel:${data.phone.replace(/\D/g, "")}" style="font-size:14px;color:${c.accent};text-decoration:none;font-weight:600;">📞 ${data.phone}</a></td></tr>` : ""}
                    ${data.bestTime ? `<tr><td style="padding:3px 0;font-size:13px;color:#6b7280;">Best time: ${data.bestTime}</td></tr>` : ""}
                    ${data.preferredContactMethod ? `<tr><td style="padding:3px 0;font-size:13px;color:#6b7280;">Prefers: ${data.preferredContactMethod}</td></tr>` : ""}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Request details -->
  <tr>
    <td style="background:#ffffff;padding:20px 32px 0;">
      <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;">Request Details</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tbody>
          ${row("Request type", c.label)}
          ${row("Appointment interest", data.appointmentInterest)}
          ${row("Prior procedures", data.revisionProcedures?.join(", "))}
          ${row("Info topics", data.informationTopics?.join(", "))}
          ${row("Research stage", data.researchStage)}
          ${row("Location", data.location)}
          ${row("Treatment interest", data.treatmentInterest && !data.appointmentInterest && !data.informationTopics?.length ? data.treatmentInterest : null)}
          ${row("Additional details", data.otherDetails)}
          ${row("Message", data.message)}
          ${row("SMS consent", typeof data.textConsent === "boolean" ? (data.textConsent ? "Yes — may text" : "No") : null)}
          ${row("reCAPTCHA score", data.recaptchaScore !== null ? String(data.recaptchaScore) : null)}
        </tbody>
      </table>
    </td>
  </tr>

  <!-- Quick links -->
  <tr>
    <td style="background:#ffffff;padding:20px 32px 28px;">
      <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;">Relevant Pages</p>
      <div>${linkEntries.join("")}</div>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f9fafb;border-top:1px solid #e5e7eb;border-radius:0 0 12px 12px;padding:20px 32px;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">This email was generated automatically by the JourneyLite website. Do not reply to this email — contact the patient directly using the details above.</p>
      <p style="margin:8px 0 0;font-size:12px;color:#d1d5db;">JourneyLite Physicians &bull; 10475 Reading Road, Cincinnati, OH 45241 &bull; 877-442-2263</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html };
}

export async function sendLeadEmail(data: LeadSubmission): Promise<void> {
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? `JourneyLite <${process.env.SMTP_USER}>`;
  if (!to) {
    console.warn("[email] CONTACT_NOTIFY_EMAIL not set — skipping send.");
    return;
  }

  const { subject, html } = buildEmail(data);

  await transporter.sendMail({
    from,
    to,
    replyTo: data.email || undefined,
    subject,
    html,
  });

  console.log(`[email] Lead email sent to ${to} — "${subject}"`);
}

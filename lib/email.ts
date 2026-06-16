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
  dob: string;
  heightFt: string;
  heightIn: string;
  weight: string;
  bmi: string;
  address: string;
  insuranceProvider: string;
  referralSource: string;
  proceduresOfInterest: string[];
  treatmentInterest: string;
  location: string;
  bestTime: string;
  sourcePage: string;
  submittedAt: string;
  securityCheck: string | null;
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

const BASE = "https://journeylite.com";

/* ── Shared HTML helpers ────────────────────────────────── */

function wrapper(inner: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f6f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6f1;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
${inner}
</table>
</td></tr>
</table>
</body>
</html>`;
}

function header(title: string, subtitle: string, tag: string) {
  return `
  <tr>
    <td style="background:#0f3e2e;border-radius:12px 12px 0 0;padding:32px;">
      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#9ed4b0;">${tag}</p>
      <h1 style="margin:8px 0 0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;">${title}</h1>
      <p style="margin:10px 0 0;font-size:13px;color:#b9d2c5;">${subtitle}</p>
    </td>
  </tr>`;
}

function footer() {
  return `
  <tr>
    <td style="background:#1a3d2b;border-radius:0 0 12px 12px;padding:20px 32px;">
      <p style="margin:0;font-size:12px;color:#9ed4b0;">JourneyLite Physicians</p>
      <p style="margin:4px 0 0;font-size:12px;color:#6b9e7e;">10475 Reading Road, Cincinnati, OH 45241 &middot; 877-442-2263</p>
    </td>
  </tr>`;
}

function greenButton(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background:#145c42;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;padding:11px 22px;border-radius:8px;margin:4px 6px 4px 0;">${label}</a>`;
}

function outlineButton(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background:#ffffff;color:#145c42;font-size:13px;font-weight:600;text-decoration:none;padding:10px 22px;border-radius:8px;border:1.5px solid #145c42;margin:4px 6px 4px 0;">${label}</a>`;
}

function infoRow(label: string, value: string | undefined | null) {
  if (!value) return "";
  return `
  <tr style="border-bottom:1px solid #dce4df;">
    <td style="padding:10px 14px;font-size:11px;font-weight:700;color:#66756d;text-transform:uppercase;letter-spacing:0.07em;white-space:nowrap;vertical-align:top;width:150px;background:#f8fbf9;">${label}</td>
    <td style="padding:10px 14px;font-size:14px;color:#1f2c25;vertical-align:top;background:#ffffff;">${value.replace(/\n/g, "<br>")}</td>
  </tr>`;
}

function sectionLabel(text: string) {
  return `
  <tr>
    <td style="background:#ffffff;padding:24px 32px 8px;">
      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#66756d;">${text}</p>
    </td>
  </tr>`;
}

function tableBlock(rows: string) {
  return `
  <tr>
    <td style="background:#ffffff;padding:0 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dce4df;border-radius:10px;overflow:hidden;">
        <tbody>${rows}</tbody>
      </table>
    </td>
  </tr>`;
}

function spacer(h = 24) {
  return `<tr><td style="background:#ffffff;height:${h}px;"></td></tr>`;
}

/* ── Staff notification email ───────────────────────────── */

function buildStaffEmail(data: LeadSubmission): { subject: string; html: string } {
  const isCancel = data.appointmentInterest === "Cancel Appointment";
  const isInfo = data.contactReason === "Information Request";

  const typeLabel = isCancel ? "Cancel Request"
    : isInfo ? "Information Request"
    : "Appointment Request";

  const interestLabel = data.appointmentInterest || data.informationTopics?.join(", ") || data.treatmentInterest || "General";
  const locationPart = data.location ? ` — ${data.location}` : "";
  const subject = `[${typeLabel}] ${data.name}${locationPart} — ${interestLabel}`;

  const submittedAt = data.submittedAt
    ? new Date(data.submittedAt).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short", timeZone: "America/New_York" })
    : "";

  const links: string[] = [];
  if (data.appointmentInterest === "Gastric Balloon") links.push(greenButton("Gastric Balloon Info", `${BASE}/gastric-balloon`));
  else if (data.appointmentInterest?.includes("Medical Weight Loss") || data.appointmentInterest?.includes("GLP")) links.push(greenButton("Medications Info", `${BASE}/medications`));
  else if (data.appointmentInterest) links.push(greenButton("Services", `${BASE}/services`));
  if (data.informationTopics?.some((t) => t.includes("GLP") || t.includes("oral"))) links.push(greenButton("Medications Info", `${BASE}/medications`));
  if (data.informationTopics?.some((t) => t.includes("Balloon"))) links.push(greenButton("Gastric Balloon Info", `${BASE}/gastric-balloon`));
  if (data.informationTopics?.some((t) => t.includes("Pricing"))) links.push(greenButton("Pricing Info", `${BASE}/services/pricing-financing`));
  links.push(outlineButton("Our Team", `${BASE}/about/our-team`));
  links.push(outlineButton("Contact Page", `${BASE}/contact`));

  const html = wrapper(`
  ${header(typeLabel, `Received ${submittedAt}`, "JourneyLite — New Lead")}

  ${sectionLabel("Submission")}
  ${tableBlock(`
    ${infoRow("Program", interestLabel)}
    ${infoRow("Name", data.name)}
    ${infoRow("DOB", data.dob)}
    ${infoRow("Email", data.email ? `<a href="mailto:${data.email}" style="color:#145c42;font-weight:600;text-decoration:none;">${data.email}</a>` : null)}
    ${infoRow("SMS consent", typeof data.textConsent === "boolean" ? (data.textConsent ? "Yes" : "No") : null)}
    ${infoRow("Phone", data.phone ? `<a href="tel:${data.phone.replace(/\D/g, "")}" style="color:#145c42;font-weight:600;text-decoration:none;">${data.phone}</a>` : null)}
    ${infoRow("Address", data.address)}
    ${infoRow("Height (ft)", data.heightFt)}
    ${infoRow("Inches", data.heightIn)}
    ${infoRow("Weight (lbs)", data.weight)}
    ${infoRow("BMI", data.bmi)}
    ${infoRow("Preferred location", data.location)}
    ${infoRow("Procedures of interest", data.proceduresOfInterest?.length ? data.proceduresOfInterest.join(", ") : null)}
    ${infoRow("Prior procedures", data.revisionProcedures?.join(", "))}
    ${infoRow("Info topics", data.informationTopics?.join(", "))}
    ${infoRow("Insurance / Self Pay", data.insuranceProvider)}
    ${infoRow("How did you hear about us", data.referralSource)}
    ${infoRow("Best time to reach", data.bestTime)}
    ${infoRow("Preferred contact method", data.preferredContactMethod)}
    ${infoRow("Research stage", data.researchStage)}
    ${infoRow("Other details", data.otherDetails)}
    ${infoRow("Message", data.message)}
    ${infoRow("Source page", data.sourcePage)}
    ${infoRow("Security check", data.securityCheck)}
  `)}

  ${sectionLabel("Quick links")}
  <tr>
    <td style="background:#ffffff;padding:8px 32px 32px;">
      ${links.join("")}
    </td>
  </tr>

  <tr>
    <td style="background:#ffffff;padding:0 32px 24px;">
      <p style="margin:0;font-size:12px;color:#66756d;border-top:1px solid #dce4df;padding-top:16px;">
        Do not reply to this email. Contact the patient directly using the details above.
      </p>
    </td>
  </tr>

  ${footer()}
  `);

  return { subject, html };
}

/* ── Patient confirmation email ─────────────────────────── */

interface ProgramContent {
  heading: string;
  intro: string;
  nextSteps: string[];
  link: { label: string; href: string };
  closingNote?: string;
}

function getProgramContent(data: LeadSubmission): ProgramContent {
  const interest = data.appointmentInterest || "";
  const isInfo = data.contactReason === "Information Request";
  const topics = data.informationTopics ?? [];

  if (interest === "Cancel Appointment") {
    return {
      heading: "Appointment Change Request Received",
      intro: "We received your request to cancel or change your appointment. A member of the JourneyLite team will be in touch shortly to assist you.",
      nextSteps: [
        "A patient service representative will review your request.",
        "We will contact you to confirm the change or cancellation.",
        "If your matter is time-sensitive, please call us directly at 877-442-2263.",
      ],
      link: { label: "Contact JourneyLite", href: `${BASE}/contact` },
    };
  }

  if (interest === "Surgical Weight Loss") {
    return {
      heading: "Surgical Weight Loss Consultation Request",
      intro: "Thank you for requesting a surgical weight loss consultation with JourneyLite. Our team performs thousands of weight loss procedures and will work with you to find the right path forward.",
      nextSteps: [
        "A patient service representative will contact you to discuss your goals and timeline.",
        "We will review your insurance coverage or self-pay options before scheduling.",
        "Your initial visit will include a consultation with Dr. Curry or Dr. Augusta and a dietitian evaluation.",
      ],
      link: { label: "Learn About Surgical Options", href: `${BASE}/services` },
      closingNote: "Surgical weight loss options at JourneyLite include gastric sleeve, gastric bypass, SADI surgery, and more. We will help you understand which procedure fits your health history and goals.",
    };
  }

  if (interest === "Revision of Prior Weight Loss Surgery") {
    return {
      heading: "Revision Surgery Consultation Request",
      intro: "Thank you for reaching out about revision of your prior weight loss surgery. JourneyLite has extensive experience evaluating patients who need a new approach after a previous procedure.",
      nextSteps: [
        "A patient service representative will contact you to gather more information about your prior procedure and current goals.",
        "Dr. Curry or Dr. Augusta will review your history and discuss available options.",
        "We will review insurance or self-pay options before scheduling your consultation.",
      ],
      link: { label: "Our Team", href: `${BASE}/about/our-team` },
      closingNote: "Revision cases require careful evaluation. Not all revisions are the same — your team will review your specific situation before making any recommendations.",
    };
  }

  if (interest === "Gastric Balloon") {
    return {
      heading: "Gastric Balloon Consultation Request",
      intro: "Thank you for your interest in the gastric balloon program at JourneyLite. The gastric balloon is a non-surgical, temporary weight loss option that is placed and removed without incisions.",
      nextSteps: [
        "A patient service representative will contact you to discuss balloon options and next steps.",
        "Your evaluation will include a consultation with Dr. Curry or Dr. Augusta and a dietitian visit.",
        "We will review self-pay options and any applicable insurance coverage.",
      ],
      link: { label: "Learn About Gastric Balloon", href: `${BASE}/gastric-balloon` },
    };
  }

  if (interest === "Medical Weight Loss (Adipex, WeGovy, etc)") {
    return {
      heading: "Medical Weight Loss Request",
      intro: "Thank you for your interest in medication-supported weight loss at JourneyLite. Our physicians prescribe both injectable GLP-1 medications and oral options, with ongoing monitoring and dietitian support.",
      nextSteps: [
        "A patient service representative will contact you to discuss medication options and eligibility.",
        "Your evaluation will include a consultation with a JourneyLite physician or nurse practitioner.",
        "We will review insurance coverage and self-pay pricing for your medication of interest.",
      ],
      link: { label: "Learn About Medications", href: `${BASE}/medications` },
      closingNote: "Medication programs at JourneyLite include injectable GLP-1s such as Wegovy and Zepbound, as well as oral options like Contrave and Qsymia. Your provider will help identify the right fit.",
    };
  }

  if (interest === "Combination Surgical & Medical") {
    return {
      heading: "Combination Surgical and Medical Request",
      intro: "Thank you for reaching out about a combined surgical and medical weight loss approach. JourneyLite physicians can discuss both surgical and medication-supported options at the same visit.",
      nextSteps: [
        "A patient service representative will contact you to review your goals and preferred approach.",
        "Your evaluation will include a consultation with Dr. Curry or Dr. Augusta and a dietitian visit.",
        "We will review your insurance coverage and self-pay options before scheduling.",
      ],
      link: { label: "Compare Options", href: `${BASE}/services` },
    };
  }

  if (interest === "General Surgery") {
    return {
      heading: "General Surgery Request",
      intro: "Thank you for reaching out about general surgery at JourneyLite. A member of our team will contact you to discuss your needs and route your request appropriately.",
      nextSteps: [
        "A JourneyLite team member will review your request and reach out to discuss next steps.",
        "If you have specific concerns or a referral from another provider, please have that information ready.",
      ],
      link: { label: "Our Team", href: `${BASE}/about/our-team` },
    };
  }

  if (isInfo) {
    const topicLabel = topics.length > 0
      ? topics.slice(0, 3).join(", ") + (topics.length > 3 ? ", and more" : "")
      : "your topics of interest";

    const primaryLink = topics.includes("Gastric Balloon")
      ? { label: "Gastric Balloon Info", href: `${BASE}/gastric-balloon` }
      : topics.some((t) => t.includes("GLP") || t.includes("oral") || t.includes("Adipex"))
        ? { label: "Medications Info", href: `${BASE}/medications` }
        : topics.includes("Pricing/Self-Pay Options")
          ? { label: "Pricing and Financing", href: `${BASE}/services/pricing-financing` }
          : { label: "Compare Weight Loss Options", href: `${BASE}/services` };

    return {
      heading: "Information Request Received",
      intro: `Thank you for reaching out to JourneyLite. We received your request for information about ${topicLabel}. A member of our team will follow up with you directly.`,
      nextSteps: [
        "A JourneyLite team member will review your request and reach out with relevant information.",
        "If you are ready to schedule a consultation at any time, you can call us directly at 877-442-2263.",
        "There is no obligation — this is just information to help you decide on your next step.",
      ],
      link: primaryLink,
      closingNote: "JourneyLite offers surgical weight loss, gastric balloon, and medication-supported programs. We are happy to help you compare options at whatever pace feels right for you.",
    };
  }

  return {
    heading: "Request Received",
    intro: "Thank you for contacting JourneyLite. A member of our team will review your request and reach out shortly.",
    nextSteps: [
      "A patient service representative will contact you using the information you provided.",
      "For urgent concerns, please call us directly at 877-442-2263.",
    ],
    link: { label: "Contact JourneyLite", href: `${BASE}/contact` },
  };
}

function buildPatientEmail(data: LeadSubmission): { subject: string; html: string } {
  const firstName = data.name.split(" ")[0] ?? data.name;
  const content = getProgramContent(data);
  const subject = `JourneyLite — ${content.heading}`;

  const html = wrapper(`
  ${header(content.heading, "JourneyLite Physicians", "JourneyLite")}

  <tr>
    <td style="background:#ffffff;padding:28px 32px 0;">
      <p style="margin:0;font-size:16px;color:#1f2c25;line-height:1.6;">Hi ${firstName},</p>
      <p style="margin:14px 0 0;font-size:15px;color:#53635b;line-height:1.7;">${content.intro}</p>
    </td>
  </tr>

  ${sectionLabel("What happens next")}
  <tr>
    <td style="background:#ffffff;padding:0 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fbf9;border:1px solid #dce4df;border-radius:10px;overflow:hidden;padding:4px 0;">
        ${content.nextSteps.map((step, i) => `
        <tr>
          <td style="padding:12px 16px;vertical-align:top;width:36px;">
            <span style="display:inline-flex;width:24px;height:24px;border-radius:50%;background:#145c42;color:#ffffff;font-size:12px;font-weight:700;text-align:center;line-height:24px;justify-content:center;align-items:center;">${i + 1}</span>
          </td>
          <td style="padding:12px 16px 12px 0;font-size:14px;color:#1f2c25;line-height:1.6;">${step}</td>
        </tr>`).join("")}
      </table>
    </td>
  </tr>

  ${content.closingNote ? `
  <tr>
    <td style="background:#ffffff;padding:20px 32px 0;">
      <p style="margin:0;font-size:13px;color:#66756d;line-height:1.7;border-left:3px solid #145c42;padding-left:14px;">${content.closingNote}</p>
    </td>
  </tr>` : ""}

  ${spacer(20)}
  ${sectionLabel("Your information on file")}
  ${tableBlock(`
    ${infoRow("Name", data.name)}
    ${infoRow("Email", data.email)}
    ${infoRow("Phone", data.phone)}
    ${infoRow("Preferred location", data.location)}
    ${infoRow("Best time to reach you", data.bestTime)}
    ${infoRow("Preferred contact method", data.preferredContactMethod)}
  `)}

  <tr>
    <td style="background:#ffffff;padding:24px 32px;">
      <p style="margin:0 0 12px;font-size:14px;color:#53635b;">Ready to learn more or speak with someone sooner?</p>
      ${greenButton(content.link.label, content.link.href)}
      ${outlineButton("Call 877-442-2263", "tel:+18774422263")}
    </td>
  </tr>

  <tr>
    <td style="background:#ffffff;padding:0 32px 28px;">
      <p style="margin:0;font-size:13px;color:#66756d;line-height:1.7;">
        This is a confirmation of your request. Do not use this email for urgent medical concerns.
        If you are experiencing a medical emergency, call 911. For urgent post-operative questions,
        call your JourneyLite office directly.
      </p>
    </td>
  </tr>

  ${footer()}
  `);

  return { subject, html };
}

/* ── Public send function ───────────────────────────────── */

export async function sendLeadEmail(data: LeadSubmission): Promise<void> {
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? `JourneyLite <${process.env.SMTP_USER}>`;

  if (!to) {
    console.warn("[email] CONTACT_NOTIFY_EMAIL not set — skipping send.");
    return;
  }

  const { subject: staffSubject, html: staffHtml } = buildStaffEmail(data);
  const { subject: patientSubject, html: patientHtml } = buildPatientEmail(data);

  // Staff notification
  await transporter.sendMail({
    from,
    to,
    replyTo: data.email || undefined,
    subject: staffSubject,
    html: staffHtml,
  });

  // Patient confirmation (only if they gave an email)
  if (data.email) {
    await transporter.sendMail({
      from,
      to: data.email,
      subject: patientSubject,
      html: patientHtml,
    });
  }

  console.log(`[email] Sent staff notification to ${to} and patient confirmation to ${data.email || "none"}`);
}

export async function sendFormSubmissionEmail({
  formName,
  pageSlug,
  data,
  to,
  replyTo,
}: {
  formName: string;
  pageSlug?: string;
  data: Record<string, unknown>;
  to: string[];
  replyTo?: string;
}) {
  const recipients = to.filter(Boolean);
  if (!recipients.length) return;

  const from = process.env.CONTACT_FROM_EMAIL ?? `JourneyLite <${process.env.SMTP_USER}>`;
  const rows = Object.entries(data)
    .filter(([key]) => key !== "website")
    .map(([key, value]) => infoRow(key, Array.isArray(value) ? value.join(", ") : typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "")))
    .join("");

  await transporter.sendMail({
    from,
    to: recipients.join(","),
    replyTo,
    subject: `[JourneyLite Form] ${formName}`,
    html: wrapper(`
      ${header("New Website Form Submission", `Form: ${formName}${pageSlug ? ` · Page: /${pageSlug}` : ""}`, "JourneyLite")}
      ${sectionLabel("Submitted fields")}
      ${tableBlock(rows)}
      ${footer()}
    `),
  });
}

/* ── Patient LMS invite ─────────────────────────────────── */

export async function sendPatientInviteEmail({
  to,
  name,
  inviteHref,
  courseTitles,
}: {
  to: string;
  name: string;
  inviteHref: string;
  courseTitles: string[];
}): Promise<void> {
  const from = process.env.CONTACT_FROM_EMAIL ?? `JourneyLite <${process.env.SMTP_USER}>`;
  const courseListHtml = courseTitles.length
    ? `<ul style="margin:16px 0;padding:0;">${courseTitles
        .map(
          (title) =>
            `<li style="margin:8px 0;padding:12px 16px;background:#f0f7f3;border:1px solid #c3dfd0;border-left:4px solid #145c42;border-radius:6px;list-style:none;"><span style="color:#145c42;font-weight:700;margin-right:8px;">&#10003;</span><span style="color:#1f2c25;font-weight:600;">${title}</span></li>`
        )
        .join("")}</ul>`
    : `<p style="color:#5f6f66;">No courses are currently assigned.</p>`;

  await transporter.sendMail({
    from,
    to,
    subject: `Welcome to JourneyLite Patient Education, ${name}`,
    html: wrapper(`
      ${header(`Welcome, ${name}`, "Your JourneyLite Patient Education account is ready.", "JourneyLite")}
      <tr>
        <td style="background:#ffffff;padding:24px 32px;">
          <p style="margin:0 0 8px;font-size:14px;color:#1f2c25;">Your care team has assigned you the following lessons as mandatory for your upcoming procedure:</p>
          ${courseListHtml}
          <p style="margin:16px 0 0;font-size:14px;color:#37443e;">Please complete these lessons before your surgery date. You can sign in from any phone, tablet, or computer — start and stop whenever it works for you.</p>
          <p style="margin:20px 0 0;">${greenButton("Begin My Education", inviteHref)}</p>
          <p style="margin:20px 0 0;font-size:13px;color:#5f6f66;">Questions? Contact your JourneyLite care team at <a href="https://journeylite.com/contact" style="color:#145c42;">journeylite.com/contact</a>.</p>
        </td>
      </tr>
      ${footer()}
    `),
  });
}

"use client";

import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CTAButton } from "../components/marketing";

type FormData = {
  contactReason: string;
  patientStatus: string;
  treatmentInterest: string;
  preferredLocation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  bestContactTime: string;
  insuranceProvider: string;
  preferredAppointmentTimeframe: string;
  referralSource: string;
  message: string;
  emergencyAcknowledgement: boolean;
  contactConsent: boolean;
  textConsent: boolean;
  sourcePage: string;
  submittedAt: string;
  website: string;
};

const initialData: FormData = {
  contactReason: "",
  patientStatus: "",
  treatmentInterest: "",
  preferredLocation: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  preferredContactMethod: "",
  bestContactTime: "",
  insuranceProvider: "",
  preferredAppointmentTimeframe: "",
  referralSource: "",
  message: "",
  emergencyAcknowledgement: false,
  contactConsent: false,
  textConsent: false,
  sourcePage: "contact",
  submittedAt: "",
  website: "",
};

const reasonOptions = [
  ["consultation", "Request a consultation", "Start a new appointment request or compare next steps."],
  ["general", "General question", "Ask a non-urgent question for the JourneyLite team."],
  ["pricing", "Pricing or financing", "Ask about self-pay, financing, or cost factors."],
  ["insurance", "Insurance question", "Ask about coverage, plan rules, or authorization."],
  ["medication", "Prescription weight loss medication", "Ask about oral or injectable medication programs."],
  ["surgical", "Surgical weight loss", "Ask about gastric sleeve, bypass, SADI, revisions, or surgery."],
  ["non-surgical", "Non-surgical procedure", "Ask about gastric balloon or comparison options."],
  ["existing", "Existing patient question", "Ask a non-urgent question as an existing patient."],
  ["location", "Location-specific question", "Contact a JourneyLite regional location."],
];

const patientOptions = ["New patient", "Existing patient", "I'm helping someone else", "Not sure"];

const treatmentOptions = [
  "Gastric Sleeve",
  "Gastric Bypass",
  "SADI Surgery",
  "Lap Band / Band Revision",
  "Gastric Sleeve Revision",
  "Gastric Balloon",
  "Prescription Weight Loss Medication",
  "Injectable Medication",
  "Oral Medication",
  "Not sure, I want help comparing options",
];

const locations = [
  {
    label: "Cincinnati Main Office & Surgery Center",
    address: "10475 Reading Road, Cincinnati, OH 45241",
    phone: "Office: 513-559-1222; Surgery Center: 513-259-2488",
  },
  {
    label: "Columbus / Grove City",
    address: "2041 Stringtown Rd, Grove City, OH 43123",
    phone: "614-526-4463",
  },
  {
    label: "Dayton / Moraine",
    address: "2621 Dryden Rd Suite 301, Moraine, OH 45439",
    phone: "937-280-5673",
  },
  {
    label: "Indianapolis / Greenwood",
    address: "33 E. County Line Road, Suite E, Greenwood, IN",
    phone: "463-237-5999",
  },
  {
    label: "Northern Kentucky / Crestview Hills",
    address: "320 Thomas More Parkway, Crestview Hills, KY",
    phone: "859-331-1035",
  },
  {
    label: "Not sure / phone discussion preferred",
    address: "JourneyLite can help route your request.",
    phone: "877-442-2263",
  },
];

const contactMethods = ["Phone", "Email", "Text if legally approved"];
const contactTimes = ["Morning", "Afternoon", "Evening", "No preference"];

function needsTreatment(reason: string) {
  return ["consultation", "medication", "surgical", "non-surgical", "pricing", "insurance"].includes(reason);
}

function placeholder(reason: string) {
  const map: Record<string, string> = {
    consultation: "Tell us a little about your goals, timeline, and any procedures or programs you are considering.",
    pricing: "Let us know which treatment you are comparing and whether you are interested in self-pay, financing, or insurance options.",
    insurance: "Share your insurance provider and the treatment you are interested in, if known.",
    existing: "Please include a brief description of your question. Do not include urgent medical concerns here.",
    medication: "Tell us whether you are interested in oral medications, injectable medications, pricing, or eligibility.",
    surgical: "Tell us which surgical option you are considering and any timing or insurance questions.",
    "non-surgical": "Tell us whether you are interested in gastric balloon treatment or comparing non-surgical options.",
  };
  return map[reason] ?? "Share a brief, non-urgent message so the JourneyLite team can route your request.";
}

export function ContactExperience() {
  const [data, setData] = useState<FormData>(initialData);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const steps = useMemo(() => {
    const base = ["reason", "patient"];
    if (needsTreatment(data.contactReason)) base.push("treatment");
    base.push("location", "contact", "details", "review");
    return base;
  }, [data.contactReason]);

  const current = steps[step] ?? steps[0];
  const progress = Math.round(((step + 1) / steps.length) * 100);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function chooseReason(reason: string) {
    update("contactReason", reason);
    setStep(1);
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function validateCurrent() {
    const nextErrors: Record<string, string> = {};
    if (current === "reason" && !data.contactReason) nextErrors.contactReason = "Choose a reason for contact.";
    if (current === "patient" && !data.patientStatus) nextErrors.patientStatus = "Choose a patient status.";
    if (current === "treatment" && !data.treatmentInterest) nextErrors.treatmentInterest = "Choose a treatment interest.";
    if (current === "location" && !data.preferredLocation) nextErrors.preferredLocation = "Choose a preferred location.";
    if (current === "contact") {
      if (!data.firstName.trim()) nextErrors.firstName = "First name is required.";
      if (!data.lastName.trim()) nextErrors.lastName = "Last name is required.";
      if (!data.email.trim() && !data.phone.trim()) nextErrors.email = "Provide an email or phone number.";
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) nextErrors.email = "Enter a valid email address.";
      if (data.phone && data.phone.replace(/\D/g, "").length < 10) nextErrors.phone = "Enter a valid phone number.";
      if (!data.preferredContactMethod) nextErrors.preferredContactMethod = "Choose a preferred contact method.";
      if (!data.bestContactTime) nextErrors.bestContactTime = "Choose a best contact time.";
    }
    if (current === "review") {
      if (!data.emergencyAcknowledgement) nextErrors.emergencyAcknowledgement = "Confirm this is not for emergencies.";
      if (!data.contactConsent) nextErrors.contactConsent = "Confirm JourneyLite may contact you.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goNext() {
    if (!validateCurrent()) return;
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function goBack() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  function submit() {
    if (!validateCurrent()) return;
    if (data.website) return;
    setData((prev) => ({ ...prev, submittedAt: new Date().toISOString() }));
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="rounded-2xl border border-[#cbd9d1] bg-white p-6 shadow-xl shadow-[#20372b]/8 lg:p-8">
        <p className="eyebrow">Request received</p>
        <h2 className="mt-3 font-serif text-4xl leading-tight text-[#1f2c25]">Thank you for contacting JourneyLite.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-[#53635b]">
          The team can use your request details to route the next step. If this becomes urgent or you are experiencing a
          medical emergency, call 911 immediately. For urgent post-operative concerns, call the office directly.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <CTAButton href="tel:+18774422263">Call 877-442-2263</CTAButton>
          <CTAButton href="/services/compare-weight-loss-options" variant="secondary">
            Compare Options
          </CTAButton>
          <CTAButton href="/services/pricing-financing" variant="secondary">
            Pricing & Financing
          </CTAButton>
          <CTAButton href="/#locations" variant="secondary">
            Locations
          </CTAButton>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-8">
      <section aria-labelledby="quick-contact-title">
        <div className="max-w-3xl">
          <p className="eyebrow">Quick contact paths</p>
          <h2 className="section-title" id="quick-contact-title">
            Choose the path that best matches your question.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reasonOptions.slice(0, 8).map(([value, label, description], index) => (
            <button
              className="rounded-lg border border-[#dce4df] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
              key={value}
              onClick={() => chooseReason(value)}
              type="button"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf4ef] text-xs font-bold text-[#145c42]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-4 block text-lg font-semibold text-[#1f2c25]">{label}</span>
              <span className="mt-2 block text-sm leading-6 text-[#53635b]">{description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-xl shadow-[#20372b]/8 lg:p-8" id="contact-form" ref={formRef}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Appointment request form</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#1f2c25]">Tell us what you need.</h2>
          </div>
          <p className="text-sm font-semibold text-[#53635b]">
            Step {step + 1} of {steps.length}: {labelForStep(current)}
          </p>
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#edf4ef]" aria-hidden="true">
          <div className="h-full rounded-full bg-[#145c42] transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-8">
          {current === "reason" ? (
            <ChoiceGrid
              error={errors.contactReason}
              name="contactReason"
              onChoose={(value) => update("contactReason", value)}
              options={reasonOptions.map(([value, label, description]) => ({ value, label, description }))}
              selected={data.contactReason}
              title="What can we help you with?"
            />
          ) : null}

          {current === "patient" ? (
            <ChoiceGrid
              error={errors.patientStatus}
              name="patientStatus"
              onChoose={(value) => update("patientStatus", value)}
              options={patientOptions.map((item) => ({ value: item, label: item }))}
              selected={data.patientStatus}
              title="Are you a new or existing JourneyLite patient?"
            >
              {data.patientStatus === "Existing patient" ? (
                <p className="mt-5 rounded-lg border border-[#d8c88b] bg-[#fffdf4] p-4 text-sm leading-6 text-[#5e5235]">
                  For urgent post-operative or medical concerns, please call the office directly. If this is an
                  emergency, call 911.
                </p>
              ) : null}
            </ChoiceGrid>
          ) : null}

          {current === "treatment" ? (
            <ChoiceGrid
              error={errors.treatmentInterest}
              name="treatmentInterest"
              onChoose={(value) => update("treatmentInterest", value)}
              options={treatmentOptions.map((item) => ({ value: item, label: item }))}
              selected={data.treatmentInterest}
              title="Which option are you interested in?"
            />
          ) : null}

          {current === "location" ? (
            <ChoiceGrid
              error={errors.preferredLocation}
              name="preferredLocation"
              onChoose={(value) => update("preferredLocation", value)}
              options={locations.map((loc) => ({ value: loc.label, label: loc.label, description: `${loc.address} | ${loc.phone}` }))}
              selected={data.preferredLocation}
              title="Which location is most convenient?"
            />
          ) : null}

          {current === "contact" ? (
            <ContactFields data={data} errors={errors} update={update} />
          ) : null}

          {current === "details" ? (
            <DetailsFields data={data} update={update} />
          ) : null}

          {current === "review" ? (
            <ReviewStep data={data} errors={errors} update={update} />
          ) : null}
        </div>

        <input
          aria-hidden="true"
          autoComplete="off"
          className="hidden"
          name="website"
          onChange={(event) => update("website", event.target.value)}
          tabIndex={-1}
          value={data.website}
        />

        <EmergencyNotice compact />

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#cbd7d0] bg-white px-5 py-3 text-sm font-semibold text-[#17362a] transition hover:border-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
            disabled={step === 0}
            onClick={goBack}
            type="button"
          >
            Back
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#145c42] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2"
            onClick={current === "review" ? submit : goNext}
            type="button"
          >
            {current === "review" ? "Submit Request" : "Continue"}
          </button>
        </div>
      </section>
    </div>
  );
}

export function EmergencyNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-[#d8c88b] bg-[#fffdf4] text-[#5e5235] ${compact ? "mt-8 p-4 text-sm leading-6" : "p-5 text-sm leading-6 shadow-sm"}`}
      role="note"
    >
      <p className="font-semibold text-[#1f2c25]">Emergency and urgent care notice</p>
      <p className="mt-2">
        If you are experiencing a medical emergency, call 911 immediately. Do not use this form for urgent or emergency
        medical needs. For urgent post-operative concerns, call the office directly using the appropriate location phone
        number.
      </p>
    </div>
  );
}

function labelForStep(step: string) {
  const labels: Record<string, string> = {
    reason: "Reason",
    patient: "Patient status",
    treatment: "Treatment interest",
    location: "Location",
    contact: "Contact information",
    details: "Details",
    review: "Review",
  };
  return labels[step] ?? step;
}

function ChoiceGrid({
  title,
  options,
  selected,
  onChoose,
  name,
  error,
  children,
}: {
  title: string;
  options: { value: string; label: string; description?: string }[];
  selected: string;
  onChoose: (value: string) => void;
  name: string;
  error?: string;
  children?: ReactNode;
}) {
  return (
    <fieldset>
      <legend className="text-2xl font-semibold text-[#1f2c25]">{title}</legend>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {options.map((option) => (
          <button
            aria-pressed={selected === option.value}
            className={`rounded-lg border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] ${
              selected === option.value
                ? "border-[#145c42] bg-[#edf4ef] shadow-sm"
                : "border-[#dce4df] bg-white hover:border-[#145c42]"
            }`}
            key={option.value}
            name={name}
            onClick={() => onChoose(option.value)}
            type="button"
          >
            <span className="block font-semibold text-[#1f2c25]">{option.label}</span>
            {option.description ? <span className="mt-2 block text-sm leading-6 text-[#53635b]">{option.description}</span> : null}
          </button>
        ))}
      </div>
      {children}
      {error ? <p className="mt-3 text-sm font-semibold text-[#8a3b22]">{error}</p> : null}
    </fieldset>
  );
}

function ContactFields({
  data,
  errors,
  update,
}: {
  data: FormData;
  errors: Record<string, string>;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div>
      <h3 className="text-2xl font-semibold text-[#1f2c25]">How should we contact you?</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <TextField error={errors.firstName} label="First name" onChange={(value) => update("firstName", value)} value={data.firstName} />
        <TextField error={errors.lastName} label="Last name" onChange={(value) => update("lastName", value)} value={data.lastName} />
        <TextField error={errors.email} label="Email" onChange={(value) => update("email", value)} type="email" value={data.email} />
        <TextField error={errors.phone} label="Phone" onChange={(value) => update("phone", value)} type="tel" value={data.phone} />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ChoiceGrid
          error={errors.preferredContactMethod}
          name="preferredContactMethod"
          onChoose={(value) => update("preferredContactMethod", value)}
          options={contactMethods.map((item) => ({ value: item, label: item }))}
          selected={data.preferredContactMethod}
          title="Preferred contact method"
        />
        <ChoiceGrid
          error={errors.bestContactTime}
          name="bestContactTime"
          onChoose={(value) => update("bestContactTime", value)}
          options={contactTimes.map((item) => ({ value: item, label: item }))}
          selected={data.bestContactTime}
          title="Best time to contact"
        />
      </div>
    </div>
  );
}

function DetailsFields({
  data,
  update,
}: {
  data: FormData;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div>
      <h3 className="text-2xl font-semibold text-[#1f2c25]">Add helpful context.</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <TextField label="Insurance provider (optional)" onChange={(value) => update("insuranceProvider", value)} value={data.insuranceProvider} />
        <TextField
          label="Preferred appointment timeframe (optional)"
          onChange={(value) => update("preferredAppointmentTimeframe", value)}
          value={data.preferredAppointmentTimeframe}
        />
      </div>
      <label className="mt-5 block">
        <span className="text-sm font-semibold text-[#1f2c25]">Message</span>
        <textarea
          className="mt-2 min-h-40 w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 text-sm leading-6 text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
          onChange={(event) => update("message", event.target.value)}
          placeholder={placeholder(data.contactReason)}
          value={data.message}
        />
      </label>
      <TextField
        label="How did you hear about us? (optional)"
        onChange={(value) => update("referralSource", value)}
        value={data.referralSource}
      />
    </div>
  );
}

function ReviewStep({
  data,
  errors,
  update,
}: {
  data: FormData;
  errors: Record<string, string>;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  const rows = [
    ["Reason for contact", data.contactReason],
    ["Patient status", data.patientStatus],
    ["Treatment interest", data.treatmentInterest || "Not provided"],
    ["Preferred location", data.preferredLocation],
    ["Name", `${data.firstName} ${data.lastName}`],
    ["Email", data.email || "Not provided"],
    ["Phone", data.phone || "Not provided"],
    ["Preferred contact method", data.preferredContactMethod],
    ["Best contact time", data.bestContactTime],
    ["Insurance provider", data.insuranceProvider || "Not provided"],
    ["Message", data.message || "Not provided"],
  ];

  return (
    <div>
      <h3 className="text-2xl font-semibold text-[#1f2c25]">Review before submitting.</h3>
      <dl className="mt-5 grid gap-3">
        {rows.map(([label, value]) => (
          <div className="rounded-lg border border-[#dce4df] bg-[#f8fbf9] p-4" key={label}>
            <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[#66756d]">{label}</dt>
            <dd className="mt-1 text-sm leading-6 text-[#1f2c25]">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 grid gap-3">
        <Checkbox
          checked={data.emergencyAcknowledgement}
          error={errors.emergencyAcknowledgement}
          label="I understand this form is not for emergencies."
          onChange={(value) => update("emergencyAcknowledgement", value)}
        />
        <Checkbox
          checked={data.contactConsent}
          error={errors.contactConsent}
          label="I understand JourneyLite will contact me using the information I provided."
          onChange={(value) => update("contactConsent", value)}
        />
        <Checkbox
          checked={data.textConsent}
          label="Optional: I agree to receive text messages if legally approved and appropriate for my request."
          onChange={(value) => update("textConsent", value)}
        />
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#1f2c25]">{label}</span>
      <input
        className="mt-2 w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 text-sm text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
      {error ? <span className="mt-2 block text-sm font-semibold text-[#8a3b22]">{error}</span> : null}
    </label>
  );
}

function Checkbox({
  checked,
  label,
  onChange,
  error,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
  error?: string;
}) {
  return (
    <label className="rounded-lg border border-[#dce4df] bg-white p-4 text-sm leading-6 text-[#53635b]">
      <span className="flex gap-3">
        <input
          checked={checked}
          className="mt-1 h-4 w-4 accent-[#145c42]"
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span>{label}</span>
      </span>
      {error ? <span className="mt-2 block font-semibold text-[#8a3b22]">{error}</span> : null}
    </label>
  );
}

export function ContactInternalLinks() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[
        ["Surgical Options", "/#surgical"],
        ["Gastric Sleeve", "/services/gastric-sleeve"],
        ["Gastric Bypass", "/services/gastric-bypass"],
        ["Gastric Balloon", "/services/gastric-balloon"],
        ["Prescription Medications", "/services/prescription-weight-loss-medications"],
        ["Pricing & Financing", "/services/pricing-financing"],
        ["Locations", "/#locations"],
        ["Compare Options", "/services/compare-weight-loss-options"],
      ].map(([label, href]) => (
        <Link
          className="rounded-lg border border-[#dce4df] bg-white p-4 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
          href={href}
          key={label}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

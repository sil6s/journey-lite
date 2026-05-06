"use client";

import { useRef, useState } from "react";
import { CTAButton } from "../components/marketing";

type FormData = {
  contactReason: string;
  contactSubreason: string;
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
  contactSubreason: "",
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
  ["consultation", "Request a consultation"],
  ["pricing", "Pricing or financing"],
  ["insurance", "Insurance question"],
  ["surgical", "Surgical weight loss"],
  ["non-surgical", "Non-surgical procedure"],
  ["medication", "Prescription weight loss medication"],
  ["existing", "Existing patient question"],
  ["general", "General question"],
];

const subreasonOptions: Record<string, string[]> = {
  consultation: ["Compare options", "Surgery consultation", "Medication consultation", "Balloon consultation", "Not sure yet"],
  pricing: ["Self-pay pricing", "Financing", "Surgery cost", "Medication cost", "Balloon cost"],
  insurance: ["Surgery coverage", "Medication coverage", "Benefit requirements", "Prior authorization", "Not sure"],
  surgical: ["Gastric sleeve", "Gastric bypass", "SADI surgery", "Lap Band", "Revision surgery"],
  "non-surgical": ["Gastric balloon", "Spatz balloon", "Allurion balloon", "Compare non-surgical options"],
  medication: ["Injectable medication", "Oral medication", "GLP-1 questions", "Medication pricing", "Eligibility"],
  existing: ["Appointment question", "Billing question", "Follow-up question", "Non-urgent clinical question"],
  general: ["Location question", "Provider question", "Records question", "Other"],
};

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

function needsLocation(reason: string) {
  return ["consultation", "pricing", "insurance", "medication", "surgical", "non-surgical", "existing"].includes(reason);
}

function needsInsurance(reason: string) {
  return ["insurance", "pricing", "consultation"].includes(reason);
}

function needsTimeframe(reason: string) {
  return ["consultation", "medication", "surgical", "non-surgical"].includes(reason);
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

  const steps = ["reason", "subreason", "contact", "details", "review"];
  const safeStep = Math.min(step, steps.length - 1);
  const current = steps[safeStep] ?? steps[0];
  const progress = Math.round(((safeStep + 1) / steps.length) * 100);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function chooseReason(reason: string) {
    setData((prev) => ({ ...prev, contactReason: reason, contactSubreason: "" }));
    setErrors((prev) => ({ ...prev, contactReason: "", contactSubreason: "" }));
  }

  function validateCurrent() {
    const nextErrors: Record<string, string> = {};
    if (current === "reason" && !data.contactReason) nextErrors.contactReason = "Choose a reason for contact.";
    if (current === "subreason" && !data.contactSubreason) nextErrors.contactSubreason = "Choose the closest match.";
    if (current === "contact") {
      if (!data.firstName.trim()) nextErrors.firstName = "First name is required.";
      if (!data.lastName.trim()) nextErrors.lastName = "Last name is required.";
      if (!data.email.trim() && !data.phone.trim()) nextErrors.email = "Provide an email or phone number.";
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) nextErrors.email = "Enter a valid email address.";
      if (data.phone && data.phone.replace(/\D/g, "").length < 10) nextErrors.phone = "Enter a valid phone number.";
      if (!data.preferredContactMethod) nextErrors.preferredContactMethod = "Choose a preferred contact method.";
    }
    if (current === "details") {
      if (needsTreatment(data.contactReason) && !data.treatmentInterest) nextErrors.treatmentInterest = "Choose a service interest.";
      if (needsLocation(data.contactReason) && !data.preferredLocation) nextErrors.preferredLocation = "Choose a preferred location.";
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
    <div className="mx-auto max-w-4xl">
      <section className="scroll-mt-28 rounded-xl border border-[#dce4df] bg-white p-5 shadow-xl shadow-[#20372b]/8 lg:p-8" id="contact-form" ref={formRef}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Contact JourneyLite</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#1f2c25]">Tell us what you need.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#53635b]">
              Choose the reason for your message and we&apos;ll route it to the right JourneyLite team member.
            </p>
            <p className="mt-2 text-xs font-semibold leading-5 text-[#8a3b22]">
              For urgent medical concerns, call the office directly or seek emergency care.
            </p>
          </div>
          <p className="text-sm font-semibold text-[#53635b]">
            Step {safeStep + 1} of {steps.length}: {labelForStep(current)}
          </p>
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#edf4ef]" aria-hidden="true">
          <div className="h-full rounded-full bg-[#145c42] transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-8">
          {current === "reason" ? (
            <div>
              <CardChoiceGroup
                error={errors.contactReason}
                label="What can we help you with?"
                onChange={chooseReason}
                options={reasonOptions.map(([value, label]) => ({ value, label }))}
                value={data.contactReason}
              />
            </div>
          ) : null}

          {current === "subreason" ? (
            <CardChoiceGroup
              error={errors.contactSubreason}
              label="Which best matches your request?"
              onChange={(value) => update("contactSubreason", value)}
              options={(subreasonOptions[data.contactReason] ?? []).map((item) => ({ value: item, label: item }))}
              value={data.contactSubreason}
            />
          ) : null}

          {current === "contact" ? (
            <ContactFields data={data} errors={errors} update={update} />
          ) : null}

          {current === "details" ? (
            <DetailsFields data={data} errors={errors} update={update} />
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

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#cbd7d0] bg-white px-5 py-3 text-sm font-semibold text-[#17362a] transition hover:border-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={safeStep === 0}
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
            {current === "review" ? "Send Request" : "Continue"}
          </button>
        </div>
      </section>
    </div>
  );
}

function labelForStep(step: string) {
  const labels: Record<string, string> = {
    reason: "Reason for contact",
    subreason: "Request type",
    contact: "Contact information",
    details: "Details",
    review: "Review and submit",
  };
  return labels[step] ?? step;
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
      <h3 className="text-2xl font-semibold text-[#1f2c25]">Contact information</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <TextField error={errors.firstName} label="First name" onChange={(value) => update("firstName", value)} value={data.firstName} />
        <TextField error={errors.lastName} label="Last name" onChange={(value) => update("lastName", value)} value={data.lastName} />
        <TextField error={errors.email} label="Email" onChange={(value) => update("email", value)} type="email" value={data.email} />
        <TextField error={errors.phone} label="Phone" onChange={(value) => update("phone", value)} type="tel" value={data.phone} />
      </div>
      <RadioGroup
        error={errors.preferredContactMethod}
        label="Preferred contact method"
        onChange={(value) => update("preferredContactMethod", value)}
        options={contactMethods}
        value={data.preferredContactMethod}
      />
    </div>
  );
}

function DetailsFields({
  data,
  errors,
  update,
}: {
  data: FormData;
  errors: Record<string, string>;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  const showLocation = needsLocation(data.contactReason);
  const showTreatment = needsTreatment(data.contactReason);
  const showInsurance = needsInsurance(data.contactReason);
  const showTimeframe = needsTimeframe(data.contactReason);

  return (
    <div>
      <h3 className="text-2xl font-semibold text-[#1f2c25]">Details</h3>
      <div className="mt-5 grid gap-4">
        {showLocation ? (
          <SelectField
            error={errors.preferredLocation}
            label="Location preference"
            onChange={(value) => update("preferredLocation", value)}
            options={locations.map((loc) => ({ value: loc.label, label: loc.label }))}
            placeholder="Choose a location"
            value={data.preferredLocation}
          />
        ) : null}
        {showTreatment ? (
          <SelectField
            error={errors.treatmentInterest}
            label="Service interest"
            onChange={(value) => update("treatmentInterest", value)}
            options={treatmentOptions.map((item) => ({ value: item, label: item }))}
            placeholder="Choose a service"
            value={data.treatmentInterest}
          />
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          {showInsurance ? (
            <TextField label="Insurance provider (optional)" onChange={(value) => update("insuranceProvider", value)} value={data.insuranceProvider} />
          ) : null}
          {showTimeframe ? (
            <TextField
              label="Preferred appointment timeframe (optional)"
              onChange={(value) => update("preferredAppointmentTimeframe", value)}
              value={data.preferredAppointmentTimeframe}
            />
          ) : null}
          <SelectField
            label="Best time to contact (optional)"
            onChange={(value) => update("bestContactTime", value)}
            options={contactTimes.map((item) => ({ value: item, label: item }))}
            placeholder="No preference"
            value={data.bestContactTime}
          />
        </div>
      </div>
      <label className="mt-5 block">
        <span className="text-sm font-semibold text-[#1f2c25]">Message</span>
        <textarea
          className="mt-2 min-h-32 w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 text-sm leading-6 text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
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
    ["Reason for contact", labelForReason(data.contactReason)],
    ["Request type", data.contactSubreason],
    ["Service interest", data.treatmentInterest],
    ["Preferred location", data.preferredLocation],
    ["Name", `${data.firstName} ${data.lastName}`],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Preferred contact method", data.preferredContactMethod],
    ["Best contact time", data.bestContactTime],
    ["Insurance provider", data.insuranceProvider],
    ["Message", data.message],
  ].filter(([, value]) => value && value !== " ");

  return (
    <div>
      <h3 className="text-2xl font-semibold text-[#1f2c25]">Review and submit</h3>
      <dl className="mt-5 grid gap-3">
        {rows.map(([label, value]) => (
          <div className="rounded-lg border border-[#dce4df] bg-[#fafbf9] p-4" key={label}>
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

function labelForReason(reason: string) {
  return reasonOptions.find(([value]) => value === reason)?.[1] ?? reason;
}

function CardChoiceGroup({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="text-lg font-semibold text-[#1f2c25]">{label}</legend>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {options.map((option) => (
          <button
            aria-pressed={value === option.value}
            className={`min-h-12 rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] ${
              value === option.value
                ? "border-[#145c42] bg-[#edf4ef] text-[#145c42] shadow-sm"
                : "border-[#dce4df] bg-white text-[#1f2c25] hover:border-[#145c42]"
            }`}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
      {error ? <p className="mt-3 text-sm font-semibold text-[#8a3b22]">{error}</p> : null}
    </fieldset>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#1f2c25]">{label}</span>
      <select
        className="mt-2 w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 text-sm text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="mt-2 block text-sm font-semibold text-[#8a3b22]">{error}</span> : null}
    </label>
  );
}

function RadioGroup({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-semibold text-[#1f2c25]">{label}</legend>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {options.map((option) => (
          <label
            className={`inline-flex min-h-10 items-center rounded-md border px-3 py-2 text-sm font-semibold ${
              value === option ? "border-[#145c42] bg-[#edf4ef] text-[#145c42]" : "border-[#dce4df] bg-white text-[#53635b]"
            }`}
            key={option}
          >
            <input
              checked={value === option}
              className="mr-2 accent-[#145c42]"
              onChange={() => onChange(option)}
              type="radio"
            />
            {option}
          </label>
        ))}
      </div>
      {error ? <p className="mt-2 text-sm font-semibold text-[#8a3b22]">{error}</p> : null}
    </fieldset>
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

"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { CTAButton } from "../components/marketing";
import { useConsult } from "@/components/site/consult-context";

const GEOAPIFY_KEY = "931a024ec98f486ba9cf392518f88d4c";

type FormData = {
  serviceInterest: string;
  preferredLocation: string;
  firstName: string;
  lastName: string;
  dob: string;
  heightFt: string;
  heightIn: string;
  weight: string;
  address: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  bestContactTime: string;
  insuranceProvider: string;
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
  serviceInterest: "",
  preferredLocation: "",
  firstName: "",
  lastName: "",
  dob: "",
  heightFt: "",
  heightIn: "",
  weight: "",
  address: "",
  email: "",
  phone: "",
  preferredContactMethod: "",
  bestContactTime: "",
  insuranceProvider: "",
  referralSource: "",
  message: "",
  emergencyAcknowledgement: false,
  contactConsent: false,
  textConsent: false,
  sourcePage: "contact",
  submittedAt: "",
  website: "",
};

const serviceOptions = [
  {
    value: "Surgical Weight Loss",
    label: "Surgical Weight Loss",
    desc: "Sleeve, bypass, SADI, or Lap Band",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M14.5 4.5l5 5m-5-5L5 14l-1.5 5.5L8 18l9-9.5m-2.5-4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "Gastric Balloon",
    label: "Gastric Balloon",
    desc: "Orbera, Spatz, or Allurion",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="10" r="7" />
        <path d="M12 17v4m-2 0h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "Medical Weight Loss",
    label: "Medical Weight Loss",
    desc: "GLP-1s, Wegovy, Zepbound, oral meds",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "Combination Surgical & Medical",
    label: "Surgical + Medical",
    desc: "Surgery and medication together",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "Revision of Prior Weight Loss Surgery",
    label: "Revision Surgery",
    desc: "Revising a previous bariatric procedure",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "General Surgery",
    label: "General Surgery",
    desc: "Other surgical procedures",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "Pricing or Financing",
    label: "Pricing / Financing",
    desc: "Self-pay, insurance, or financing options",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "Insurance Question",
    label: "Insurance",
    desc: "Coverage, requirements, or authorization",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "Existing Patient Question",
    label: "Existing Patient",
    desc: "Appointment, billing, or follow-up",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "General Question",
    label: "General Question",
    desc: "Location, records, or other",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const insuranceOptions = [
  { value: "Aetna", label: "Aetna", note: "An Aetna Institute of Quality for bariatric care.", logo: "/insurance-financing-logos/aetna.png" },
  { value: "Anthem/Blue Cross-Blue Shield", label: "Anthem / Blue Cross-Blue Shield", note: "A Blue Distinction Plus Center for bariatric surgery.", logo: "/insurance-financing-logos/Anthem-BCBS.svg" },
  { value: "Cigna", label: "Cigna", note: null, logo: "/insurance-financing-logos/cigna.png" },
  { value: "Humana", label: "Humana", note: null, logo: "/insurance-financing-logos/Humana.png" },
  { value: "Medical Mutual", label: "Medical Mutual", note: null, logo: "/insurance-financing-logos/MedicalMutual.png" },
  { value: "Surgery Plus", label: "Surgery Plus", note: null, logo: "/insurance-financing-logos/LanternCare-SurgeryPlus.png" },
  { value: "Transcarent", label: "Transcarent", note: null, logo: "/insurance-financing-logos/transcarent.png" },
  { value: "United Healthcare", label: "United Healthcare", note: "An Optum Center of Excellence for weight loss surgery.", logo: "/insurance-financing-logos/UnitedHealthcare.png" },
  { value: "Self Pay / No Insurance", label: "Self Pay / No Insurance", note: null, logo: null },
  { value: "Other", label: "Other / Not Listed", note: "If you don't see your carrier, check with us — we may still be in network.", logo: null },
];

const locations = [
  "Cincinnati Main Office & Surgery Center",
  "Columbus / Grove City",
  "Dayton / Moraine",
  "Indianapolis / Greenwood",
  "Northern Kentucky / Crestview Hills",
  "Not sure yet",
];

const contactMethods = ["Phone", "Email", "Text if legally approved"];
const contactTimes = ["Morning", "Afternoon", "Evening", "No preference"];

function computeBMI(heightFt: string, heightIn: string, weight: string): string {
  const ft = parseFloat(heightFt);
  const inches = parseFloat(heightIn) || 0;
  const lbs = parseFloat(weight);
  if (!ft || !lbs) return "";
  const totalIn = ft * 12 + inches;
  return ((lbs / (totalIn * totalIn)) * 703).toFixed(1);
}

const steps = ["service", "contact", "measurements", "insurance", "message"] as const;
type Step = (typeof steps)[number];

const stepLabels: Record<Step, string> = {
  service: "Service of interest",
  contact: "Contact information",
  measurements: "Health information",
  insurance: "Insurance",
  message: "Message & consent",
};

export function ContactExperience() {
  const { openOverlay } = useConsult();
  const [data, setData] = useState<FormData>(initialData);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const safeStep = Math.min(step, steps.length - 1);
  const current = steps[safeStep] as Step;
  const progress = Math.round(((safeStep + 1) / steps.length) * 100);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validateCurrent() {
    const e: Record<string, string> = {};
    if (current === "service" && !data.serviceInterest) e.serviceInterest = "Choose a service or topic.";
    if (current === "contact") {
      if (!data.firstName.trim()) e.firstName = "First name is required.";
      if (!data.lastName.trim()) e.lastName = "Last name is required.";
      if (!data.email.trim() && !data.phone.trim()) e.email = "Provide an email or phone number.";
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Enter a valid email address.";
      if (data.phone && data.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a valid phone number.";
      if (!data.preferredContactMethod) e.preferredContactMethod = "Choose a preferred contact method.";
    }
    if (current === "message") {
      if (!data.emergencyAcknowledgement) e.emergencyAcknowledgement = "Confirm this is not for emergencies.";
      if (!data.contactConsent) e.contactConsent = "Confirm JourneyLite may contact you.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goNext() {
    if (!validateCurrent()) return;
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goBack() {
    setStep((prev) => Math.max(prev - 1, 0));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit() {
    if (!validateCurrent()) return;
    if (data.website) return;
    const submittedAt = new Date().toISOString();
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          dob: data.dob,
          heightFt: data.heightFt,
          heightIn: data.heightIn,
          weight: data.weight,
          bmi: computeBMI(data.heightFt, data.heightIn, data.weight),
          address: data.address,
          insuranceProvider: data.insuranceProvider,
          referralSource: data.referralSource,
          treatmentInterest: data.serviceInterest,
          appointmentInterest: data.serviceInterest,
          location: data.preferredLocation,
          bestTime: data.bestContactTime,
          preferredContactMethod: data.preferredContactMethod,
          message: data.message,
          textConsent: data.textConsent,
          sourcePage: data.sourcePage,
          website: data.website,
          submittedAt,
        }),
      });
    } catch {
      // non-fatal
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="rounded-2xl border border-[#cbd9d1] bg-white p-6 shadow-xl shadow-[#20372b]/8 lg:p-8">
        <p className="eyebrow">Request received</p>
        <h2 className="mt-3 font-serif text-4xl leading-tight text-[#1f2c25]">Thank you for contacting JourneyLite.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-[#53635b]">
          A member of our team will reach out using the contact information you provided. For urgent concerns, call us
          directly. For emergencies, call 911.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <CTAButton href="tel:+18774422263">Call 877-442-2263</CTAButton>
          <CTAButton href="/services/compare-weight-loss-options" variant="secondary">Compare Options</CTAButton>
          <CTAButton href="/services/pricing-financing" variant="secondary">Pricing &amp; Financing</CTAButton>
        </div>
      </section>
    );
  }

  return (
    <section
      className="scroll-mt-28 rounded-xl border border-[#dce4df] bg-white p-5 shadow-xl shadow-[#20372b]/8 lg:p-8"
      id="contact-form"
      ref={formRef}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Contact JourneyLite</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#1f2c25]">
            {step === 0 ? "What can we help you with?" : stepLabels[current]}
          </h2>
        </div>
        <p className="shrink-0 text-sm font-semibold text-[#66756d]">
          Step {safeStep + 1} of {steps.length}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#edf4ef]" aria-hidden="true">
        <div className="h-full rounded-full bg-[#145c42] transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Step pills */}
      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              i < safeStep
                ? "bg-[#145c42] text-white"
                : i === safeStep
                  ? "bg-[#edf4ef] text-[#145c42] ring-1 ring-[#145c42]"
                  : "bg-[#f3f5f4] text-[#8fa09a]"
            }`}
            key={s}
          >
            {i < safeStep ? "✓ " : ""}{stepLabels[s]}
          </span>
        ))}
      </div>

      {/* Step content */}
      <div className="mt-7">
        {current === "service" && (
          <ServiceStep
            data={data}
            error={errors.serviceInterest}
            onOpenOverlay={() => openOverlay()}
            update={update}
          />
        )}
        {current === "contact" && <ContactStep data={data} errors={errors} update={update} />}
        {current === "measurements" && <MeasurementsStep data={data} update={update} />}
        {current === "insurance" && <InsuranceStep data={data} update={update} />}
        {current === "message" && <MessageStep data={data} errors={errors} update={update} />}
      </div>

      {/* Honeypot */}
      <input
        aria-hidden="true"
        autoComplete="off"
        className="hidden"
        name="website"
        onChange={(e) => update("website", e.target.value)}
        tabIndex={-1}
        value={data.website}
      />

      {/* Navigation */}
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
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#145c42] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2"
          onClick={current === "message" ? submit : goNext}
          type="button"
        >
          {current === "message" ? "Send Request" : "Continue"}
        </button>
      </div>
    </section>
  );
}

/* ─── Step 1: Service of interest ───────────────────────── */

function ServiceStep({
  data,
  error,
  onOpenOverlay,
  update,
}: {
  data: FormData;
  error?: string;
  onOpenOverlay: () => void;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div className="grid gap-6">
      {/* Quick-book strip */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#c8ddd4] bg-[#f0f8f4] p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[#355346]">
          Want to book a consultation or info request directly?
        </p>
        <button
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-[#145c42] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f4d37]"
          onClick={onOpenOverlay}
          type="button"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Quick Book
        </button>
      </div>

      {/* Service grid */}
      <div>
        <p className="text-sm font-semibold text-[#1f2c25]">Or tell us what you&apos;re interested in:</p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceOptions.map((opt) => {
            const selected = data.serviceInterest === opt.value;
            return (
              <button
                aria-pressed={selected}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] ${
                  selected
                    ? "border-[#145c42] bg-[#edf4ef] shadow-sm"
                    : "border-[#dce4df] bg-white hover:border-[#9bbfb0] hover:bg-[#fafcfb]"
                }`}
                key={opt.value}
                onClick={() => update("serviceInterest", opt.value)}
                type="button"
              >
                <span className={`mt-0.5 shrink-0 ${selected ? "text-[#145c42]" : "text-[#66756d]"}`}>
                  {opt.icon}
                </span>
                <span>
                  <span className={`block text-sm font-semibold leading-5 ${selected ? "text-[#145c42]" : "text-[#1f2c25]"}`}>
                    {opt.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-[#66756d]">{opt.desc}</span>
                </span>
                {selected && (
                  <svg className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-[#145c42]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        {error && <p className="mt-3 text-sm font-semibold text-[#8a3b22]">{error}</p>}
      </div>
    </div>
  );
}

/* ─── Step 2: Contact information ────────────────────────── */

interface GeoapifySuggestion {
  formatted: string;
  line1: string;
  city: string;
  state: string;
}

function AddressAutocomplete({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [suggestions, setSuggestions] = useState<GeoapifySuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleInput(text: string) {
    onChange(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 3) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&filter=countrycode:us&limit=5&apiKey=${GEOAPIFY_KEY}`
        );
        const json = (await res.json()) as {
          features: { properties: { formatted: string; address_line1: string; city: string; state: string } }[];
        };
        setSuggestions(json.features.map((f) => ({
          formatted: f.properties.formatted,
          line1: f.properties.address_line1 ?? f.properties.formatted,
          city: f.properties.city ?? "",
          state: f.properties.state ?? "",
        })));
        setOpen(true);
      } catch { setSuggestions([]); }
    }, 300);
  }

  return (
    <div className="relative">
      <input
        autoComplete="off"
        className="mt-2 w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 text-sm text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
        onChange={(e) => handleInput(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
        placeholder="Start typing your street address…"
        value={value}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-[#dce4df] bg-white shadow-xl">
          {suggestions.map((s, i) => (
            <li
              className="cursor-pointer border-b border-[#f0f3f1] px-4 py-3 text-sm last:border-0 hover:bg-[#f0f7f3]"
              key={i}
              onMouseDown={() => { onChange(s.formatted); setSuggestions([]); setOpen(false); }}
            >
              <span className="font-medium text-[#1f2c25]">{s.line1}</span>
              {s.city && <span className="ml-1.5 text-[#66756d]">{s.city}{s.state ? `, ${s.state}` : ""}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ContactStep({
  data,
  errors,
  update,
}: {
  data: FormData;
  errors: Record<string, string>;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <TextField error={errors.firstName} label="First name" onChange={(v) => update("firstName", v)} value={data.firstName} />
        <TextField error={errors.lastName} label="Last name" onChange={(v) => update("lastName", v)} value={data.lastName} />
        <TextField error={errors.email} label="Email" onChange={(v) => update("email", v)} type="email" value={data.email} />
        <TextField error={errors.phone} label="Phone" onChange={(v) => update("phone", v)} type="tel" value={data.phone} />
        <div className="md:col-span-2">
          <label className="block">
            <span className="text-sm font-semibold text-[#1f2c25]">
              Address <span className="font-normal text-[#66756d]">(optional)</span>
            </span>
            <AddressAutocomplete value={data.address} onChange={(v) => update("address", v)} />
          </label>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <RadioGroup
          error={errors.preferredContactMethod}
          label="Preferred contact method"
          onChange={(v) => update("preferredContactMethod", v)}
          options={contactMethods}
          value={data.preferredContactMethod}
        />
        <RadioGroup
          label="Best time to reach you"
          onChange={(v) => update("bestContactTime", v)}
          options={contactTimes}
          value={data.bestContactTime}
        />
      </div>
    </div>
  );
}

/* ─── Step 3: Measurements + BMI ─────────────────────────── */

const GAUGE_MIN = 15;
const GAUGE_MAX = 55;

function bmiPercent(n: number) {
  return Math.min(100, Math.max(0, ((n - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100));
}

function bmiMeta(n: number) {
  if (n < 18.5) return { category: "Underweight", color: "#3b82f6" };
  if (n < 25) return { category: "Normal weight", color: "#22c55e" };
  if (n < 30) return { category: "Overweight", color: "#f59e0b" };
  if (n < 35) return { category: "Obese — Class I", color: "#f97316" };
  if (n < 40) return { category: "Obese — Class II", color: "#ef4444" };
  return { category: "Obese — Class III", color: "#b91c1c" };
}

function MeasurementsStep({
  data,
  update,
}: {
  data: FormData;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  const bmi = computeBMI(data.heightFt, data.heightIn, data.weight);
  const bmiNum = parseFloat(bmi);
  const bmiPct = bmiNum ? bmiPercent(bmiNum) : null;
  const { category, color } = bmiNum ? bmiMeta(bmiNum) : { category: "", color: "#145c42" };

  return (
    <div className="grid gap-7">
      <p className="text-sm leading-6 text-[#53635b]">
        All optional — helps us prepare for your consultation and verify insurance eligibility.
      </p>

      {/* DOB */}
      <TextField label="Date of birth (optional)" onChange={(v) => update("dob", v)} type="date" value={data.dob} />

      {/* Height */}
      <div>
        <span className="text-sm font-semibold text-[#1f2c25]">
          Height <span className="font-normal text-[#66756d]">(optional)</span>
        </span>
        <div className="mt-2 flex gap-3">
          <div className="relative flex-1">
            <input
              className="w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 pr-10 text-sm text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
              max="8" min="3" onChange={(e) => update("heightFt", e.target.value)}
              placeholder="5" type="number" value={data.heightFt}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#66756d]">ft</span>
          </div>
          <div className="relative flex-1">
            <input
              className="w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 pr-10 text-sm text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
              max="11" min="0" onChange={(e) => update("heightIn", e.target.value)}
              placeholder="8" type="number" value={data.heightIn}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#66756d]">in</span>
          </div>
        </div>
      </div>

      {/* Weight */}
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-[#1f2c25]">
            Weight <span className="font-normal text-[#66756d]">(optional)</span>
          </span>
          {data.weight && (
            <span className="text-2xl font-bold text-[#145c42]">
              {data.weight} <span className="text-sm font-semibold text-[#66756d]">lbs</span>
            </span>
          )}
        </div>
        <input
          className="mt-3 w-full cursor-pointer accent-[#145c42]"
          max="600" min="80"
          onChange={(e) => update("weight", e.target.value)}
          step="1" type="range" value={data.weight || "200"}
        />
        <div className="mt-1 flex justify-between text-xs text-[#66756d]">
          <span>80 lbs</span>
          <span>600 lbs</span>
        </div>
        <div className="relative mt-3">
          <input
            className="w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 pr-14 text-sm text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
            onChange={(e) => update("weight", e.target.value)}
            placeholder="Or type exact weight…"
            type="number" value={data.weight}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#66756d]">lbs</span>
        </div>
      </div>

      {/* BMI result */}
      {bmi && bmiPct !== null && (
        <div className="overflow-hidden rounded-2xl border border-[#dce4df] bg-white shadow-sm">
          <div className="flex flex-wrap items-end gap-4 px-6 pt-6 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#66756d]">Your BMI</p>
              <p className="mt-1 text-6xl font-bold leading-none tabular-nums" style={{ color }}>{bmi}</p>
            </div>
            <span
              className="mb-1.5 inline-block rounded-full px-4 py-1.5 text-sm font-bold text-white shadow-sm"
              style={{ background: color }}
            >
              {category}
            </span>
          </div>

          {/* Gauge */}
          <div className="px-6 pb-6">
            <div
              className="relative h-4 overflow-visible rounded-full"
              style={{
                background: `linear-gradient(to right,
                  #3b82f6 0%,    #3b82f6 8.75%,
                  #22c55e 8.75%, #22c55e 25%,
                  #f59e0b 25%,   #f59e0b 37.5%,
                  #f97316 37.5%, #f97316 50%,
                  #ef4444 50%,   #ef4444 62.5%,
                  #b91c1c 62.5%, #b91c1c 100%)`,
              }}
            >
              {/* Marker */}
              <div
                className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg ring-2 transition-all duration-300"
                style={{ left: `${bmiPct}%`, background: color }}
              />
            </div>
            <div className="mt-3 flex justify-between text-xs font-medium text-[#66756d]">
              <span>Underweight</span>
              <span>Normal</span>
              <span>Overweight</span>
              <span>Obese</span>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#8fa09a]">
              BMI is used as an initial screening tool. Your care team will evaluate your complete health history.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Step 4: Insurance ───────────────────────────────────── */

function InsuranceStep({
  data,
  update,
}: {
  data: FormData;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  const predefinedValues = insuranceOptions.slice(0, -1).map((o) => o.value);
  const isOtherSelected = !!data.insuranceProvider && !predefinedValues.includes(data.insuranceProvider);
  const [otherText, setOtherText] = useState(isOtherSelected ? data.insuranceProvider : "");
  const activeCard = isOtherSelected ? "Other" : data.insuranceProvider;

  function handleCardClick(value: string) {
    if (value === "Other") {
      update("insuranceProvider", otherText || "Other");
    } else {
      update("insuranceProvider", value);
      setOtherText("");
    }
  }

  return (
    <div className="grid gap-6">
      <p className="text-sm leading-6 text-[#53635b]">
        Optional — select your insurance carrier so we can check coverage before your first visit. You can skip this and discuss at your consultation.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {insuranceOptions.map((option) => {
          const selected = activeCard === option.value;
          return (
            <button
              aria-pressed={selected}
              className={`rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] ${
                selected
                  ? "border-[#145c42] bg-[#edf4ef] shadow-sm"
                  : "border-[#dce4df] bg-white hover:border-[#9bbfb0]"
              }`}
              key={option.value}
              onClick={() => handleCardClick(option.value)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {option.logo && (
                    <div className="mb-2 flex h-7 items-center">
                      <Image
                        alt={option.label}
                        className="max-h-7 w-auto object-contain"
                        height={28}
                        src={option.logo}
                        style={{ maxWidth: 110 }}
                        unoptimized
                        width={110}
                      />
                    </div>
                  )}
                  <span className={`text-sm font-semibold leading-5 ${selected ? "text-[#145c42]" : "text-[#1f2c25]"}`}>
                    {option.label}
                  </span>
                  {option.note && (
                    <p className="mt-1 text-xs leading-5 text-[#66756d]">{option.note}</p>
                  )}
                </div>
                {selected && (
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#145c42]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {activeCard === "Other" && (
        <label className="block">
          <span className="text-sm font-semibold text-[#1f2c25]">Name your insurance carrier</span>
          <input
            autoFocus
            className="mt-2 w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 text-sm text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
            onChange={(e) => {
              setOtherText(e.target.value);
              update("insuranceProvider", e.target.value || "Other");
            }}
            placeholder="Your insurance carrier"
            value={otherText}
          />
        </label>
      )}
    </div>
  );
}

/* ─── Step 5: Message + consent ──────────────────────────── */

function MessageStep({
  data,
  errors,
  update,
}: {
  data: FormData;
  errors: Record<string, string>;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div className="grid gap-6">
      {/* Location */}
      <SelectField
        label="Preferred location (optional)"
        onChange={(v) => update("preferredLocation", v)}
        options={locations.map((l) => ({ value: l, label: l }))}
        placeholder="No preference"
        value={data.preferredLocation}
      />

      {/* Message */}
      <label className="block">
        <span className="text-sm font-semibold text-[#1f2c25]">
          Comments or questions <span className="font-normal text-[#66756d]">(optional)</span>
        </span>
        <textarea
          className="mt-2 min-h-36 w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 text-sm leading-6 text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
          onChange={(e) => update("message", e.target.value)}
          placeholder="Share any questions, goals, or context that would help us prepare for your consultation or route your request to the right team member…"
          value={data.message}
        />
      </label>

      {/* Referral */}
      <TextField
        label="How did you hear about us? (optional)"
        onChange={(v) => update("referralSource", v)}
        value={data.referralSource}
      />

      {/* Consent */}
      <div className="grid gap-3 border-t border-[#e8eeea] pt-5">
        <p className="text-sm font-semibold text-[#1f2c25]">Before you submit</p>
        <Checkbox
          checked={data.emergencyAcknowledgement}
          error={errors.emergencyAcknowledgement}
          label="I understand this form is not for medical emergencies. For emergencies I will call 911."
          onChange={(v) => update("emergencyAcknowledgement", v)}
        />
        <Checkbox
          checked={data.contactConsent}
          error={errors.contactConsent}
          label="I understand JourneyLite will contact me using the information I provided."
          onChange={(v) => update("contactConsent", v)}
        />
        <Checkbox
          checked={data.textConsent}
          label="Optional: I agree to receive text messages from JourneyLite if legally approved."
          onChange={(v) => update("textConsent", v)}
        />
      </div>
    </div>
  );
}

/* ─── UI primitives ──────────────────────────────────────── */

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
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <span className="mt-2 block text-sm font-semibold text-[#8a3b22]">{error}</span>}
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
    <fieldset>
      <legend className="text-sm font-semibold text-[#1f2c25]">{label}</legend>
      <div className="mt-3 flex flex-col gap-2">
        {options.map((option) => (
          <label
            className={`inline-flex min-h-10 cursor-pointer items-center rounded-md border px-3 py-2 text-sm font-semibold ${
              value === option ? "border-[#145c42] bg-[#edf4ef] text-[#145c42]" : "border-[#dce4df] bg-white text-[#53635b]"
            }`}
            key={option}
          >
            <input checked={value === option} className="mr-2 accent-[#145c42]" onChange={() => onChange(option)} type="radio" />
            {option}
          </label>
        ))}
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-[#8a3b22]">{error}</p>}
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
        onChange={(e) => onChange(e.target.value)}
        type={type}
        value={value}
      />
      {error && <span className="mt-2 block text-sm font-semibold text-[#8a3b22]">{error}</span>}
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
    <label className="cursor-pointer rounded-lg border border-[#dce4df] bg-white p-4 text-sm leading-6 text-[#53635b]">
      <span className="flex gap-3">
        <input checked={checked} className="mt-1 h-4 w-4 shrink-0 accent-[#145c42]" onChange={(e) => onChange(e.target.checked)} type="checkbox" />
        <span>{label}</span>
      </span>
      {error && <span className="mt-2 block font-semibold text-[#8a3b22]">{error}</span>}
    </label>
  );
}

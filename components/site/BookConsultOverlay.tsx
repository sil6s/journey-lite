"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useConsult } from "./consult-context";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const treatmentCategories = [
  {
    value: "Surgical procedure",
    label: "Surgical",
    icon: "◆",
    examples: ["Gastric Sleeve (VSG)", "Gastric Bypass", "SADI Surgery", "Lap Band", "Band Revision", "Sleeve Revision"],
  },
  {
    value: "Non-surgical procedure",
    label: "Non-Surgical",
    icon: "●",
    examples: ["Gastric Balloon", "Spatz Adjustable Balloon", "Endoscopic Sleeve"],
  },
  {
    value: "Prescription medication",
    label: "Prescription",
    icon: "✦",
    examples: ["Wegovy / Semaglutide", "Zepbound / Tirzepatide", "Phentermine", "Qsymia", "Contrave"],
  },
];

const locations = [
  "Cincinnati / Crestview Hills, KY",
  "Columbus / Grove City, OH",
  "Dayton / Moraine, OH",
  "Indianapolis / Greenwood, IN",
  "Not sure — let's discuss",
];

// window.grecaptcha type is declared in types/recaptcha-enterprise.d.ts

async function getRecaptchaToken(action: string): Promise<string> {
  if (!SITE_KEY || typeof window === "undefined" || !window.grecaptcha?.enterprise) return "";
  return new Promise((resolve) => {
    window.grecaptcha.enterprise.ready(async () => {
      try {
        const token = await window.grecaptcha.enterprise.execute(SITE_KEY, { action });
        resolve(token);
      } catch {
        resolve("");
      }
    });
  });
}

type Step = "treatment" | "contact" | "submitting" | "done" | "error";

interface FormState {
  treatmentInterest: string;
  location: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bestTime: string;
  message: string;
  consent: boolean;
  website: string; // honeypot
}

export function BookConsultOverlay() {
  const { open, closeOverlay, prefill } = useConsult();
  const [step, setStep] = useState<Step>("treatment");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>({
    treatmentInterest: "",
    location: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bestTime: "",
    message: "",
    consent: false,
    website: "",
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Reset form when overlay opens
  useEffect(() => {
    if (!open) return;
    const resetTimer = window.setTimeout(() => {
      setStep("treatment");
      setErrors({});
      setForm((prev) => ({ ...prev, treatmentInterest: prefill.treatmentInterest ?? "", location: "" }));
      setTimeout(() => firstFocusableRef.current?.focus(), 80);
    }, 0);
    return () => window.clearTimeout(resetTimer);
  }, [open, prefill]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeOverlay();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeOverlay]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validateTreatment() {
    const e: Record<string, string> = {};
    if (!form.treatmentInterest) e.treatmentInterest = "Choose what you're interested in.";
    if (!form.location) e.location = "Choose a preferred location.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateContact() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.email.trim() && !form.phone.trim()) e.email = "Provide an email address or phone number.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (form.phone && form.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a valid 10-digit phone number.";
    if (!form.consent) e.consent = "Please confirm to continue.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validateContact()) return;
    if (form.website) return; // honeypot
    setStep("submitting");

    const recaptchaToken = await getRecaptchaToken("CONSULTATION_REQUEST");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          recaptchaToken,
          sourcePage: "book-consult-overlay",
          submittedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Submission failed.");
      }
      setStep("done");
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "Something went wrong. Please call us directly." });
      setStep("error");
    }
  }

  if (!open) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-stretch"
      role="dialog"
      aria-label="Book a consultation"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeOverlay}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative z-10 ml-auto flex h-full w-full max-w-5xl flex-col bg-white shadow-2xl lg:flex-row"
        style={{ animation: "slideInRight 0.28s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* Left branded column — desktop only */}
        <div className="hidden flex-col justify-between bg-[#0f3e2e] p-8 text-white lg:flex lg:w-[340px] xl:w-[380px] lg:flex-shrink-0">
          <div>
            <Image
              alt="JourneyLite Physicians"
              className="h-auto w-[160px] brightness-0 invert"
              height={60}
              src="/journeylite-logo.svg"
              width={400}
            />
            <div className="mt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#b9d2c5]">
                Start your weight loss journey
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight">
                Book a free consultation with JourneyLite.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#c8ddd5]">
                Our bariatric team will help you compare surgery, gastric balloon, and medication options based on your
                goals, BMI, and health history.
              </p>
            </div>
            <div className="mt-8 space-y-4">
              {[
                ["No commitment required", "A consultation is a conversation, not a commitment."],
                ["Multiple care options", "We offer surgical, non-surgical, and medication paths."],
                ["5 regional locations", "Ohio, Kentucky, and Indiana offices available."],
              ].map(([title, body]) => (
                <div className="flex gap-3" key={title}>
                  <span className="mt-0.5 flex-shrink-0 text-[#6aaa88]">✓</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-[#b9d2c5]">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 rounded-xl bg-white/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#b9d2c5]">Prefer to call?</p>
            <a
              className="mt-2 block text-xl font-bold text-white hover:text-[#a8d5bf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              href="tel:+18774422263"
            >
              877-442-2263
            </a>
            <p className="mt-1 text-xs text-[#a0bdb0]">Mon–Fri, 8am–5pm Eastern</p>
          </div>
        </div>

        {/* Right form column */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e8ede9] px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#145c42]">
                {step === "treatment" ? "Step 1 of 2" : step === "contact" || step === "submitting" || step === "error" ? "Step 2 of 2" : ""}
              </p>
              <p className="mt-0.5 text-base font-semibold text-[#1f2c25]">
                {step === "treatment" && "What are you interested in?"}
                {step === "contact" && "How can we reach you?"}
                {step === "submitting" && "Sending your request…"}
                {step === "done" && "Request received!"}
                {step === "error" && "Something went wrong"}
              </p>
            </div>
            <button
              ref={firstFocusableRef}
              aria-label="Close"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[#53635b] transition hover:bg-[#f0f5f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
              onClick={closeOverlay}
              type="button"
            >
              <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          {(step === "treatment" || step === "contact") && (
            <div className="h-1 bg-[#edf4ef]">
              <div
                className="h-full bg-[#145c42] transition-all duration-500"
                style={{ width: step === "treatment" ? "50%" : "100%" }}
              />
            </div>
          )}

          {/* Body */}
          <div className="flex-1 px-6 py-6 lg:px-8 lg:py-8">
            {/* Step 1: Treatment + Location */}
            {step === "treatment" && (
              <div>
                <fieldset>
                  <legend className="text-sm font-semibold text-[#1f2c25]">
                    What treatment are you interested in?
                  </legend>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {treatmentCategories.map((cat) => {
                      const selected = form.treatmentInterest === cat.value;
                      return (
                        <button
                          aria-pressed={selected}
                          className={`flex flex-col rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] ${
                            selected
                              ? "border-[#145c42] bg-[#edf4ef] shadow-sm"
                              : "border-[#dce4df] bg-white hover:border-[#145c42]"
                          }`}
                          key={cat.value}
                          onClick={() => update("treatmentInterest", cat.value)}
                          type="button"
                        >
                          <span className={`text-xl ${selected ? "text-[#145c42]" : "text-[#8aaa95]"}`}>
                            {cat.icon}
                          </span>
                          <span className="mt-2 text-base font-bold text-[#1f2c25]">{cat.label}</span>
                          <ul className="mt-3 space-y-1.5">
                            {cat.examples.map((ex) => (
                              <li key={ex} className="flex items-start gap-1.5 text-xs leading-4 text-[#53635b]">
                                <span className="mt-px flex-shrink-0 text-[#a0b8aa]">–</span>
                                {ex}
                              </li>
                            ))}
                          </ul>
                        </button>
                      );
                    })}
                  </div>
                  {errors.treatmentInterest && (
                    <p className="mt-2 text-sm font-semibold text-[#8a3b22]">{errors.treatmentInterest}</p>
                  )}
                </fieldset>

                <div className="mt-6">
                  <label className="block">
                    <span className="text-sm font-semibold text-[#1f2c25]">Preferred location</span>
                    <select
                      className="mt-2 w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 text-sm text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                      onChange={(e) => update("location", e.target.value)}
                      value={form.location}
                    >
                      <option value="">Choose a location</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                    {errors.location && (
                      <span className="mt-2 block text-sm font-semibold text-[#8a3b22]">{errors.location}</span>
                    )}
                  </label>
                </div>

                <p className="mt-6 text-xs leading-5 text-[#8a9e92]">
                  For emergencies, call 911. For urgent post-op concerns, call your JourneyLite office directly.
                </p>
              </div>
            )}

            {/* Step 2: Contact info */}
            {(step === "contact" || step === "submitting" || step === "error") && (
              <div>
                <div className="mb-5 rounded-lg border border-[#dce4df] bg-[#f7fbf8] p-4 text-sm text-[#1f2c25]">
                  <span className="font-semibold">{form.treatmentInterest}</span>
                  <span className="mx-2 text-[#8aaa95]">·</span>
                  <span className="text-[#53635b]">{form.location}</span>
                  <button
                    className="ml-3 text-xs font-semibold text-[#145c42] underline-offset-2 hover:underline"
                    onClick={() => setStep("treatment")}
                    type="button"
                  >
                    Edit
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <OverlayTextField
                    error={errors.firstName}
                    label="First name"
                    onChange={(v) => update("firstName", v)}
                    value={form.firstName}
                  />
                  <OverlayTextField
                    error={errors.lastName}
                    label="Last name"
                    onChange={(v) => update("lastName", v)}
                    value={form.lastName}
                  />
                  <OverlayTextField
                    error={errors.email}
                    label="Email address"
                    onChange={(v) => update("email", v)}
                    type="email"
                    value={form.email}
                  />
                  <OverlayTextField
                    error={errors.phone}
                    label="Phone number"
                    onChange={(v) => update("phone", v)}
                    type="tel"
                    value={form.phone}
                  />
                </div>

                <div className="mt-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-[#1f2c25]">Best time to reach you (optional)</span>
                    <select
                      className="mt-2 w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 text-sm text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                      onChange={(e) => update("bestTime", e.target.value)}
                      value={form.bestTime}
                    >
                      <option value="">No preference</option>
                      {["Morning (8am–12pm)", "Afternoon (12pm–4pm)", "Evening (4pm–6pm)"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-[#1f2c25]">
                      Anything else? <span className="font-normal text-[#66756d]">(optional)</span>
                    </span>
                    <textarea
                      className="mt-2 min-h-24 w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 text-sm leading-6 text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Questions about insurance, pricing, timing, or options you are considering."
                      value={form.message}
                    />
                  </label>
                </div>

                {/* Honeypot */}
                <input
                  aria-hidden="true"
                  autoComplete="off"
                  className="hidden"
                  name="website"
                  onChange={(e) => update("website", e.target.value)}
                  tabIndex={-1}
                  value={form.website}
                />

                <label className="mt-5 flex gap-3 rounded-lg border border-[#dce4df] p-4 text-sm leading-6 text-[#53635b]">
                  <input
                    checked={form.consent}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#145c42]"
                    onChange={(e) => update("consent", e.target.checked)}
                    type="checkbox"
                  />
                  <span>
                    I understand this form is not for medical emergencies, and I agree that JourneyLite may contact me
                    using the information I provided.
                  </span>
                </label>
                {errors.consent && (
                  <p className="mt-2 text-sm font-semibold text-[#8a3b22]">{errors.consent}</p>
                )}

                <p className="mt-3 text-xs leading-5 text-[#8a9e92]">
                  Protected by reCAPTCHA Enterprise.{" "}
                  <a className="underline underline-offset-2" href="https://policies.google.com/privacy" rel="noreferrer" target="_blank">
                    Privacy
                  </a>{" "}
                  &{" "}
                  <a className="underline underline-offset-2" href="https://policies.google.com/terms" rel="noreferrer" target="_blank">
                    Terms
                  </a>{" "}
                  apply.
                </p>

                {errors.submit && (
                  <div className="mt-4 rounded-lg border border-[#f0c9be] bg-[#fdf4f2] p-4 text-sm font-semibold text-[#8a3b22]">
                    {errors.submit}
                  </div>
                )}
              </div>
            )}

            {/* Done */}
            {step === "done" && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#edf4ef]">
                  <svg fill="none" height="32" viewBox="0 0 32 32" width="32">
                    <path d="M6 16l7 7 13-14" stroke="#145c42" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  </svg>
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-[#1f2c25]">Request received.</h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-[#53635b]">
                  The JourneyLite team will be in touch. If you need to speak with someone sooner, call{" "}
                  <a className="font-semibold text-[#145c42]" href="tel:+18774422263">
                    877-442-2263
                  </a>
                  .
                </p>
                <button
                  className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-[#145c42] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2"
                  onClick={closeOverlay}
                  type="button"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Footer actions */}
          {(step === "treatment" || step === "contact" || step === "submitting" || step === "error") && (
            <div className="border-t border-[#e8ede9] px-6 py-5 lg:px-8">
              <div className="flex gap-3">
                {(step === "contact" || step === "error") ? (
                  <button
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#cbd7d0] bg-white px-5 py-3 text-sm font-semibold text-[#17362a] transition hover:border-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                    onClick={() => { setStep("treatment"); setErrors({}); }}
                    type="button"
                  >
                    Back
                  </button>
                ) : null}
                <button
                  className="flex-1 inline-flex min-h-11 items-center justify-center rounded-md bg-[#145c42] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2"
                  disabled={step === "submitting"}
                  onClick={step === "treatment" ? () => { if (validateTreatment()) setStep("contact"); } : handleSubmit}
                  type="button"
                >
                  {step === "submitting" ? (
                    <span className="flex items-center gap-2">
                      <svg aria-hidden="true" className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" d="M4 12a8 8 0 018-8v8z" fill="currentColor" />
                      </svg>
                      Sending…
                    </span>
                  ) : step === "treatment" ? (
                    "Continue"
                  ) : (
                    "Send Consultation Request"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(60px); opacity: 0; }
          to   { transform: translateX(0);  opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function OverlayTextField({
  label,
  value,
  onChange,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
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
      {error ? <span className="mt-2 block text-sm font-semibold text-[#8a3b22]">{error}</span> : null}
    </label>
  );
}

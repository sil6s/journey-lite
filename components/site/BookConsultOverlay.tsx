"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarCheck,
  CalendarX,
  ChevronDown,
  ChevronUp,
  Check,
  ClipboardList,
  ExternalLink,
  HelpCircle,
  Info,
  Layers,
  Loader2,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Pill,
  RefreshCw,
  Scissors,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import { useConsult } from "./consult-context";
import { cincinnatiLocation, locationGroups } from "@/app/components/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Value as PhoneValue } from "react-phone-number-input";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const trustStats = [
  ["20+", "Years of Bariatric Experience"],
  ["8,000+", "Bariatric Procedures"],
  ["5", "Regional Locations"],
  ["MBSAQIP", "Accredited Bariatric Program"],
  ["AAAHC", "Accredited Surgery Center"],
  ["For Life", "Long-Term Support"],
];

const appointmentInterests: { label: string; icon: ReactNode }[] = [
  { label: "Surgical Weight Loss", icon: <Scissors className="size-4 shrink-0" /> },
  { label: "Revision of Prior Weight Loss Surgery", icon: <RefreshCw className="size-4 shrink-0" /> },
  { label: "Gastric Balloon", icon: <Stethoscope className="size-4 shrink-0" /> },
  { label: "Medical Weight Loss (Adipex, WeGovy, etc)", icon: <Pill className="size-4 shrink-0" /> },
  { label: "Combination Surgical & Medical", icon: <Layers className="size-4 shrink-0" /> },
  { label: "General Surgery", icon: <Stethoscope className="size-4 shrink-0" /> },
  { label: "Cancel Appointment", icon: <CalendarX className="size-4 shrink-0" /> },
];

const revisionProcedures = [
  "Gastric bypass or VBG (stomach stapling)",
  "Gastric band",
  "Gastric sleeve",
  "Duodenal switch",
  "SIPS, SADI, or LDS procedure",
];

const unsupportedRevisionProcedures = new Set([
  "Gastric bypass or VBG (stomach stapling)",
  "Duodenal switch",
  "SIPS, SADI, or LDS procedure",
]);

const informationTopics = [
  "Gastric Sleeve",
  "Gastric Bypass",
  "SADI Surgery",
  "Gastric Balloon",
  "Injectable GLP-1's",
  "Oral GLP-1's",
  "Other oral meds (Adipex/phentermine/Contrave/Qsymia)",
  "General Surgery",
  "Pricing/Self-Pay Options",
  "Insurance Coverage",
  "Other",
];

const researchStages = [
  "I'm just starting to research options",
  "I'm comparing medications vs. surgery",
  "I'm interested but not ready to schedule yet",
  "I want pricing or insurance information",
  "I had weight loss surgery before and have questions",
  "I'm ready to talk with someone soon",
  "Other",
];

const overlayLocations = [
  {
    id: "cincinnati",
    name: "Cincinnati Main Office & Surgery Center",
    address1: cincinnatiLocation.address1,
    address2: cincinnatiLocation.address2,
    phone: cincinnatiLocation.panels[0].voice,
    phoneHref: cincinnatiLocation.panels[0].voiceHref,
    directions: cincinnatiLocation.directions,
    badge: "Main Office",
  },
  ...locationGroups.flatMap((group) =>
    group.locations.map((loc) => ({
      id: `${loc.city.toLowerCase().replace(/\s+/g, "-")}-${loc.state.toLowerCase()}`,
      name: `${loc.city}, ${loc.state}`,
      address1: loc.address1,
      address2: loc.address2,
      phone: loc.phone,
      phoneHref: `tel:+1${loc.phone.replace(/\D/g, "")}`,
      directions: loc.directions,
      badge: null as string | null,
    }))
  ),
  {
    id: "not-sure",
    name: "Not sure yet",
    address1: "JourneyLite can help route your request to the most convenient location.",
    address2: "",
    phone: "(877) 442-2263",
    phoneHref: "tel:+18774422263",
    directions: null as string | null,
    badge: null as string | null,
  },
];

type Flow = "choice" | "details" | "location" | "contact" | "submitting" | "done";
type RequestType = "information" | "appointment";

interface FormState {
  requestType: RequestType | "";
  appointmentInterest: string;
  proceduresOfInterest: string[];
  revisionProcedures: string[];
  informationTopics: string[];
  researchStage: string;
  otherDetails: string;
  location: string;
  firstName: string;
  lastName: string;
  dob: string;
  heightFt: string;
  heightIn: string;
  weight: string;
  address: string;
  insuranceProvider: string;
  referralSource: string;
  email: string;
  confirmEmail: string;
  phone: string;
  preferredContactMethod: string;
  bestTime: string;
  message: string;
  consent: boolean;
  textConsent: boolean;
  website: string;
}

async function getRecaptchaToken(action: string): Promise<string> {
  if (!SITE_KEY || typeof window === "undefined" || !window.grecaptcha?.enterprise) return "";
  return new Promise((resolve) => {
    window.grecaptcha.enterprise.ready(async () => {
      try {
        resolve(await window.grecaptcha.enterprise.execute(SITE_KEY, { action }));
      } catch {
        resolve("");
      }
    });
  });
}

const surgicalProcedureOptions = [
  "Gastric Sleeve",
  "Gastric Bypass",
  "SADI Surgery",
  "Lap Band / Band Revision",
  "Not Sure Yet",
];

function computeBMI(heightFt: string, heightIn: string, weight: string): string {
  const ft = parseFloat(heightFt);
  const inches = parseFloat(heightIn) || 0;
  const lbs = parseFloat(weight);
  if (!ft || !lbs) return "";
  const totalIn = ft * 12 + inches;
  return ((lbs / (totalIn * totalIn)) * 703).toFixed(1);
}

const initialForm: FormState = {
  requestType: "",
  appointmentInterest: "",
  proceduresOfInterest: [],
  revisionProcedures: [],
  informationTopics: [],
  researchStage: "",
  otherDetails: "",
  location: "",
  firstName: "",
  lastName: "",
  dob: "",
  heightFt: "",
  heightIn: "",
  weight: "",
  address: "",
  insuranceProvider: "",
  referralSource: "",
  email: "",
  confirmEmail: "",
  phone: "",
  preferredContactMethod: "No preference",
  bestTime: "",
  message: "",
  consent: false,
  textConsent: false,
  website: "",
};

export function BookConsultOverlay() {
  const { open, closeOverlay, prefill } = useConsult();
  const [flow, setFlow] = useState<Flow>("choice");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>(initialForm);
  const bodyRef = useRef<HTMLDivElement>(null);

  const revisionBlocked = useMemo(
    () => form.revisionProcedures.some((p) => unsupportedRevisionProcedures.has(p)),
    [form.revisionProcedures],
  );

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const hasPrefill = Boolean(prefill.treatmentInterest);
      setFlow(hasPrefill ? "details" : "choice");
      setErrors({});
      setForm({
        ...initialForm,
        appointmentInterest: normalizePrefill(prefill.treatmentInterest),
        requestType: hasPrefill ? "appointment" : "",
      });
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, prefill]);

  function scrollTop() {
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function toggleList(key: "revisionProcedures" | "informationTopics" | "proceduresOfInterest", value: string) {
    setForm((prev) => {
      const exists = prev[key].includes(value);
      return { ...prev, [key]: exists ? prev[key].filter((i) => i !== value) : [...prev[key], value] };
    });
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function chooseRequestType(type: RequestType) {
    update("requestType", type);
    setFlow("details");
    scrollTop();
  }

  function switchToMedical() {
    setForm((prev) => ({
      ...prev,
      appointmentInterest: "Medical Weight Loss (Adipex, WeGovy, etc)",
      revisionProcedures: [],
      proceduresOfInterest: [],
    }));
    setErrors({});
  }

  function validateDetails() {
    const errs: Record<string, string> = {};
    if (form.requestType === "information") {
      if (form.informationTopics.length === 0) errs.informationTopics = "Choose at least one topic.";
      if (!form.researchStage) errs.researchStage = "Choose what best describes where you are.";
    }
    if (form.requestType === "appointment") {
      if (!form.appointmentInterest) errs.appointmentInterest = "Choose an appointment interest.";
      if (form.appointmentInterest === "Revision of Prior Weight Loss Surgery" && form.revisionProcedures.length === 0) {
        errs.revisionProcedures = "Choose the prior procedure.";
      }
      if (revisionBlocked) errs.revisionBlocked = "blocked";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateLocation() {
    const errs: Record<string, string> = {};
    if (!form.location) errs.location = "Choose a preferred location.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateContact() {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    if (!form.lastName.trim()) errs.lastName = "Last name is required.";
    if (!form.email.trim() && !form.phone.trim()) errs.email = "Provide an email address or phone number.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address.";
    if (form.email && form.confirmEmail !== form.email) errs.confirmEmail = "Email addresses do not match.";
    if (!form.consent) errs.consent = "Please confirm to continue.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goNext() {
    if (flow === "details") {
      if (!validateDetails()) return;
      setErrors({});
      setFlow(form.requestType === "appointment" ? "location" : "contact");
      scrollTop();
    } else if (flow === "location") {
      if (!validateLocation()) return;
      setErrors({});
      setFlow("contact");
      scrollTop();
    }
  }

  function goBack() {
    setErrors({});
    if (flow === "details") { setFlow("choice"); }
    else if (flow === "location") { setFlow("details"); }
    else if (flow === "contact") {
      setFlow(form.requestType === "appointment" ? "location" : "details");
    }
    scrollTop();
  }

  async function handleSubmit() {
    if (!validateContact()) return;
    if (form.website) return;
    setFlow("submitting");

    const recaptchaToken = await getRecaptchaToken("CONSULTATION_REQUEST");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          treatmentInterest:
            form.requestType === "appointment" ? form.appointmentInterest : form.informationTopics.join(", "),
          contactReason: form.requestType === "information" ? "Information Request" : "Appointment Request",
          bmi: computeBMI(form.heightFt, form.heightIn, form.weight),
          sourcePage: "consult-overlay",
          submittedAt: new Date().toISOString(),
          recaptchaToken,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Submission failed.");
      }
      setFlow("done");
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Something went wrong. Please call us directly." });
      setFlow("contact");
    }
  }

  const isFormFlow = flow === "details" || flow === "location" || flow === "contact" || flow === "submitting";
  const totalSteps = form.requestType === "information" ? 2 : 3;
  const stepNumber =
    flow === "details" ? 1 :
    flow === "location" ? 2 :
    flow === "contact" || flow === "submitting" ? totalSteps :
    null;
  const progressPct = stepNumber !== null ? Math.round((stepNumber / totalSteps) * 100) : 0;

  const headerTitle =
    flow === "choice" ? "How can we help you today?" :
    flow === "done" ? "Request received" :
    flow === "details" ? (form.requestType === "information" ? "What are you interested in?" : "Your appointment interest") :
    flow === "location" ? "Choose a location" :
    "Your contact information";

  return (
    <Sheet open={open} onOpenChange={(next) => { if (!next) closeOverlay(); }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 p-0 overflow-hidden !w-[min(1080px,90vw)] !max-w-none"
      >
        <div className="flex h-full">
          {/* Sidebar */}
          <aside className="hidden lg:flex lg:flex-col w-[300px] shrink-0 overflow-hidden bg-[#0f3e2e] p-8 text-white">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg font-bold">
                JL
              </div>
              <div>
                <p className="text-xl font-semibold">JourneyLite</p>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#90d4a4]">Patient Access</p>
              </div>
            </div>
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9ed4b0]">
                Why choose JourneyLite
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#fff8ed]">
                Expert bariatric care, close to home.
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#b9d2c5]">
                Questions first or ready to schedule — our team guides you to the right next step.
              </p>
            </div>
            <div className="mt-auto grid gap-3.5 border-t border-white/15 pt-6">
              {trustStats.map(([value, label]) => (
                <div className="flex items-center justify-between gap-3" key={label}>
                  <span className="shrink-0 text-base font-bold text-[#fff8ed]">{value}</span>
                  <span className="text-right text-xs leading-4 text-[#b9d2c5]">{label}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* Main panel */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#e5ece7] bg-white px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#66756d]">JourneyLite</p>
                <h2 className="mt-0.5 text-xl font-semibold text-[#163d2d]">{headerTitle}</h2>
              </div>
              <div className="flex items-center gap-4">
                {stepNumber !== null ? (
                  <span className="hidden sm:block text-sm font-semibold text-[#66756d]">
                    Step {stepNumber} of {totalSteps}
                  </span>
                ) : null}
                <button
                  aria-label="Close"
                  className="flex size-9 items-center justify-center rounded-full text-[#66756d] transition hover:bg-[#f0f5f2] hover:text-[#163d2d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                  onClick={closeOverlay}
                  type="button"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            {isFormFlow ? (
              <div className="h-1.5 bg-[#e5ece7]" aria-hidden="true">
                <div
                  className="h-full bg-[#145c42] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            ) : null}

            {/* Body */}
            <div className="flex-1 overflow-y-auto" ref={bodyRef}>
              {flow === "choice" ? (
                <ChoiceStep onChoose={chooseRequestType} />
              ) : flow === "done" ? (
                <DoneStep requestType={form.requestType} onClose={closeOverlay} />
              ) : flow === "details" ? (
                <div className="px-6 py-6 grid gap-6">
                  {form.requestType === "information" ? (
                    <InformationForm errors={errors} form={form} toggleList={toggleList} update={update} />
                  ) : (
                    <AppointmentForm
                      errors={errors}
                      form={form}
                      revisionBlocked={revisionBlocked}
                      toggleList={toggleList}
                      update={update}
                      onSwitchToMedical={switchToMedical}
                    />
                  )}
                </div>
              ) : flow === "location" ? (
                <div className="px-6 py-6 grid gap-6">
                  <LocationStep
                    error={errors.location}
                    selected={form.location}
                    onSelect={(value) => update("location", value)}
                  />
                </div>
              ) : (
                <div className="px-6 py-6 grid gap-6">
                  <ContactFields errors={errors} form={form} update={update} />
                  {errors.submit ? (
                    <Alert className="border-[#f0c9be] bg-[#fff7f4] text-[#7b351e]">
                      <AlertTriangle className="size-4" />
                      <AlertTitle>Could not submit</AlertTitle>
                      <AlertDescription>{errors.submit}</AlertDescription>
                    </Alert>
                  ) : null}
                </div>
              )}
            </div>

            {/* Footer */}
            {isFormFlow ? (
              <div className="shrink-0 border-t border-[#e5ece7] bg-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <Button
                    className="h-12 shrink-0 border border-[#dce7e0] bg-white text-[#163d2d] hover:bg-[#f0f5f2] text-sm font-semibold"
                    disabled={flow === "submitting"}
                    onClick={goBack}
                    type="button"
                    variant="outline"
                  >
                    <ArrowLeft className="mr-1.5 size-4" />
                    Back
                  </Button>

                  {flow === "details" && revisionBlocked && form.requestType === "appointment" ? (
                    <a
                      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-[#145c42] px-6 text-sm font-semibold text-[#145c42] transition hover:bg-[#f0f5f2] sm:flex-none sm:px-10"
                      href="tel:+18774422263"
                    >
                      <Phone className="size-4" />
                      Call Us — 877-442-2263
                    </a>
                  ) : flow === "details" || flow === "location" ? (
                    <Button
                      className="h-12 flex-1 bg-[#145c42] text-white hover:bg-[#0f4d37] text-sm font-semibold sm:flex-none sm:px-10"
                      onClick={goNext}
                      type="button"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      className="h-12 flex-1 bg-[#145c42] text-white hover:bg-[#0f4d37] text-sm font-semibold sm:flex-none sm:px-10"
                      disabled={flow === "submitting"}
                      onClick={handleSubmit}
                      type="button"
                    >
                      {flow === "submitting" ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                      {flow === "submitting"
                        ? "Sending..."
                        : form.requestType === "information"
                          ? "Send My Information Request"
                          : "Request an Appointment"}
                    </Button>
                  )}
                </div>
                <p className="mt-2.5 text-xs leading-5 text-[#7c8e84]">
                  For emergencies, call 911. For urgent post-op concerns, call your JourneyLite office directly.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ── Choice step ──────────────────────────────────────────── */

function ChoiceStep({ onChoose }: { onChoose: (type: RequestType) => void }) {
  return (
    <div className="flex flex-col divide-y divide-[#e5ece7]">
      <ChoiceCard
        buttonLabel="Request an Appointment"
        defaultOpen
        icon={<CalendarCheck className="size-8" />}
        onClick={() => onChoose("appointment")}
        title="Request an Appointment"
        subtitle="Ready to take the next step? Our team will contact you about scheduling, insurance, and self-pay."
        items={[
          "You already know which program or procedure interests you.",
          "You are ready for a consultation or next-step conversation.",
          "You want our team to review insurance or self-pay details.",
          "You want to discuss location options, virtual visits, or timing.",
          "You are ready for a JourneyLite team member to contact you directly.",
        ]}
        note="This does not lock you into anything. Our team will help guide the process."
      />
      <ChoiceCard
        buttonLabel="Request Information"
        icon={<HelpCircle className="size-8" />}
        onClick={() => onChoose("information")}
        title="Just Have Questions?"
        subtitle="Not ready to schedule yet? Ask about pricing, insurance, or compare treatment options first."
        items={[
          "You are just starting to research weight loss options.",
          "You want information about pricing, insurance, or self-pay options.",
          "You want to compare surgery, medications, or gastric balloon.",
          "You are unsure whether you qualify for a procedure.",
          "You would like someone from JourneyLite to send information.",
        ]}
        note="No obligation. This is the lower-commitment way to learn more before deciding what to do next."
      />
    </div>
  );
}

function ChoiceCard({
  title,
  subtitle,
  items,
  note,
  buttonLabel,
  icon,
  onClick,
  defaultOpen = false,
}: {
  title: string;
  subtitle: string;
  items: string[];
  note: string;
  buttonLabel: string;
  icon: ReactNode;
  onClick: () => void;
  defaultOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <div className="px-6 py-7">
      <div className="flex items-start gap-5">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#145c42]">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold text-[#163d2d]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[#53635b]">{subtitle}</p>
          <button
            aria-expanded={expanded}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#145c42] transition hover:text-[#0f4d37] focus-visible:outline-none"
            onClick={() => setExpanded((p) => !p)}
            type="button"
          >
            {expanded ? "Hide details" : "What's included"}
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          {expanded ? (
            <div className="mt-4">
              <ul className="space-y-2">
                {items.map((item) => (
                  <li className="flex gap-2.5 text-sm leading-6 text-[#43564d]" key={item}>
                    <Check className="mt-0.5 size-4 shrink-0 text-[#178a4f]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-lg bg-[#f5faf7] px-4 py-3 text-xs leading-5 text-[#5e7167]">{note}</p>
            </div>
          ) : null}
        </div>
      </div>
      <button
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#145c42] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2"
        onClick={onClick}
        type="button"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

/* ── Information form ─────────────────────────────────────── */

function InformationForm({
  form,
  errors,
  update,
  toggleList,
}: {
  form: FormState;
  errors: Record<string, string>;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  toggleList: (key: "revisionProcedures" | "informationTopics" | "proceduresOfInterest", value: string) => void;
}) {
  return (
    <div className="grid gap-6">
      <StepCard icon={<ClipboardList className="size-5 text-[#145c42]" />} title="Tell us what you need" description="A JourneyLite team member will send information or reach out based on your interests." />
      <CheckboxGroup
        error={errors.informationTopics}
        items={informationTopics}
        label="What would you like information about?"
        selected={form.informationTopics}
        onToggle={(value) => toggleList("informationTopics", value)}
      />
      <RadioField
        error={errors.researchStage}
        label="What best describes where you are right now?"
        onChange={(value) => update("researchStage", value)}
        options={researchStages}
        value={form.researchStage}
      />
      {form.researchStage === "Other" || form.informationTopics.includes("Other") ? (
        <TextField label="Other details" onChange={(value) => update("otherDetails", value)} value={form.otherDetails} />
      ) : null}
      <Alert className="border-[#dce7e0] bg-[#f8fbf9]">
        <Info className="size-4 text-[#145c42]" />
        <AlertTitle>This form is for general information requests only.</AlertTitle>
        <AlertDescription>Submitting this form does not schedule an appointment.</AlertDescription>
      </Alert>
    </div>
  );
}

/* ── Appointment form ─────────────────────────────────────── */

function AppointmentForm({
  form,
  errors,
  revisionBlocked,
  update,
  toggleList,
  onSwitchToMedical,
}: {
  form: FormState;
  errors: Record<string, string>;
  revisionBlocked: boolean;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  toggleList: (key: "revisionProcedures" | "informationTopics" | "proceduresOfInterest", value: string) => void;
  onSwitchToMedical: () => void;
}) {
  const showProcedures =
    form.appointmentInterest === "Surgical Weight Loss" ||
    form.appointmentInterest === "Combination Surgical & Medical";

  return (
    <div className="grid gap-6">
      <StepCard icon={<CalendarCheck className="size-5 text-[#145c42]" />} title="Your appointment interest" description="A patient service representative will contact you to discuss next steps." />

      {/* Appointment interest cards */}
      <fieldset className="grid gap-3">
        <legend className="text-sm font-semibold text-[#1f2c25]">
          What program are you interested in? <span className="text-[#8a3b22]">*</span>
        </legend>
        {errors.appointmentInterest ? <p className="mt-1 text-sm font-semibold text-[#8a3b22]">{errors.appointmentInterest}</p> : null}
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {appointmentInterests.map(({ label, icon }) => {
            const selected = form.appointmentInterest === label;
            const isCancel = label === "Cancel Appointment";
            return (
              <button
                aria-pressed={selected}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]",
                  isCancel && "sm:col-span-2",
                  isCancel && !selected && "border-[#fca5a5] bg-[#fff5f5] text-[#991b1b] hover:border-[#ef4444] hover:bg-[#fff1f1]",
                  isCancel && selected && "border-[#ef4444] bg-[#fee2e2] text-[#7f1d1d]",
                  !isCancel && selected && "border-[#145c42] bg-[#edf6f0] text-[#143d2c]",
                  !isCancel && !selected && "border-[#dce7e0] bg-white text-[#43564d] hover:border-[#145c42]",
                )}
                key={label}
                onClick={() => update("appointmentInterest", label)}
                type="button"
              >
                <span className={cn(
                  "shrink-0",
                  isCancel ? (selected ? "text-[#7f1d1d]" : "text-[#dc2626]") : (selected ? "text-[#145c42]" : "text-[#66756d]"),
                )}>{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {form.appointmentInterest ? <AppointmentDetails interest={form.appointmentInterest} /> : null}

      {showProcedures ? (
        <CheckboxGroup
          items={surgicalProcedureOptions}
          label="Which procedure(s) are you interested in? (optional)"
          selected={form.proceduresOfInterest}
          onToggle={(value) => toggleList("proceduresOfInterest", value)}
        />
      ) : null}

      {form.appointmentInterest === "Revision of Prior Weight Loss Surgery" ? (
        <CheckboxGroup
          error={errors.revisionProcedures}
          items={revisionProcedures}
          label="Which procedure(s) have you had in the past?"
          selected={form.revisionProcedures}
          onToggle={(value) => toggleList("revisionProcedures", value)}
        />
      ) : null}

      {revisionBlocked ? <RevisionBlockedCard onSwitchToMedical={onSwitchToMedical} /> : null}
    </div>
  );
}

function RevisionBlockedCard({ onSwitchToMedical }: { onSwitchToMedical: () => void }) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-[#d97706] bg-[#fffbeb]">
      <div className="flex items-center gap-3 border-b border-[#fde68a] bg-[#fef3c7] px-5 py-4">
        <AlertTriangle className="size-6 shrink-0 text-[#b45309]" />
        <p className="text-base font-bold text-[#92400e]">We don&apos;t offer this surgical revision</p>
      </div>
      <div className="px-5 py-5">
        <p className="text-sm leading-6 text-[#78350f]">
          JourneyLite does not perform surgical revisions for{" "}
          <span className="font-semibold">gastric bypass, duodenal switch, or SIPS/SADI/LDS procedures</span> due to
          significantly increased complication risk and poor long-term outcomes with re-operation.
        </p>
        <p className="mt-3 text-sm leading-6 text-[#78350f]">
          Many patients in this situation benefit from <span className="font-semibold">medical weight loss</span> —
          including injectable GLP-1 medications like Wegovy or Zepbound — which may help address weight regain, plateaus,
          or long-term maintenance without additional surgery.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#145c42] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] sm:flex-none"
            onClick={onSwitchToMedical}
            type="button"
          >
            <Pill className="size-4" />
            Switch to Medical Weight Loss
          </button>
          <a
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[#d97706] bg-white px-5 text-sm font-semibold text-[#92400e] transition hover:bg-[#fef3c7] focus-visible:outline-none sm:flex-none"
            href="tel:+18774422263"
          >
            <Phone className="size-4" />
            Call Us — 877-442-2263
          </a>
        </div>
        <p className="mt-4 text-xs leading-5 text-[#92400e]">
          To continue, choose a different appointment interest above or call us to discuss your options with a patient
          service representative.
        </p>
      </div>
    </div>
  );
}

function AppointmentDetails({ interest }: { interest: string }) {
  const details: Record<string, string> = {
    "Surgical Weight Loss":
      "Your evaluation includes a consultation with Dr. Curry or Dr. Augusta and a dietitian evaluation. A representative will contact you to review insurance or self-pay options first.",
    "Revision of Prior Weight Loss Surgery":
      "Our team can review your prior surgery history and available next steps. Your evaluation includes a consultation with Dr. Curry or Dr. Augusta and a dietitian evaluation.",
    "Gastric Balloon":
      "Your evaluation will include a consultation with Dr. Curry or Dr. Augusta, and an evaluation by one of our licensed/registered dietitians.",
    "Medical Weight Loss (Adipex, WeGovy, etc)":
      "Your evaluation will include a consultation with a doctor or nurse practitioner, and an evaluation by a licensed/registered dietitian.",
    "Combination Surgical & Medical":
      "Your appointment includes a consultation with Dr. Curry or Dr. Augusta to discuss procedures and medications, plus a dietitian evaluation.",
    "General Surgery":
      "A JourneyLite team member will contact you about general surgery appointment options and next steps.",
    "Cancel Appointment":
      "Use this option if you need help canceling or changing an existing appointment. A team member will route your request.",
  };
  return (
    <div className="rounded-lg border border-[#dce7e0] bg-[#f8fbf9] px-4 py-3 text-sm leading-6 text-[#43564d]">
      {details[interest]}
    </div>
  );
}

/* ── Location step ────────────────────────────────────────── */

function LocationStep({
  selected,
  onSelect,
  error,
}: {
  selected: string;
  onSelect: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="grid gap-6">
      <StepCard
        icon={<MapPin className="size-5 text-[#145c42]" />}
        title="Choose a location"
        description="Select the JourneyLite office most convenient for you. You can always discuss alternatives when our team reaches out."
      />
      {error ? <p className="text-sm font-semibold text-[#8a3b22]">{error}</p> : null}
      <div className="grid gap-3">
        {overlayLocations.map((loc) => {
          const isSelected = selected === loc.name;
          const isNotSure = loc.id === "not-sure";
          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                "relative w-full rounded-xl border-2 p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2",
                isSelected
                  ? "border-[#145c42] bg-[#edf6f0]"
                  : "border-[#dce7e0] bg-white hover:border-[#145c42]",
              )}
              key={loc.id}
              onClick={() => onSelect(loc.name)}
              type="button"
            >
              {isSelected ? (
                <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-[#145c42]">
                  <Check className="size-3.5 text-white" />
                </span>
              ) : null}

              <div className="flex items-start gap-3">
                <div className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                  isSelected ? "bg-[#145c42] text-white" : "bg-[#f0f5f2] text-[#145c42]",
                )}>
                  {isNotSure ? <HelpCircle className="size-4" /> : <Building2 className="size-4" />}
                </div>
                <div className="min-w-0 flex-1 pr-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={cn("text-base font-semibold", isSelected ? "text-[#163d2d]" : "text-[#1f2c25]")}>
                      {loc.name}
                    </p>
                    {loc.badge ? (
                      <span className="rounded-full bg-[#145c42] px-2.5 py-0.5 text-xs font-semibold text-white">
                        {loc.badge}
                      </span>
                    ) : null}
                  </div>
                  {loc.address1 ? (
                    <p className="mt-1 flex items-start gap-1.5 text-sm text-[#66756d]">
                      {!isNotSure && <MapPin className="mt-0.5 size-3.5 shrink-0" />}
                      <span>{loc.address1}{loc.address2 ? `, ${loc.address2}` : ""}</span>
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                    <a
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#145c42] hover:text-[#0f4d37]"
                      href={loc.phoneHref}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="size-3.5" />
                      {loc.phone}
                    </a>
                    {loc.directions ? (
                      <a
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#145c42] hover:text-[#0f4d37]"
                        href={loc.directions}
                        onClick={(e) => e.stopPropagation()}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <Navigation className="size-3.5" />
                        Directions
                        <ExternalLink className="size-3" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Contact fields ───────────────────────────────────────── */

function ContactFields({
  form,
  errors,
  update,
}: {
  form: FormState;
  errors: Record<string, string>;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div className="grid gap-6">
      <StepCard icon={<User className="size-5 text-[#145c42]" />} title="Almost there" description="Share your contact details so the JourneyLite team can reach you." />
      {/* Name + DOB */}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField error={errors.firstName} label="First name" onChange={(v) => update("firstName", v)} value={form.firstName} />
        <TextField error={errors.lastName} label="Last name" onChange={(v) => update("lastName", v)} value={form.lastName} />
        <TextField label="Date of birth" onChange={(v) => update("dob", v)} type="date" value={form.dob} />
      </div>

      {/* Height / Weight / BMI */}
      {(() => {
        const bmi = computeBMI(form.heightFt, form.heightIn, form.weight);
        return (
          <div className="grid gap-3 rounded-xl border border-[#dce7e0] bg-[#f8fbf9] p-4">
            <p className="text-sm font-semibold text-[#1f2c25]">Height, Weight &amp; BMI</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="grid gap-1.5">
                <Label htmlFor="heightFt">Height (ft)</Label>
                <Input
                  className="border-[#cbd7d0] focus-visible:ring-[#145c42]"
                  id="heightFt"
                  max="8"
                  min="1"
                  onChange={(e) => update("heightFt", e.target.value)}
                  placeholder="5"
                  type="number"
                  value={form.heightFt}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="heightIn">Inches</Label>
                <Input
                  className="border-[#cbd7d0] focus-visible:ring-[#145c42]"
                  id="heightIn"
                  max="11"
                  min="0"
                  onChange={(e) => update("heightIn", e.target.value)}
                  placeholder="4"
                  type="number"
                  value={form.heightIn}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  className="border-[#cbd7d0] focus-visible:ring-[#145c42]"
                  id="weight"
                  min="0"
                  onChange={(e) => update("weight", e.target.value)}
                  placeholder="240"
                  type="number"
                  value={form.weight}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>BMI</Label>
                <div className={cn(
                  "flex h-10 items-center rounded-lg border px-3 text-sm font-bold",
                  bmi ? "border-[#145c42] bg-[#edf6f0] text-[#145c42]" : "border-[#dce7e0] bg-white text-[#9ca3af]",
                )}>
                  {bmi || "—"}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Address */}
      <TextField label="Address (optional)" onChange={(v) => update("address", v)} value={form.address} />

      {/* Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField error={errors.email} label="Email" onChange={(v) => update("email", v)} type="email" value={form.email} />
        <TextField error={errors.confirmEmail} label="Confirm email" onChange={(v) => update("confirmEmail", v)} type="email" value={form.confirmEmail} />
      </div>

      {/* Phone */}
      <div className="grid gap-2 sm:max-w-xs">
        <Label htmlFor="consult-phone">Phone (optional)</Label>
        <PhoneInput
          id="consult-phone"
          value={form.phone as PhoneValue}
          onChange={(v) => update("phone", v ?? "")}
          placeholder="Enter a phone number"
        />
      </div>

      {/* Insurance + Referral */}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Insurance / Self-pay" onChange={(v) => update("insuranceProvider", v)} value={form.insuranceProvider} />
        <TextField label="How did you hear about us? (optional)" onChange={(v) => update("referralSource", v)} value={form.referralSource} />
      </div>
      <RadioField
        compact
        label="Preferred contact method"
        onChange={(v) => update("preferredContactMethod", v)}
        options={["Email", "Phone call", "Text message", "No preference"]}
        value={form.preferredContactMethod}
      />
      {form.requestType === "appointment" ? (
        <RadioField
          compact
          label="Best time to reach you"
          onChange={(v) => update("bestTime", v)}
          options={["Morning", "Afternoon", "Evening", "No preference"]}
          value={form.bestTime}
        />
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="consult-message">Questions or additional details (optional)</Label>
        <Textarea
          className="min-h-24 border-[#cbd7d0] focus-visible:ring-[#145c42]"
          id="consult-message"
          onChange={(e) => update("message", e.target.value)}
          placeholder="Pricing, insurance, timing, or treatment questions."
          value={form.message}
        />
      </div>
      <input
        aria-hidden="true"
        autoComplete="off"
        className="hidden"
        name="website"
        onChange={(e) => update("website", e.target.value)}
        tabIndex={-1}
        value={form.website}
      />
      <label className="flex cursor-pointer gap-3 rounded-lg border border-[#dce7e0] p-4 text-sm leading-6 text-[#53635b]">
        <input
          checked={form.textConsent}
          className="mt-1 size-4 shrink-0 accent-[#145c42]"
          onChange={(e) => update("textConsent", e.target.checked)}
          type="checkbox"
        />
        <span>
          SMS Consent (optional): I agree to receive text messages from JourneyLite. Message and data rates may apply.
          Reply STOP to opt out.
        </span>
      </label>
      <label className="flex cursor-pointer gap-3 rounded-lg border border-[#dce7e0] p-4 text-sm leading-6 text-[#53635b]">
        <input
          checked={form.consent}
          className="mt-1 size-4 shrink-0 accent-[#145c42]"
          onChange={(e) => update("consent", e.target.checked)}
          type="checkbox"
        />
        <span>
          I understand this form is not for medical emergencies, and I agree that JourneyLite may contact me using the
          information I provided.
        </span>
      </label>
      {errors.consent ? <p className="text-sm font-semibold text-[#8a3b22]">{errors.consent}</p> : null}
    </div>
  );
}

/* ── Done ─────────────────────────────────────────────────── */

function DoneStep({ requestType, onClose }: { requestType: RequestType | ""; onClose: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#edf6f0] text-[#145c42]">
        {requestType === "information" ? <Mail className="size-8" /> : <Phone className="size-8" />}
      </div>
      <h3 className="mt-5 text-2xl font-semibold text-[#163d2d]">Request received.</h3>
      <p className="mt-3 text-sm leading-7 text-[#53635b]">
        The JourneyLite team will be in touch. If you need to speak with someone sooner, call{" "}
        <a className="font-semibold text-[#145c42]" href="tel:+18774422263">
          877-442-2263
        </a>
        .
      </p>
      <Button className="mt-8 bg-[#145c42] text-white hover:bg-[#0f4d37]" onClick={onClose} type="button">
        Close
      </Button>
    </div>
  );
}

/* ── Shared primitives ────────────────────────────────────── */

function StepCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[#dce7e0] bg-[#f8fbf9] p-5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#edf6f0]">{icon}</div>
      <div>
        <p className="text-base font-semibold text-[#163d2d]">{title}</p>
        <p className="mt-0.5 text-sm leading-5 text-[#66756d]">{description}</p>
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
  const id = `consult-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        aria-invalid={Boolean(error)}
        className="border-[#cbd7d0] focus-visible:ring-[#145c42]"
        id={id}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        value={value}
      />
      {error ? <p className="text-sm font-semibold text-[#8a3b22]">{error}</p> : null}
    </div>
  );
}

function RadioField({
  label,
  options,
  value,
  onChange,
  error,
  compact = false,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  compact?: boolean;
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-semibold text-[#1f2c25]">
        {label} <span className="text-[#8a3b22]">*</span>
      </legend>
      <RadioGroup
        className={cn("grid gap-2", compact ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2")}
        onValueChange={onChange}
        value={value}
      >
        {options.map((option) => {
          const selected = value === option;
          return (
            <Label
              className={cn(
                "min-h-12 cursor-pointer rounded-lg border border-[#dce7e0] bg-white p-3 text-sm leading-5 text-[#43564d] transition hover:border-[#145c42]",
                selected && "border-[#145c42] bg-[#edf6f0] text-[#143d2c]",
              )}
              key={option}
            >
              <RadioGroupItem value={option} />
              <span>{option}</span>
            </Label>
          );
        })}
      </RadioGroup>
      {error ? <p className="text-sm font-semibold text-[#8a3b22]">{error}</p> : null}
    </fieldset>
  );
}

function CheckboxGroup({
  label,
  items,
  selected,
  onToggle,
  error,
}: {
  label: string;
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
  error?: string;
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-semibold text-[#1f2c25]">
        {label} <span className="text-[#8a3b22]">*</span>
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const checked = selected.includes(item);
          return (
            <label
              className={cn(
                "flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-[#dce7e0] bg-white p-3 text-sm leading-5 text-[#43564d] transition hover:border-[#145c42]",
                checked && "border-[#145c42] bg-[#edf6f0] text-[#143d2c]",
              )}
              key={item}
            >
              <input
                checked={checked}
                className="mt-0.5 size-4 shrink-0 accent-[#145c42]"
                onChange={() => onToggle(item)}
                type="checkbox"
              />
              <span>{item}</span>
            </label>
          );
        })}
      </div>
      {error ? <p className="text-sm font-semibold text-[#8a3b22]">{error}</p> : null}
    </fieldset>
  );
}

function normalizePrefill(value?: string) {
  if (!value) return "";
  const labels = appointmentInterests.map((a) => a.label);
  if (labels.includes(value)) return value;
  if (/medication|prescription/i.test(value)) return "Medical Weight Loss (Adipex, WeGovy, etc)";
  if (/balloon/i.test(value)) return "Gastric Balloon";
  if (/revision/i.test(value)) return "Revision of Prior Weight Loss Surgery";
  if (/surgery|surgical|sleeve|bypass|sadi|band/i.test(value)) return "Surgical Weight Loss";
  return "";
}

"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarCheck,
  CalendarX,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ExternalLink,
  HelpCircle,
  Info,
  Layers,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Pill,
  RefreshCw,
  Scissors,
  Stethoscope,
  User,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Value as PhoneValue } from "react-phone-number-input";
import { TurnstileWidget } from "@/components/site/TurnstileWidget";
import { cincinnatiLocation, locationGroups } from "@/app/components/data";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/* ── Data ─────────────────────────────────────────────────── */

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

const surgicalProcedureOptions = [
  "Gastric Sleeve",
  "Gastric Bypass",
  "SADI Surgery",
  "Lap Band / Band Revision",
  "Not Sure Yet",
];

const pageLocations = [
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

/* ── Types ────────────────────────────────────────────────── */

type Flow = "choice" | "details" | "contact" | "submitting" | "done";
type RequestType = "information" | "appointment" | "general";

interface FormState {
  requestType: RequestType | "";
  generalInquiryTopic: string;
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

const initialForm: FormState = {
  requestType: "",
  generalInquiryTopic: "",
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

function computeBMI(heightFt: string, heightIn: string, weight: string): string {
  const ft = parseFloat(heightFt);
  const inches = parseFloat(heightIn) || 0;
  const lbs = parseFloat(weight);
  if (!ft || !lbs) return "";
  const totalIn = ft * 12 + inches;
  return ((lbs / (totalIn * totalIn)) * 703).toFixed(1);
}

/* ── Main component ───────────────────────────────────────── */

export function ContactExperience() {
  const [flow, setFlow] = useState<Flow>("choice");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>(initialForm);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  const revisionBlocked = useMemo(
    () => form.revisionProcedures.some((p) => unsupportedRevisionProcedures.has(p)),
    [form.revisionProcedures],
  );

  function scrollTop() {
    bodyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  function chooseRequestType(type: RequestType, topic = "") {
    setForm((prev) => ({ ...prev, requestType: type, generalInquiryTopic: topic }));
    setErrors({});
    setFlow(type === "general" ? "contact" : "details");
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


  function validateContact() {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    if (!form.lastName.trim()) errs.lastName = "Last name is required.";
    if (!form.email.trim() && !form.phone.trim()) errs.email = "Provide an email address or phone number.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address.";
    if (form.email && form.confirmEmail !== form.email) errs.confirmEmail = "Email addresses do not match.";
    if (!form.consent) errs.consent = "Please confirm to continue.";
    if (TURNSTILE_SITE_KEY && !turnstileToken) errs.turnstile = "Please complete the security check.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    if (token) setErrors((prev) => ({ ...prev, turnstile: "" }));
  }, []);

  const handleTurnstileError = useCallback(() => {
    setErrors((prev) => ({ ...prev, turnstile: "Security check failed. Please try again." }));
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setErrors((prev) => ({ ...prev, turnstile: "Security check expired. Please try again." }));
  }, []);

  function goNext() {
    if (flow === "details") {
      if (!validateDetails()) return;
      setErrors({});
      setFlow("contact");
      scrollTop();
    }
  }

  function goBack() {
    setErrors({});
    if (flow === "details") setFlow("choice");
    else if (flow === "contact") setFlow(form.requestType === "general" ? "choice" : "details");
    scrollTop();
  }

  async function handleSubmit() {
    if (!validateContact()) return;
    if (form.website) return;
    setFlow("submitting");

    const contactReason =
      form.requestType === "general"
        ? "General Inquiry"
        : form.requestType === "information"
          ? "Information Request"
          : "Appointment Request";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          treatmentInterest:
            form.requestType === "appointment"
              ? form.appointmentInterest
              : form.requestType === "information"
                ? form.informationTopics.join(", ")
                : form.generalInquiryTopic || "General Inquiry",
          contactReason,
          generalInquiry: form.requestType === "general",
          bmi: computeBMI(form.heightFt, form.heightIn, form.weight),
          sourcePage: "contact-page",
          submittedAt: new Date().toISOString(),
          turnstileToken,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Submission failed.");
      }
      setFlow("done");
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Something went wrong. Please call us directly." });
      setTurnstileToken("");
      setTurnstileResetKey((prev) => prev + 1);
      setFlow("contact");
    }
  }

  const totalSteps = form.requestType === "general" ? 1 : 2;
  const stepNumber =
    flow === "details" ? 1 :
    flow === "contact" || flow === "submitting" ? totalSteps :
    null;
  const progressPct = stepNumber !== null ? Math.round((stepNumber / totalSteps) * 100) : 0;
  const isFormFlow = flow === "details" || flow === "contact" || flow === "submitting";

  if (flow === "done") {
    return (
      <section className="rounded-2xl border border-[#cbd9d1] bg-white p-8 shadow-xl shadow-[#20372b]/8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#edf6f0] text-[#145c42]">
          {form.requestType === "information" ? <Mail className="size-8" /> : <Phone className="size-8" />}
        </div>
        <h3 className="mt-5 text-2xl font-semibold text-[#163d2d]">Request received.</h3>
        <p className="mt-3 text-sm leading-7 text-[#53635b]">
          The JourneyLite team will be in touch. If you need to speak with someone sooner, call{" "}
          <a className="font-semibold text-[#145c42]" href="tel:+18774422263">877-442-2263</a>.
        </p>
      </section>
    );
  }

  return (
    <section
      className="scroll-mt-28 rounded-xl border border-[#dce4df] bg-white shadow-xl shadow-[#20372b]/8 overflow-hidden"
      id="contact-form"
      ref={bodyRef}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e5ece7] bg-white px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#66756d]">JourneyLite</p>
          <h2 className="mt-0.5 text-xl font-semibold text-[#163d2d]">
            {flow === "choice"
              ? "How can we help you today?"
              : flow === "details"
                ? form.requestType === "information" ? "What are you interested in?" : "Your appointment interest"
                : form.requestType === "general" && form.generalInquiryTopic
                  ? form.generalInquiryTopic
                  : "Your contact information"}
          </h2>
        </div>
        {stepNumber !== null && (
          <span className="hidden sm:block text-sm font-semibold text-[#66756d]">
            Step {stepNumber} of {totalSteps}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {isFormFlow && (
        <div className="h-1.5 bg-[#e5ece7]" aria-hidden="true">
          <div className="h-full bg-[#145c42] transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      )}

      {/* Body */}
      <div className="px-6 py-6">
        {flow === "choice" && <ChoiceStep onChoose={chooseRequestType} />}

        {flow === "details" && (
          <div className="grid gap-6">
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
        )}

        {(flow === "contact" || flow === "submitting") && (
          <div className="grid gap-6">
            <ContactFields errors={errors} form={form} update={update} />
            <TurnstileWidget
              action="consultation_request"
              key={turnstileResetKey}
              onError={handleTurnstileError}
              onExpire={handleTurnstileExpire}
              onVerify={handleTurnstileVerify}
            />
            {errors.turnstile && <p className="text-sm font-semibold text-[#8a3b22]">{errors.turnstile}</p>}
            {errors.submit && (
              <Alert className="border-[#f0c9be] bg-[#fff7f4] text-[#7b351e]">
                <AlertTriangle className="size-4" />
                <AlertTitle>Could not submit</AlertTitle>
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>

      {/* Footer nav */}
      {isFormFlow && (
        <div className="border-t border-[#e5ece7] bg-white px-6 py-4">
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
            ) : flow === "details" ? (
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
                {flow === "submitting" && <Loader2 className="mr-2 size-4 animate-spin" />}
                {flow === "submitting"
                  ? "Sending..."
                  : form.requestType === "information"
                    ? "Send My Information Request"
                    : form.requestType === "general"
                      ? "Send My Message"
                      : "Request an Appointment"}
              </Button>
            )}
          </div>
          <p className="mt-2.5 text-xs leading-5 text-[#7c8e84]">
            For emergencies, call 911. For urgent post-op concerns, call your JourneyLite office directly.
          </p>
        </div>
      )}
    </section>
  );
}

/* ── Choice step ──────────────────────────────────────────── */

const generalInquiryTopics = [
  {
    value: "Pricing / Financing",
    label: "Pricing / Financing",
    desc: "Self-pay, insurance, or financing options",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "Insurance",
    label: "Insurance",
    desc: "Coverage, requirements, or authorization",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "Existing Patient",
    label: "Existing Patient",
    desc: "Appointment, billing, or follow-up",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function ChoiceStep({ onChoose }: { onChoose: (type: RequestType, topic?: string) => void }) {
  return (
    <div className="divide-y divide-[#e5ece7]">
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
        icon={<ClipboardList className="size-8" />}
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
      {/* General Inquiry — inline sub-topic picker */}
      <div className="px-6 py-7">
        <div className="flex items-start gap-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#edf6f0] text-[#145c42]">
            <MessageSquare className="size-8" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-semibold text-[#163d2d]">General Inquiry</h3>
            <p className="mt-1 text-sm leading-6 text-[#53635b]">
              Have a question that doesn&apos;t fit the options above? Choose a topic and a team member will get back to you.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {generalInquiryTopics.map((topic) => (
                <button
                  className="flex items-start gap-3 rounded-xl border border-[#dce7e0] bg-white p-4 text-left transition hover:border-[#145c42] hover:bg-[#f5faf7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                  key={topic.value}
                  onClick={() => onChoose("general", topic.value)}
                  type="button"
                >
                  <span className="mt-0.5 shrink-0 text-[#66756d]">{topic.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold text-[#1f2c25]">{topic.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-[#66756d]">{topic.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
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
          {expanded && (
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
          )}
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
      {(form.researchStage === "Other" || form.informationTopics.includes("Other")) && (
        <TextField label="Other details" onChange={(value) => update("otherDetails", value)} value={form.otherDetails} />
      )}
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

      <fieldset className="grid gap-3">
        <legend className="text-sm font-semibold text-[#1f2c25]">
          What program are you interested in? <span className="text-[#8a3b22]">*</span>
        </legend>
        {errors.appointmentInterest && <p className="mt-1 text-sm font-semibold text-[#8a3b22]">{errors.appointmentInterest}</p>}
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

      {form.appointmentInterest && <AppointmentDetails interest={form.appointmentInterest} />}

      {showProcedures && (
        <CheckboxGroup
          items={surgicalProcedureOptions}
          label="Which procedure(s) are you interested in? (optional)"
          selected={form.proceduresOfInterest}
          onToggle={(value) => toggleList("proceduresOfInterest", value)}
        />
      )}

      {form.appointmentInterest === "Revision of Prior Weight Loss Surgery" && (
        <CheckboxGroup
          error={errors.revisionProcedures}
          items={revisionProcedures}
          label="Which procedure(s) have you had in the past?"
          selected={form.revisionProcedures}
          onToggle={(value) => toggleList("revisionProcedures", value)}
        />
      )}

      {revisionBlocked && <RevisionBlockedCard onSwitchToMedical={onSwitchToMedical} />}
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
          significantly increased complication risk.
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
      </div>
    </div>
  );
}

function AppointmentDetails({ interest }: { interest: string }) {
  const details: Record<string, string> = {
    "Surgical Weight Loss": "Your evaluation includes a consultation with Dr. Curry or Dr. Augusta and a dietitian evaluation. A representative will contact you to review insurance or self-pay options first.",
    "Revision of Prior Weight Loss Surgery": "Our team can review your prior surgery history and available next steps. Your evaluation includes a consultation with Dr. Curry or Dr. Augusta and a dietitian evaluation.",
    "Gastric Balloon": "Your evaluation will include a consultation with Dr. Curry or Dr. Augusta, and an evaluation by one of our licensed/registered dietitians.",
    "Medical Weight Loss (Adipex, WeGovy, etc)": "Your evaluation will include a consultation with a doctor or nurse practitioner, and an evaluation by a licensed/registered dietitian.",
    "Combination Surgical & Medical": "Your appointment includes a consultation with Dr. Curry or Dr. Augusta to discuss procedures and medications, plus a dietitian evaluation.",
    "General Surgery": "A JourneyLite team member will contact you about general surgery appointment options and next steps.",
    "Cancel Appointment": "Use this option if you need help canceling or changing an existing appointment. A team member will route your request.",
  };
  return (
    <div className="rounded-lg border border-[#dce7e0] bg-[#f8fbf9] px-4 py-3 text-sm leading-6 text-[#43564d]">
      {details[interest]}
    </div>
  );
}

/* ── Location step (kept for internal use) ───────────────────── */

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
      {error && <p className="text-sm font-semibold text-[#8a3b22]">{error}</p>}
      <div className="grid gap-3">
        {pageLocations.map((loc) => {
          const isSelected = selected === loc.name;
          const isNotSure = loc.id === "not-sure";
          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                "relative w-full rounded-xl border-2 p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2",
                isSelected ? "border-[#145c42] bg-[#edf6f0]" : "border-[#dce7e0] bg-white hover:border-[#145c42]",
              )}
              key={loc.id}
              onClick={() => onSelect(loc.name)}
              type="button"
            >
              {isSelected && (
                <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-[#145c42]">
                  <Check className="size-3.5 text-white" />
                </span>
              )}
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
                    {loc.badge && (
                      <span className="rounded-full bg-[#145c42] px-2.5 py-0.5 text-xs font-semibold text-white">
                        {loc.badge}
                      </span>
                    )}
                  </div>
                  {loc.address1 && (
                    <p className="mt-1 flex items-start gap-1.5 text-sm text-[#66756d]">
                      {!isNotSure && <MapPin className="mt-0.5 size-3.5 shrink-0" />}
                      <span>{loc.address1}{loc.address2 ? `, ${loc.address2}` : ""}</span>
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                    <a
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#145c42] hover:text-[#0f4d37]"
                      href={loc.phoneHref}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="size-3.5" />
                      {loc.phone}
                    </a>
                    {loc.directions && (
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
                    )}
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

/* ── BMI helpers ──────────────────────────────────────────── */

const GAUGE_MIN = 15;
const GAUGE_MAX = 55;

function bmiGaugePct(n: number) {
  return Math.min(100, Math.max(0, ((n - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100));
}

function bmiCategory(n: number): { label: string; color: string } {
  if (n < 18.5) return { label: "Underweight", color: "#3b82f6" };
  if (n < 25)   return { label: "Normal weight", color: "#22c55e" };
  if (n < 30)   return { label: "Overweight", color: "#f59e0b" };
  if (n < 35)   return { label: "Obese — Class I", color: "#f97316" };
  if (n < 40)   return { label: "Obese — Class II", color: "#ef4444" };
  return           { label: "Obese — Class III", color: "#b91c1c" };
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
  const bmi = computeBMI(form.heightFt, form.heightIn, form.weight);
  const bmiNum = parseFloat(bmi);
  const { label: bmiLabel, color: bmiColor } = bmiNum ? bmiCategory(bmiNum) : { label: "", color: "#145c42" };
  const isGeneral = form.requestType === "general";

  return (
    <div className="grid gap-6">
      <StepCard icon={<User className="size-5 text-[#145c42]" />} title="Almost there" description="Share your contact details so the JourneyLite team can reach you." />

      {/* Location — compact inline picker for appointment */}
      {form.requestType === "appointment" && (
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-[#1f2c25]">Preferred location <span className="font-normal text-[#66756d]">(optional)</span></p>
          <div className="grid gap-2 sm:grid-cols-2">
            {pageLocations.map((loc) => {
              const selected = form.location === loc.name;
              return (
                <button
                  aria-pressed={selected}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]",
                    selected ? "border-[#145c42] bg-[#edf6f0] font-semibold text-[#143d2c]" : "border-[#dce7e0] bg-white text-[#43564d] hover:border-[#145c42]",
                  )}
                  key={loc.id}
                  onClick={() => update("location", selected ? "" : loc.name)}
                  type="button"
                >
                  <MapPin className={cn("size-3.5 shrink-0", selected ? "text-[#145c42]" : "text-[#9ca3af]")} />
                  <span className="truncate">{loc.name}</span>
                  {selected && <Check className="ml-auto size-3.5 shrink-0 text-[#145c42]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Name + DOB */}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField error={errors.firstName} label="First name" onChange={(v) => update("firstName", v)} value={form.firstName} />
        <TextField error={errors.lastName} label="Last name" onChange={(v) => update("lastName", v)} value={form.lastName} />
        {!isGeneral && (
          <TextField label="Date of birth" onChange={(v) => update("dob", v)} type="date" value={form.dob} />
        )}
      </div>

      {/* Height / Weight / BMI — skip for general inquiry */}
      {!isGeneral && (
        <div className="grid gap-3 rounded-xl border border-[#dce7e0] bg-[#f8fbf9] p-4">
          <p className="text-sm font-semibold text-[#1f2c25]">Height, Weight &amp; BMI <span className="font-normal text-[#66756d]">(optional)</span></p>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="heightFt">Height (ft)</Label>
              <Input className="border-[#cbd7d0] focus-visible:ring-[#145c42]" id="heightFt" max="8" min="1" onChange={(e) => update("heightFt", e.target.value)} placeholder="5" type="number" value={form.heightFt} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="heightIn">Inches</Label>
              <Input className="border-[#cbd7d0] focus-visible:ring-[#145c42]" id="heightIn" max="11" min="0" onChange={(e) => update("heightIn", e.target.value)} placeholder="4" type="number" value={form.heightIn} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input className="border-[#cbd7d0] focus-visible:ring-[#145c42]" id="weight" min="0" onChange={(e) => update("weight", e.target.value)} placeholder="240" type="number" value={form.weight} />
            </div>
          </div>
          {bmi && (
            <div className="mt-1">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#66756d]">BMI</span>
                <span className="text-lg font-bold tabular-nums" style={{ color: bmiColor }}>
                  {bmi} <span className="text-xs font-semibold">{bmiLabel}</span>
                </span>
              </div>
              <div
                className="relative h-3 rounded-full overflow-hidden"
                style={{ background: "linear-gradient(to right, #3b82f6 0%,#3b82f6 8.75%,#22c55e 8.75%,#22c55e 25%,#f59e0b 25%,#f59e0b 37.5%,#f97316 37.5%,#f97316 50%,#ef4444 50%,#ef4444 62.5%,#b91c1c 62.5%,#b91c1c 100%)" }}
              >
                <div
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md transition-all duration-300"
                  style={{ left: `${bmiGaugePct(bmiNum)}%`, background: bmiColor }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-[#9ca3af]">
                <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Address */}
      {!isGeneral && (
        <TextField label="Address (optional)" onChange={(v) => update("address", v)} value={form.address} />
      )}

      {/* Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField error={errors.email} label="Email" onChange={(v) => update("email", v)} type="email" value={form.email} />
        <TextField error={errors.confirmEmail} label="Confirm email" onChange={(v) => update("confirmEmail", v)} type="email" value={form.confirmEmail} />
      </div>

      {/* Phone */}
      <div className="grid gap-2 sm:max-w-xs">
        <Label htmlFor="contact-phone">Phone (optional)</Label>
        <PhoneInput id="contact-phone" value={form.phone as PhoneValue} onChange={(v) => update("phone", v ?? "")} placeholder="Enter a phone number" />
      </div>

      {/* Insurance + Referral — skip for general inquiry */}
      {!isGeneral && (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Insurance / Self-pay" onChange={(v) => update("insuranceProvider", v)} value={form.insuranceProvider} />
          <TextField label="How did you hear about us? (optional)" onChange={(v) => update("referralSource", v)} value={form.referralSource} />
        </div>
      )}

      <RadioField compact label="Preferred contact method" onChange={(v) => update("preferredContactMethod", v)} options={["Email", "Phone call", "Text message", "No preference"]} value={form.preferredContactMethod} />

      {form.requestType === "appointment" && (
        <RadioField compact label="Best time to reach you" onChange={(v) => update("bestTime", v)} options={["Morning", "Afternoon", "Evening", "No preference"]} value={form.bestTime} />
      )}

      <div className="grid gap-2">
        <Label htmlFor="contact-message">
          {isGeneral ? "Your message" : "Questions or additional details (optional)"}
        </Label>
        <Textarea className="min-h-24 border-[#cbd7d0] focus-visible:ring-[#145c42]" id="contact-message" onChange={(e) => update("message", e.target.value)} placeholder={isGeneral ? "How can we help you?" : "Pricing, insurance, timing, or treatment questions."} value={form.message} />
      </div>

      {/* Honeypot */}
      <input aria-hidden="true" autoComplete="off" className="hidden" name="website" onChange={(e) => update("website", e.target.value)} tabIndex={-1} value={form.website} />

      <label className="flex cursor-pointer gap-3 rounded-lg border border-[#dce7e0] p-4 text-sm leading-6 text-[#53635b]">
        <input checked={form.textConsent} className="mt-1 size-4 shrink-0 accent-[#145c42]" onChange={(e) => update("textConsent", e.target.checked)} type="checkbox" />
        <span>SMS Consent (optional): I agree to receive text messages from JourneyLite. Message and data rates may apply. Reply STOP to opt out.</span>
      </label>

      <label className="flex cursor-pointer gap-3 rounded-lg border border-[#dce7e0] p-4 text-sm leading-6 text-[#53635b]">
        <input checked={form.consent} className="mt-1 size-4 shrink-0 accent-[#145c42]" onChange={(e) => update("consent", e.target.checked)} type="checkbox" />
        <span>I understand this form is not for medical emergencies, and I agree that JourneyLite may contact me using the information I provided.</span>
      </label>
      {errors.consent && <p className="text-sm font-semibold text-[#8a3b22]">{errors.consent}</p>}
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

function TextField({ label, value, onChange, type = "text", error }: { label: string; value: string; onChange: (value: string) => void; type?: string; error?: string }) {
  const id = `cf-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input aria-invalid={Boolean(error)} className="border-[#cbd7d0] focus-visible:ring-[#145c42]" id={id} onChange={(e) => onChange(e.target.value)} type={type} value={value} />
      {error && <p className="text-sm font-semibold text-[#8a3b22]">{error}</p>}
    </div>
  );
}

function RadioField({ label, options, value, onChange, error, compact = false }: { label: string; options: string[]; value: string; onChange: (value: string) => void; error?: string; compact?: boolean }) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-semibold text-[#1f2c25]">
        {label} <span className="text-[#8a3b22]">*</span>
      </legend>
      <RadioGroup className={cn("grid gap-2", compact ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2")} onValueChange={onChange} value={value}>
        {options.map((option) => {
          const selected = value === option;
          return (
            <Label className={cn("min-h-12 cursor-pointer rounded-lg border border-[#dce7e0] bg-white p-3 text-sm leading-5 text-[#43564d] transition hover:border-[#145c42]", selected && "border-[#145c42] bg-[#edf6f0] text-[#143d2c]")} key={option}>
              <RadioGroupItem value={option} />
              <span>{option}</span>
            </Label>
          );
        })}
      </RadioGroup>
      {error && <p className="text-sm font-semibold text-[#8a3b22]">{error}</p>}
    </fieldset>
  );
}

function CheckboxGroup({ label, items, selected, onToggle, error }: { label: string; items: string[]; selected: string[]; onToggle: (value: string) => void; error?: string }) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-semibold text-[#1f2c25]">
        {label} <span className="text-[#8a3b22]">*</span>
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const checked = selected.includes(item);
          return (
            <label className={cn("flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-[#dce7e0] bg-white p-3 text-sm leading-5 text-[#43564d] transition hover:border-[#145c42]", checked && "border-[#145c42] bg-[#edf6f0] text-[#143d2c]")} key={item}>
              <input checked={checked} className="mt-0.5 size-4 shrink-0 accent-[#145c42]" onChange={() => onToggle(item)} type="checkbox" />
              <span>{item}</span>
            </label>
          );
        })}
      </div>
      {error && <p className="text-sm font-semibold text-[#8a3b22]">{error}</p>}
    </fieldset>
  );
}

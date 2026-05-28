"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CTAButton } from "../components/marketing";

type Inputs = {
  gender: string;
  feet: string;
  inches: string;
  startingWeight: string;
  currentWeight: string;
  goalWeight: string;
  lowestWeight: string;
  priorTreatment: string;
  procedureType: string;
  treatmentDate: string;
  followUpDate: string;
};

type Result = {
  heightIn: number;
  startingWeight: number;
  currentWeight: number;
  goalWeight?: number;
  lowestWeight?: number;
  currentBmi: number;
  startingBmi: number;
  idealWeight: number;
  weightLost: number;
  twl: number;
  excessWeight: number;
  ewl?: number;
  bmiLoss: number;
  ebmil?: number;
  poundsToGoal?: number;
  goalProgress?: number;
  regain?: number;
  percentRegained?: number;
  daysSinceTreatment?: number;
  monthsSinceTreatment?: number;
  averageWeightChangePerMonth?: number;
};

type FieldFeedback = {
  type: "error" | "warning";
  message: string;
};

const initialInputs: Inputs = {
  gender: "",
  feet: "",
  inches: "",
  startingWeight: "",
  currentWeight: "",
  goalWeight: "",
  lowestWeight: "",
  priorTreatment: "",
  procedureType: "",
  treatmentDate: "",
  followUpDate: "",
};

const metricCards = [
  {
    title: "BMI",
    meaning: "A height-and-weight measure often used as one screening point in weight-loss care.",
    why: "BMI can help frame eligibility conversations, but it does not tell the whole story.",
    cta: "See if you qualify",
    href: "/contact",
  },
  {
    title: "Total Weight Loss",
    meaning: "The number of pounds lost from your starting weight.",
    why: "It gives a simple view of progress over time.",
    cta: "Explore options",
    href: "/services/compare-weight-loss-options",
  },
  {
    title: "Percent Total Weight Loss, %TWL",
    meaning: "Shows what percentage of your starting body weight you have lost.",
    why: "This is one of the easiest ways to compare progress across medical and surgical paths.",
    cta: "Compare treatment options",
    href: "/services/compare-weight-loss-options",
  },
  {
    title: "Excess Weight Loss, %EWL",
    meaning: "Compares weight lost with the amount above a BMI 25 reference weight.",
    why: "Bariatric programs often use this to describe progress after procedures.",
    cta: "Learn about surgery",
    href: "/services/gastric-sleeve",
  },
  {
    title: "Excess BMI Loss, %EBMIL",
    meaning: "Looks at how much BMI has changed compared with the amount above BMI 25.",
    why: "It helps translate weight change into a BMI-based progress measure.",
    cta: "Discuss your numbers",
    href: "/contact",
  },
  {
    title: "Goal Weight",
    meaning: "A personal reference point you may discuss with your care team.",
    why: "A realistic goal can guide nutrition, follow-up, medication, and procedure conversations.",
    cta: "Schedule a consultation",
    href: "/contact",
  },
  {
    title: "Weight Regain From Lowest Weight",
    meaning: "If you previously reached a lower weight, this shows how much has returned since then.",
    why: "Regain can be a reason to review nutrition support, medications, anatomy, or revision options.",
    cta: "Review regain support",
    href: "/medications#post-op-support",
  },
  {
    title: "Follow-Up Progress Over Time",
    meaning: "A pattern view of weight, symptoms, habits, labs, and follow-up needs.",
    why: "Long-term support helps turn one-time numbers into a plan that can be adjusted.",
    cta: "Meet the team",
    href: "/about/our-team",
  },
];

const pathwayCards = [
  ["I am exploring weight-loss treatment for the first time", "Start with options that match your goals, health history, and comfort level.", "/services/compare-weight-loss-options"],
  ["I have tried medications or dieting without lasting results", "Compare medical weight loss, GLP-1 options, and surgical paths with structured follow-up.", "/medications"],
  ["I had bariatric surgery and want to understand regain", "Review post-op support, nutrition, medication, anatomy, or revision questions.", "/medications#post-op-support"],
  ["I want a less invasive option", "Compare gastric balloon options that may fit some patients.", "/services/gastric-balloon"],
  ["I want to know if I qualify", "Use your starting point to guide a consultation rather than guessing alone.", "/contact"],
];

const optionCards = [
  ["Gastric sleeve", "Eligible patients considering a durable surgical option.", "May support portion control and metabolic progress with follow-up.", "/services/gastric-sleeve"],
  ["Gastric bypass", "Patients comparing more established metabolic surgery options.", "May support weight loss and selected metabolic goals after evaluation.", "/services/gastric-bypass"],
  ["Gastric balloon", "Patients considering temporary, non-surgical support.", "Helps support portion awareness and habit-building during treatment.", "/services/gastric-balloon"],
  ["Revision surgery", "Patients with prior bariatric surgery or band concerns.", "Helps evaluate regain, reflux, anatomy, or prior procedure problems.", "/services/gastric-band-revision"],
  ["Medical weight loss", "Patients seeking provider-led non-surgical care.", "Combines monitoring, nutrition guidance, and medication review when appropriate.", "/medications"],
  ["GLP-1 medication support", "Eligible patients considering injectable medication options.", "May support appetite regulation with medical screening and follow-up.", "/medications#injectable-medications"],
  ["Nutrition and follow-up support", "Patients working on long-term progress or maintenance.", "Keeps care connected after treatment decisions are made.", "/contact"],
];

const faqItems = [
  {
    question: "What is BMI?",
    answer:
      "BMI is a height-and-weight screening number. It can help frame eligibility and risk conversations, but it is not the only number that matters.",
  },
  {
    question: "What is percent total weight loss?",
    answer:
      "%TWL shows what share of your starting body weight you have lost. It is simple to understand and useful across surgery, medication, and follow-up care.",
  },
  {
    question: "What is excess weight loss?",
    answer:
      "%EWL compares weight lost with the amount above a BMI 25 reference weight. Bariatric programs may use it when discussing procedure outcomes.",
  },
  {
    question: "Why do bariatric programs track these numbers?",
    answer:
      "Metrics can help teams understand your starting point, progress, eligibility, regain risk, and whether the current plan needs to change.",
  },
  {
    question: "Is BMI the only number that matters?",
    answer:
      "No. Health history, symptoms, labs, prior treatments, goals, medication tolerance, and follow-up needs all matter.",
  },
  {
    question: "Can these numbers tell me which procedure I need?",
    answer:
      "No. These results are educational only. A consultation is needed to compare options based on your medical history and goals.",
  },
  {
    question: "What if I already had bariatric surgery and regained weight?",
    answer:
      "Regain can be discussed without judgment. The next step may involve nutrition support, medications, anatomy review, or revision evaluation.",
  },
  {
    question: "When should I schedule a consultation?",
    answer:
      "Schedule when you want help interpreting your numbers, comparing options, or understanding whether surgery, medication, or non-surgical care may fit.",
  },
];

const sourceLinks = [
  ["NIH/NHLBI BMI information", "https://www.nhlbi.nih.gov/health/educational/lose_wt/BMI/bmicalc.htm"],
  ["CDC adult BMI categories", "https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html"],
  ["ASMBS bariatric surgery procedures", "https://asmbs.org/patients/bariatric-surgery-procedures/"],
  ["ACS MBSAQIP quality program", "https://www.facs.org/quality-programs/mbsaqip/"],
  ["Peer-reviewed %TWL and %EWL outcomes study", "https://www.nature.com/articles/s41366-023-01349-7"],
  ["NIDDK types of weight-loss surgery", "https://www.niddk.nih.gov/health-information/weight-management/bariatric-surgery/types"],
];

export function MetricsDashboard() {
  const [inputs, setInputs] = useState<Inputs>(initialInputs);
  const [openMetric, setOpenMetric] = useState(metricCards[0].title);
  const [pdfState, setPdfState] = useState<"idle" | "loading" | "error">("idle");
  const [showResults, setShowResults] = useState(false);

  const result = useMemo(() => calculateResults(inputs), [inputs]);

  function update(key: keyof Inputs, value: string) {
    setInputs((prev) => ({ ...prev, [key]: value }));
    setShowResults(false);
  }

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:px-8 lg:py-16">
          <div>
            <p className="eyebrow">Bariatric metrics dashboard</p>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-[1.08] text-[#1e2b24] md:text-5xl">
              Start With Your Numbers, Then Explore Your Options
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#516059]">
              Enter your height and weight details first. The dashboard will estimate common bariatric metrics in plain
              English, then help you compare weight-loss options that may be worth discussing with JourneyLite.
            </p>
            <p className="mt-4 rounded-lg border border-[#dce4df] bg-[#f7f8f6] p-4 text-sm leading-6 text-[#53635b]">
              No name is collected. Your entries are calculated in your browser and are not sent anywhere. If you choose
              to contact JourneyLite later, you decide what to share.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Private", "No name or contact info"],
                ["Simple", "Four guided steps"],
                ["Useful", "Plain-English summary"],
              ].map(([label, copy]) => (
                <div className="rounded-lg border border-[#cbd7d0] bg-white p-4 shadow-sm" key={label}>
                  <p className="text-sm font-semibold text-[#145c42]">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-[#53635b]">{copy}</p>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTAButton href="/services/compare-weight-loss-options">Explore Weight Loss Options</CTAButton>
              <CTAButton href="/contact" variant="secondary">
                Schedule a Consultation
              </CTAButton>
            </div>
          </div>
          <CalculatorInputCard inputs={inputs} onComplete={() => setShowResults(true)} update={update} />
        </div>
      </section>

      {showResults ? (
        <section className="bg-[#edf4ef] py-10 lg:py-12" id="results">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <ResultsPanel
              inputs={inputs}
              onDownloadPdf={async () => {
                setPdfState("loading");
                try {
                  await downloadResultsPdf(inputs, result);
                  setPdfState("idle");
                } catch {
                  setPdfState("error");
                }
              }}
              pdfState={pdfState}
              result={result}
            />
          </div>
        </section>
      ) : null}

      <section className="bg-[#f7f8f6] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="eyebrow">Why these numbers matter</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight text-[#1f2c25]">
                Weight-loss care is more than one number on a scale.
              </h2>
              <p className="mt-4 text-base leading-7 text-[#53635b]">
                Your weight, BMI, health history, goals, and previous treatments all help shape the right plan. These
                metrics are not here to define you. They help our care team understand your starting point and recommend
                options that may be safe, realistic, and effective for eligible patients after evaluation.
              </p>
              <Link className="mt-5 inline-flex text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href="/services/compare-weight-loss-options">
                View available treatment options
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["Starting point", "Height, weight, BMI, prior treatment, and health history."],
                ["Progress", "Weight change, %TWL, goal progress, and follow-up patterns."],
                ["Options", "Surgery, medication, non-surgical procedures, or renewed support."],
              ].map(([title, copy]) => (
                <article className="rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm" key={title}>
                  <h3 className="text-lg font-semibold text-[#1f2c25]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#53635b]">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">Metric guide</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-[#1f2c25]">
              Common bariatric metrics, explained simply.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#53635b]">
              Open each card for a plain-English explanation of what the result can help patients and providers discuss.
            </p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {metricCards.map((metric) => (
              <article className="overflow-hidden rounded-lg border border-[#dce4df] bg-white shadow-sm" key={metric.title}>
                <button
                  aria-expanded={openMetric === metric.title}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenMetric(openMetric === metric.title ? "" : metric.title)}
                  type="button"
                >
                  <span className="text-lg font-semibold text-[#1f2c25]">{metric.title}</span>
                  <span className="text-xl text-[#145c42]" aria-hidden="true">
                    +
                  </span>
                </button>
                {openMetric === metric.title ? (
                  <div className="border-t border-[#edf1ee] px-5 py-5">
                    <p className="text-sm leading-6 text-[#53635b]">{metric.meaning}</p>
                    <p className="mt-4 text-sm leading-6 text-[#53635b]">
                      <span className="font-semibold text-[#1f2c25]">Why it matters: </span>
                      {metric.why}
                    </p>
                    <Link className="mt-4 inline-flex text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href={metric.href}>
                      {metric.cta}
                    </Link>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">Care pathways</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-[#1f2c25]">
              What your results can help us understand.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {pathwayCards.map(([title, copy, href]) => (
              <article className="flex h-full flex-col rounded-lg border border-[#dce4df] bg-[#fafbf9] p-5" key={title}>
                <h3 className="text-lg font-semibold text-[#1f2c25]">{title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-[#53635b]">{copy}</p>
                <Link className="mt-5 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href={href}>
                  See related options
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8f6] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">Treatment options</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight text-[#1f2c25]">
                Use your starting point to compare available paths.
              </h2>
              <p className="mt-4 text-base leading-7 text-[#53635b]">
                These options are not ranked by the calculator. A consultation can help match your numbers, health
                history, goals, and preferences to a responsible plan.
              </p>
            </div>
            <CTAButton href="/services/compare-weight-loss-options">Explore Weight Loss Options</CTAButton>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {optionCards.map(([title, who, helps, href]) => (
              <article className="flex h-full flex-col rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm" key={title}>
                <h3 className="text-lg font-semibold text-[#1f2c25]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#53635b]">
                  <span className="font-semibold text-[#355346]">May be for: </span>
                  {who}
                </p>
                <p className="mt-3 flex-1 text-sm leading-6 text-[#53635b]">
                  <span className="font-semibold text-[#355346]">Helps with: </span>
                  {helps}
                </p>
                <Link className="mt-5 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href={href}>
                  Learn More
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="eyebrow">Trust and credibility</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight text-[#1f2c25]">
                Bariatric outcomes are commonly tracked over time.
              </h2>
              <p className="mt-4 text-base leading-7 text-[#53635b]">
                Programs may review BMI, percent total weight loss, excess weight loss, follow-up progress, symptoms,
                labs, and health improvements. The goal is to make care more informed, not to reduce your story to a
                spreadsheet.
              </p>
            </div>
            <div className="rounded-xl border border-[#dce4df] bg-[#fafbf9] p-5">
              <h3 className="text-xl font-semibold text-[#1f2c25]">Sources and references</h3>
              <div className="mt-4 divide-y divide-[#dce4df]">
                {sourceLinks.map(([label, href]) => (
                  <details className="py-3" key={label}>
                    <summary className="cursor-pointer list-none text-sm font-semibold text-[#1f2c25] marker:hidden">
                      {label}
                    </summary>
                    <a className="mt-2 inline-flex text-sm text-[#145c42] underline-offset-4 hover:underline" href={href} rel="noreferrer" target="_blank">
                      Open reference
                    </a>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8f6] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">FAQs</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-[#1f2c25]">
              Questions patients often ask about weight-loss metrics.
            </h2>
          </div>
          <div className="mt-8 divide-y divide-[#dce4df] overflow-hidden rounded-lg border border-[#dce4df] bg-white">
            {faqItems.map((item) => (
              <details className="group p-5 open:bg-[#fbfdfb]" key={item.question}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-[#1f2c25] marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]">
                  {item.question}
                  <span className="text-lg text-[#145c42]" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#53635b]">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0f3e2e] py-14 text-white lg:py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="eyebrow text-[#b9d2c5]">Next step</p>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
            Ready to understand your options?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8e6de]">
            Your numbers are only one part of your story. Our team can help you understand what they mean and which
            weight-loss options may fit your goals, health history, and lifestyle.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CTAButton href="/services/compare-weight-loss-options" variant="light">
              Explore Weight Loss Options
            </CTAButton>
            <CTAButton href="/contact" variant="outline">
              Schedule a Consultation
            </CTAButton>
            <CTAButton href="/contact" variant="outline">
              See If You Qualify
            </CTAButton>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#cbd7d0] bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-2">
          <Link className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#145c42] px-3 py-2 text-sm font-semibold text-white" href="/services/compare-weight-loss-options">
            Explore Options
          </Link>
          <Link className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#cbd7d0] bg-white px-3 py-2 text-sm font-semibold text-[#17362a]" href="/contact">
            Consultation
          </Link>
        </div>
      </div>
    </>
  );
}

function CalculatorInputCard({
  inputs,
  onComplete,
  update,
}: {
  inputs: Inputs;
  onComplete: () => void;
  update: (key: keyof Inputs, value: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState<Partial<Record<keyof Inputs, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const steps = ["Measurements", "Goal", "History", "Calculate"];
  const progress = ((step + 1) / steps.length) * 100;
  const feedback = getInputFeedback(inputs);

  function markTouched(key: keyof Inputs) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function shownFeedback(key: keyof Inputs) {
    return touched[key] || submitAttempted || inputs[key] ? feedback[key] : undefined;
  }

  function hasErrors(keys: Array<keyof Inputs>) {
    return keys.some((key) => feedback[key]?.type === "error");
  }

  function goNext() {
    setSubmitAttempted(true);
    if (step === 0 && hasErrors(["feet", "inches", "startingWeight", "currentWeight"])) return;
    if (step === 1 && hasErrors(["goalWeight"])) return;
    if (step === 2 && hasErrors(["lowestWeight", "treatmentDate", "followUpDate"])) return;
    if (
      step === 3 &&
      (hasErrors(["feet", "inches", "startingWeight", "currentWeight", "goalWeight", "lowestWeight", "treatmentDate", "followUpDate"]) ||
        !calculateResults(inputs))
    ) {
      return;
    }

    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
      setSubmitAttempted(false);
      return;
    }

    onComplete();
    window.setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  return (
    <aside className="rounded-2xl border border-[#d6e1da] bg-[#fafbf9] p-5 shadow-xl shadow-[#20372b]/8" id="calculator">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Start here</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#1f2c25]">Enter your details</h2>
        </div>
        <p className="text-sm font-semibold text-[#53635b]">
          Step {step + 1} of {steps.length}
        </p>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-[#145c42]" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-6">
        {step === 0 ? (
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold text-[#1f2c25]">Your starting numbers</h3>
            <p className="rounded-lg border border-[#bfccd8] bg-white p-3 text-sm leading-6 text-[#53635b]">
              Height, starting weight, and current weight are the only required fields. Optional fields will only appear
              in your results if you enter them.
            </p>
            <div>
              <p className="text-sm font-semibold text-[#1f2c25]">Height</p>
              <p className="mt-1 text-xs leading-5 text-[#66756d]">Use feet and inches. Adult range: 4 ft 0 in to 7 ft 6 in.</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <NumberField
                  feedback={shownFeedback("feet")}
                  id="feet"
                  label="Feet"
                  onBlur={() => markTouched("feet")}
                  onChange={(value) => update("feet", value)}
                  value={inputs.feet}
                />
                <NumberField
                  feedback={shownFeedback("inches")}
                  id="inches"
                  label="Inches"
                  onBlur={() => markTouched("inches")}
                  onChange={(value) => update("inches", value)}
                  value={inputs.inches}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField
                feedback={shownFeedback("startingWeight")}
                helper="Use the weight you were at before treatment or when you began your weight-loss plan."
                id="startingWeight"
                label="Starting weight"
                onBlur={() => markTouched("startingWeight")}
                onChange={(value) => update("startingWeight", value)}
                suffix="lb"
                value={inputs.startingWeight}
              />
              <NumberField
                feedback={shownFeedback("currentWeight")}
                helper="Use your most recent weight."
                id="currentWeight"
                label="Current weight"
                onBlur={() => markTouched("currentWeight")}
                onChange={(value) => update("currentWeight", value)}
                suffix="lb"
                value={inputs.currentWeight}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1f2c25]">Gender context optional</p>
              <p className="mt-1 text-xs leading-5 text-[#66756d]">
                BMI uses height and weight. Gender is not required to calculate these dashboard estimates.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {["Female", "Male", "Another gender", "Prefer not to say"].map((option) => (
                  <button
                    aria-pressed={inputs.gender === option}
                    className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm font-semibold ${genderOptionClass(option, inputs.gender === option)}`}
                    key={option}
                    onClick={() => update("gender", option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold text-[#1f2c25]">Optional goal</h3>
            <p className="text-sm leading-6 text-[#53635b]">
              Add a goal only if you want to see progress toward it. Leave it blank and the goal section will stay hidden.
            </p>
            <NumberField
              feedback={shownFeedback("goalWeight")}
              helper="Optional: add a goal if you want to see progress toward it."
              id="goalWeight"
              label="Goal weight optional"
              onBlur={() => markTouched("goalWeight")}
              onChange={(value) => update("goalWeight", value)}
              suffix="lb"
              value={inputs.goalWeight}
            />
            <GoalWeightNote inputs={inputs} />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold text-[#1f2c25]">Treatment history optional</h3>
            <p className="text-sm leading-6 text-[#53635b]">
              If you have had weight-loss treatment before, these details can estimate follow-up timing and regain from
              your lowest weight. Skip anything you do not know.
            </p>
            <div>
              <p className="text-sm font-semibold text-[#1f2c25]">Have you had weight-loss treatment before?</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {["Yes", "No", "Not sure"].map((option) => (
                  <button
                    aria-pressed={inputs.priorTreatment === option}
                    className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm font-semibold ${
                      inputs.priorTreatment === option ? "border-[#145c42] bg-[#edf4ef] text-[#145c42]" : "border-[#dce4df] bg-white text-[#1f2c25] hover:border-[#145c42]"
                    }`}
                    key={option}
                    onClick={() => update("priorTreatment", option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            {inputs.priorTreatment === "Yes" ? (
              <div className="grid gap-4 rounded-lg border border-[#dce4df] bg-white p-4">
                <label className="block" htmlFor="procedureType">
                  <span className="text-sm font-semibold text-[#1f2c25]">Procedure or treatment type optional</span>
                  <select
                    className="mt-2 min-h-11 w-full rounded-lg border border-[#cbd7d0] bg-white px-3 py-2 text-sm text-[#1f2c25] focus:outline-none focus:ring-2 focus:ring-[#145c42]"
                    id="procedureType"
                    onBlur={() => markTouched("procedureType")}
                    onChange={(event) => update("procedureType", event.target.value)}
                    value={inputs.procedureType}
                  >
                    <option value="">Select if known</option>
                    <option value="Gastric sleeve">Gastric sleeve</option>
                    <option value="Gastric bypass">Gastric bypass</option>
                    <option value="Gastric band">Gastric band</option>
                    <option value="Gastric balloon">Gastric balloon</option>
                    <option value="Medication-supported weight loss">Medication-supported weight loss</option>
                    <option value="Other or not sure">Other or not sure</option>
                  </select>
                </label>
                <NumberField
                  feedback={shownFeedback("lowestWeight")}
                  helper="Optional: add your lowest weight after treatment to estimate weight regain."
                  id="lowestWeight"
                  label="Lowest weight after treatment optional"
                  onBlur={() => markTouched("lowestWeight")}
                  onChange={(value) => update("lowestWeight", value)}
                  suffix="lb"
                  value={inputs.lowestWeight}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <DateField
                    feedback={shownFeedback("treatmentDate")}
                    helper="Optional: used only for time-based progress estimates."
                    id="treatmentDate"
                    label="Surgery or treatment date optional"
                    onBlur={() => markTouched("treatmentDate")}
                    onChange={(value) => update("treatmentDate", value)}
                    value={inputs.treatmentDate}
                  />
                  <DateField
                    feedback={shownFeedback("followUpDate")}
                    helper="Optional: add a follow-up date if you want average change per month."
                    id="followUpDate"
                    label="Follow-up date optional"
                    onBlur={() => markTouched("followUpDate")}
                    onChange={(value) => update("followUpDate", value)}
                    value={inputs.followUpDate}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-[#dce4df] bg-white p-4 text-sm leading-6 text-[#53635b]">
                No problem. Regain and time-based outputs will stay hidden unless you add treatment history details.
              </div>
            )}
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <h3 className="text-lg font-semibold text-[#1f2c25]">Ready to calculate</h3>
            <p className="mt-2 text-sm leading-6 text-[#53635b]">
              We will show only the sections supported by your entries: BMI, weight change, % total weight loss, and any
              optional goal, regain, or timing estimates.
            </p>
            <div className="mt-4 rounded-lg border border-[#d8c88b] bg-[#fffdf4] p-4 text-sm leading-6 text-[#5e5235]">
              No name is collected. Your entries stay on this page and are not sent anywhere.
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#cbd7d0] bg-white px-4 py-2.5 text-sm font-semibold text-[#17362a] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={step === 0}
          onClick={() => {
            setStep((prev) => Math.max(prev - 1, 0));
            setSubmitAttempted(false);
          }}
          type="button"
        >
          Back
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#145c42] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f4d37]"
          onClick={goNext}
          type="button"
        >
          {step === steps.length - 1 ? "Calculate Results" : "Continue"}
        </button>
      </div>
    </aside>
  );
}

function NumberField({
  feedback,
  helper,
  id,
  label,
  onBlur,
  value,
  onChange,
  suffix,
}: {
  feedback?: FieldFeedback;
  helper?: string;
  id: string;
  label: string;
  onBlur: () => void;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
}) {
  const helperId = `${id}-helper`;
  const feedbackId = `${id}-feedback`;
  const describedBy = [helper ? helperId : "", feedback ? feedbackId : ""].filter(Boolean).join(" ") || undefined;

  return (
    <div className="block">
      <label className="text-sm font-semibold text-[#1f2c25]" htmlFor={id}>
        {label}
      </label>
      {helper ? (
        <p className="mt-1 text-xs leading-5 text-[#66756d]" id={helperId}>
          {helper}
        </p>
      ) : null}
      <div
        className={`mt-2 flex rounded-lg border bg-white focus-within:ring-2 ${
          feedback?.type === "error" ? "border-[#d66b4f] focus-within:ring-[#d66b4f]" : "border-[#cbd7d0] focus-within:ring-[#145c42]"
        }`}
      >
        <input
          aria-describedby={describedBy}
          aria-invalid={feedback?.type === "error" ? true : undefined}
          className="min-w-0 flex-1 rounded-lg bg-transparent px-4 py-3 text-sm text-[#1f2c25] focus:outline-none"
          id={id}
          inputMode="decimal"
          min="0"
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          type="number"
          value={value}
        />
        {suffix ? <span className="flex items-center px-3 text-xs font-semibold text-[#66756d]">{suffix}</span> : null}
      </div>
      {feedback ? (
        <p className={`mt-2 text-xs leading-5 ${feedback.type === "error" ? "font-semibold text-[#9d341c]" : "text-[#6b5a23]"}`} id={feedbackId}>
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}

function DateField({
  feedback,
  helper,
  id,
  label,
  onBlur,
  onChange,
  value,
}: {
  feedback?: FieldFeedback;
  helper?: string;
  id: string;
  label: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  value: string;
}) {
  const helperId = `${id}-helper`;
  const feedbackId = `${id}-feedback`;
  const describedBy = [helper ? helperId : "", feedback ? feedbackId : ""].filter(Boolean).join(" ") || undefined;

  return (
    <div className="block">
      <label className="text-sm font-semibold text-[#1f2c25]" htmlFor={id}>
        {label}
      </label>
      {helper ? (
        <p className="mt-1 text-xs leading-5 text-[#66756d]" id={helperId}>
          {helper}
        </p>
      ) : null}
      <input
        aria-describedby={describedBy}
        aria-invalid={feedback?.type === "error" ? true : undefined}
        className={`mt-2 min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#1f2c25] focus:outline-none focus:ring-2 ${
          feedback?.type === "error" ? "border-[#d66b4f] focus:ring-[#d66b4f]" : "border-[#cbd7d0] focus:ring-[#145c42]"
        }`}
        id={id}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={value}
      />
      {feedback ? (
        <p className={`mt-2 text-xs leading-5 ${feedback.type === "error" ? "font-semibold text-[#9d341c]" : "text-[#6b5a23]"}`} id={feedbackId}>
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}

function genderOptionClass(option: string, selected: boolean) {
  if (!selected) return "border-[#dce4df] bg-white text-[#1f2c25] hover:border-[#145c42]";
  if (option === "Male") return "border-[#2c6fa3] bg-[#eaf4ff] text-[#195176]";
  if (option === "Female") return "border-[#c95b5b] bg-[#fff0f0] text-[#963333]";
  return "border-[#145c42] bg-[#edf4ef] text-[#145c42]";
}

function GoalWeightNote({ inputs }: { inputs: Inputs }) {
  const feet = toNumber(inputs.feet);
  const inches = toNumber(inputs.inches);
  const goalWeight = toNumber(inputs.goalWeight);
  const heightIn = feet * 12 + inches;

  if (!heightIn || !goalWeight) return null;

  const goalBmi = bmiFromWeight(goalWeight, heightIn);
  const context = getGoalBmiContext(goalBmi);

  return (
    <div className={`rounded-lg border p-3 text-sm leading-6 ${toneClasses(context.tone)}`}>
      {context.message}
    </div>
  );
}

function ResultsPanel({
  inputs,
  result,
  pdfState,
  onDownloadPdf,
}: {
  inputs: Inputs;
  result?: Result;
  pdfState: "idle" | "loading" | "error";
  onDownloadPdf: () => Promise<void>;
}) {
  if (!result) {
    return (
      <div className="rounded-xl border border-[#dce4df] bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-semibold text-[#1f2c25]">Your results will appear here.</h3>
        <p className="mt-3 text-sm leading-6 text-[#53635b]">
          Enter height, starting weight, and current weight to estimate your bariatric metrics.
        </p>
      </div>
    );
  }

  const bmiContext = getBmiContext(result.currentBmi);
  const startingBmiContext = getBmiContext(result.startingBmi);
  const goalBmi = result.goalWeight ? bmiFromWeight(result.goalWeight, result.heightIn) : undefined;
  const goalBmiContext = goalBmi ? getBmiContext(goalBmi) : undefined;
  const validRegain = result.regain !== undefined && result.percentRegained !== undefined && result.regain >= 0;
  const warnings = getResultWarnings(result);
  const resultCards = [
    {
      label: "Current BMI",
      value: formatNumber(result.currentBmi, 1),
      explanation: bmiContext.copy,
      calculation: "BMI = weight lb / height in² × 703",
    },
    {
      label: "Weight change from starting weight",
      value: `${formatNumber(Math.abs(result.weightLost), 1)} lb ${result.weightLost >= 0 ? "lost" : "gained"}`,
      explanation:
        result.weightLost >= 0
          ? `You have lost ${formatNumber(result.weightLost, 1)} pounds from your starting weight.`
          : "Your current weight is higher than your starting weight, so weight-loss metrics show weight gain instead of loss.",
      calculation: "Weight change = starting weight - current weight",
    },
    {
      label: "Percent total weight loss",
      value: `${formatNumber(result.twl, 1)}%`,
      explanation: getTwlInterpretation(result.twl),
      calculation: "%TWL = (starting weight - current weight) / starting weight × 100",
    },
    ...(result.ewl !== undefined
      ? [
          {
            label: "Excess weight loss",
            value: `${formatNumber(result.ewl, 1)}%`,
            explanation: getEwlInterpretation(result.ewl),
            calculation: "%EWL = (starting weight - current weight) / (starting weight - BMI 25 reference weight) × 100",
          },
        ]
      : []),
    ...(result.goalWeight && goalBmi !== undefined
      ? [
          {
            label: "Goal progress",
            value: `${formatNumber(Math.abs(result.poundsToGoal ?? 0), 1)} lb ${result.poundsToGoal && result.poundsToGoal > 0 ? "from goal" : "past goal"}`,
            explanation: getGoalInterpretation(result, goalBmi),
            calculation: "Pounds to goal = current weight - goal weight",
          },
        ]
      : []),
    ...(validRegain
      ? [
          {
            label: "Weight regain",
            value: `${formatNumber(result.regain ?? 0, 1)} lb`,
            explanation: getRegainInterpretation(result.percentRegained ?? 0),
            calculation: "% regained = (current weight - lowest weight) / (starting weight - lowest weight) × 100",
          },
        ]
      : []),
    ...(result.daysSinceTreatment !== undefined && result.monthsSinceTreatment !== undefined && result.averageWeightChangePerMonth !== undefined
      ? [
          {
            label: "Time-based progress",
            value: `${formatNumber(result.monthsSinceTreatment, 1)} months`,
            explanation: `About ${formatNumber(result.daysSinceTreatment, 0)} days between the treatment and follow-up dates entered. Average weight change is ${formatNumber(
              Math.abs(result.averageWeightChangePerMonth),
              1,
            )} lb per month.`,
            calculation: "Average monthly change = weight change / months between dates",
          },
        ]
      : []),
  ];

  return (
    <div className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-xl shadow-[#20372b]/8 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-[#1f2c25]">Estimated results</h3>
          <p className="mt-2 text-sm leading-6 text-[#53635b]">
            Your numbers are a starting point for a more complete conversation.
          </p>
        </div>
        <Link className="text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href="/contact">
          See If You Qualify
        </Link>
      </div>

      <div aria-live="polite" className="mt-5 grid gap-3 sm:grid-cols-2">
        {resultCards.map((card) => (
          <ResultCard {...card} key={card.label} />
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <div className={`rounded-lg border p-4 ${toneClasses(bmiContext.tone)}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.1em]">{bmiContext.kicker}</p>
          <h4 className="mt-2 text-lg font-semibold">{bmiContext.label}</h4>
          <p className="mt-2 text-sm leading-6">{bmiContext.copy}</p>
        </div>
        <div className="rounded-lg border border-[#dce4df] bg-white p-4 text-sm leading-6 text-[#53635b]">
          <p className="font-semibold text-[#1f2c25]">Quick interpretation</p>
          <p className="mt-2">
            Starting BMI: <span className="font-semibold text-[#1f2c25]">{formatNumber(result.startingBmi, 1)}</span>{" "}
            ({startingBmiContext.label}).
          </p>
          {goalBmiContext ? (
            <p className="mt-2">
              Goal BMI estimate: <span className="font-semibold text-[#1f2c25]">{formatNumber(goalBmi ?? 0, 1)}</span>{" "}
              ({goalBmiContext.label}).
            </p>
          ) : null}
          <p className="mt-2">BMI is a screening tool. Your health history, symptoms, labs, medications, and goals also matter.</p>
        </div>
      </div>

      {warnings.length ? (
        <div className="mt-4 grid gap-3">
          {warnings.map((warning) => (
            <div className="rounded-lg border border-[#d8c88b] bg-[#fffdf4] p-4 text-sm leading-6 text-[#5e5235]" key={warning}>
              {warning}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        <ProgressLine label="% Total Weight Loss" value={clamp(result.twl, 0, 50)} max={50} display={`${formatNumber(result.twl, 1)}%`} />
        {result.goalProgress !== undefined ? (
          <ProgressLine label="Progress toward entered goal" value={clamp(result.goalProgress, 0, 100)} max={100} display={`${formatNumber(clamp(result.goalProgress, 0, 100), 0)}%`} />
        ) : null}
        {validRegain ? (
          <ProgressLine
            label="Weight regained from lowest weight"
            value={clamp(result.percentRegained ?? 0, 0, 100)}
            max={100}
            display={`${formatNumber(result.regain ?? 0, 1)} lb`}
          />
        ) : null}
      </div>

      <div className="mt-6 rounded-lg border border-[#d8c88b] bg-[#fffdf4] p-4 text-sm leading-6 text-[#5e5235]">
        <p>
          Your current BMI is {formatNumber(result.currentBmi, 1)}. {bmiContext.copy} {getTwlInterpretation(result.twl)}
        </p>
        {inputs.goalWeight && goalBmi !== undefined ? <p className="mt-2">{getGoalInterpretation(result, goalBmi)}</p> : null}
        {validRegain ? <p className="mt-2">{getRegainInterpretation(result.percentRegained ?? 0)}</p> : null}
      </div>

      <NextStepCards result={result} />

      <div className="mt-6">
        <p className="text-sm font-semibold text-[#1f2c25]">
          Want to save this? Download a simple PDF summary to review or bring to your consultation.
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <button
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#145c42] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] sm:w-auto"
            onClick={onDownloadPdf}
            type="button"
          >
            {pdfState === "loading" ? "Preparing PDF..." : "Download My Results as PDF"}
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-[#53635b]">
          No name is collected. Your results stay on this page and are not sent anywhere unless you choose what to share.
        </p>
        {pdfState === "error" ? <p className="mt-2 text-sm font-semibold text-[#8a3b22]">The PDF could not be generated. Please try again.</p> : null}
      </div>
    </div>
  );
}

function ResultCard({
  calculation,
  explanation,
  label,
  value,
}: {
  calculation: string;
  explanation: string;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-lg border border-[#dce4df] bg-[#fafbf9] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#66756d]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#1f2c25]">{value}</p>
      <p className="mt-2 text-xs leading-5 text-[#53635b]">{explanation}</p>
      <details className="mt-3">
        <summary className="cursor-pointer list-none text-xs font-semibold text-[#145c42] underline-offset-4 hover:underline">
          How this is calculated
        </summary>
        <p className="mt-2 rounded-md bg-white p-3 text-xs leading-5 text-[#53635b]">{calculation}</p>
      </details>
    </article>
  );
}

function NextStepCards({ result }: { result: Result }) {
  const cards = getNextStepCards(result);

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold text-[#1f2c25]">Suggested next steps</h4>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {cards.map((card) => (
          <article className="flex h-full flex-col rounded-lg border border-[#dce4df] bg-white p-4 shadow-sm" key={card.title}>
            <h5 className="text-base font-semibold text-[#1f2c25]">{card.title}</h5>
            <p className="mt-2 flex-1 text-sm leading-6 text-[#53635b]">{card.copy}</p>
            <Link className="mt-4 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href={card.href}>
              {card.cta}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProgressLine({ label, value, max, display }: { label: string; value: number; max: number; display: string }) {
  const width = max > 0 ? (value / max) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-xs font-semibold text-[#53635b]">
        <span>{label}</span>
        <span>{display}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf4ef]">
        <div className="h-full rounded-full bg-[#145c42]" style={{ width: `${clamp(width, 0, 100)}%` }} />
      </div>
    </div>
  );
}

function getInputFeedback(inputs: Inputs): Partial<Record<keyof Inputs, FieldFeedback>> {
  const feedback: Partial<Record<keyof Inputs, FieldFeedback>> = {};
  const feet = parseOptionalNumber(inputs.feet);
  const inches = inputs.inches === "" ? 0 : parseOptionalNumber(inputs.inches);
  const startingWeight = parseOptionalNumber(inputs.startingWeight);
  const currentWeight = parseOptionalNumber(inputs.currentWeight);
  const goalWeight = parseOptionalNumber(inputs.goalWeight);
  const lowestWeight = parseOptionalNumber(inputs.lowestWeight);
  const heightIn = feet && inches !== undefined ? feet * 12 + inches : 0;

  if (inputs.feet === "") feedback.feet = { type: "error", message: "Enter your height so we can calculate BMI." };
  else if (feet === undefined || feet <= 0) feedback.feet = { type: "error", message: "Enter feet using a positive number." };

  if (inputs.inches !== "" && (inches === undefined || inches < 0 || inches > 11)) {
    feedback.inches = { type: "error", message: "Enter inches from 0 to 11." };
  }

  if (heightIn && (heightIn < 48 || heightIn > 90)) {
    feedback.feet = {
      type: "error",
      message: "This height looks outside the usual adult range. Please double-check it.",
    };
  }

  if (inputs.startingWeight === "") {
    feedback.startingWeight = { type: "error", message: "Enter a starting weight to calculate weight-loss progress." };
  } else {
    feedback.startingWeight = validateWeight(startingWeight, "This weight looks very low for an adult. Please double-check it.", "This weight looks very high. Please double-check it.");
  }

  if (inputs.currentWeight === "") {
    feedback.currentWeight = { type: "error", message: "Enter your current weight to see your results." };
  } else {
    feedback.currentWeight = validateWeight(currentWeight, "This weight looks very low for an adult. Please double-check it.", "This weight looks very high. Please double-check it.");
  }

  if (heightIn && startingWeight && currentWeight && !feedback.currentWeight) {
    const twl = ((startingWeight - currentWeight) / startingWeight) * 100;
    const currentBmi = bmiFromWeight(currentWeight, heightIn);
    if (twl > 50 || currentBmi < 18.5) {
      feedback.currentWeight = {
        type: "warning",
        message: "This is a large change from your starting weight. Please double-check the number.",
      };
    } else if (currentWeight > startingWeight) {
      feedback.currentWeight = {
        type: "warning",
        message: "Your current weight is higher than your starting weight, so weight-loss metrics will show weight gain instead of loss.",
      };
    }
  }

  if (inputs.goalWeight !== "") {
    feedback.goalWeight = validateWeight(goalWeight, "This weight looks very low for an adult. Please double-check it.", "This weight looks very high. Please double-check it.");
    if (!feedback.goalWeight && goalWeight && heightIn) {
      if (goalWeight > (currentWeight || 0)) {
        feedback.goalWeight = { type: "warning", message: "This goal is higher than your current weight. Please double-check that this is intentional." };
      } else if (startingWeight && ((startingWeight - goalWeight) / startingWeight) * 100 > 50) {
        feedback.goalWeight = { type: "warning", message: "This is a very large goal. A care team can help set safe, realistic milestones." };
      }
    }
  }

  if (inputs.lowestWeight !== "") {
    feedback.lowestWeight = validateWeight(lowestWeight, "This weight looks very low for an adult. Please double-check it.", "This weight looks very high. Please double-check it.");
    if (!feedback.lowestWeight && lowestWeight && heightIn) {
      if (bmiFromWeight(lowestWeight, heightIn) < 18.5) {
        feedback.lowestWeight = {
          type: "warning",
          message: "This lowest weight would fall below the standard healthy BMI range. Please double-check it.",
        };
      } else if (startingWeight && lowestWeight > startingWeight) {
        feedback.lowestWeight = {
          type: "warning",
          message: "Lowest weight is usually below starting weight. Please double-check this value.",
        };
      } else if (currentWeight && lowestWeight > currentWeight) {
        feedback.lowestWeight = {
          type: "warning",
          message: "Because this value is higher than your current weight, weight regain from lowest weight does not apply.",
        };
      }
    }
  }

  if (inputs.treatmentDate && isFutureDate(inputs.treatmentDate)) {
    feedback.treatmentDate = { type: "error", message: "Treatment date cannot be in the future." };
  }

  if (inputs.followUpDate && isFutureDate(inputs.followUpDate)) {
    feedback.followUpDate = { type: "error", message: "Follow-up date cannot be in the future." };
  }

  if (inputs.treatmentDate && inputs.followUpDate && new Date(inputs.followUpDate) < new Date(inputs.treatmentDate)) {
    feedback.followUpDate = { type: "error", message: "Follow-up date cannot be before the surgery or treatment date." };
  }

  return feedback;
}

function validateWeight(value: number | undefined, lowMessage: string, highMessage: string): FieldFeedback | undefined {
  if (value === undefined || value <= 0) return { type: "error", message: "Enter weight using a positive number." };
  if (value < 70) return { type: "error", message: lowMessage };
  if (value > 800) return { type: "error", message: highMessage };
  return undefined;
}

function parseOptionalNumber(value: string) {
  if (value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function isFutureDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date > today;
}

function bmiFromWeight(weight: number, heightIn: number) {
  return (weight / (heightIn * heightIn)) * 703;
}

function getBmiContext(bmi: number) {
  if (bmi < 18.5) {
    return {
      kicker: "Below healthy range",
      label: "Below the standard healthy BMI range",
      tone: "red" as const,
      copy: "This is below the standard healthy BMI range. A medical provider can help evaluate whether this is safe for you.",
    };
  }

  if (bmi < 25) {
    return {
      kicker: "Healthy range",
      label: "Standard healthy BMI range",
      tone: "green" as const,
      copy: "This is within the standard healthy BMI range.",
    };
  }

  if (bmi < 30) {
    return {
      kicker: "Overweight range",
      label: "Overweight BMI range",
      tone: "yellow" as const,
      copy: "This falls in the overweight BMI range.",
    };
  }

  if (bmi < 35) {
    return {
      kicker: "Class I obesity",
      label: "Class I obesity BMI range",
      tone: "blue" as const,
      copy: "This falls in the Class I obesity BMI range.",
    };
  }

  if (bmi < 40) {
    return {
      kicker: "Class II obesity",
      label: "Class II obesity BMI range",
      tone: "blue" as const,
      copy: "This falls in the Class II obesity BMI range.",
    };
  }

  return {
    kicker: "Class III obesity",
    label: "Class III obesity BMI range",
    tone: "blue" as const,
    copy: "This falls in the Class III obesity BMI range.",
  };
}

function toneClasses(tone: "green" | "yellow" | "red" | "blue") {
  if (tone === "green") return "border-[#b8d4c4] bg-[#edf8f1] text-[#1f5a3e]";
  if (tone === "yellow") return "border-[#d8c88b] bg-[#fffdf4] text-[#5e5235]";
  if (tone === "red") return "border-[#efb3a5] bg-[#fff5f2] text-[#8a3b22]";
  return "border-[#bfccd8] bg-[#f3f8fc] text-[#255374]";
}

function getGoalBmiContext(goalBmi: number) {
  if (goalBmi < 18.5) {
    return {
      tone: "red" as const,
      message:
        "This goal weight would fall below the standard healthy BMI range. Please discuss a safe goal with a medical provider.",
    };
  }
  if (goalBmi < 25) {
    return {
      tone: "green" as const,
      message: "This goal is within the standard healthy BMI range.",
    };
  }
  if (goalBmi < 30) {
    return {
      tone: "yellow" as const,
      message: "This goal is in the overweight BMI range, but it may still be a meaningful and medically helpful milestone.",
    };
  }
  return {
    tone: "blue" as const,
    message:
      "This goal is still in the obesity BMI range, but it may still represent important progress depending on your starting point and health history.",
  };
}

function getTwlInterpretation(twl: number) {
  if (twl < 0) return "This shows weight gain compared with your starting weight.";
  if (twl < 5) return "This shows early or modest change from your starting weight.";
  if (twl < 10) return "Even 5% total weight loss can be clinically meaningful for some people.";
  if (twl < 15) return "This level of total weight loss may represent meaningful progress.";
  if (twl < 20) return "This is a strong amount of total weight loss.";
  return "This is a substantial amount of total weight loss.";
}

function getEwlInterpretation(ewl: number) {
  if (ewl < 0) return "This shows weight gain relative to the starting point.";
  if (ewl < 25) return "This may represent early progress, depending on timing and treatment type.";
  if (ewl < 50) return "This may represent meaningful progress.";
  return "Many bariatric studies use 50% excess weight loss as a common success benchmark, but your care team should interpret this in context.";
}

function getGoalInterpretation(result: Result, goalBmi: number) {
  const pounds = Math.abs(result.poundsToGoal ?? 0);
  const direction = result.poundsToGoal && result.poundsToGoal > 0 ? "from" : "past";
  return `You are ${formatNumber(pounds, 1)} lb ${direction} your entered goal. Your entered goal would place BMI at ${formatNumber(
    goalBmi,
    1,
  )}. ${getGoalBmiContext(goalBmi).message} Healthy goals vary by person.`;
}

function getRegainInterpretation(percentRegained: number) {
  if (percentRegained < 10) return "This suggests limited regain from your lowest weight.";
  if (percentRegained < 20) return "This may be worth discussing during follow-up, especially if the trend continues.";
  return "This level of regain may be worth reviewing with a bariatric provider to discuss support or revision options.";
}

function getResultWarnings(result: Result) {
  const warnings: string[] = [];
  const goalBmi = result.goalWeight ? bmiFromWeight(result.goalWeight, result.heightIn) : undefined;
  const lowestBmi = result.lowestWeight ? bmiFromWeight(result.lowestWeight, result.heightIn) : undefined;

  if (result.weightLost < 0) {
    warnings.push("Your current weight is higher than your starting weight, so weight-loss metrics will show weight gain instead of loss.");
  }
  if (result.twl > 50 || result.currentBmi < 18.5) {
    warnings.push("This is a large change from your starting weight. Please double-check the number.");
  }
  if (goalBmi !== undefined && goalBmi < 18.5) {
    warnings.push("This goal weight would fall below the standard healthy BMI range. Please discuss a safe goal with a medical provider.");
  }
  if (result.goalWeight && result.goalWeight > result.currentWeight) {
    warnings.push("This goal is higher than your current weight. Please double-check that this is intentional.");
  }
  if (result.lowestWeight && result.lowestWeight > result.currentWeight) {
    warnings.push("Because lowest weight is higher than your current weight, weight regain from lowest weight does not apply.");
  }
  if (lowestBmi !== undefined && lowestBmi < 18.5) {
    warnings.push("The lowest weight entered would fall below the standard healthy BMI range. Please double-check it.");
  }

  return Array.from(new Set(warnings));
}

function getNextStepCards(result: Result) {
  if (result.currentBmi < 18.5) {
    return [
      {
        title: "Talk with a provider about safe next steps",
        copy: "Because this BMI estimate is below the standard healthy range, the next step should be a medical conversation rather than weight-loss treatment browsing.",
        cta: "Contact JourneyLite",
        href: "/contact",
      },
    ];
  }

  const cards = [
    {
      title: "Explore weight-loss treatment options",
      copy: "Your results could be a starting point for comparing medical, surgical, and non-surgical paths.",
      cta: "Explore options",
      href: "/services/compare-weight-loss-options",
    },
  ];

  if (result.currentBmi >= 35) {
    cards.push({
      title: "See if bariatric surgery may be an option",
      copy: "A consultation can help you understand eligibility, health history, insurance steps, and procedure fit.",
      cta: "Review surgery options",
      href: "/services/gastric-sleeve",
    });
  } else if (result.currentBmi >= 30) {
    cards.push({
      title: "Compare medical and procedural care",
      copy: "Medical weight loss, medications, and procedures may be worth discussing after evaluation.",
      cta: "Compare options",
      href: "/services/compare-weight-loss-options",
    });
  }

  if (result.percentRegained !== undefined && result.percentRegained >= 20) {
    cards.push({
      title: "Learn about revision and follow-up options",
      copy: "Regain can be reviewed without judgment. Support may include nutrition, medication, anatomy review, or revision evaluation.",
      cta: "Review regain support",
      href: "/medications#post-op-support",
    });
  } else if (result.goalProgress !== undefined && result.goalProgress >= 80 && result.goalProgress <= 120) {
    cards.push({
      title: "Discuss maintenance support",
      copy: "If you are close to goal, follow-up can help with nutrition, protein, hydration, labs, and long-term maintenance.",
      cta: "Schedule a visit",
      href: "/contact",
    });
  }

  return cards.slice(0, 3);
}

function calculateResults(inputs: Inputs): Result | undefined {
  const feet = toNumber(inputs.feet);
  const inches = toNumber(inputs.inches);
  const startingWeight = toNumber(inputs.startingWeight);
  const currentWeight = toNumber(inputs.currentWeight);
  const goalWeight = toNumber(inputs.goalWeight);
  const lowestWeight = toNumber(inputs.lowestWeight);
  const heightIn = feet * 12 + inches;

  if (!heightIn || !startingWeight || !currentWeight) return undefined;

  const currentBmi = bmiFromWeight(currentWeight, heightIn);
  const startingBmi = bmiFromWeight(startingWeight, heightIn);
  const idealWeight = (25 * heightIn * heightIn) / 703;
  const weightLost = startingWeight - currentWeight;
  const twl = (weightLost / startingWeight) * 100;
  const excessWeight = startingWeight - idealWeight;
  const ewl = excessWeight > 0 ? (weightLost / excessWeight) * 100 : undefined;
  const bmiLoss = startingBmi - currentBmi;
  const ebmil = startingBmi > 25 ? (bmiLoss / (startingBmi - 25)) * 100 : undefined;
  const poundsToGoal = goalWeight ? currentWeight - goalWeight : undefined;
  const goalProgress = goalWeight && startingWeight > goalWeight ? (weightLost / (startingWeight - goalWeight)) * 100 : undefined;
  const canCalculateRegain = Boolean(lowestWeight && startingWeight > lowestWeight && currentWeight >= lowestWeight);
  const regain = canCalculateRegain ? currentWeight - lowestWeight : undefined;
  const percentRegained = canCalculateRegain ? ((currentWeight - lowestWeight) / (startingWeight - lowestWeight)) * 100 : undefined;
  const treatmentDate = inputs.treatmentDate ? new Date(`${inputs.treatmentDate}T00:00:00`) : undefined;
  const followUpDate = inputs.followUpDate ? new Date(`${inputs.followUpDate}T00:00:00`) : undefined;
  const daysSinceTreatment =
    treatmentDate && followUpDate && followUpDate >= treatmentDate ? Math.max(0, Math.round((followUpDate.getTime() - treatmentDate.getTime()) / 86400000)) : undefined;
  const monthsSinceTreatment = daysSinceTreatment !== undefined ? Math.max(daysSinceTreatment / 30.437, 0.1) : undefined;
  const averageWeightChangePerMonth = monthsSinceTreatment ? weightLost / monthsSinceTreatment : undefined;

  return {
    heightIn,
    startingWeight,
    currentWeight,
    goalWeight,
    lowestWeight,
    currentBmi,
    startingBmi,
    idealWeight,
    weightLost,
    twl,
    excessWeight,
    ewl,
    bmiLoss,
    ebmil,
    poundsToGoal,
    goalProgress,
    regain,
    percentRegained,
    daysSinceTreatment,
    monthsSinceTreatment,
    averageWeightChangePerMonth,
  };
}

async function downloadResultsPdf(inputs: Inputs, result?: Result) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 44;
  let y = 46;

  const write = (text: string, size = 10, color = "#53635b", x = margin) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    doc.text(lines, x, y);
    y += lines.length * (size + 4);
  };
  const heading = (text: string, size = 17) => {
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor("#1f2c25");
    doc.text(text, margin, y);
    y += size + 10;
  };
  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor("#1f2c25");
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#53635b");
    doc.text(value, margin + 190, y);
    y += 18;
  };
  const pageBreak = () => {
    if (y > 700) {
      doc.addPage();
      y = 46;
    }
  };

  doc.setFillColor("#f7f8f6");
  doc.rect(0, 0, pageWidth, 120, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor("#145c42");
  doc.text("JourneyLite Bariatric Physicians", margin, y);
  y += 26;
  doc.setFontSize(24);
  doc.setTextColor("#1f2c25");
  doc.text("Your Weight-Loss Metrics Summary", margin, y);
  y += 24;
  write(`Date generated: ${new Date().toLocaleDateString()}`, 10);
  y = 140;

  heading("Entered values");
  row("Height", `${inputs.feet || "0"} ft ${inputs.inches || "0"} in`);
  row("Starting weight", `${inputs.startingWeight || "Not entered"} lb`);
  row("Current weight", `${inputs.currentWeight || "Not entered"} lb`);
  if (inputs.gender) row("Gender context", inputs.gender);
  if (inputs.goalWeight) row("Goal weight", `${inputs.goalWeight} lb`);
  if (inputs.priorTreatment) row("Prior treatment", inputs.priorTreatment);
  if (inputs.procedureType) row("Procedure or treatment type", inputs.procedureType);
  if (inputs.lowestWeight) row("Lowest weight after treatment", `${inputs.lowestWeight} lb`);
  if (inputs.treatmentDate) row("Treatment date", inputs.treatmentDate);
  if (inputs.followUpDate) row("Follow-up date", inputs.followUpDate);

  heading("Calculated results");
  if (result) {
    const bmiContext = getBmiContext(result.currentBmi);
    row("Current BMI", formatNumber(result.currentBmi, 1));
    row("BMI category", bmiContext.label);
    row("Weight change", `${formatNumber(Math.abs(result.weightLost), 1)} lb ${result.weightLost >= 0 ? "lost" : "gained"}`);
    row("Percent total weight loss", `${formatNumber(result.twl, 1)}%`);
    if (result.ewl !== undefined) row("Estimated excess weight loss", `${formatNumber(result.ewl, 1)}%`);
    row("BMI change", formatNumber(result.bmiLoss, 1));
    if (result.goalProgress !== undefined) row("Progress toward goal", `${formatNumber(clamp(result.goalProgress, 0, 100), 0)}%`);
    if (result.regain !== undefined) row("Weight regain", `${formatNumber(result.regain, 1)} lb`);
    if (result.daysSinceTreatment !== undefined) row("Days between dates", `${formatNumber(result.daysSinceTreatment, 0)} days`);
  } else {
    write("Not enough values were entered to calculate results.", 10);
  }

  pageBreak();
  heading("Plain-English explanations");
  write("BMI is a height-and-weight screening number. It can help frame a care discussion, but it is not a diagnosis by itself.");
  if (result) {
    write(`${getBmiContext(result.currentBmi).label}: ${getBmiContext(result.currentBmi).copy}`);
    write(getTwlInterpretation(result.twl));
    if (result.ewl !== undefined) write(getEwlInterpretation(result.ewl));
    if (result.goalWeight) write(getGoalInterpretation(result, bmiFromWeight(result.goalWeight, result.heightIn)));
    if (result.percentRegained !== undefined) write(getRegainInterpretation(result.percentRegained));
  }

  if (result) {
    const warnings = getResultWarnings(result);
    if (warnings.length) {
      pageBreak();
      heading("Notes to review");
      warnings.forEach((warning) => write(warning));
    }
  }

  pageBreak();
  heading("What these numbers can help us discuss");
  write("These numbers can support a conversation about your starting point, treatment history, follow-up needs, realistic goals, insurance or financing questions, and which options may be appropriate after medical evaluation.");

  heading("Next steps");
  write("Explore Weight Loss Options: journeylite.com/services/compare-weight-loss-options", 10, "#145c42");
  write("Schedule a Consultation: journeylite.com/contact", 10, "#145c42");
  write("See If You Qualify: journeylite.com/contact", 10, "#145c42");

  doc.setFontSize(8);
  doc.setTextColor("#66756d");
  doc.text(
    "This summary is for educational purposes only and does not diagnose, treat, or replace a consultation with a qualified medical provider.",
    margin,
    760,
    { maxWidth: pageWidth - margin * 2 },
  );
  doc.save("weight-loss-metrics-summary.pdf");
}

function toNumber(value: string) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function formatNumber(value: number, digits: number) {
  if (!Number.isFinite(value)) return "0";
  return value.toFixed(digits);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

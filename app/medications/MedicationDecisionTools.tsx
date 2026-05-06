"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export type MedicationOptionTab = {
  id: string;
  label: string;
  title: string;
  image: string;
  alt: string;
  summary: string;
  how: string;
  ask: string;
  followUp: string[];
  cost: string;
  cta: string;
  href: string;
};

export type MedicationFaq = {
  question: string;
  answer: string;
};

const quizQuestions = [
  {
    id: "current",
    question: "What best describes you right now?",
    options: [
      "I am exploring medication weight loss for the first time",
      "I have tried dieting or programs and want more structure",
      "I am interested in injectable medications",
      "I am interested in oral medications",
      "I had bariatric surgery and regained weight",
      "I want to compare medication with surgery or procedures",
    ],
  },
  {
    id: "concern",
    question: "What is your biggest concern?",
    options: ["Appetite", "Cravings", "Weight regain", "Cost or insurance", "Side effects", "Long-term maintenance", "I am not sure"],
  },
  {
    id: "surgery",
    question: "Have you had bariatric surgery before?",
    options: ["No", "Yes, gastric sleeve", "Yes, gastric bypass", "Yes, gastric band", "Yes, another procedure", "I am not sure"],
  },
  {
    id: "path",
    question: "Which option sounds most comfortable to discuss?",
    options: ["Weekly injectable medication", "Oral medication", "Either medication path", "Medication after surgery", "I want to compare all options"],
  },
  {
    id: "next",
    question: "What next step would help most?",
    options: [
      "Find out if medication may fit",
      "Compare oral vs injectable options",
      "Review pricing and insurance",
      "Get help with weight regain",
      "Compare medication with surgery",
    ],
  },
] as const;

export function MedicationOptionExplorer({ tabs }: { tabs: MedicationOptionTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  if (!active) return null;

  return (
    <div className="mt-8 rounded-2xl border border-[#d9e4de] bg-white p-4 shadow-sm md:p-5">
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Medication option comparison">
        {tabs.map((tab) => (
          <button
            aria-controls={`${tab.id}-panel`}
            aria-selected={active.id === tab.id}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] ${
              active.id === tab.id
                ? "border-[#145c42] bg-[#145c42] text-white"
                : "border-[#d9e4de] bg-[#f8faf8] text-[#25372f] hover:border-[#145c42]"
            }`}
            id={`${tab.id}-tab`}
            key={tab.id}
            onClick={() => setActiveId(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <article
        aria-labelledby={`${active.id}-tab`}
        className="mt-5 grid gap-6 lg:grid-cols-[0.78fr_1fr] lg:items-stretch"
        id={`${active.id}-panel`}
        role="tabpanel"
      >
        <div className="overflow-hidden rounded-xl border border-[#dce4df] bg-[#f7f8f6]">
          <Image
            alt={active.alt}
            className="h-full min-h-[280px] w-full object-cover"
            height={720}
            src={active.image}
            width={900}
          />
        </div>
        <div className="rounded-xl border border-[#edf1ee] bg-[#fbfcfb] p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64736b]">{active.label}</p>
          <h3 className="mt-2 text-2xl font-semibold text-[#1f2c25]">{active.title}</h3>
          <p className="mt-4 text-base leading-7 text-[#53635b]">{active.summary}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <MiniPanel title="How it may work" copy={active.how} />
            <MiniPanel title="Who may ask about it" copy={active.ask} />
            <MiniPanel title="Cost and coverage" copy={active.cost} />
            <div className="rounded-lg border border-[#dce4df] bg-white p-4">
              <h4 className="text-sm font-semibold text-[#1f2c25]">Follow-up needs</h4>
              <ul className="mt-3 grid gap-2">
                {active.followUp.map((item) => (
                  <li className="flex gap-2 text-sm leading-5 text-[#53635b]" key={item}>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#145c42]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6">
            <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#145c42] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2" href={active.href}>
              {active.cta}
            </Link>
          </div>
        </div>
      </article>
      <p className="mt-4 text-xs leading-5 text-[#64736b]">
        Medication images and examples are representative only. Your provider will determine whether a specific
        medication is appropriate.
      </p>
    </div>
  );
}

function MiniPanel({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-lg border border-[#dce4df] bg-white p-4">
      <h4 className="text-sm font-semibold text-[#1f2c25]">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-[#53635b]">{copy}</p>
    </div>
  );
}

export function MedicationQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const question = quizQuestions[step];
  const progress = ((step + 1) / quizQuestions.length) * 100;
  const isComplete = step === quizQuestions.length - 1 && Boolean(answers[question.id]);
  const result = useMemo(() => getQuizResult(answers), [answers]);

  function choose(value: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  return (
    <div className="rounded-2xl border border-[#d6e1da] bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64736b]">Quick guidance</p>
          <h3 className="mt-2 text-2xl font-semibold text-[#1f2c25]">Which medication path should I ask about?</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#53635b]">
            This quiz organizes consultation topics. It does not determine eligibility or recommend a specific medication.
          </p>
        </div>
        <p className="rounded-full bg-[#edf4ef] px-3 py-1.5 text-sm font-semibold text-[#355346]">
          Step {step + 1} of {quizQuestions.length}
        </p>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#edf4ef]" aria-hidden="true">
        <div className="h-full rounded-full bg-[#145c42] transition-all" style={{ width: `${progress}%` }} />
      </div>

      <fieldset className="mt-6">
        <legend className="text-lg font-semibold text-[#1f2c25]">{question.question}</legend>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {question.options.map((option) => (
            <button
              aria-pressed={answers[question.id] === option}
              className={`min-h-12 rounded-lg border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] ${
                answers[question.id] === option
                  ? "border-[#145c42] bg-[#edf4ef] text-[#145c42]"
                  : "border-[#dce4df] bg-white text-[#1f2c25] hover:border-[#145c42]"
              }`}
              key={option}
              onClick={() => choose(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#cbd7d0] bg-white px-4 py-2.5 text-sm font-semibold text-[#17362a] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={step === 0}
          onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
          type="button"
        >
          Back
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#145c42] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!answers[question.id]}
          onClick={() => setStep((prev) => Math.min(prev + 1, quizQuestions.length - 1))}
          type="button"
        >
          {step === quizQuestions.length - 1 ? "Review Topics" : "Continue"}
        </button>
      </div>

      {isComplete ? (
        <div aria-live="polite" className="mt-6 rounded-xl border border-[#cbd9d1] bg-[#edf4ef] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#145c42]">Options to discuss</p>
          <h4 className="mt-2 text-xl font-semibold text-[#1f2c25]">{result.title}</h4>
          <p className="mt-3 text-sm leading-6 text-[#53635b]">{result.copy}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#145c42] px-4 py-2.5 text-sm font-semibold text-white" href={result.href}>
              {result.cta}
            </Link>
            <Link className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#cbd7d0] bg-white px-4 py-2.5 text-sm font-semibold text-[#17362a]" href="/contact">
              Book Consultation
            </Link>
            <Link className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#cbd7d0] bg-white px-4 py-2.5 text-sm font-semibold text-[#17362a]" href="/services/pricing-financing">
              Check Insurance & Financing
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MedicationFaqAccordion({ items }: { items: MedicationFaq[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.question ?? null);

  return (
    <div className="mt-8 divide-y divide-[#dce4df] overflow-hidden rounded-xl border border-[#dce4df] bg-white">
      {items.map((item) => {
        const id = item.question.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const expanded = open === item.question;

        return (
          <div key={item.question}>
            <button
              aria-controls={`${id}-answer`}
              aria-expanded={expanded}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-semibold text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#145c42]"
              onClick={() => setOpen(expanded ? null : item.question)}
              type="button"
            >
              <span>{item.question}</span>
              <span aria-hidden="true" className="text-xl text-[#145c42]">{expanded ? "-" : "+"}</span>
            </button>
            {expanded ? (
              <div className="px-5 pb-5" id={`${id}-answer`}>
                <p className="max-w-4xl text-sm leading-6 text-[#53635b]">{item.answer}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function getQuizResult(answers: Record<string, string>) {
  if (
    answers.surgery?.startsWith("Yes") ||
    answers.current === "I had bariatric surgery and regained weight" ||
    answers.concern === "Weight regain" ||
    answers.path === "Medication after surgery" ||
    answers.next === "Get help with weight regain"
  ) {
    return {
      title: "Ask about post-op support",
      copy:
        "Based on your answers, post-op support may be worth discussing. JourneyLite can help review your surgery history, weight trend, nutrition, labs, medication options, and whether revision evaluation should be considered.",
      cta: "Get Help With Weight Regain",
      href: "/contact",
    };
  }

  if (answers.current === "I am interested in injectable medications" || answers.path === "Weekly injectable medication") {
    return {
      title: "Ask about injectable medication options",
      copy:
        "Based on your answers, injectable medication options may be worth discussing during consultation. A provider can review your health history, coverage, possible side effects, and whether this path fits your goals.",
      cta: "Ask About Injectable Options",
      href: "/contact",
    };
  }

  if (answers.current === "I am interested in oral medications" || answers.path === "Oral medication") {
    return {
      title: "Ask about oral medication options",
      copy:
        "Based on your answers, oral medication options may be worth discussing. Your provider can review your medical history, current medications, vitals, contraindications, and follow-up needs.",
      cta: "Ask About Oral Options",
      href: "/contact",
    };
  }

  return {
    title: "Start with a comparison consultation",
    copy:
      "Based on your answers, a comparison consultation may be the best starting point. JourneyLite can help you compare medication, surgery, non-surgical procedures, and support options.",
    cta: "Book Consultation",
    href: "/contact",
  };
}

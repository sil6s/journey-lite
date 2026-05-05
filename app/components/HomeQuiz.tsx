"use client";

import { useMemo, useState } from "react";
import { CTAButton } from "./marketing";

type AnswerState = {
  weight?: string;
  interest?: string;
  medications?: string;
  comfort?: string;
};

const questions = [
  {
    id: "weight",
    question: "How much weight are you looking to lose?",
    options: ["20-50 lbs", "50-150 lbs", "150+ lbs", "Not sure"],
  },
  {
    id: "interest",
    question: "Which type of care are you most interested in?",
    options: ["Surgery", "Non-surgical options", "Medication support", "Unsure"],
  },
  {
    id: "medications",
    question: "Have you tried prescription weight loss medications before?",
    options: ["Yes", "No", "I am currently using them", "I am not sure"],
  },
  {
    id: "comfort",
    question: "Which care path feels most comfortable right now?",
    options: ["Fastest path", "Least invasive path", "Most durable path", "Not sure"],
  },
] as const;

export function HomeQuiz() {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [step, setStep] = useState(0);
  const current = questions[step];
  const isComplete = step >= questions.length;
  const progress = Math.min(((step + (isComplete ? 0 : 1)) / questions.length) * 100, 100);

  const recommendation = useMemo(() => {
    if (answers.interest === "Medication support" || answers.comfort === "Least invasive path") {
      return {
        title: "A non-surgical or medication-supported conversation may be a good starting point.",
        body: "Based on your answers, it may be useful to compare gastric balloon, weight loss medications, and medical weight loss support before deciding whether surgery should be considered.",
      };
    }

    if (answers.weight === "150+ lbs" || answers.comfort === "Most durable path" || answers.interest === "Surgery") {
      return {
        title: "A surgical consultation may help clarify your strongest options.",
        body: "Your answers suggest it may be worth comparing gastric sleeve, gastric bypass, and other surgical options with a bariatric specialist. Eligibility depends on BMI, health history, and provider evaluation.",
      };
    }

    return {
      title: "A comparison visit can help you choose the right level of support.",
      body: "You may benefit from reviewing both surgical and non-surgical paths with JourneyLite so your plan matches your goals, health history, and comfort level.",
    };
  }, [answers]);

  function chooseAnswer(value: string) {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [current.id]: value }));
    window.setTimeout(() => {
      setStep((currentStep) => currentStep + 1);
    }, 120);
  }

  function resetQuiz() {
    setAnswers({});
    setStep(0);
  }

  return (
    <div className="rounded-xl border border-[#d4ddd7] bg-white p-5 shadow-xl shadow-[#20372b]/8 sm:p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#64736b]">
          <span>{isComplete ? "Results" : `Step ${step + 1} of ${questions.length}`}</span>
          <span>About 60 seconds</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e5ece8]">
          <div
            aria-hidden="true"
            className="h-full rounded-full bg-[#145c42] transition-all"
            style={{ width: `${isComplete ? 100 : progress}%` }}
          />
        </div>
      </div>

      {isComplete ? (
        <div aria-live="polite">
          <p className="eyebrow">Suggested next step</p>
          <h3 className="mt-3 text-2xl font-semibold leading-tight text-[#1f2c25]">{recommendation.title}</h3>
          <p className="mt-4 text-sm leading-6 text-[#53635b]">{recommendation.body}</p>
          <p className="mt-4 rounded-md bg-[#f1f6f3] px-3 py-2 text-xs leading-5 text-[#355346]">
            This guide is educational only. Final recommendations depend on BMI, medical history, prior weight loss
            attempts, goals, and provider evaluation.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <CTAButton href="/#compare" variant="secondary">
              See My Options
            </CTAButton>
            <CTAButton href="/#quiz">Book Consultation</CTAButton>
          </div>
          <button
            className="mt-4 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
            onClick={resetQuiz}
            type="button"
          >
            Start over
          </button>
        </div>
      ) : (
        <fieldset>
          <legend className="text-2xl font-semibold leading-tight text-[#1f2c25]">{current.question}</legend>
          <div className="mt-6 grid gap-3">
            {current.options.map((option) => (
              <button
                className="flex min-h-14 w-full items-center justify-between rounded-lg border border-[#d4ddd7] bg-white px-4 py-3 text-left text-sm font-semibold text-[#24352c] transition hover:border-[#145c42] hover:bg-[#f4faf6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                key={option}
                onClick={() => chooseAnswer(option)}
                type="button"
              >
                <span>{option}</span>
                <span aria-hidden="true" className="h-4 w-4 rounded-full border border-[#aebfb5]" />
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}

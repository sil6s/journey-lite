"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardCheck, FileCheck2, ListChecks } from "lucide-react";
import { recordLessonInteraction, submitCompletionAttestation, submitQuizAttempt } from "@/lib/lms/actions";
import type { SanityInteractiveComponent, SanityQuiz } from "@/src/lib/sanity/lms-types";

const typeLabels: Record<string, string> = {
  calculator: "Calculator",
  tracker: "Tracker",
  drag_drop: "Sorting activity",
  guided_form: "Guided form",
  scenario_picker: "Scenario picker",
  medication_checklist: "Medication checklist",
  timeline: "Timeline",
  triage_cards: "Triage cards",
  calendar_builder: "Calendar builder",
  upload_or_confirm: "Upload or confirm",
  completion_attestation: "Completion attestation",
  knowledge_card: "Knowledge card",
};

export function InteractiveComponentRenderer({
  component,
  courseSlug,
  lessonSlug,
}: {
  component: SanityInteractiveComponent;
  courseSlug: string;
  lessonSlug: string;
}) {
  const [complete, setComplete] = useState(false);
  const [pending, startTransition] = useTransition();
  const Icon = component.interactionType === "completion_attestation" ? FileCheck2 : ListChecks;

  function finish() {
    startTransition(async () => {
      if (component.interactionType === "completion_attestation") {
        await submitCompletionAttestation(courseSlug, { lessonSlug, componentId: component._id });
      }
      await recordLessonInteraction(courseSlug, lessonSlug, "interaction_completed", {
        componentId: component._id,
        interactionType: component.interactionType,
      });
      if (component.supabaseEvent && component.supabaseEvent !== "interaction_completed") {
        await recordLessonInteraction(courseSlug, lessonSlug, component.supabaseEvent, {
          componentId: component._id,
          interactionType: component.interactionType,
        });
      }
      setComplete(true);
    });
  }

  return (
    <section
      aria-labelledby={`activity-${component._id}`}
      className="rounded-2xl border border-[#c8ddd4] bg-white p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf8f2] text-[#145c42]">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#145c42]">
            {typeLabels[component.interactionType] ?? component.interactionType}
          </p>
          <h2 id={`activity-${component._id}`} className="mt-1 text-lg font-semibold text-[#1f2c25]">
            {component.title}
          </h2>
          {component.description ? (
            <p className="mt-2 text-sm leading-6 text-[#53635b]">{component.description}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-[#f7faf8] p-4 text-sm leading-6 text-[#53635b]">
        {renderInteractionCopy(component.interactionType)}
      </div>

      <button
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#145c42] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2 disabled:opacity-60"
        disabled={pending || complete}
        onClick={finish}
        type="button"
      >
        {complete ? <CheckCircle2 className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
        {complete ? "Activity complete" : pending ? "Saving..." : "Confirm activity complete"}
      </button>
    </section>
  );
}

export function KnowledgeCheck({
  quiz,
  courseSlug,
  lessonSlug,
}: {
  quiz: SanityQuiz;
  courseSlug: string;
  lessonSlug: string;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [pending, startTransition] = useTransition();
  const answerKey = Object.fromEntries(quiz.questions.map((question) => [question._id, question.correctIndex ?? -1]));
  const allAnswered = quiz.questions.every((question) => answers[question._id] !== undefined);

  function submit() {
    startTransition(async () => {
      const next = await submitQuizAttempt(courseSlug, lessonSlug, answers, answerKey, quiz.passingScore ?? 100);
      setResult(next);
      playQuizTone(next.passed);
    });
  }

  return (
    <section aria-labelledby={`quiz-${quiz._id}`} className="rounded-2xl border border-[#dce4df] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#145c42]">Knowledge check</p>
      <h2 id={`quiz-${quiz._id}`} className="mt-1 text-lg font-semibold text-[#1f2c25]">{quiz.title}</h2>
      <div className="mt-4 space-y-5">
        {quiz.questions.map((question, questionIndex) => (
          <fieldset key={question._id} className="rounded-xl border border-[#edf1ee] p-4">
            <legend className="px-1 text-sm font-semibold text-[#1f2c25]">
              {questionIndex + 1}. {question.question}
            </legend>
            <div className="mt-3 space-y-2">
              {question.options?.map((option, optionIndex) => (
                <label
                  className="flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2 text-sm text-[#53635b] hover:bg-[#f7faf8]"
                  key={option}
                >
                  <input
                    checked={answers[question._id] === optionIndex}
                    className="mt-1"
                    name={question._id}
                    onChange={() => setAnswers((current) => ({ ...current, [question._id]: optionIndex }))}
                    type="radio"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {result && question.feedback ? (
              <p className="mt-3 rounded-lg bg-[#f7faf8] p-3 text-xs leading-5 text-[#53635b]">{question.feedback}</p>
            ) : null}
          </fieldset>
        ))}
      </div>
      {result ? (
        <div className={`mt-4 flex items-start gap-2 rounded-xl p-4 text-sm ${result.passed ? "bg-[#ecfdf3] text-[#166534]" : "bg-[#fffbeb] text-[#92400e]"}`}>
          {result.passed ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertTriangle className="mt-0.5 h-4 w-4" />}
          <p>{result.passed ? `Passed with ${result.score}%. You can complete the lesson.` : `Score: ${result.score}%. Review the lesson and try again.`}</p>
        </div>
      ) : null}
      <button
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#145c42] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2 disabled:opacity-60"
        disabled={!allAnswered || pending}
        onClick={submit}
        type="button"
      >
        {pending ? "Submitting..." : "Submit knowledge check"}
      </button>
    </section>
  );
}

function playQuizTone(passed: boolean) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const gain = context.createGain();
    gain.gain.value = 0.05;
    gain.connect(context.destination);

    const notes = passed ? [523.25, 659.25, 783.99] : [220, 174.61];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      const start = context.currentTime + index * 0.12;
      oscillator.start(start);
      oscillator.stop(start + 0.1);
    });
  } catch {
    // Audio feedback is optional; never block quiz submission.
  }
}

function renderInteractionCopy(type: string) {
  switch (type) {
    case "calculator":
      return "Use the calculation guidance in this lesson, then confirm you understand which numbers to follow from your JourneyLite care team.";
    case "tracker":
      return "Use this checkpoint to track the action described in the lesson. Do not enter private health details here.";
    case "drag_drop":
      return "Sort the examples mentally into the correct groups, then confirm when you can explain the safer choice.";
    case "guided_form":
      return "Work through the prompts on your own or with your care team. Keep personal health details in your secure patient record or with your clinical team.";
    case "scenario_picker":
      return "Review each scenario and choose the response that matches your JourneyLite instructions.";
    case "medication_checklist":
      return "Review medication instructions with your prescribing clinician. Call the care team if your medication is not listed or your instructions differ.";
    case "timeline":
      return "Use the timeline to understand when actions happen before or after surgery. Your assigned dates may differ.";
    case "triage_cards":
      return "Review warning signs and escalation guidance. For emergencies, call 911.";
    case "calendar_builder":
      return "Build a personal reminder plan outside this page using the dates provided by your care team.";
    case "upload_or_confirm":
      return "Confirm you completed the requested step. This page records completion only and does not collect personal health documents.";
    case "completion_attestation":
      return "Confirm that you reviewed the course content and understand this education does not replace individualized medical advice.";
    default:
      return "Review the key takeaways, then confirm the activity before continuing.";
  }
}

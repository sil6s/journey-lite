"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { CourseQuiz } from "@/lib/courses/catalog";

export function LessonQuiz({ quiz }: { quiz?: CourseQuiz }) {
  const questions = quiz?.questions?.filter((question) => question.question) ?? [];
  const [answers, setAnswers] = useState<Record<number, number>>({});

  if (!questions.length) return null;

  return (
    <section className="rounded-xl border border-[#cfe0d7] bg-[#f7fbf8] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#145c42]">Knowledge check</p>
          <h2 className="mt-1 text-xl font-semibold text-[#1f2c25]">{quiz?.title ?? "Lesson quiz"}</h2>
        </div>
        {quiz?.passingScore ? (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#53635b]">
            Passing score: {quiz.passingScore}%
          </span>
        ) : null}
      </div>

      <div className="mt-5 space-y-5">
        {questions.map((question, questionIndex) => {
          const selected = answers[questionIndex];
          const correctIndex = question.correctIndex;

          return (
            <fieldset className="rounded-lg border border-[#dce4df] bg-white p-4" key={`${question.question}-${questionIndex}`}>
              <legend className="px-1 text-sm font-semibold text-[#1f2c25]">{question.question}</legend>
              <div className="mt-3 space-y-2">
                {question.options?.map((option, optionIndex) => {
                  const isSelected = selected === optionIndex;
                  const isCorrect = correctIndex === optionIndex;
                  const showCorrect = selected !== undefined && isCorrect;

                  return (
                    <label
                      className={`flex cursor-pointer gap-3 rounded-md border px-3 py-2 text-sm transition ${
                        isSelected
                          ? "border-[#145c42] bg-[#edf7f1] text-[#1f2c25]"
                          : "border-[#e6ece8] text-[#53635b] hover:border-[#b9cec4]"
                      }`}
                      key={option}
                    >
                      <input
                        checked={isSelected}
                        className="mt-1 h-4 w-4 accent-[#145c42]"
                        name={`question-${questionIndex}`}
                        onChange={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))}
                        type="radio"
                      />
                      <span className="flex-1">{option}</span>
                      {showCorrect ? <CheckCircle2 className="h-4 w-4 text-[#145c42]" /> : null}
                    </label>
                  );
                })}
              </div>
              {selected !== undefined && question.feedback ? (
                <p className="mt-3 rounded-md bg-[#fff8e6] px-3 py-2 text-sm leading-6 text-[#6a5520]">{question.feedback}</p>
              ) : null}
            </fieldset>
          );
        })}
      </div>
    </section>
  );
}

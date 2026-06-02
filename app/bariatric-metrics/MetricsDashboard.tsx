"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

// ─── Types ─────────────────────────────────────────────────────────────────

type Inputs = {
  gender: string;
  feet: string;
  inches: string;
  startingWeight: string;
  currentWeight: string;
  goalWeight: string;
  lowestWeight: string;
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
};

type FieldFeedback = { type: "error" | "warning"; message: string };
type Tone = "green" | "yellow" | "red" | "blue";

const initialInputs: Inputs = {
  gender: "",
  feet: "",
  inches: "",
  startingWeight: "",
  currentWeight: "",
  goalWeight: "",
  lowestWeight: "",
};

// ─── Main component ─────────────────────────────────────────────────────────

export function MetricsDashboard() {
  const [inputs, setInputs] = useState<Inputs>(initialInputs);
  const [showResults, setShowResults] = useState(false);
  const [pdfState, setPdfState] = useState<"idle" | "loading" | "error">("idle");
  const result = useMemo(() => calculateResults(inputs), [inputs]);

  function update(key: keyof Inputs, value: string) {
    setInputs((prev) => ({ ...prev, [key]: value }));
    setShowResults(false);
  }

  return (
    <div className="min-h-screen bg-[#f7f8f6]">
      <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="mb-8">
          <p className="eyebrow">Bariatric metrics calculator</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-[#1e2b24] md:text-5xl">
            Know Your Numbers
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#516059]">
            Enter your height and weight to instantly calculate BMI, percent total weight loss, and progress toward your
            goal. All calculations happen in your browser — nothing is sent anywhere.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr] lg:items-start">
          <CalculatorCard inputs={inputs} update={update} onCalculate={() => setShowResults(true)} />

          {showResults && result ? (
            <ResultsDashboard
              result={result}
              inputs={inputs}
              pdfState={pdfState}
              onDownloadPdf={async () => {
                setPdfState("loading");
                try {
                  await downloadResultsPdf(inputs, result);
                  setPdfState("idle");
                } catch {
                  setPdfState("error");
                }
              }}
            />
          ) : (
            <PlaceholderDashboard />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Calculator card ────────────────────────────────────────────────────────

function CalculatorCard({
  inputs,
  update,
  onCalculate,
}: {
  inputs: Inputs;
  update: (key: keyof Inputs, value: string) => void;
  onCalculate: () => void;
}) {
  const [touched, setTouched] = useState<Partial<Record<keyof Inputs, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const feedback = getInputFeedback(inputs);

  function mark(key: keyof Inputs) {
    setTouched((p) => ({ ...p, [key]: true }));
  }

  function shown(key: keyof Inputs) {
    return touched[key] || submitted ? feedback[key] : undefined;
  }

  function hasErrors() {
    return (["feet", "startingWeight", "currentWeight"] as Array<keyof Inputs>).some(
      (k) => feedback[k]?.type === "error",
    );
  }

  function handleCalculate() {
    setSubmitted(true);
    if (hasErrors()) return;
    onCalculate();
    setTimeout(
      () => document.getElementById("results-dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
  }

  return (
    <aside className="sticky top-6 rounded-2xl border border-[#d6e1da] bg-white p-6 shadow-xl shadow-[#20372b]/8">
      <h2 className="text-xl font-semibold text-[#1f2c25]">Enter your details</h2>
      <p className="mt-1 text-xs leading-5 text-[#66756d]">Only height + starting + current weight are required.</p>

      <div className="mt-5 grid gap-4">
        {/* Height */}
        <div>
          <p className="text-sm font-semibold text-[#1f2c25]">Height</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <NumberField id="feet" label="Feet" value={inputs.feet} onBlur={() => mark("feet")} onChange={(v) => update("feet", v)} feedback={shown("feet")} />
            <NumberField id="inches" label="Inches" value={inputs.inches} onBlur={() => mark("inches")} onChange={(v) => update("inches", v)} feedback={shown("inches")} />
          </div>
        </div>

        {/* Weights */}
        <NumberField id="startingWeight" label="Starting weight" suffix="lb" helper="Your weight before treatment or when you began your plan." value={inputs.startingWeight} onBlur={() => mark("startingWeight")} onChange={(v) => update("startingWeight", v)} feedback={shown("startingWeight")} />
        <NumberField id="currentWeight" label="Current weight" suffix="lb" helper="Your most recent weight." value={inputs.currentWeight} onBlur={() => mark("currentWeight")} onChange={(v) => update("currentWeight", v)} feedback={shown("currentWeight")} />

        {/* Optional */}
        <details className="group">
          <summary className="cursor-pointer list-none text-sm font-semibold text-[#145c42] hover:underline">
            + Optional fields
          </summary>
          <div className="mt-3 grid gap-3">
            <NumberField id="goalWeight" label="Goal weight (optional)" suffix="lb" value={inputs.goalWeight} onBlur={() => mark("goalWeight")} onChange={(v) => update("goalWeight", v)} feedback={shown("goalWeight")} />
            <NumberField id="lowestWeight" label="Lowest weight ever (optional)" suffix="lb" helper="Add this to see regain from your lowest point." value={inputs.lowestWeight} onBlur={() => mark("lowestWeight")} onChange={(v) => update("lowestWeight", v)} feedback={shown("lowestWeight")} />
            <div>
              <p className="text-sm font-semibold text-[#1f2c25]">Gender (optional)</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {["Female", "Male", "Another gender", "Prefer not to say"].map((opt) => (
                  <button
                    aria-pressed={inputs.gender === opt}
                    className={`min-h-9 rounded-lg border px-3 py-1.5 text-left text-xs font-semibold transition ${inputs.gender === opt ? "border-[#145c42] bg-[#edf4ef] text-[#145c42]" : "border-[#dce4df] bg-white text-[#1f2c25] hover:border-[#145c42]"}`}
                    key={opt}
                    onClick={() => update("gender", opt)}
                    type="button"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </details>
      </div>

      <button
        className="mt-6 w-full rounded-xl bg-[#0f3e2e] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f3e2e]"
        onClick={handleCalculate}
        type="button"
      >
        Calculate My Results
      </button>

      <p className="mt-3 text-center text-[11px] leading-5 text-[#66756d]">
        🔒 Private — nothing leaves your browser
      </p>
    </aside>
  );
}

// ─── Placeholder ─────────────────────────────────────────────────────────────

function PlaceholderDashboard() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d6e1da] bg-white p-10 text-center" id="results-dashboard">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#edf4ef]">
        <svg className="size-8 text-[#145c42]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-[#1f2c25]">Your dashboard will appear here</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#53635b]">
        Enter your height and weights on the left, then click Calculate to see your personalized metrics and charts.
      </p>
    </div>
  );
}

// ─── Results dashboard ────────────────────────────────────────────────────────

function ResultsDashboard({
  result,
  inputs,
  pdfState,
  onDownloadPdf,
}: {
  result: Result;
  inputs: Inputs;
  pdfState: "idle" | "loading" | "error";
  onDownloadPdf: () => void;
}) {
  const bmiCtx = getBmiContext(result.currentBmi);
  const twlGood = result.twl >= 10;
  const hasGoal = result.goalWeight !== undefined && result.poundsToGoal !== undefined;
  const goalReached = hasGoal && (result.poundsToGoal ?? 1) <= 0;
  const hasRegain = result.regain !== undefined && result.percentRegained !== undefined;

  return (
    <div className="grid gap-5" id="results-dashboard">
      {/* Status header */}
      <div className={`flex items-center gap-3 rounded-2xl p-5 ${toneClasses(bmiCtx.tone)}`}>
        <StatusIcon tone={bmiCtx.tone} />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest">{bmiCtx.kicker}</p>
          <p className="mt-0.5 text-lg font-semibold">{bmiCtx.label}</p>
          <p className="mt-1 text-sm leading-6">{bmiCtx.copy}</p>
        </div>
      </div>

      {/* Key metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <BigMetricCard
          label="Current BMI"
          value={formatN(result.currentBmi, 1)}
          sub={bmiCtx.kicker}
          tone={bmiCtx.tone}
        />
        <BigMetricCard
          label="Weight Lost"
          value={`${formatN(Math.abs(result.weightLost), 0)} lb`}
          sub={result.weightLost >= 0 ? "from starting weight" : "gained"}
          tone={result.weightLost > 0 ? "green" : "yellow"}
        />
        <BigMetricCard
          label="% Total Weight Loss"
          value={`${formatN(result.twl, 1)}%`}
          sub={twlGood ? "Strong progress" : "Early progress"}
          tone={twlGood ? "green" : "yellow"}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* BMI gauge + TWL chart */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ChartCard title="BMI Gauge" sub={`${formatN(result.currentBmi, 1)} — ${bmiCtx.label}`}>
          <BmiGauge bmi={result.currentBmi} />
        </ChartCard>

        <ChartCard title="% Total Weight Loss" sub={getTwlInterpretation(result.twl)}>
          <TwlRing twl={result.twl} />
        </ChartCard>
      </div>

      {/* Goal progress (if entered) */}
      {hasGoal ? (
        <ChartCard
          title="Goal Progress"
          sub={goalReached ? "You have reached or passed your goal! 🎉" : `${formatN(Math.abs(result.poundsToGoal ?? 0), 0)} lb remaining`}
        >
          <GoalBar result={result} />
        </ChartCard>
      ) : null}

      {/* Regain tracker (if entered) */}
      {hasRegain ? (
        <div className={`rounded-2xl border p-5 ${toneClasses(getRegainTone(result.percentRegained ?? 0))}`}>
          <p className="text-xs font-bold uppercase tracking-widest">Weight Regain Tracker</p>
          <div className="mt-3 flex items-end gap-6">
            <div>
              <p className="text-3xl font-semibold">{formatN(result.regain ?? 0, 0)} lb</p>
              <p className="mt-1 text-sm">regained from lowest weight</p>
            </div>
            <div>
              <p className="text-3xl font-semibold">{formatN(result.percentRegained ?? 0, 0)}%</p>
              <p className="mt-1 text-sm">of prior loss regained</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6">{getRegainInterpretation(result.percentRegained ?? 0)}</p>
          {(result.percentRegained ?? 0) >= 20 ? (
            <Link className="mt-3 inline-flex text-sm font-semibold underline-offset-4 hover:underline" href="/medications#post-op-support">
              Review regain support options →
            </Link>
          ) : null}
        </div>
      ) : null}

      {/* EWL if available */}
      {result.ewl !== undefined ? (
        <div className="rounded-2xl border border-[#dce4df] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#66756d]">Excess Weight Loss (%EWL)</p>
          <p className="mt-2 text-3xl font-semibold text-[#1f2c25]">{formatN(result.ewl, 1)}%</p>
          <p className="mt-2 text-sm leading-6 text-[#53635b]">{getEwlInterpretation(result.ewl)}</p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#edf4ef]">
            <div
              className={`h-full rounded-full transition-all ${result.ewl >= 50 ? "bg-[#145c42]" : result.ewl >= 25 ? "bg-[#f0a500]" : "bg-[#d66b4f]"}`}
              style={{ width: `${clamp(result.ewl, 0, 100)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-[#66756d]">
            <span>0%</span><span>25%</span><span>50%+</span>
          </div>
        </div>
      ) : null}

      {/* Suggested next steps */}
      <NextStepCards result={result} />

      {/* PDF download */}
      <div className="rounded-2xl border border-[#d6e1da] bg-[#0f3e2e] p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-[#9fd4aa]">Save Your Results</p>
        <h3 className="mt-2 font-serif text-2xl leading-tight">Download a styled PDF summary</h3>
        <p className="mt-2 text-sm leading-6 text-[#d8e6de]">
          Print or save your metrics to bring to your consultation. No name is collected.
        </p>
        <button
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#0f3e2e] transition hover:bg-[#f0f7f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
          disabled={pdfState === "loading"}
          onClick={onDownloadPdf}
          type="button"
        >
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {pdfState === "loading" ? "Preparing PDF…" : "Download PDF Summary"}
        </button>
        {pdfState === "error" ? <p className="mt-2 text-sm text-[#ffb3a0]">PDF generation failed. Please try again.</p> : null}
      </div>

      <p className="text-xs leading-6 text-[#64736b]">
        These results are for educational purposes only and do not diagnose, treat, or replace a consultation with a qualified medical provider.
      </p>
    </div>
  );
}

// ─── Chart components ─────────────────────────────────────────────────────────

function BmiGauge({ bmi }: { bmi: number }) {
  // Semi-circle gauge: arc from 180° to 0° (left to right)
  const zones = [
    { name: "Under", color: "#e8a87c", min: 15, max: 18.5 },
    { name: "Healthy", color: "#52b788", min: 18.5, max: 25 },
    { name: "Overweight", color: "#f0a500", min: 25, max: 30 },
    { name: "Obese", color: "#4895cb", min: 30, max: 40 },
    { name: "Obese III", color: "#8b5cf6", min: 40, max: 50 },
  ];
  const MIN = 15, MAX = 50, R = 70, cx = 90, cy = 90, SW = 16;
  const toAngle = (v: number) => 180 - ((clamp(v, MIN, MAX) - MIN) / (MAX - MIN)) * 180;
  const arcPath = (startDeg: number, endDeg: number) => {
    const s = (startDeg * Math.PI) / 180;
    const e = (endDeg * Math.PI) / 180;
    const x1 = cx + R * Math.cos(s), y1 = cy - R * Math.sin(s);
    const x2 = cx + R * Math.cos(e), y2 = cy - R * Math.sin(e);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 0 ${x2} ${y2}`;
  };
  const needleAngle = toAngle(bmi);
  const nx = cx + (R - 2) * Math.cos((needleAngle * Math.PI) / 180);
  const ny = cy - (R - 2) * Math.sin((needleAngle * Math.PI) / 180);

  return (
    <div>
      <svg className="w-full" viewBox="0 0 180 100">
        {zones.map((z) => {
          const startA = toAngle(z.max);
          const endA = toAngle(z.min);
          return (
            <path
              d={arcPath(startA, endA)}
              fill="none"
              key={z.name}
              stroke={z.color}
              strokeLinecap="round"
              strokeWidth={SW}
            />
          );
        })}
        {/* Needle */}
        <line stroke="#1f2c25" strokeLinecap="round" strokeWidth={2.5} x1={cx} x2={nx} y1={cy} y2={ny} />
        <circle cx={cx} cy={cy} fill="#1f2c25" r={4} />
        {/* Value */}
        <text dominantBaseline="middle" fill="#1f2c25" fontFamily="serif" fontSize="18" fontWeight="bold" textAnchor="middle" x={cx} y={cy + 18}>
          {formatN(bmi, 1)}
        </text>
      </svg>
      <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {zones.map((z) => (
          <span className="flex items-center gap-1 text-[10px] text-[#53635b]" key={z.name}>
            <span className="inline-block size-2 rounded-full" style={{ background: z.color }} />
            {z.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function TwlRing({ twl }: { twl: number }) {
  const pct = clamp(twl / 50, 0, 1);
  const R = 54, cx = 70, cy = 70, SW = 14;
  const circ = 2 * Math.PI * R;
  const dash = pct * circ;
  const color = twl >= 20 ? "#52b788" : twl >= 10 ? "#f0a500" : "#4895cb";

  return (
    <div>
      <div className="relative flex justify-center">
        <svg height="140" viewBox="0 0 140 140" width="140">
          <circle cx={cx} cy={cy} fill="none" r={R} stroke="#edf4ef" strokeWidth={SW} />
          <circle
            cx={cx}
            cy={cy}
            fill="none"
            r={R}
            stroke={color}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            strokeWidth={SW}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          <text dominantBaseline="middle" fill="#1f2c25" fontFamily="sans-serif" fontSize="20" fontWeight="bold" textAnchor="middle" x={cx} y={cy - 6}>
            {formatN(twl, 1)}%
          </text>
          <text dominantBaseline="middle" fill="#66756d" fontSize="10" textAnchor="middle" x={cx} y={cy + 13}>
            %TWL
          </text>
        </svg>
      </div>
      <div className="flex justify-between text-[10px] text-[#66756d]">
        <span>0%</span><span className="font-semibold text-[#145c42]">10%+ meaningful</span><span>50%</span>
      </div>
    </div>
  );
}

function GoalBar({ result }: { result: Result }) {
  const start = result.startingWeight;
  const goal = result.goalWeight ?? result.currentWeight;
  const current = result.currentWeight;
  const progress = clamp(result.goalProgress ?? 0, 0, 110);

  const data = [
    { label: "Starting", weight: start },
    { label: "Current", weight: current },
    { label: "Goal", weight: goal },
  ];

  return (
    <div>
      <div className="h-36">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart barSize={40} data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#53635b" }} />
            <YAxis
              domain={[Math.max(0, goal - 20), start + 10]}
              tick={{ fontSize: 10, fill: "#66756d" }}
              width={40}
            />
            <Tooltip />
            <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
              <Cell fill="#d6e1da" />
              <Cell fill={progress >= 100 ? "#52b788" : "#0f3e2e"} />
              <Cell fill="#b9d2c5" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#edf4ef]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${progress >= 100 ? "bg-[#52b788]" : "bg-[#0f3e2e]"}`}
          style={{ width: `${clamp(progress, 0, 100)}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-[#53635b]">
        <span>Start ({start} lb)</span>
        <span className={progress >= 100 ? "text-[#145c42]" : "text-[#0f3e2e]"}>{formatN(progress, 0)}% to goal</span>
        <span>Goal ({goal} lb)</span>
      </div>
    </div>
  );
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

function ChartCard({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#dce4df] bg-white p-5">
      <p className="text-sm font-semibold text-[#1f2c25]">{title}</p>
      <p className="mt-0.5 text-xs leading-5 text-[#53635b]">{sub}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function BigMetricCard({
  label,
  value,
  sub,
  tone,
  className = "",
}: {
  label: string;
  value: string;
  sub: string;
  tone: Tone;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${toneClasses(tone)} ${className}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs">{sub}</p>
    </div>
  );
}

function StatusIcon({ tone }: { tone: Tone }) {
  const colors: Record<Tone, string> = {
    green: "bg-[#52b788]/20 text-[#1a7046]",
    yellow: "bg-[#f0a500]/20 text-[#7a5300]",
    red: "bg-[#d66b4f]/20 text-[#8a3b22]",
    blue: "bg-[#4895cb]/20 text-[#194f70]",
  };
  return (
    <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${colors[tone]}`}>
      {tone === "green" ? (
        <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function NextStepCards({ result }: { result: Result }) {
  const cards = getNextStepCards(result);
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-widest text-[#1f2c25]">Suggested Next Steps</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <article className="flex flex-col rounded-xl border border-[#dce4df] bg-white p-4 shadow-sm" key={c.title}>
            <h5 className="text-sm font-semibold text-[#1f2c25]">{c.title}</h5>
            <p className="mt-2 flex-1 text-xs leading-5 text-[#53635b]">{c.copy}</p>
            <Link className="mt-4 text-xs font-bold text-[#145c42] underline-offset-4 hover:underline" href={c.href}>
              {c.cta} →
            </Link>
          </article>
        ))}
      </div>
    </div>
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
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-[#1f2c25]" htmlFor={id}>
        {label}
      </label>
      {helper ? <p className="mt-0.5 text-xs leading-5 text-[#66756d]">{helper}</p> : null}
      <div
        className={`mt-1.5 flex rounded-lg border bg-white focus-within:ring-2 ${feedback?.type === "error" ? "border-[#d66b4f] focus-within:ring-[#d66b4f]" : "border-[#cbd7d0] focus-within:ring-[#145c42]"}`}
      >
        <input
          aria-invalid={feedback?.type === "error" ? true : undefined}
          className="min-w-0 flex-1 rounded-lg bg-transparent px-3 py-2.5 text-sm text-[#1f2c25] focus:outline-none"
          id={id}
          inputMode="decimal"
          min="0"
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          type="number"
          value={value}
        />
        {suffix ? <span className="flex items-center px-3 text-xs font-semibold text-[#66756d]">{suffix}</span> : null}
      </div>
      {feedback ? (
        <p className={`mt-1 text-xs ${feedback.type === "error" ? "font-semibold text-[#9d341c]" : "text-[#6b5a23]"}`}>
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}

// ─── Styled PDF ───────────────────────────────────────────────────────────────

async function downloadResultsPdf(inputs: Inputs, result: Result) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const M = 48;
  let y = 0;

  const bmiCtx = getBmiContext(result.currentBmi);

  // ── Header band ──
  doc.setFillColor("#0f3e2e");
  doc.rect(0, 0, W, 90, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor("#9fd4aa");
  doc.text("JOURNEYLITE BARIATRIC PHYSICIANS", M, 32);
  doc.setFontSize(22);
  doc.setTextColor("#ffffff");
  doc.text("Weight-Loss Metrics Summary", M, 62);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#b9d2c5");
  doc.text(`Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, M, 80);
  y = 110;

  // ── BMI status band ──
  const toneBg: Record<string, string> = { green: "#edf8f1", yellow: "#fffdf4", red: "#fff5f2", blue: "#f3f8fc" };
  const toneBorder: Record<string, string> = { green: "#52b788", yellow: "#f0a500", red: "#d66b4f", blue: "#4895cb" };
  const toneText: Record<string, string> = { green: "#1a7046", yellow: "#7a5300", red: "#8a3b22", blue: "#194f70" };
  const bg = toneBg[bmiCtx.tone] ?? "#f7f8f6";
  const border = toneBorder[bmiCtx.tone] ?? "#dce4df";
  const textCol = toneText[bmiCtx.tone] ?? "#1f2c25";

  doc.setFillColor(bg);
  doc.setDrawColor(border);
  doc.roundedRect(M, y, W - M * 2, 52, 6, 6, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(textCol);
  doc.text(bmiCtx.kicker.toUpperCase(), M + 12, y + 16);
  doc.setFontSize(13);
  doc.text(`BMI ${formatN(result.currentBmi, 1)} — ${bmiCtx.label}`, M + 12, y + 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const copyLines = doc.splitTextToSize(bmiCtx.copy, W - M * 2 - 24);
  doc.text(copyLines, M + 12, y + 46);
  y += 66;

  // ── Section helper ──
  function section(title: string) {
    y += 14;
    doc.setFillColor("#edf4ef");
    doc.rect(M, y, W - M * 2, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor("#145c42");
    doc.text(title.toUpperCase(), M + 8, y + 14);
    y += 30;
  }

  function row(label: string, value: string, highlight = false) {
    if (y > 700) { doc.addPage(); y = 48; }
    if (highlight) {
      doc.setFillColor("#f7fbf9");
      doc.rect(M, y - 10, W - M * 2, 18, "F");
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor("#1f2c25");
    doc.text(label, M + 4, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#53635b");
    doc.text(value, M + 200, y);
    y += 17;
  }

  function note(text: string) {
    if (y > 700) { doc.addPage(); y = 48; }
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor("#53635b");
    const lines = doc.splitTextToSize(text, W - M * 2 - 8);
    doc.text(lines, M + 4, y);
    y += lines.length * 13;
  }

  // ── Key metrics ──
  section("Key Metrics");
  row("Current BMI", formatN(result.currentBmi, 1), true);
  row("Starting BMI", formatN(result.startingBmi, 1));
  row("Weight lost", `${formatN(Math.abs(result.weightLost), 1)} lb ${result.weightLost >= 0 ? "lost" : "gained"}`, true);
  row("% Total weight loss (%TWL)", `${formatN(result.twl, 1)}%`);
  if (result.ewl !== undefined) row("% Excess weight loss (%EWL)", `${formatN(result.ewl, 1)}%`, true);
  if (result.ebmil !== undefined) row("% Excess BMI loss (%EBMIL)", `${formatN(result.ebmil, 1)}%`);
  if (result.goalWeight) row("Goal weight entered", `${result.goalWeight} lb`, true);
  if (result.goalProgress !== undefined) row("Progress toward goal", `${formatN(clamp(result.goalProgress, 0, 100), 0)}%`);
  if (result.regain !== undefined) row("Weight regain from lowest", `${formatN(result.regain, 1)} lb`, true);
  if (result.percentRegained !== undefined) row("% of prior loss regained", `${formatN(result.percentRegained, 1)}%`);

  // ── Entered values ──
  section("Entered Values");
  row("Height", `${inputs.feet || "0"} ft ${inputs.inches || "0"} in`);
  row("Starting weight", `${inputs.startingWeight} lb`, true);
  row("Current weight", `${inputs.currentWeight} lb`);
  if (inputs.gender) row("Gender context", inputs.gender, true);
  if (inputs.goalWeight) row("Goal weight", `${inputs.goalWeight} lb`);
  if (inputs.lowestWeight) row("Lowest weight after treatment", `${inputs.lowestWeight} lb`, true);

  // ── Interpretation ──
  section("Plain-English Interpretation");
  note(bmiCtx.copy);
  note(getTwlInterpretation(result.twl));
  if (result.ewl !== undefined) note(getEwlInterpretation(result.ewl));
  if (result.goalWeight && result.goalProgress !== undefined) {
    note(getGoalInterpretation(result, bmiFrom(result.goalWeight!, result.heightIn)));
  }
  if (result.percentRegained !== undefined) note(getRegainInterpretation(result.percentRegained));

  // ── Footer ──
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor("#0f3e2e");
    doc.rect(0, 770, W, 22, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor("#9fd4aa");
    doc.text("JourneyLite Physicians · journeylite.com · For educational use only. Does not replace medical consultation.", M, 784);
    doc.setTextColor("#b9d2c5");
    doc.text(`Page ${i} of ${pages}`, W - M, 784, { align: "right" });
  }

  doc.save("journeylite-metrics-summary.pdf");
}

// ─── Pure logic ───────────────────────────────────────────────────────────────

function calculateResults(inputs: Inputs): Result | undefined {
  const feet = toNum(inputs.feet);
  const inches = toNum(inputs.inches);
  const sw = toNum(inputs.startingWeight);
  const cw = toNum(inputs.currentWeight);
  const gw = toNum(inputs.goalWeight) || undefined;
  const lw = toNum(inputs.lowestWeight) || undefined;
  const h = feet * 12 + inches;
  if (!h || !sw || !cw) return undefined;

  const currentBmi = bmiFrom(cw, h);
  const startingBmi = bmiFrom(sw, h);
  const idealWeight = (25 * h * h) / 703;
  const weightLost = sw - cw;
  const twl = (weightLost / sw) * 100;
  const excessWeight = sw - idealWeight;
  const ewl = excessWeight > 0 ? (weightLost / excessWeight) * 100 : undefined;
  const bmiLoss = startingBmi - currentBmi;
  const ebmil = startingBmi > 25 ? (bmiLoss / (startingBmi - 25)) * 100 : undefined;
  const poundsToGoal = gw ? cw - gw : undefined;
  const goalProgress = gw && sw > gw ? (weightLost / (sw - gw)) * 100 : undefined;
  const canRegain = Boolean(lw && sw > lw && cw >= lw);
  const regain = canRegain ? cw - lw! : undefined;
  const percentRegained = canRegain ? ((cw - lw!) / (sw - lw!)) * 100 : undefined;

  return { heightIn: h, startingWeight: sw, currentWeight: cw, goalWeight: gw, lowestWeight: lw, currentBmi, startingBmi, idealWeight, weightLost, twl, excessWeight, ewl, bmiLoss, ebmil, poundsToGoal, goalProgress, regain, percentRegained };
}

function getInputFeedback(inputs: Inputs): Partial<Record<keyof Inputs, FieldFeedback>> {
  const fb: Partial<Record<keyof Inputs, FieldFeedback>> = {};
  const feet = parseNum(inputs.feet);
  const inches = inputs.inches === "" ? 0 : parseNum(inputs.inches);
  const sw = parseNum(inputs.startingWeight);
  const cw = parseNum(inputs.currentWeight);
  const gw = parseNum(inputs.goalWeight);
  const lw = parseNum(inputs.lowestWeight);
  const h = feet && inches !== undefined ? feet * 12 + inches : 0;

  if (!inputs.feet) fb.feet = { type: "error", message: "Height is required." };
  else if (!feet || feet <= 0) fb.feet = { type: "error", message: "Enter a valid number of feet." };
  if (inputs.inches && (inches === undefined || inches < 0 || inches > 11))
    fb.inches = { type: "error", message: "Enter inches from 0 to 11." };
  if (h && (h < 48 || h > 90))
    fb.feet = { type: "error", message: "Height looks outside normal adult range." };

  if (!inputs.startingWeight) fb.startingWeight = { type: "error", message: "Starting weight is required." };
  else if (!sw || sw < 70) fb.startingWeight = { type: "error", message: "Enter a valid starting weight (≥ 70 lb)." };
  else if (sw > 800) fb.startingWeight = { type: "error", message: "Check this value — it looks very high." };

  if (!inputs.currentWeight) fb.currentWeight = { type: "error", message: "Current weight is required." };
  else if (!cw || cw < 70) fb.currentWeight = { type: "error", message: "Enter a valid current weight (≥ 70 lb)." };
  else if (cw > 800) fb.currentWeight = { type: "error", message: "Check this value — it looks very high." };

  if (inputs.goalWeight && gw !== undefined) {
    if (gw < 70) fb.goalWeight = { type: "error", message: "Goal weight looks too low." };
    else if (sw && gw > sw) fb.goalWeight = { type: "warning", message: "Goal is higher than starting weight — is that intentional?" };
  }

  if (inputs.lowestWeight && lw !== undefined && sw && lw > sw)
    fb.lowestWeight = { type: "warning", message: "Lowest weight is usually below starting weight." };

  return fb;
}

function getBmiContext(bmi: number) {
  if (bmi < 18.5) return { kicker: "Below healthy range", label: "Below the standard healthy BMI range", tone: "red" as Tone, copy: "This is below the standard healthy BMI range. A provider can help evaluate whether this is safe." };
  if (bmi < 25) return { kicker: "Healthy range", label: "Standard healthy BMI range", tone: "green" as Tone, copy: "Your BMI is within the standard healthy range." };
  if (bmi < 30) return { kicker: "Overweight range", label: "Overweight BMI range", tone: "yellow" as Tone, copy: "Your BMI falls in the overweight range. Medical weight loss or non-surgical options may be worth discussing." };
  if (bmi < 35) return { kicker: "Class I obesity", label: "Class I obesity BMI range", tone: "blue" as Tone, copy: "Your BMI falls in the Class I obesity range. Multiple treatment paths may be available after evaluation." };
  if (bmi < 40) return { kicker: "Class II obesity", label: "Class II obesity BMI range", tone: "blue" as Tone, copy: "Your BMI is in the Class II range. Bariatric surgery may be an option worth discussing with a provider." };
  return { kicker: "Class III obesity", label: "Class III obesity BMI range", tone: "blue" as Tone, copy: "Your BMI falls in the Class III range. Bariatric surgery is commonly discussed at this level. A consultation can help." };
}

function toneClasses(tone: Tone) {
  if (tone === "green") return "border-[#b8d4c4] bg-[#edf8f1] text-[#1a7046]";
  if (tone === "yellow") return "border-[#d8c88b] bg-[#fffdf4] text-[#5e5235]";
  if (tone === "red") return "border-[#efb3a5] bg-[#fff5f2] text-[#8a3b22]";
  return "border-[#bfccd8] bg-[#f3f8fc] text-[#255374]";
}

function getRegainTone(pct: number): Tone {
  if (pct < 10) return "green";
  if (pct < 20) return "yellow";
  return "red";
}

function getTwlInterpretation(twl: number) {
  if (twl < 0) return "This shows weight gain compared with your starting weight.";
  if (twl < 5) return "Early or modest change from starting weight.";
  if (twl < 10) return "Even 5% total weight loss can be clinically meaningful.";
  if (twl < 15) return "This level of weight loss may represent meaningful progress.";
  if (twl < 20) return "This is a strong amount of total weight loss.";
  return "This is a substantial amount of total weight loss.";
}

function getEwlInterpretation(ewl: number) {
  if (ewl < 0) return "This shows weight gain relative to your starting point.";
  if (ewl < 25) return "Early progress relative to excess weight.";
  if (ewl < 50) return "Meaningful progress on excess weight loss.";
  return "Many bariatric programs cite ≥50% EWL as a success benchmark — discuss with your care team.";
}

function getGoalInterpretation(result: Result, goalBmi: number) {
  const lbs = Math.abs(result.poundsToGoal ?? 0);
  const dir = (result.poundsToGoal ?? 1) > 0 ? "from" : "past";
  return `You are ${formatN(lbs, 1)} lb ${dir} your entered goal. Goal BMI estimate: ${formatN(goalBmi, 1)}.`;
}

function getRegainInterpretation(pct: number) {
  if (pct < 10) return "Limited regain from your lowest weight — strong maintenance.";
  if (pct < 20) return "Some regain detected. Worth discussing at your next follow-up.";
  return "Significant regain detected. A provider review may help identify support options.";
}

function getNextStepCards(result: Result) {
  const cards = [];
  if (result.currentBmi < 18.5) return [{ title: "Talk with a provider", copy: "BMI is below healthy range — a medical conversation is the recommended next step.", cta: "Contact JourneyLite", href: "/contact" }];
  cards.push({ title: "Explore treatment options", copy: "Compare surgical, non-surgical, and medication paths with JourneyLite's care team.", cta: "Compare options", href: "/services/compare-weight-loss-options" });
  if (result.currentBmi >= 35) cards.push({ title: "Consider bariatric surgery", copy: "Your BMI may support a surgical evaluation conversation. Learn about the gastric sleeve and bypass.", cta: "Explore surgery", href: "/services/gastric-sleeve" });
  else if (result.currentBmi >= 30) cards.push({ title: "Compare medical paths", copy: "Medications, gastric balloon, and medical weight-loss programs may be worth discussing.", cta: "View options", href: "/medications" });
  if ((result.percentRegained ?? 0) >= 20) cards.push({ title: "Review regain support", copy: "Regain can be addressed without judgment — nutrition, medication, or revision options may help.", cta: "Regain support", href: "/medications#post-op-support" });
  else cards.push({ title: "Schedule a consultation", copy: "Bring these numbers to your first JourneyLite appointment to guide the conversation.", cta: "Book now", href: "/contact" });
  return cards.slice(0, 3);
}

function bmiFrom(w: number, h: number) { return (w / (h * h)) * 703; }
function toNum(v: string) { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : 0; }
function parseNum(v: string) { if (!v) return undefined; const n = Number(v); return Number.isFinite(n) ? n : undefined; }
function formatN(v: number, d: number) { return Number.isFinite(v) ? v.toFixed(d) : "0"; }
function clamp(v: number, mn: number, mx: number) { return Math.min(Math.max(v, mn), mx); }

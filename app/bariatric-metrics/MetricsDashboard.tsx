"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Conditions = {
  diabetes: boolean;
  sleepApnea: boolean;
  highBloodPressure: boolean;
  gerd: boolean;
  pcos: boolean;
  jointPain: boolean;
};

type AssessmentInputs = {
  feet: string;
  inches: string;
  currentWeight: string;
  startWeight: string;
  goalWeight: string;
  age: string;
  sex: string;
  conditions: Conditions;
  previousSurgery: string;
  smokingStatus: string;
  insuranceProvider: string;
};

const initialInputs: AssessmentInputs = {
  feet: "", inches: "", currentWeight: "", startWeight: "", goalWeight: "",
  age: "", sex: "",
  conditions: {
    diabetes: false, sleepApnea: false, highBloodPressure: false,
    gerd: false, pcos: false, jointPain: false,
  },
  previousSurgery: "", smokingStatus: "", insuranceProvider: "",
};

type CandidateStatus = "unlikely" | "possible" | "likely" | "strong";

type AssessmentResult = {
  heightIn: number;
  currentWeight: number;
  startWeight: number;
  goalWeight?: number;
  currentBmi: number;
  startBmi: number;
  goalBmi?: number;
  idealWeightLow: number;
  idealWeightHigh: number;
  weightLost: number;
  remainingToGoal?: number;
  excessWeight: number;
  twl: number;
  ewl?: number;
  goalProgress?: number;
  poundsTo40: number;
  poundsTo35: number;
  poundsTo30: number;
  poundsTo25: number;
  candidateStatus: CandidateStatus;
  eligibilityScore: number;
  bmiQualifies: boolean;
  comorbidityQualifies: boolean;
  conditionCount: number;
};

// ─── Procedure data ───────────────────────────────────────────────────────────

type Procedure = {
  id: string;
  name: string;
  tagline: string;
  weightLoss: string;
  recovery: string;
  benefits: string[];
  tradeoffs: string[];
  bestFor: string;
  isRevision?: boolean;
};

const PROCEDURES: Procedure[] = [
  {
    id: "sleeve",
    name: "Gastric Sleeve",
    tagline: "The most commonly performed bariatric procedure",
    weightLoss: "60–70% excess weight loss",
    recovery: "2–4 weeks return to normal activity",
    benefits: [
      "Simpler, shorter procedure than bypass",
      "No intestinal rerouting required",
      "Reduces hunger hormone (ghrelin)",
      "Strong, durable long-term outcomes",
    ],
    tradeoffs: [
      "Irreversible — stomach is permanently resized",
      "May worsen GERD in some patients",
      "Less effective than bypass at very high BMI",
    ],
    bestFor: "First-time surgery, BMI 35–50, mild or no GERD, no severe diabetes",
  },
  {
    id: "bypass",
    name: "Gastric Bypass (RYGB)",
    tagline: "Gold standard for GERD, diabetes, and metabolic disease",
    weightLoss: "65–80% excess weight loss",
    recovery: "3–5 weeks return to normal activity",
    benefits: [
      "Resolves GERD and acid reflux in most patients",
      "Highest diabetes remission rate of sleeve or bypass",
      "Largest clinical evidence base",
      "Strong metabolic and hormonal effects",
    ],
    tradeoffs: [
      "More complex procedure than sleeve",
      "Higher risk of long-term nutritional deficiency",
      "Permanent intestinal rerouting",
    ],
    bestFor: "GERD, type 2 diabetes, BMI 35–60, strong metabolic goals",
  },
  {
    id: "sadi",
    name: "SADI-S / Duodenal Switch",
    tagline: "Highest weight loss of any bariatric procedure",
    weightLoss: "75–90% excess weight loss",
    recovery: "4–6 weeks return to normal activity",
    benefits: [
      "Best long-term weight loss outcomes",
      "Excellent for very high BMI (50+)",
      "Superior diabetes and metabolic remission",
      "Single anastomosis simplifies DS anatomy",
    ],
    tradeoffs: [
      "Most complex and technically demanding procedure",
      "Strictest nutritional supplementation requirements",
      "Less widely offered than sleeve or bypass",
    ],
    bestFor: "BMI 50 or above, severe metabolic disease, very high weight-loss goals",
  },
  {
    id: "revision",
    name: "Revision Surgery",
    tagline: "For patients with a prior bariatric procedure",
    weightLoss: "Varies by conversion type and anatomy",
    recovery: "2–5 weeks depending on procedure",
    benefits: [
      "Restores or enhances prior results",
      "Addresses regain, complications, or inadequate loss",
      "Sleeve-to-bypass is the most common revision",
      "Resolves GERD that developed after sleeve",
    ],
    tradeoffs: [
      "More technically complex than primary surgery",
      "Higher surgical risk than a first procedure",
      "Insurance coverage varies significantly by plan",
    ],
    bestFor: "Prior bariatric surgery with regain, GERD, or inadequate weight loss",
    isRevision: true,
  },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function MetricsDashboard() {
  const [inputs, setInputs] = useState<AssessmentInputs>(initialInputs);
  const [showResults, setShowResults] = useState(false);
  const [pdfState, setPdfState] = useState<"idle" | "loading" | "error">("idle");

  const result = useMemo(() => calculateAssessment(inputs), [inputs]);

  function updateField<K extends keyof AssessmentInputs>(key: K, value: AssessmentInputs[K]) {
    setInputs(prev => ({ ...prev, [key]: value }));
    setShowResults(false);
  }

  function toggleCondition(key: keyof Conditions) {
    setInputs(prev => ({
      ...prev,
      conditions: { ...prev.conditions, [key]: !prev.conditions[key] },
    }));
    setShowResults(false);
  }

  function handleCalculate() {
    if (!canCalculate(inputs)) return;
    setShowResults(true);
    setTimeout(() => {
      document.getElementById("assessment-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  return (
    <div className="min-h-screen" style={{ background: "#f7f8f6" }}>

      {/* Hero */}
      <section style={{ background: "#fff", borderBottom: "1px solid #e4e9e6" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 72px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            borderRadius: 999, border: "1px solid #c8ddd1", background: "#f0f7f3",
            padding: "6px 14px", marginBottom: 22,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#145c42", flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#145c42" }}>
              Completes in ~30 seconds · Private
            </span>
          </div>
          <h1 className="font-serif" style={{ fontSize: "clamp(32px,5vw,50px)", lineHeight: 1.13, color: "#0d1a11", margin: "0 0 18px" }}>
            Your Personalized<br />Bariatric Assessment
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "#586760", maxWidth: 480, margin: "0 auto 24px" }}>
            Enter your health details to receive a clinical assessment of your BMI, surgery eligibility,
            procedure options, and a personalized path forward — calculated privately in your browser.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
            {[
              "Nothing leaves your device",
              "Educational, not a diagnosis",
              "PDF report available",
            ].map(text => (
              <span key={text} style={{ fontSize: 12, color: "#8a9b92", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#c8ddd1", flexShrink: 0 }} />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-step form */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 56px" }}>
        <MultiStepForm
          inputs={inputs}
          onUpdateField={updateField}
          onToggleCondition={toggleCondition}
          onCalculate={handleCalculate}
        />
      </section>

      {/* Results */}
      {showResults && result && (
        <div id="assessment-results">
          <AssessmentResultsView
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
            onEditInputs={() => {
              setShowResults(false);
              setTimeout(() => {
                document.querySelector("section")?.scrollIntoView({ behavior: "smooth" });
              }, 50);
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Multi-step form ──────────────────────────────────────────────────────────

const STEPS = ["Measurements", "About You", "Conditions", "Finish"] as const;

function MultiStepForm({
  inputs,
  onUpdateField,
  onToggleCondition,
  onCalculate,
}: {
  inputs: AssessmentInputs;
  onUpdateField: <K extends keyof AssessmentInputs>(key: K, value: AssessmentInputs[K]) => void;
  onToggleCondition: (key: keyof Conditions) => void;
  onCalculate: () => void;
}) {
  const [step, setStep] = useState(0);

  // Live BMI for step 1 callout
  const liveCurrentBmi = useMemo(() => {
    const f = toNum(inputs.feet), i = toNum(inputs.inches), w = toNum(inputs.currentWeight);
    const h = f * 12 + i;
    return h && w ? bmiFrom(w, h) : null;
  }, [inputs.feet, inputs.inches, inputs.currentWeight]);

  const highBmi = liveCurrentBmi !== null && liveCurrentBmi >= 50;

  const step0Valid = Boolean(toNum(inputs.feet) && toNum(inputs.currentWeight) && toNum(inputs.startWeight));
  const step1Valid = Boolean(toNum(inputs.age) && inputs.sex);
  const step2Valid = true; // conditions are optional
  const step3Valid = true; // all optional

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1);
  }

  function back() {
    if (step > 0) setStep(s => s - 1);
  }

  function stepCanAdvance() {
    if (step === 0) return step0Valid;
    if (step === 1) return step1Valid;
    return true;
  }

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
        {STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800,
                  background: done ? "#145c42" : active ? "#0f3e2e" : "#e4e9e6",
                  color: done || active ? "#fff" : "#8a9b92",
                  transition: "all 0.2s",
                }}>
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : i + 1}
                </div>
                <span style={{
                  fontSize: 12, fontWeight: active ? 700 : 500,
                  color: active ? "#0d1a11" : done ? "#145c42" : "#8a9b92",
                  whiteSpace: "nowrap",
                }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1, background: done ? "#c8ddd1" : "#e4e9e6", margin: "0 12px" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div style={{
        background: "#fff", border: "1px solid #e4e9e6", borderRadius: 18,
        overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        {step === 0 && (
          <StepMeasurements inputs={inputs} onUpdateField={onUpdateField} liveBmi={liveCurrentBmi} highBmi={highBmi} />
        )}
        {step === 1 && (
          <StepAboutYou inputs={inputs} onUpdateField={onUpdateField} />
        )}
        {step === 2 && (
          <StepConditions inputs={inputs} onToggleCondition={onToggleCondition} />
        )}
        {step === 3 && (
          <StepFinish inputs={inputs} onUpdateField={onUpdateField} />
        )}

        {/* Navigation */}
        <div style={{
          padding: "20px 28px", background: "#f8fbf9",
          borderTop: "1px solid #f0f4f2",
          display: "flex", gap: 10, alignItems: "center",
        }}>
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              style={{
                padding: "11px 22px", borderRadius: 10,
                border: "1px solid #e4e9e6", background: "#fff",
                fontSize: 13, fontWeight: 600, color: "#586760",
                cursor: "pointer",
              }}
            >
              Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!stepCanAdvance()}
              onClick={next}
              style={{
                padding: "11px 28px", borderRadius: 10, border: "none",
                background: stepCanAdvance() ? "#0f3e2e" : "#c8d5cf",
                color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: stepCanAdvance() ? "pointer" : "not-allowed",
                transition: "background 0.15s",
              }}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={onCalculate}
              style={{
                padding: "11px 28px", borderRadius: 10, border: "none",
                background: "#0f3e2e", color: "#fff",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              Generate My Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Measurements ─────────────────────────────────────────────────────

function StepMeasurements({
  inputs,
  onUpdateField,
  liveBmi,
  highBmi,
}: {
  inputs: AssessmentInputs;
  onUpdateField: <K extends keyof AssessmentInputs>(key: K, value: AssessmentInputs[K]) => void;
  liveBmi: number | null;
  highBmi: boolean;
}) {
  return (
    <div style={{ padding: "28px 28px 24px" }}>
      <StepHeader
        title="Measurements"
        subtitle="Height and weight are required. Goal weight is optional."
      />

      {/* High-BMI direct-contact callout */}
      {highBmi && (
        <div style={{
          margin: "0 0 24px",
          padding: "16px 20px",
          borderRadius: 12,
          border: "1.5px solid #c8ddd1",
          background: "#f0f7f3",
          display: "flex", gap: 16, alignItems: "flex-start",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: "#0f3e2e", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0f3e2e", margin: "0 0 4px" }}>
              Your BMI ({liveBmi?.toFixed(1)}) is in a range where direct guidance may be most helpful.
            </p>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: "#4a5e53", margin: "0 0 10px" }}>
              At this level, a JourneyLite specialist can give you a more complete picture than an online tool. You are welcome to finish this assessment, but we encourage you to connect with our team directly.
            </p>
            <Link
              href="/contact"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12, fontWeight: 700, color: "#0f3e2e",
                textDecoration: "none", borderBottom: "1px solid #c8ddd1",
                paddingBottom: 1,
              }}
            >
              Talk to a specialist now
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {/* Height */}
        <div>
          <label style={labelStyle}>Height</label>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <div style={{ flex: 1 }}>
              <div style={inputWrap}>
                <input style={inputBase} id="feet" inputMode="numeric" placeholder="5" type="number" min="3" max="8"
                  value={inputs.feet} onChange={e => onUpdateField("feet", e.target.value)} />
                <span style={suffixStyle}>ft</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={inputWrap}>
                <input style={inputBase} id="inches" inputMode="numeric" placeholder="8" type="number" min="0" max="11"
                  value={inputs.inches} onChange={e => onUpdateField("inches", e.target.value)} />
                <span style={suffixStyle}>in</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <NumberInput label="Current Weight" id="currentWeight" value={inputs.currentWeight}
            onChange={v => onUpdateField("currentWeight", v)} suffix="lb" placeholder="220" />
          <NumberInput label="Starting / Highest Weight" id="startWeight" value={inputs.startWeight}
            onChange={v => onUpdateField("startWeight", v)} suffix="lb" placeholder="280"
            helper="Your heaviest weight or weight before treatment." />
        </div>

        <NumberInput label="Goal Weight (optional)" id="goalWeight" value={inputs.goalWeight}
          onChange={v => onUpdateField("goalWeight", v)} suffix="lb" placeholder="160"
          helper="Unlocks goal BMI and progress tracking." />
      </div>

      {/* Live BMI preview */}
      {liveBmi !== null && !highBmi && (
        <div style={{
          marginTop: 20, padding: "12px 16px", borderRadius: 10,
          background: "#f8fbf9", border: "1px solid #e4e9e6",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 12, color: "#6b7f74" }}>Current BMI estimate</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#0d1a11" }}>
            {liveBmi.toFixed(1)}
            <span style={{ fontSize: 11, fontWeight: 500, color: "#8a9b92", marginLeft: 6 }}>
              {getBmiContext(liveBmi).label}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: About You ────────────────────────────────────────────────────────

function StepAboutYou({
  inputs,
  onUpdateField,
}: {
  inputs: AssessmentInputs;
  onUpdateField: <K extends keyof AssessmentInputs>(key: K, value: AssessmentInputs[K]) => void;
}) {
  return (
    <div style={{ padding: "28px 28px 24px" }}>
      <StepHeader title="About You" subtitle="Age and sex are used to contextualize your assessment." />
      <div style={{ display: "grid", gap: 20 }}>
        <NumberInput label="Age" id="age" value={inputs.age}
          onChange={v => onUpdateField("age", v)} suffix="yrs" placeholder="42" />
        <div>
          <label style={labelStyle}>Sex</label>
          <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {["Female", "Male", "Other"].map(opt => (
              <ToggleButton key={opt} label={opt} active={inputs.sex === opt}
                onClick={() => onUpdateField("sex", opt)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Conditions ───────────────────────────────────────────────────────

function StepConditions({
  inputs,
  onToggleCondition,
}: {
  inputs: AssessmentInputs;
  onToggleCondition: (key: keyof Conditions) => void;
}) {
  const conditionList: { key: keyof Conditions; label: string }[] = [
    { key: "diabetes", label: "Type 2 Diabetes" },
    { key: "sleepApnea", label: "Sleep Apnea" },
    { key: "highBloodPressure", label: "High Blood Pressure" },
    { key: "gerd", label: "GERD / Acid Reflux" },
    { key: "pcos", label: "PCOS" },
    { key: "jointPain", label: "Joint Pain / Arthritis" },
  ];

  return (
    <div style={{ padding: "28px 28px 24px" }}>
      <StepHeader
        title="Health Conditions"
        subtitle="Select any that apply. These affect eligibility scoring and procedure recommendations."
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {conditionList.map(({ key, label }) => {
          const active = inputs.conditions[key];
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => onToggleCondition(key)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 14px", borderRadius: 10, textAlign: "left",
                border: active ? "1.5px solid #145c42" : "1.5px solid #dce6e1",
                background: active ? "#f0f7f3" : "#fff",
                color: active ? "#145c42" : "#3d4f45",
                fontSize: 13, fontWeight: 500, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <span style={{
                width: 17, height: 17, borderRadius: 4, flexShrink: 0,
                border: active ? "none" : "1.5px solid #b0c5bb",
                background: active ? "#145c42" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {active && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </span>
              {label}
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: "#8a9b92", margin: "14px 0 0" }}>
        None of these apply? Leave all unselected and continue.
      </p>
    </div>
  );
}

// ─── Step 4: Finish ───────────────────────────────────────────────────────────

function StepFinish({
  inputs,
  onUpdateField,
}: {
  inputs: AssessmentInputs;
  onUpdateField: <K extends keyof AssessmentInputs>(key: K, value: AssessmentInputs[K]) => void;
}) {
  return (
    <div style={{ padding: "28px 28px 24px" }}>
      <StepHeader
        title="Additional Information"
        subtitle="All fields on this step are optional. They help personalize procedure recommendations."
      />
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <label style={labelStyle}>Previous Bariatric Surgery</label>
          <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {["Yes", "No"].map(opt => (
              <ToggleButton key={opt} label={opt} active={inputs.previousSurgery === opt}
                onClick={() => onUpdateField("previousSurgery", opt)} />
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Smoking Status</label>
          <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {["Non-smoker", "Current smoker", "Former smoker"].map(opt => (
              <ToggleButton key={opt} label={opt} active={inputs.smokingStatus === opt}
                onClick={() => onUpdateField("smokingStatus", opt)} small />
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle} htmlFor="insuranceProvider">Insurance Provider</label>
          <div style={{ ...inputWrap, marginTop: 6 }}>
            <input
              style={{ ...inputBase, flex: 1 }}
              id="insuranceProvider"
              placeholder="e.g. Anthem, Aetna, UnitedHealthcare, Medicare"
              type="text"
              value={inputs.insuranceProvider}
              onChange={e => onUpdateField("insuranceProvider", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Assessment Results ────────────────────────────────────────────────────────

function AssessmentResultsView({
  result,
  inputs,
  pdfState,
  onDownloadPdf,
  onEditInputs,
}: {
  result: AssessmentResult;
  inputs: AssessmentInputs;
  pdfState: "idle" | "loading" | "error";
  onDownloadPdf: () => void;
  onEditInputs: () => void;
}) {
  const procedures = getProcedureFit(result, inputs);

  return (
    <>
      {/* Compact input summary bar */}
      <div style={{ background: "#fff", borderTop: "1px solid #e4e9e6", borderBottom: "1px solid #e4e9e6" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
          <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: "4px 0", alignItems: "center", minWidth: 0 }}>
            {buildInputSummaryChips(inputs, result).map((chip, i, arr) => (
              <span key={chip} style={{ fontSize: 12, color: "#586760" }}>
                <span style={{ fontWeight: i === 0 ? 700 : 500, color: i === 0 ? "#0d1a11" : "#586760" }}>{chip}</span>
                {i < arr.length - 1 && <span style={{ color: "#c8ddd1", margin: "0 8px" }}>·</span>}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onEditInputs}
            style={{
              marginLeft: 16, padding: "6px 14px", borderRadius: 8,
              border: "1px solid #e4e9e6", background: "#f8f9f8",
              fontSize: 12, fontWeight: 600, color: "#586760",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            Edit
          </button>
        </div>
      </div>

      {/* Assessment Summary */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e4e9e6" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "52px 24px" }}>
          <AssessmentSummary result={result} inputs={inputs} />
        </div>
      </div>

      {/* Results Dashboard */}
      <div style={{ maxWidth: 1024, margin: "0 auto", padding: "52px 24px" }}>
        <ResultsSectionHeader title="Results Dashboard" subtitle="Your key bariatric metrics at a glance" />
        <ResultsDashboard result={result} />
      </div>

      {/* Surgery Eligibility */}
      <div style={{ background: "#fff", borderTop: "1px solid #e4e9e6", borderBottom: "1px solid #e4e9e6" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "52px 24px" }}>
          <ResultsSectionHeader title="Surgery Eligibility" subtitle="Based on your BMI, health conditions, and insurance status" />
          <SurgeryEligibility result={result} inputs={inputs} />
        </div>
      </div>

      {/* Procedure Fit */}
      {procedures.length > 0 && (
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "52px 24px" }}>
          <ResultsSectionHeader title="Possible Procedure Fit" subtitle="Procedures worth discussing based on your assessment" />
          <ProcedureFitCards procedures={procedures} result={result} inputs={inputs} />
        </div>
      )}

      {/* Progress Visuals */}
      <div style={{ background: "#fff", borderTop: "1px solid #e4e9e6", borderBottom: "1px solid #e4e9e6" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "52px 24px" }}>
          <ResultsSectionHeader title="Progress Visuals" subtitle="Your BMI journey, goal progress, and milestone tracker" />
          <ProgressVisuals result={result} />
        </div>
      </div>

      {/* Personalized Insights */}
      <div style={{ maxWidth: 1024, margin: "0 auto", padding: "52px 24px" }}>
        <ResultsSectionHeader title="Personalized Insights" subtitle="Observations generated from your specific inputs" />
        <PersonalizedInsights result={result} inputs={inputs} />
      </div>

      {/* Next Steps */}
      <div style={{ background: "#fff", borderTop: "1px solid #e4e9e6" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "52px 24px" }}>
          <ResultsSectionHeader title="Next Steps" subtitle="Your personalized path forward with JourneyLite" />
          <NextSteps pdfState={pdfState} onDownloadPdf={onDownloadPdf} />
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ maxWidth: 1024, margin: "0 auto", padding: "28px 24px 48px", textAlign: "center" }}>
        <p style={{ fontSize: 11, lineHeight: 1.7, color: "#9aafa5", maxWidth: 640, margin: "0 auto" }}>
          This assessment is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. Final surgical eligibility requires a comprehensive evaluation by a board-certified bariatric surgeon and multidisciplinary team, including medical history, physical examination, laboratory work, and insurance pre-authorization.{" "}
          <Link href="/contact" style={{ color: "#145c42", textDecoration: "underline" }}>JourneyLite Physicians</Link>
        </p>
      </div>
    </>
  );
}

// Builds the compact summary chips from inputs
function buildInputSummaryChips(inputs: AssessmentInputs, result: AssessmentResult): string[] {
  const chips: string[] = [];
  if (inputs.feet) chips.push(`${inputs.feet}'${inputs.inches || "0"}"`);
  if (inputs.currentWeight) chips.push(`${inputs.currentWeight} lb current`);
  if (inputs.startWeight) chips.push(`${inputs.startWeight} lb start`);
  if (inputs.goalWeight) chips.push(`${inputs.goalWeight} lb goal`);
  chips.push(`BMI ${result.currentBmi.toFixed(1)}`);
  if (inputs.age) chips.push(`Age ${inputs.age}`);
  if (inputs.sex) chips.push(inputs.sex);
  const selectedConditions = (Object.entries(inputs.conditions) as [keyof Conditions, boolean][])
    .filter(([, v]) => v)
    .map(([k]) => ({
      diabetes: "Diabetes", sleepApnea: "Sleep Apnea",
      highBloodPressure: "High BP", gerd: "GERD", pcos: "PCOS", jointPain: "Joint Pain",
    }[k]));
  if (selectedConditions.length) chips.push(selectedConditions.join(", "));
  if (inputs.previousSurgery === "Yes") chips.push("Prior surgery");
  if (inputs.smokingStatus) chips.push(inputs.smokingStatus);
  if (inputs.insuranceProvider) chips.push(inputs.insuranceProvider);
  return chips;
}

// ─── Assessment Summary ────────────────────────────────────────────────────────

function AssessmentSummary({ result, inputs }: { result: AssessmentResult; inputs: AssessmentInputs }) {
  const bmiCtx = getBmiContext(result.currentBmi);
  const candCtx = getCandidateContext(result.candidateStatus);

  return (
    <div style={{ display: "grid", gap: 32, gridTemplateColumns: "1fr auto", alignItems: "start" }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a9b92", margin: "0 0 14px" }}>
          Assessment Summary
        </p>
        <h2 className="font-serif" style={{ fontSize: "clamp(24px,4vw,36px)", lineHeight: 1.15, color: "#0d1a11", margin: "0 0 14px" }}>
          {candCtx.heading}
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.75, color: "#586760", maxWidth: 580, margin: "0 0 22px" }}>
          {candCtx.explanation(result, inputs)}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700,
            ...candCtx.badgeStyle,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
            {candCtx.label}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 500,
            border: "1px solid #e4e9e6", background: "#f8f9f8", color: "#586760",
          }}>
            BMI {result.currentBmi.toFixed(1)} · {bmiCtx.label}
          </span>
        </div>
      </div>

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        background: "#f8fbf9", border: "1px solid #e4e9e6", borderRadius: 18,
        padding: "28px 36px", minWidth: 160,
      }}>
        <p style={{ fontSize: 44, fontWeight: 900, color: "#0d1a11", lineHeight: 1, margin: "0 0 6px" }}>
          {result.currentBmi.toFixed(1)}
        </p>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a9b92", margin: "0 0 14px" }}>
          Current BMI
        </p>
        <MiniBmiBar bmi={result.currentBmi} />
        <p style={{ fontSize: 11, fontWeight: 600, color: bmiCtx.textColor, marginTop: 8 }}>
          {bmiCtx.label}
        </p>
      </div>
    </div>
  );
}

// ─── Results Dashboard ────────────────────────────────────────────────────────

function ResultsDashboard({ result }: { result: AssessmentResult }) {
  const metrics = [
    { label: "Current BMI", value: result.currentBmi.toFixed(1), sub: getBmiContext(result.currentBmi).label, accent: true },
    { label: "Starting BMI", value: result.startBmi.toFixed(1), sub: getBmiContext(result.startBmi).label },
    { label: "Goal BMI", value: result.goalBmi ? result.goalBmi.toFixed(1) : "—", sub: result.goalBmi ? getBmiContext(result.goalBmi).label : "Enter goal weight" },
    { label: "Current Weight", value: `${result.currentWeight.toFixed(0)} lb`, sub: "Most recent" },
    { label: "Weight Lost", value: `${Math.abs(result.weightLost).toFixed(0)} lb`, sub: result.weightLost >= 0 ? "from starting weight" : "above start", accent: result.weightLost > 0 },
    { label: "Remaining to Goal", value: result.remainingToGoal !== undefined ? `${Math.abs(result.remainingToGoal).toFixed(0)} lb` : "—", sub: result.remainingToGoal !== undefined ? (result.remainingToGoal > 0 ? "until goal" : "Goal exceeded") : "Enter goal weight" },
    { label: "Healthy Weight Range", value: `${result.idealWeightLow.toFixed(0)}–${result.idealWeightHigh.toFixed(0)} lb`, sub: "BMI 18.5–24.9" },
    { label: "Excess Weight", value: `${result.excessWeight.toFixed(0)} lb`, sub: "above BMI 25" },
    { label: "% Total Weight Loss", value: `${result.twl.toFixed(1)}%`, sub: "from starting weight", accent: result.twl >= 10 },
    { label: "% Excess Weight Loss", value: result.ewl !== undefined ? `${result.ewl.toFixed(1)}%` : "—", sub: result.ewl !== undefined ? "of excess weight lost" : "Calculated from start" },
    { label: "Lbs to BMI 35", value: result.poundsTo35 > 0 ? `${result.poundsTo35.toFixed(0)} lb` : "Reached", sub: result.poundsTo35 > 0 ? "to reach BMI 35" : "Below BMI 35", positive: result.poundsTo35 <= 0 },
    { label: "Lbs to BMI 30", value: result.poundsTo30 > 0 ? `${result.poundsTo30.toFixed(0)} lb` : "Reached", sub: result.poundsTo30 > 0 ? "to reach BMI 30" : "Below BMI 30", positive: result.poundsTo30 <= 0 },
    { label: "Lbs to BMI 25", value: result.poundsTo25 > 0 ? `${result.poundsTo25.toFixed(0)} lb` : "Reached", sub: result.poundsTo25 > 0 ? "to reach BMI 25" : "Below BMI 25", positive: result.poundsTo25 <= 0 },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 10 }}>
      {metrics.map(m => (
        <div key={m.label} style={{
          borderRadius: 14, padding: "15px 16px",
          border: m.accent ? "1.5px solid #c8ddd1" : "1px solid #e4e9e6",
          background: m.accent ? "#f0f7f3" : "#fff",
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a9b92", margin: "0 0 9px" }}>
            {m.label}
          </p>
          <p style={{ fontSize: 21, fontWeight: 800, lineHeight: 1, margin: "0 0 5px", color: m.accent ? "#0f3e2e" : m.positive ? "#145c42" : "#0d1a11" }}>
            {m.value}
          </p>
          <p style={{ fontSize: 11, color: "#7a8d84", margin: 0 }}>{m.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Surgery Eligibility ──────────────────────────────────────────────────────

function SurgeryEligibility({ result, inputs }: { result: AssessmentResult; inputs: AssessmentInputs }) {
  const hasInsurance = inputs.insuranceProvider.trim().length > 0;
  const smokingKnown = inputs.smokingStatus.length > 0;
  const isNonSmoker = inputs.smokingStatus === "Non-smoker" || inputs.smokingStatus === "Former smoker";

  const criteria = [
    {
      label: "BMI Qualification",
      status: result.bmiQualifies ? "met" : "not-met",
      note: result.bmiQualifies
        ? `BMI ${result.currentBmi.toFixed(1)} meets standard criteria (40 or above, or 35+ with qualifying conditions).`
        : `BMI ${result.currentBmi.toFixed(1)} is below the standard threshold. Comorbidities and clinical review may affect final eligibility.`,
    },
    {
      label: "Comorbidity Qualification",
      status: result.comorbidityQualifies ? "met" : "neutral",
      note: result.comorbidityQualifies
        ? `${result.conditionCount} qualifying condition${result.conditionCount > 1 ? "s" : ""} selected — strengthens eligibility, especially at BMI 35–39.9.`
        : "No qualifying conditions selected. Surgery at lower BMI typically requires a documented comorbidity.",
    },
    {
      label: "Insurance Readiness",
      status: hasInsurance ? "met" : "neutral",
      note: hasInsurance
        ? `${inputs.insuranceProvider} entered. Coverage criteria vary — your consultation will clarify the authorization pathway.`
        : "No insurer entered. Most major plans cover bariatric surgery when BMI and comorbidity criteria are documented.",
    },
    {
      label: "Smoking Status",
      status: !smokingKnown ? "neutral" : isNonSmoker ? "met" : "caution",
      note: inputs.smokingStatus === "Current smoker"
        ? "Most programs require smoking cessation before surgery. A pre-op plan can address this — it does not automatically disqualify you."
        : inputs.smokingStatus === "Former smoker"
        ? "Former smoker — most cessation period requirements are typically satisfied."
        : inputs.smokingStatus === "Non-smoker"
        ? "Non-smoker status is favorable for surgical candidacy and recovery."
        : "Smoking status not entered — programs will review this during evaluation.",
    },
  ] as { label: string; status: "met" | "not-met" | "neutral" | "caution"; note: string }[];

  const score = result.eligibilityScore;
  const scoreColor = score >= 70 ? "#145c42" : score >= 40 ? "#b45309" : "#64748b";
  const scoreFill = score >= 70 ? "#145c42" : score >= 40 ? "#d97706" : "#94a3b8";
  const scoreLabel = score >= 70 ? "Likely eligible" : score >= 40 ? "Partially eligible" : "Review needed";

  return (
    <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 240px" }}>
      <div style={{ display: "grid", gap: 10 }}>
        {criteria.map(c => {
          const iconColor = c.status === "met" ? "#145c42" : c.status === "caution" ? "#b45309" : c.status === "not-met" ? "#dc2626" : "#94a3b8";
          const iconBg = c.status === "met" ? "#e8f5ee" : c.status === "caution" ? "#fffbeb" : c.status === "not-met" ? "#fef2f2" : "#f8f9f8";
          return (
            <div key={c.label} style={{ display: "flex", gap: 14, padding: "15px 18px", border: "1px solid #e4e9e6", borderRadius: 14, background: "#fff" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {c.status === "met" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 12.75l6 6 9-13.5" /></svg>
                ) : c.status === "caution" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                ) : c.status === "not-met" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" /></svg>
                )}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0d1a11", margin: "0 0 3px" }}>{c.label}</p>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: "#586760", margin: 0 }}>{c.note}</p>
              </div>
            </div>
          );
        })}
        <div style={{ padding: "13px 16px", border: "1px solid #e4e9e6", borderRadius: 12, background: "#f8fbf9", fontSize: 11, lineHeight: 1.7, color: "#6b7f74" }}>
          <strong style={{ color: "#0d1a11" }}>Disclaimer:</strong> This review is informational only. Final determination requires evaluation by a board-certified bariatric surgeon, including history, exam, labs, and insurer pre-authorization.
        </div>
      </div>

      {/* Score */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid #e4e9e6", borderRadius: 18, background: "#fff", padding: "32px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a9b92", margin: "0 0 14px" }}>Overall Score</p>
        <p style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, color: scoreColor, margin: "0 0 4px" }}>{score}</p>
        <p style={{ fontSize: 11, color: "#8a9b92", margin: "0 0 14px" }}>out of 100</p>
        <div style={{ width: "100%", height: 5, borderRadius: 999, background: "#f0f4f2", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 999, background: scoreFill, width: `${score}%`, transition: "width 1s" }} />
        </div>
        <p style={{ fontSize: 12, fontWeight: 700, color: scoreColor, margin: "12px 0 4px" }}>{scoreLabel}</p>
        <p style={{ fontSize: 11, color: "#8a9b92", margin: "0 0 20px", lineHeight: 1.5 }}>Based on BMI, conditions, and inputs entered.</p>
        <div style={{ width: "100%", borderTop: "1px solid #f0f4f2", paddingTop: 18 }}>
          <Link href="/contact" style={{ display: "block", padding: "11px 16px", borderRadius: 10, background: "#0f3e2e", color: "#fff", fontSize: 12, fontWeight: 700, textAlign: "center", textDecoration: "none" }}>
            Confirm with a Provider
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Procedure Fit Cards ──────────────────────────────────────────────────────

function ProcedureFitCards({ procedures, result, inputs }: { procedures: Procedure[]; result: AssessmentResult; inputs: AssessmentInputs }) {
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))" }}>
      {procedures.map(proc => (
        <ProcedureCard key={proc.id} procedure={proc} result={result} inputs={inputs} />
      ))}
    </div>
  );
}

function ProcedureCard({ procedure, result, inputs }: { procedure: Procedure; result: AssessmentResult; inputs: AssessmentInputs }) {
  const [expanded, setExpanded] = useState(false);
  const fitReason = getProcedureFitReason(procedure, result, inputs);

  return (
    <div style={{ border: "1px solid #e4e9e6", borderRadius: 18, background: "#fff", overflow: "hidden" }}>
      <div style={{ padding: "22px 22px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#145c42", margin: "0 0 5px" }}>
              {procedure.isRevision ? "Revision" : "Procedure"}
            </p>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0d1a11", margin: "0 0 3px" }}>{procedure.name}</h3>
            <p style={{ fontSize: 12, color: "#7a8d84", margin: 0 }}>{procedure.tagline}</p>
          </div>
          <div style={{ flexShrink: 0, background: "#f0f7f3", border: "1px solid #c8ddd1", borderRadius: 9, padding: "6px 11px", textAlign: "center" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#145c42", margin: "0 0 1px" }}>MATCH</p>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f3e2e" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>

        <div style={{ background: "#f8fbf9", border: "1px solid #e8f0eb", borderRadius: 9, padding: "11px 13px", marginBottom: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#145c42", margin: "0 0 3px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Why this may fit</p>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: "#4a5e53", margin: 0 }}>{fitReason}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#8a9b92", margin: "0 0 3px" }}>Expected Weight Loss</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0d1a11", margin: 0 }}>{procedure.weightLoss}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#8a9b92", margin: "0 0 3px" }}>Recovery</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0d1a11", margin: 0 }}>{procedure.recovery}</p>
          </div>
        </div>

        <button type="button" onClick={() => setExpanded(!expanded)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#145c42", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          {expanded ? "Show less" : "Benefits, tradeoffs & best for"}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid #f0f4f2", padding: "18px 22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#8a9b92", margin: "0 0 8px" }}>Benefits</p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
                {procedure.benefits.map(b => (
                  <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12, lineHeight: 1.5, color: "#586760" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#145c42", flexShrink: 0, marginTop: 5 }} />{b}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#8a9b92", margin: "0 0 8px" }}>Considerations</p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
                {procedure.tradeoffs.map(t => (
                  <li key={t} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12, lineHeight: 1.5, color: "#586760" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#b0c5bb", flexShrink: 0, marginTop: 5 }} />{t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ background: "#f8fbf9", borderRadius: 9, padding: "11px 13px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#8a9b92", margin: "0 0 3px" }}>Best For</p>
            <p style={{ fontSize: 12, color: "#4a5e53", margin: 0 }}>{procedure.bestFor}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Progress Visuals ─────────────────────────────────────────────────────────

function ProgressVisuals({ result }: { result: AssessmentResult }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: result.goalProgress !== undefined ? "1.5fr 1fr" : "1fr", gap: 14 }}>
        <div style={{ border: "1px solid #e4e9e6", borderRadius: 18, background: "#fff", padding: "22px 26px" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0d1a11", margin: "0 0 3px" }}>BMI Journey</p>
          <p style={{ fontSize: 12, color: "#7a8d84", margin: "0 0 24px" }}>Starting weight through current and goal</p>
          <BmiJourneyBar result={result} />
        </div>
        {result.goalProgress !== undefined && (
          <div style={{ border: "1px solid #e4e9e6", borderRadius: 18, background: "#fff", padding: "22px 26px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0d1a11", margin: "0 0 3px", textAlign: "center" }}>Goal Progress</p>
            <p style={{ fontSize: 12, color: "#7a8d84", margin: "0 0 18px", textAlign: "center" }}>Weight lost toward your goal</p>
            <GoalRing progress={result.goalProgress} />
          </div>
        )}
      </div>
      <div style={{ border: "1px solid #e4e9e6", borderRadius: 18, background: "#fff", padding: "22px 26px" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#0d1a11", margin: "0 0 3px" }}>BMI Milestone Tracker</p>
        <p style={{ fontSize: 12, color: "#7a8d84", margin: "0 0 24px" }}>Pounds needed to reach each BMI threshold</p>
        <MilestoneTracker result={result} />
      </div>
    </div>
  );
}

function BmiJourneyBar({ result }: { result: AssessmentResult }) {
  const MIN = 15, MAX = 55;
  const pct = (v: number) => ((Math.max(MIN, Math.min(MAX, v)) - MIN) / (MAX - MIN)) * 100;
  const zones = [
    { label: "Healthy", color: "#86efac", from: 18.5, to: 25 },
    { label: "Overweight", color: "#fde68a", from: 25, to: 30 },
    { label: "Obesity I", color: "#fca5a5", from: 30, to: 35 },
    { label: "Obesity II", color: "#f87171", from: 35, to: 40 },
    { label: "Obesity III", color: "#ef4444", from: 40, to: 55 },
  ];
  return (
    <div>
      <div style={{ position: "relative", height: 36, borderRadius: 999, overflow: "hidden", background: "#f0f4f2", marginBottom: 8 }}>
        {zones.map(z => (
          <div key={z.label} style={{ position: "absolute", top: 0, height: "100%", opacity: 0.35, left: `${pct(z.from)}%`, width: `${pct(z.to) - pct(z.from)}%`, background: z.color }} />
        ))}
        <div style={{ position: "absolute", top: 5, bottom: 5, width: 3, borderRadius: 2, background: "#9ca3af", left: `calc(${pct(result.startBmi)}% - 1.5px)` }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, width: 4, borderRadius: 2, background: "#0f3e2e", left: `calc(${pct(result.currentBmi)}% - 2px)`, boxShadow: "0 0 0 3px rgba(15,62,46,0.15)" }} />
        {result.goalBmi && (
          <div style={{ position: "absolute", top: 5, bottom: 5, width: 2, borderRadius: 2, borderLeft: "2px dashed #145c42", left: `${pct(result.goalBmi)}%` }} />
        )}
      </div>
      <div style={{ position: "relative", height: 32, marginBottom: 16 }}>
        {[
          { val: result.startBmi, label: "Start", color: "#9ca3af", bold: false },
          { val: result.currentBmi, label: "Now", color: "#0f3e2e", bold: true },
          ...(result.goalBmi ? [{ val: result.goalBmi, label: "Goal", color: "#145c42", bold: false }] : []),
        ].map(m => (
          <div key={m.label} style={{ position: "absolute", top: 0, left: `${pct(m.val)}%`, transform: "translateX(-50%)", textAlign: "center", minWidth: 44 }}>
            <p style={{ fontSize: 10, fontWeight: m.bold ? 800 : 600, color: m.color, margin: "0 0 1px" }}>{m.label}</p>
            <p style={{ fontSize: 10, color: m.color, margin: 0 }}>{m.val.toFixed(1)}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {[15, 18.5, 25, 30, 35, 40, 55].map(v => <span key={v} style={{ fontSize: 10, color: "#b0c5bb" }}>{v}</span>)}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 14px", marginTop: 12 }}>
        {zones.map(z => (
          <span key={z.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#7a8d84" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: z.color, display: "inline-block" }} />{z.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function GoalRing({ progress }: { progress: number }) {
  const pct = Math.min(100, Math.max(0, progress));
  const R = 60, cx = 78, cy = 78, SW = 12;
  const circ = 2 * Math.PI * R;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="156" height="156" viewBox="0 0 156 156">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f0f4f2" strokeWidth={SW} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={pct >= 100 ? "#145c42" : "#0f3e2e"} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" strokeWidth={SW} transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 7} textAnchor="middle" dominantBaseline="middle" fill="#0d1a11" fontSize="21" fontWeight="800">{pct.toFixed(0)}%</text>
        <text x={cx} y={cx + 12} textAnchor="middle" dominantBaseline="middle" fill="#8a9b92" fontSize="10">to goal</text>
      </svg>
      <p style={{ fontSize: 11, color: "#7a8d84", marginTop: -6 }}>{pct >= 100 ? "Goal reached" : `${(100 - pct).toFixed(0)}% remaining`}</p>
    </div>
  );
}

function MilestoneTracker({ result }: { result: AssessmentResult }) {
  const milestones = [
    { bmi: 40, label: "BMI 40", sublabel: "Class III boundary", lbs: result.poundsTo40, reached: result.poundsTo40 <= 0 },
    { bmi: 35, label: "BMI 35", sublabel: "Surgery threshold", lbs: result.poundsTo35, reached: result.poundsTo35 <= 0 },
    { bmi: 30, label: "BMI 30", sublabel: "Obesity → Overweight", lbs: result.poundsTo30, reached: result.poundsTo30 <= 0 },
    { bmi: 25, label: "BMI 25", sublabel: "Healthy weight range", lbs: result.poundsTo25, reached: result.poundsTo25 <= 0 },
  ];
  return (
    <div style={{ display: "grid", gap: 13 }}>
      {milestones.map(m => {
        const totalToLose = result.currentWeight - weightForBmi(m.bmi, result.heightIn);
        const progressPct = m.reached ? 100 : Math.max(5, Math.min(93, ((totalToLose - m.lbs) / Math.max(totalToLose, 1)) * 100));
        return (
          <div key={m.bmi} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: m.reached ? "2px solid #145c42" : "2px solid #e4e9e6", background: m.reached ? "#145c42" : "#fff", color: m.reached ? "#fff" : "#8a9b92" }}>
              {m.reached ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 12.75l6 6 9-13.5" /></svg>
              ) : <span style={{ fontSize: 10, fontWeight: 700 }}>{m.bmi}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0d1a11" }}>{m.label}</span>
                  <span style={{ fontSize: 11, color: "#8a9b92", marginLeft: 7 }}>{m.sublabel}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: m.reached ? "#145c42" : "#0d1a11", flexShrink: 0, marginLeft: 10 }}>
                  {m.reached ? "Reached" : `${m.lbs.toFixed(0)} lb`}
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 999, background: "#f0f4f2", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 999, transition: "width 1s", background: m.reached ? "#145c42" : "#c8ddd1", width: `${progressPct}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniBmiBar({ bmi }: { bmi: number }) {
  const pct = ((Math.max(15, Math.min(50, bmi)) - 15) / 35) * 100;
  const color = bmi < 25 ? "#145c42" : bmi < 30 ? "#d97706" : bmi < 35 ? "#f87171" : "#ef4444";
  return (
    <div style={{ width: "100%", height: 4, borderRadius: 999, background: "#e4e9e6", overflow: "hidden" }}>
      <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: color }} />
    </div>
  );
}

// ─── Personalized Insights ─────────────────────────────────────────────────────

function PersonalizedInsights({ result, inputs }: { result: AssessmentResult; inputs: AssessmentInputs }) {
  const insights = getPersonalizedInsights(result, inputs);
  return (
    <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
      {insights.map((ins, i) => (
        <div key={i} style={{
          borderRadius: 13, padding: "15px 17px",
          border: ins.type === "positive" ? "1.5px solid #c8ddd1" : ins.type === "caution" ? "1.5px solid #fde68a" : "1px solid #e4e9e6",
          background: ins.type === "positive" ? "#f0f7f3" : ins.type === "caution" ? "#fffbeb" : "#fff",
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", margin: "0 0 7px", color: ins.type === "positive" ? "#145c42" : ins.type === "caution" ? "#92400e" : "#8a9b92" }}>
            {ins.category}
          </p>
          <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.55, color: "#0d1a11", margin: 0 }}>{ins.text}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Next Steps ───────────────────────────────────────────────────────────────

function NextSteps({ pdfState, onDownloadPdf }: { pdfState: "idle" | "loading" | "error"; onDownloadPdf: () => void }) {
  return (
    <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1.6fr" }}>
      <div style={{ borderRadius: 18, background: "#0f3e2e", padding: "32px 28px", display: "flex", flexDirection: "column" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9fd4aa", margin: "0 0 14px" }}>Recommended Next Step</p>
        <h3 className="font-serif" style={{ fontSize: 24, lineHeight: 1.2, color: "#fff", margin: "0 0 12px" }}>Book a Free Consultation</h3>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "#c8e6d4", margin: "0 0 24px", flex: 1 }}>
          A JourneyLite specialist will review your assessment, answer your coverage questions, and outline a personalized plan — no commitment required.
        </p>
        <Link href="/contact" style={{ display: "block", textAlign: "center", padding: "13px 20px", borderRadius: 11, background: "#fff", color: "#0f3e2e", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          Schedule Your Consultation
        </Link>
        <p style={{ fontSize: 11, color: "#7db896", textAlign: "center", margin: "9px 0 0" }}>Free · No commitment</p>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ border: "1px solid #e4e9e6", borderRadius: 14, background: "#fff", padding: "20px 22px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a9b92", margin: "0 0 7px" }}>Save Your Results</p>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0d1a11", margin: "0 0 7px" }}>Download PDF Report</h3>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: "#586760", margin: "0 0 14px" }}>Print or share your assessment with your care team. No personal data is stored.</p>
          <button type="button" disabled={pdfState === "loading"} onClick={onDownloadPdf} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9, border: "1px solid #e4e9e6", background: "#f8f9f8", color: "#0d1a11", fontSize: 12, fontWeight: 600, cursor: pdfState === "loading" ? "default" : "pointer", opacity: pdfState === "loading" ? 0.6 : 1 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#145c42" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {pdfState === "loading" ? "Preparing…" : "Download PDF Report"}
          </button>
          {pdfState === "error" && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 6 }}>PDF generation failed — please try again.</p>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { tag: "Learn", title: "Patient Education", desc: "Videos, guides, and nutrition resources.", cta: "Explore", href: "https://learn.journeylite.com" },
            { tag: "Shop", title: "Bariatric Supplements", desc: "Vitamins, protein, and post-op supplies.", cta: "Shop now", href: "/shop" },
          ].map(card => (
            <Link key={card.tag} href={card.href} style={{ display: "flex", flexDirection: "column", border: "1px solid #e4e9e6", borderRadius: 13, background: "#fff", padding: "16px 16px", textDecoration: "none" }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a9b92", margin: "0 0 5px" }}>{card.tag}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0d1a11", margin: "0 0 5px" }}>{card.title}</p>
              <p style={{ fontSize: 11, color: "#586760", lineHeight: 1.5, margin: "0 0 10px", flex: 1 }}>{card.desc}</p>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#145c42" }}>{card.cta} →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Small UI primitives ──────────────────────────────────────────────────────

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0d1a11", margin: "0 0 4px" }}>{title}</h2>
      <p style={{ fontSize: 13, color: "#6b7f74", margin: 0 }}>{subtitle}</p>
    </div>
  );
}

function ResultsSectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h2 style={{ fontSize: 19, fontWeight: 700, color: "#0d1a11", margin: "0 0 3px" }}>{title}</h2>
      <p style={{ fontSize: 12, color: "#7a8d84", margin: 0 }}>{subtitle}</p>
    </div>
  );
}

function NumberInput({ label, id, value, onChange, suffix, placeholder, helper }: {
  label: string; id: string; value: string; onChange: (v: string) => void;
  suffix?: string; placeholder?: string; helper?: string;
}) {
  return (
    <div>
      <label style={labelStyle} htmlFor={id}>{label}</label>
      {helper && <p style={{ fontSize: 11, color: "#8a9b92", margin: "2px 0 0" }}>{helper}</p>}
      <div style={{ ...inputWrap, marginTop: 6 }}>
        <input style={inputBase} id={id} inputMode="decimal" min="0" placeholder={placeholder} type="number" value={value} onChange={e => onChange(e.target.value)} />
        {suffix && <span style={suffixStyle}>{suffix}</span>}
      </div>
    </div>
  );
}

function ToggleButton({ label, active, onClick, small }: { label: string; active: boolean; onClick: () => void; small?: boolean }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} style={{
      padding: small ? "8px 6px" : "10px 12px", borderRadius: 9,
      border: active ? "1.5px solid #145c42" : "1.5px solid #dce6e1",
      background: active ? "#f0f7f3" : "#fff",
      color: active ? "#145c42" : "#3d4f45",
      fontSize: small ? 11 : 13, fontWeight: 600, cursor: "pointer", textAlign: "center",
      transition: "all 0.15s",
    }}>
      {label}
    </button>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#0d1a11" };
const inputWrap: React.CSSProperties = { display: "flex", overflow: "hidden", border: "1.5px solid #dce6e1", borderRadius: 10, background: "#fff" };
const inputBase: React.CSSProperties = { flex: 1, minWidth: 0, padding: "10px 13px", border: "none", background: "transparent", fontSize: 14, color: "#0d1a11", outline: "none" };
const suffixStyle: React.CSSProperties = { display: "flex", alignItems: "center", padding: "0 11px", background: "#f8fbf9", fontSize: 11, fontWeight: 700, color: "#8a9b92", borderLeft: "1px solid #e8ecea", flexShrink: 0 };

// ─── Pure logic ───────────────────────────────────────────────────────────────

function canCalculate(inputs: AssessmentInputs): boolean {
  return Boolean(toNum(inputs.feet) && toNum(inputs.currentWeight) && toNum(inputs.startWeight) && toNum(inputs.age) && inputs.sex);
}

function calculateAssessment(inputs: AssessmentInputs): AssessmentResult | undefined {
  const feet = toNum(inputs.feet);
  const inchesN = toNum(inputs.inches);
  const cw = toNum(inputs.currentWeight);
  const sw = toNum(inputs.startWeight);
  const gw = toNum(inputs.goalWeight) || undefined;
  const h = feet * 12 + inchesN;
  if (!h || !cw || !sw) return undefined;

  const currentBmi = bmiFrom(cw, h);
  const startBmi = bmiFrom(sw, h);
  const goalBmi = gw ? bmiFrom(gw, h) : undefined;
  const idealWeightLow = weightForBmi(18.5, h);
  const idealWeightHigh = weightForBmi(24.9, h);
  const idealWeight = weightForBmi(25, h);
  const weightLost = sw - cw;
  const remainingToGoal = gw !== undefined ? cw - gw : undefined;
  const excessWeight = Math.max(0, cw - idealWeight);
  const twl = sw > 0 ? (weightLost / sw) * 100 : 0;
  const excessAtStart = Math.max(0, sw - idealWeight);
  const ewl = excessAtStart > 0 ? (weightLost / excessAtStart) * 100 : undefined;
  const goalProgress = gw !== undefined && sw > gw ? clamp((weightLost / (sw - gw)) * 100, 0, 110) : undefined;
  const poundsTo40 = Math.max(0, cw - weightForBmi(40, h));
  const poundsTo35 = Math.max(0, cw - weightForBmi(35, h));
  const poundsTo30 = Math.max(0, cw - weightForBmi(30, h));
  const poundsTo25 = Math.max(0, cw - weightForBmi(25, h));

  const c = inputs.conditions;
  const qualifyingConditions = [c.diabetes, c.sleepApnea, c.highBloodPressure, c.gerd, c.pcos, c.jointPain];
  const conditionCount = qualifyingConditions.filter(Boolean).length;
  const bmiQualifies = currentBmi >= 40 || (currentBmi >= 35 && conditionCount >= 1) || (currentBmi >= 30 && conditionCount >= 2);
  const comorbidityQualifies = conditionCount >= 1;

  let candidateStatus: CandidateStatus;
  if (currentBmi >= 40) candidateStatus = "strong";
  else if (currentBmi >= 35 && conditionCount >= 1) candidateStatus = "strong";
  else if (currentBmi >= 35) candidateStatus = "likely";
  else if (currentBmi >= 30 && conditionCount >= 2) candidateStatus = "likely";
  else if (currentBmi >= 30 && conditionCount >= 1) candidateStatus = "possible";
  else if (currentBmi >= 27.5) candidateStatus = "possible";
  else candidateStatus = "unlikely";

  let score = 0;
  if (currentBmi >= 40) score += 45;
  else if (currentBmi >= 35) score += 35;
  else if (currentBmi >= 30) score += 20;
  else if (currentBmi >= 27.5) score += 10;
  score += Math.min(conditionCount * 8, 24);
  if (inputs.insuranceProvider.trim()) score += 10;
  if (inputs.smokingStatus === "Non-smoker") score += 10;
  else if (inputs.smokingStatus === "Former smoker") score += 7;
  else if (inputs.smokingStatus === "Current smoker") score -= 5;
  const eligibilityScore = clamp(Math.round(score), 0, 100);

  return {
    heightIn: h, currentWeight: cw, startWeight: sw, goalWeight: gw,
    currentBmi, startBmi, goalBmi, idealWeightLow, idealWeightHigh,
    weightLost, remainingToGoal, excessWeight, twl, ewl, goalProgress,
    poundsTo40, poundsTo35, poundsTo30, poundsTo25,
    candidateStatus, eligibilityScore, bmiQualifies, comorbidityQualifies, conditionCount,
  };
}

function getBmiContext(bmi: number): { label: string; textColor: string } {
  if (bmi < 18.5) return { label: "Underweight", textColor: "#dc2626" };
  if (bmi < 25) return { label: "Healthy Weight", textColor: "#15803d" };
  if (bmi < 30) return { label: "Overweight", textColor: "#d97706" };
  if (bmi < 35) return { label: "Class I Obesity", textColor: "#c2410c" };
  if (bmi < 40) return { label: "Class II Obesity", textColor: "#b91c1c" };
  return { label: "Class III Obesity", textColor: "#9d174d" };
}

function getCandidateContext(status: CandidateStatus) {
  type Ctx = { label: string; heading: string; badgeStyle: React.CSSProperties; explanation: (r: AssessmentResult, i: AssessmentInputs) => string };
  const map: Record<CandidateStatus, Ctx> = {
    strong: {
      label: "Strong Candidate",
      heading: "You appear to be a strong bariatric surgery candidate.",
      badgeStyle: { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
      explanation: (r) => `Your BMI of ${r.currentBmi.toFixed(1)} meets standard bariatric surgery criteria${r.conditionCount > 0 ? `, and you've reported ${r.conditionCount} qualifying health condition${r.conditionCount > 1 ? "s" : ""}` : ""}. These factors suggest you may be an excellent candidate for a surgical consultation and evaluation.`,
    },
    likely: {
      label: "Likely Candidate",
      heading: "You are likely a bariatric surgery candidate.",
      badgeStyle: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
      explanation: (r) => `Your BMI of ${r.currentBmi.toFixed(1)}${r.conditionCount > 0 ? ` with ${r.conditionCount} qualifying condition${r.conditionCount > 1 ? "s" : ""}` : ""} places you in a range commonly considered for bariatric evaluation. A consultation can clarify your specific options and insurance pathway.`,
    },
    possible: {
      label: "Possible Candidate",
      heading: "Bariatric surgery may be worth discussing.",
      badgeStyle: { background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" },
      explanation: (r) => `Your BMI of ${r.currentBmi.toFixed(1)}${r.conditionCount > 0 ? " and selected health conditions" : ""} suggest you may qualify for certain procedures or non-surgical medical weight management. A consultation can determine eligibility with a full clinical review.`,
    },
    unlikely: {
      label: "Unlikely Surgical Candidate",
      heading: "Surgical options may be limited at this BMI.",
      badgeStyle: { background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" },
      explanation: (r) => `Your BMI of ${r.currentBmi.toFixed(1)} falls below the typical surgical threshold. However, medical weight management, GLP-1 medications, and non-surgical options may still be appropriate. A consultation can explore what's available for you.`,
    },
  };
  return map[status];
}

function getProcedureFit(result: AssessmentResult, inputs: AssessmentInputs): Procedure[] {
  if (result.currentBmi < 27) return [];
  const fit: Procedure[] = [];
  if (inputs.previousSurgery === "Yes") {
    fit.push(PROCEDURES.find(p => p.id === "revision")!);
  }
  if (inputs.previousSurgery !== "Yes") {
    if (result.currentBmi >= 35 && !inputs.conditions.gerd) fit.push(PROCEDURES.find(p => p.id === "sleeve")!);
    if (result.currentBmi >= 30 && (inputs.conditions.gerd || inputs.conditions.diabetes || result.currentBmi >= 35)) fit.push(PROCEDURES.find(p => p.id === "bypass")!);
    if (result.currentBmi >= 40 || (result.currentBmi >= 35 && inputs.conditions.diabetes)) fit.push(PROCEDURES.find(p => p.id === "sadi")!);
  }
  return fit.filter((p, i, arr) => p && arr.findIndex(x => x?.id === p.id) === i);
}

function getProcedureFitReason(procedure: Procedure, result: AssessmentResult, inputs: AssessmentInputs): string {
  const bmi = result.currentBmi.toFixed(1);
  if (procedure.id === "sleeve") {
    const parts = [`Your BMI of ${bmi} meets standard sleeve eligibility.`];
    if (!inputs.conditions.gerd) parts.push("No GERD reported, which is favorable for sleeve outcomes.");
    return parts.join(" ");
  }
  if (procedure.id === "bypass") {
    const parts = [`Your BMI of ${bmi} supports bypass consideration.`];
    if (inputs.conditions.gerd) parts.push("GERD is selected — bypass resolves reflux in most patients.");
    if (inputs.conditions.diabetes) parts.push("Type 2 diabetes is selected — bypass has strong remission rates.");
    if (!inputs.conditions.gerd && !inputs.conditions.diabetes) parts.push("Bypass offers the strongest metabolic benefits and broadest procedural evidence.");
    return parts.join(" ");
  }
  if (procedure.id === "sadi") {
    if (result.currentBmi >= 45) return `At BMI ${bmi}, SADI-S offers the highest long-term weight loss of any procedure — typically 75–90% excess weight loss.`;
    if (result.currentBmi >= 40) return `Your BMI of ${bmi} qualifies for SADI-S, which may achieve 75–90% excess weight loss with superior metabolic outcomes.`;
    return `With diabetes and a BMI of ${bmi}, SADI-S may offer superior metabolic remission beyond bypass alone.`;
  }
  if (procedure.id === "revision") return `You indicated a previous bariatric procedure. Revision surgery — commonly sleeve-to-bypass — can address weight regain, GERD, or complications from an original procedure.`;
  return "";
}

function getPersonalizedInsights(result: AssessmentResult, inputs: AssessmentInputs): { category: string; text: string; type: "positive" | "caution" | "neutral" }[] {
  const insights: { category: string; text: string; type: "positive" | "caution" | "neutral" }[] = [];
  if (result.bmiQualifies) insights.push({ category: "Eligibility", text: `Your BMI of ${result.currentBmi.toFixed(1)} meets standard bariatric surgery criteria.`, type: "positive" });
  else if (result.currentBmi >= 30) insights.push({ category: "Eligibility", text: `Your BMI of ${result.currentBmi.toFixed(1)} is near the surgery threshold. Conditions and clinical review may affect final eligibility.`, type: "neutral" });
  if (result.poundsTo35 > 0) insights.push({ category: "Milestone", text: `You are ${result.poundsTo35.toFixed(0)} lbs from BMI 35 — the surgery threshold for most programs.`, type: "neutral" });
  else if (result.poundsTo30 > 0) insights.push({ category: "Milestone", text: `You are below BMI 35 and ${result.poundsTo30.toFixed(0)} lbs from the obesity/overweight boundary at BMI 30.`, type: "positive" });
  if (result.goalBmi) insights.push({ category: "Goal", text: `Your goal weight would place you at BMI ${result.goalBmi.toFixed(1)} — ${getBmiContext(result.goalBmi).label.toLowerCase()}.`, type: result.goalBmi < 25 ? "positive" : "neutral" });
  if (inputs.conditions.gerd) insights.push({ category: "GERD", text: "Because you selected GERD, gastric bypass may be worth prioritizing — it resolves reflux in the majority of patients.", type: "neutral" });
  if (inputs.conditions.diabetes) insights.push({ category: "Diabetes", text: "With type 2 diabetes, metabolic surgery (bypass or SADI-S) can achieve remission in 60–80% of patients.", type: "positive" });
  if (inputs.conditions.sleepApnea) insights.push({ category: "Sleep Apnea", text: "Sleep apnea is a recognized comorbidity that may strengthen your eligibility at BMI 35–39.9.", type: "positive" });
  if (inputs.smokingStatus === "Current smoker") insights.push({ category: "Smoking", text: "Most programs require cessation before surgery. A structured pre-op plan can address this — it does not automatically disqualify you.", type: "caution" });
  if (result.twl >= 10) insights.push({ category: "Progress", text: `You have lost ${result.twl.toFixed(1)}% of your starting weight — a clinically meaningful amount.`, type: "positive" });
  if (result.ewl !== undefined && result.ewl >= 50) insights.push({ category: "Excess Weight", text: `${result.ewl.toFixed(0)}% excess weight loss — meeting the benchmark many programs use to define success.`, type: "positive" });
  if (inputs.previousSurgery === "Yes") insights.push({ category: "Prior Surgery", text: "Revision procedures require specialized evaluation. JourneyLite performs all major revision types including sleeve-to-bypass.", type: "neutral" });
  return insights.slice(0, 9);
}

// ─── PDF download ─────────────────────────────────────────────────────────────

async function downloadResultsPdf(inputs: AssessmentInputs, result: AssessmentResult) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const M = 48;
  let y = 0;
  const bmiCtx = getBmiContext(result.currentBmi);
  const candCtx = getCandidateContext(result.candidateStatus);

  doc.setFillColor("#0f3e2e");
  doc.rect(0, 0, W, 96, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor("#9fd4aa");
  doc.text("JOURNEYLITE BARIATRIC PHYSICIANS", M, 30);
  doc.setFontSize(20); doc.setTextColor("#ffffff");
  doc.text("Personalized Bariatric Assessment", M, 58);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor("#b9d2c5");
  doc.text(`Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, M, 80);
  y = 116;

  doc.setFillColor("#f0f7f3"); doc.setDrawColor("#c8ddd1");
  doc.roundedRect(M, y, W - M * 2, 54, 6, 6, "FD");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor("#145c42");
  doc.text(candCtx.label.toUpperCase(), M + 12, y + 16);
  doc.setFontSize(13); doc.setTextColor("#0d1a11");
  doc.text(`BMI ${result.currentBmi.toFixed(1)} — ${bmiCtx.label}`, M + 12, y + 32);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor("#586760");
  const expl = doc.splitTextToSize(candCtx.explanation(result, inputs), W - M * 2 - 24);
  doc.text(expl.slice(0, 2), M + 12, y + 46);
  y += 70;

  function section(title: string) {
    y += 10; doc.setFillColor("#f0f7f3"); doc.rect(M, y, W - M * 2, 20, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor("#145c42");
    doc.text(title.toUpperCase(), M + 8, y + 13); y += 28;
  }
  function row(label: string, value: string, alt = false) {
    if (y > 700) { doc.addPage(); y = 48; }
    if (alt) { doc.setFillColor("#f8fbf9"); doc.rect(M, y - 9, W - M * 2, 17, "F"); }
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor("#0d1a11");
    doc.text(label, M + 4, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor("#586760");
    doc.text(value, M + 210, y); y += 16;
  }

  section("Key Metrics");
  row("Current BMI", result.currentBmi.toFixed(1), true);
  row("Starting BMI", result.startBmi.toFixed(1));
  if (result.goalBmi) row("Goal BMI", result.goalBmi.toFixed(1), true);
  row("Weight Lost", `${Math.abs(result.weightLost).toFixed(0)} lb ${result.weightLost >= 0 ? "lost" : "gained"}`);
  row("% Total Weight Loss", `${result.twl.toFixed(1)}%`, true);
  if (result.ewl !== undefined) row("% Excess Weight Loss", `${result.ewl.toFixed(1)}%`);
  row("Excess Weight (above BMI 25)", `${result.excessWeight.toFixed(0)} lb`, true);
  row("Healthy Weight Range", `${result.idealWeightLow.toFixed(0)}–${result.idealWeightHigh.toFixed(0)} lb`);
  row("Lbs to BMI 35", result.poundsTo35 > 0 ? `${result.poundsTo35.toFixed(0)} lb` : "Reached", true);
  row("Lbs to BMI 30", result.poundsTo30 > 0 ? `${result.poundsTo30.toFixed(0)} lb` : "Reached");
  row("Lbs to BMI 25", result.poundsTo25 > 0 ? `${result.poundsTo25.toFixed(0)} lb` : "Reached", true);

  section("Eligibility Summary");
  row("BMI Qualification", result.bmiQualifies ? "Meets criteria" : "Below standard threshold", true);
  row("Comorbidity Qualification", result.comorbidityQualifies ? `${result.conditionCount} qualifying condition(s)` : "None selected");
  row("Overall Eligibility Score", `${result.eligibilityScore}/100`, true);
  row("Candidate Status", candCtx.label);

  section("Patient Inputs");
  row("Height", `${inputs.feet || "0"} ft ${inputs.inches || "0"} in`, true);
  row("Starting Weight", `${inputs.startWeight} lb`);
  row("Current Weight", `${inputs.currentWeight} lb`, true);
  if (inputs.goalWeight) row("Goal Weight", `${inputs.goalWeight} lb`);
  if (inputs.age) row("Age", inputs.age, true);
  if (inputs.sex) row("Sex", inputs.sex);
  if (inputs.smokingStatus) row("Smoking Status", inputs.smokingStatus, true);
  if (inputs.insuranceProvider) row("Insurance Provider", inputs.insuranceProvider);
  row("Previous Surgery", inputs.previousSurgery || "Not specified", true);
  const conds = (Object.entries(inputs.conditions) as [keyof Conditions, boolean][])
    .filter(([, v]) => v)
    .map(([k]) => ({ diabetes: "Type 2 Diabetes", sleepApnea: "Sleep Apnea", highBloodPressure: "High Blood Pressure", gerd: "GERD", pcos: "PCOS", jointPain: "Joint Pain" }[k]))
    .join(", ");
  if (conds) row("Health Conditions", conds);

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor("#0f3e2e"); doc.rect(0, 770, W, 22, "F");
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor("#9fd4aa");
    doc.text("JourneyLite Physicians · journeylite.com · For educational use only. Does not replace medical consultation.", M, 784);
    doc.setTextColor("#b9d2c5");
    doc.text(`Page ${i} of ${pages}`, W - M, 784, { align: "right" });
  }
  doc.save("journeylite-bariatric-assessment.pdf");
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

function bmiFrom(w: number, h: number) { return (w / (h * h)) * 703; }
function weightForBmi(bmi: number, h: number) { return (bmi * h * h) / 703; }
function toNum(v: string) { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : 0; }
function clamp(v: number, mn: number, mx: number) { return Math.min(Math.max(v, mn), mx); }

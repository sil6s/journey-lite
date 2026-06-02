"use client";

import { useState } from "react";
import Link from "next/link";

type QuickResult = {
  bmi: number;
  twl: number;
  weightLost: number;
  category: string;
  tone: "green" | "yellow" | "blue" | "red";
};

function quickCalc(feet: string, inches: string, sw: string, cw: string): QuickResult | null {
  const f = Number(feet), i = Number(inches || "0"), s = Number(sw), c = Number(cw);
  if (!f || !s || !c || s < 70 || c < 70) return null;
  const h = f * 12 + i;
  if (h < 48 || h > 90) return null;
  const bmi = (c / (h * h)) * 703;
  const twl = ((s - c) / s) * 100;
  const weightLost = s - c;
  let category = "";
  let tone: QuickResult["tone"] = "blue";
  if (bmi < 18.5) { category = "Below healthy range"; tone = "red"; }
  else if (bmi < 25) { category = "Healthy BMI"; tone = "green"; }
  else if (bmi < 30) { category = "Overweight"; tone = "yellow"; }
  else if (bmi < 35) { category = "Class I Obesity"; tone = "blue"; }
  else if (bmi < 40) { category = "Class II Obesity"; tone = "blue"; }
  else { category = "Class III Obesity"; tone = "blue"; }
  return { bmi, twl, weightLost, category, tone };
}

export function BariatricMetricsWidget() {
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [sw, setSw] = useState("");
  const [cw, setCw] = useState("");
  const [result, setResult] = useState<QuickResult | null>(null);
  const [tried, setTried] = useState(false);

  const toneMap = {
    green: { bg: "bg-[#edf8f1]", border: "border-[#52b788]", text: "text-[#1a7046]", bar: "bg-[#52b788]" },
    yellow: { bg: "bg-[#fffdf4]", border: "border-[#f0a500]", text: "text-[#7a5300]", bar: "bg-[#f0a500]" },
    blue: { bg: "bg-[#f3f8fc]", border: "border-[#4895cb]", text: "text-[#194f70]", bar: "bg-[#4895cb]" },
    red: { bg: "bg-[#fff5f2]", border: "border-[#d66b4f]", text: "text-[#8a3b22]", bar: "bg-[#d66b4f]" },
  };

  function handleCalc() {
    setTried(true);
    const r = quickCalc(feet, inches, sw, cw);
    setResult(r);
  }

  const ready = feet && sw && cw;
  const tone = result ? toneMap[result.tone] : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d6e1da] bg-white shadow-xl shadow-[#20372b]/8">
      <div className="bg-[#0f3e2e] px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[#9fd4aa]">Free calculator</p>
        <h3 className="mt-1 font-serif text-2xl leading-tight text-white">Check Your Bariatric Metrics</h3>
        <p className="mt-1 text-sm text-[#d8e6de]">BMI · % Weight Loss · Progress — all private, nothing sent.</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="text-xs font-semibold text-[#1f2c25]" htmlFor="w-feet">Feet</label>
            <input
              className="mt-1 w-full rounded-lg border border-[#cbd7d0] bg-white px-3 py-2 text-sm text-[#1f2c25] focus:outline-none focus:ring-2 focus:ring-[#145c42]"
              id="w-feet"
              inputMode="numeric"
              onChange={(e) => { setFeet(e.target.value); setResult(null); }}
              placeholder="5"
              type="number"
              value={feet}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#1f2c25]" htmlFor="w-inches">Inches</label>
            <input
              className="mt-1 w-full rounded-lg border border-[#cbd7d0] bg-white px-3 py-2 text-sm text-[#1f2c25] focus:outline-none focus:ring-2 focus:ring-[#145c42]"
              id="w-inches"
              inputMode="numeric"
              onChange={(e) => { setInches(e.target.value); setResult(null); }}
              placeholder="6"
              type="number"
              value={inches}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#1f2c25]" htmlFor="w-sw">Starting lb</label>
            <input
              className="mt-1 w-full rounded-lg border border-[#cbd7d0] bg-white px-3 py-2 text-sm text-[#1f2c25] focus:outline-none focus:ring-2 focus:ring-[#145c42]"
              id="w-sw"
              inputMode="numeric"
              onChange={(e) => { setSw(e.target.value); setResult(null); }}
              placeholder="280"
              type="number"
              value={sw}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#1f2c25]" htmlFor="w-cw">Current lb</label>
            <input
              className="mt-1 w-full rounded-lg border border-[#cbd7d0] bg-white px-3 py-2 text-sm text-[#1f2c25] focus:outline-none focus:ring-2 focus:ring-[#145c42]"
              id="w-cw"
              inputMode="numeric"
              onChange={(e) => { setCw(e.target.value); setResult(null); }}
              placeholder="240"
              type="number"
              value={cw}
            />
          </div>
        </div>

        <button
          className="mt-4 w-full rounded-xl bg-[#0f3e2e] py-3 text-sm font-semibold text-white transition hover:bg-[#145c42] disabled:opacity-50"
          disabled={!ready}
          onClick={handleCalc}
          type="button"
        >
          Calculate
        </button>

        {tried && !result ? (
          <p className="mt-3 text-xs text-[#9d341c]">Please check your entries — height and both weights are required (70 lb minimum).</p>
        ) : null}

        {result && tone ? (
          <div className={`mt-4 rounded-xl border p-4 ${tone.bg} ${tone.border}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${tone.text}`}>{result.category}</p>
                <p className={`mt-1 text-3xl font-bold ${tone.text}`}>BMI {result.bmi.toFixed(1)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-[#53635b]">% Total Weight Loss</p>
                <p className={`text-3xl font-bold ${tone.text}`}>{result.twl.toFixed(1)}%</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-white/60">
                <div className={`h-full rounded-full transition-all ${tone.bar}`} style={{ width: `${Math.min(result.twl / 50 * 100, 100)}%` }} />
              </div>
              <p className={`mt-1.5 text-xs ${tone.text}`}>
                {result.weightLost > 0 ? `${result.weightLost.toFixed(0)} lb lost` : `${Math.abs(result.weightLost).toFixed(0)} lb above starting weight`}
              </p>
            </div>
          </div>
        ) : null}

        <div className={`mt-4 flex flex-col gap-2 sm:flex-row ${result ? "" : "mt-4"}`}>
          <Link
            className="flex-1 rounded-lg bg-[#0f3e2e] px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[#145c42]"
            href="/bariatric-metrics"
          >
            Full Dashboard & Charts →
          </Link>
          <Link
            className="flex-1 rounded-lg border border-[#0f3e2e] px-4 py-2.5 text-center text-xs font-semibold text-[#0f3e2e] transition hover:bg-[#edf4ef]"
            href="/contact"
          >
            Book a Consultation
          </Link>
        </div>
        <p className="mt-3 text-center text-[10px] text-[#64736b]">
          🔒 Private · No data sent · Not a medical diagnosis
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, Loader2, MessageSquareQuote, Plus, Save, Search, Sparkles, Star, Trash2, X } from "lucide-react";
import {
  createTestimonialAction, updateTestimonialAction, deleteTestimonialAction,
  type TestimonialDoc,
} from "@/app/admin/people/actions";

const inputCls = "w-full rounded-lg border border-[#dce4df] bg-white px-3 py-1.5 text-sm text-[#1f2c25] outline-none focus:border-[#145c42]";
const textareaCls = "w-full rounded-lg border border-[#dce4df] bg-white px-3 py-2 text-sm text-[#1f2c25] outline-none focus:border-[#145c42] resize-y";

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function TestimonialsClient({ initialTestimonials }: { initialTestimonials: TestimonialDoc[] }) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [deleting, setDeleting] = useState(false);
  const [, startT] = useTransition();

  const isNew = selectedId === "__new__";

  // Editor state
  const [name, setName]           = useState("");
  const [procedure, setProcedure] = useState("");
  const [weightLost, setWeight]   = useState("");
  const [shortQuote, setQuote]    = useState("");
  const [fullStory, setStory]     = useState("");
  const [featured, setFeatured]   = useState(false);
  const [publishedAt, setPub]     = useState(new Date().toISOString().slice(0, 10));
  const [activeTab, setActiveTab] = useState<"overview" | "story">("overview");
  const [aiOpen, setAiOpen] = useState(false);

  function handleAiInsert(data: { shortQuote: string; fullStory: string }) {
    setAiOpen(false);
    setQuote(data.shortQuote.slice(0, 120));
    setStory(data.fullStory);
    setActiveTab("story");
  }

  const filtered = query.trim()
    ? testimonials.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()) || t.procedure?.toLowerCase().includes(query.toLowerCase()))
    : testimonials;

  function openNew() {
    setSelectedId("__new__");
    setName(""); setProcedure(""); setWeight(""); setQuote(""); setStory(""); setFeatured(false);
    setPub(new Date().toISOString().slice(0, 10));
    setActiveTab("overview");
    setSaveStatus("idle");
  }

  function openExisting(t: TestimonialDoc) {
    setSelectedId(t._id);
    setName(t.name); setProcedure(t.procedure || ""); setWeight(t.weightLost != null ? String(t.weightLost) : "");
    setQuote(t.shortQuote || ""); setStory(t.fullStory || ""); setFeatured(t.featured ?? false);
    setPub(t.publishedAt ? t.publishedAt.slice(0, 10) : new Date().toISOString().slice(0, 10));
    setActiveTab("overview");
    setSaveStatus("idle");
  }

  function handleSave() {
    if (!name.trim() || !shortQuote.trim()) return;
    setSaving(true);
    startT(async () => {
      try {
        const data = {
          name: name.trim(), procedure: procedure.trim(),
          weightLost: parseInt(weightLost) || 0, shortQuote: shortQuote.trim(),
          fullStory: fullStory.trim(),
          featured, publishedAt: new Date(publishedAt).toISOString(),
        };
        if (isNew) {
          const id = await createTestimonialAction(data);
          setTestimonials((prev) => [{ _id: id, ...data }, ...prev]);
          setSelectedId(id);
        } else if (selectedId) {
          await updateTestimonialAction(selectedId, data);
          setTestimonials((prev) => prev.map((t) => t._id === selectedId ? { ...t, ...data } : t));
        }
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
        router.refresh();
      } catch { setSaveStatus("error"); }
      finally { setSaving(false); }
    });
  }

  function handleDelete() {
    if (!selectedId || isNew) return;
    if (!window.confirm(`Delete "${name}"?`)) return;
    setDeleting(true);
    startT(async () => {
      try {
        await deleteTestimonialAction(selectedId);
        setTestimonials((prev) => prev.filter((t) => t._id !== selectedId));
        setSelectedId(null);
        router.refresh();
      } finally { setDeleting(false); }
    });
  }

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden -mx-4 -mb-8 lg:-mx-8">
      {/* Sidebar */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-[#dce4df] bg-zinc-50">
        <div className="border-b border-[#dce4df] px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-sm font-bold text-[#1f2c25]">Testimonials</h1>
            <button onClick={openNew}
              className="flex items-center gap-1 rounded-lg bg-[#0D3D24] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#145c42]">
              <Plus className="h-3.5 w-3.5" /> New
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#9aafa5]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…"
              className="w-full rounded-lg border border-[#dce4df] bg-white pl-8 pr-3 py-1.5 text-xs outline-none focus:border-[#145c42]" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-[#9aafa5]">No testimonials yet.</div>
          ) : filtered.map((t) => (
            <button key={t._id} onClick={() => openExisting(t)}
              className={`w-full border-b border-[#dce4df] px-4 py-3 text-left transition-colors hover:bg-white ${selectedId === t._id ? "bg-white border-l-2 border-l-[#0D3D24]" : ""}`}>
              <div className="flex items-center gap-2">
                {t.featured && <Star className="h-3 w-3 text-amber-400 shrink-0 fill-amber-400" />}
                <span className={`truncate text-xs font-semibold ${selectedId === t._id ? "text-[#0D3D24]" : "text-[#1f2c25]"}`}>{t.name}</span>
              </div>
              <p className="mt-0.5 truncate text-[11px] text-[#9aafa5]">
                {t.procedure || "—"}{t.weightLost ? ` · ${t.weightLost} lbs` : ""}
              </p>
            </button>
          ))}
        </div>
      </aside>

      {/* Editor */}
      <main className="flex flex-1 flex-col overflow-hidden bg-white">
        {!selectedId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <MessageSquareQuote className="h-12 w-12 text-[#dce4df]" />
            <div>
              <p className="font-semibold text-[#1f2c25]">Select a testimonial to edit</p>
              <p className="mt-1 text-sm text-[#9aafa5]">Or add a new patient story</p>
            </div>
            <button onClick={openNew}
              className="flex items-center gap-1.5 rounded-lg bg-[#0D3D24] px-4 py-2 text-sm font-semibold text-white hover:bg-[#145c42]">
              <Plus className="h-4 w-4" /> Add Testimonial
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center gap-3 border-b border-[#dce4df] px-5 py-2.5">
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                {isNew ? "New Testimonial" : "Testimonial"}
              </span>
              <span className="flex-1 font-bold text-[#1f2c25] truncate">{name || "Untitled"}</span>
              <div className="flex items-center gap-2">
                {saveStatus === "saved" && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check className="h-3.5 w-3.5" />Saved</span>}
                {saveStatus === "error" && <span className="text-xs font-semibold text-red-600">Save failed</span>}
                <button onClick={() => setAiOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100">
                  <Sparkles className="h-3.5 w-3.5" /> AI Builder
                </button>
                {!isNew && (
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex items-center gap-1 rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-40">
                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                )}
                <button onClick={() => setSelectedId(null)} className="text-[#9aafa5] hover:text-[#1f2c25]"><X className="h-4 w-4" /></button>
                <button onClick={handleSave} disabled={saving || !name.trim() || !shortQuote.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-[#0D3D24] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#145c42] disabled:opacity-50">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {isNew ? "Create" : "Save"}
                </button>
              </div>
            </div>

            {/* Tab strip */}
            <div className="flex border-b border-[#dce4df] px-5">
              {(["overview", "story"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`mr-4 border-b-2 py-2.5 text-xs font-semibold capitalize transition-colors ${activeTab === tab ? "border-[#0D3D24] text-[#0D3D24]" : "border-transparent text-[#9aafa5] hover:text-[#1f2c25]"}`}>
                  {tab === "overview" ? "Overview & Quote" : "Full Patient Story"}
                  {tab === "story" && fullStory.trim() && (
                    <Check className="ml-1.5 inline h-3 w-3 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {activeTab === "overview" ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Patient name *">
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder='e.g. "Sarah M."' className={inputCls} />
                      </Field>
                      <Field label="Procedure *">
                        <input value={procedure} onChange={(e) => setProcedure(e.target.value)} placeholder="Gastric Sleeve" className={inputCls} />
                      </Field>
                      <Field label="Weight lost (lbs)">
                        <input value={weightLost} onChange={(e) => setWeight(e.target.value)} type="number" min="0" placeholder="85" className={inputCls} />
                      </Field>
                      <Field label="Published date">
                        <input value={publishedAt} onChange={(e) => setPub(e.target.value)} type="date" className={inputCls} />
                      </Field>
                    </div>
                    <Field label="Short quote * (shown on homepage — 120 chars max)">
                      <textarea value={shortQuote} onChange={(e) => setQuote(e.target.value.slice(0, 120))} rows={3}
                        placeholder="This surgery changed my life. I feel healthier and more confident than ever before."
                        className={textareaCls} />
                      <p className={`mt-0.5 text-[11px] ${shortQuote.length > 110 ? "text-amber-600" : "text-[#9aafa5]"}`}>{shortQuote.length}/120</p>
                    </Field>

                    {/* Homepage preview */}
                    {name && shortQuote && (
                      <div className="rounded-xl border border-[#dce4df] bg-[#f7faf8] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#9aafa5] mb-2">Homepage card preview</p>
                        <blockquote className="text-sm italic text-[#1f2c25]">"{shortQuote}"</blockquote>
                        <p className="mt-2 text-xs font-semibold text-[#5f6f66]">— {name}{procedure ? `, ${procedure}` : ""}{weightLost ? ` · Lost ${weightLost} lbs` : ""}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="rounded-lg border border-[#dce4df] bg-[#f7faf8] px-4 py-3 text-xs text-[#9aafa5] leading-relaxed">
                      Write the patient's full journey — surgery prep, recovery, life changes, results. Use blank lines to separate paragraphs. This appears on their dedicated testimonial page (not the homepage card above).
                    </div>
                    <Field label="Full patient story">
                      <textarea
                        value={fullStory}
                        onChange={(e) => setStory(e.target.value)}
                        rows={16}
                        placeholder={`Before my surgery, I struggled with my weight for over 20 years. I tried every diet imaginable…\n\nThe team at JourneyLite made me feel comfortable from the very first consultation…\n\nSix months after my sleeve gastrectomy, I've lost 85 pounds and feel like a completely different person…`}
                        className={`${textareaCls} font-sans leading-relaxed`}
                      />
                      <p className="mt-0.5 text-[11px] text-[#9aafa5]">{fullStory.length} characters · {fullStory.split(/\n\n+/).filter(Boolean).length} paragraph{fullStory.split(/\n\n+/).filter(Boolean).length !== 1 ? "s" : ""}</p>
                    </Field>

                    {/* Story preview */}
                    {fullStory.trim() && (
                      <div className="rounded-xl border border-[#dce4df] bg-white p-5">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#9aafa5] mb-3">Story preview</p>
                        <div className="space-y-3">
                          {fullStory.split(/\n\n+/).filter(Boolean).map((para, i) => (
                            <p key={i} className="text-sm leading-6 text-[#374151]">{para}</p>
                          ))}
                        </div>
                        <div className="mt-4 border-t border-[#dce4df] pt-3 text-xs text-[#9aafa5]">
                          — {name || "Patient"}{procedure ? `, ${procedure}` : ""}{weightLost ? ` · Lost ${weightLost} lbs` : ""}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <aside className="w-56 shrink-0 overflow-y-auto border-l border-[#dce4df] bg-zinc-50 px-4 py-5 space-y-5">
                <Section title="Display">
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[#dce4df] bg-white px-3 py-2.5">
                    <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-[#0D3D24]" />
                    <div>
                      <p className="text-xs font-semibold text-[#1f2c25]">Featured</p>
                      <p className="text-[10px] text-[#9aafa5]">Show on homepage hero</p>
                    </div>
                  </label>
                </Section>
                <Section title="Note">
                  <p className="text-[11px] text-[#9aafa5] leading-relaxed">
                    Before/after photos and the full patient story must be uploaded via Sanity Studio for HIPAA compliance.
                    Use the short quote here for homepage display.
                  </p>
                </Section>
              </aside>
            </div>
          </div>
        )}
      </main>

      {aiOpen && (
        <AiTestimonialPanel
          name={name}
          procedure={procedure}
          weightLost={weightLost}
          onClose={() => setAiOpen(false)}
          onInsert={handleAiInsert}
        />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9aafa5]">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#5f6f66]">{label}</label>
      {children}
    </div>
  );
}

/* ── AI Builder ───────────────────────────────────────────────────────────── */

function AiTestimonialPanel({ name, procedure, weightLost, onClose, onInsert }: {
  name: string;
  procedure: string;
  weightLost: string;
  onClose: () => void;
  onInsert: (data: { shortQuote: string; fullStory: string }) => void;
}) {
  const [nameVal, setNameVal] = useState(name);
  const [procedureVal, setProcedureVal] = useState(procedure);
  const [weightLostVal, setWeightLostVal] = useState(weightLost);
  const [keyDetails, setKeyDetails] = useState("");

  const [status, setStatus] = useState<"idle" | "streaming" | "done" | "error">("idle");
  const [streamText, setStreamText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<{ shortQuote: string; fullStory: string } | null>(null);

  async function generate() {
    if (!nameVal.trim() || !procedureVal.trim()) return;
    setStatus("streaming");
    setStreamText("");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "testimonial",
          name: nameVal, procedure: procedureVal, weightLost: weightLostVal, keyDetails,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            setStatus("done");
            try {
              const parsed = JSON.parse(accumulated);
              setResult({ shortQuote: parsed.shortQuote ?? "", fullStory: parsed.fullStory ?? "" });
            } catch {
              setStatus("error");
              setErrorMsg("Failed to parse AI response. The API may have returned invalid JSON.");
            }
            break;
          }
          try {
            const chunk = JSON.parse(data);
            if (chunk.delta) {
              accumulated += chunk.delta;
              setStreamText(accumulated);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-full max-w-3xl flex-col rounded-2xl border border-[#dce4df] bg-white shadow-2xl max-h-[92vh]">
        <div className="flex items-center gap-3 border-b border-[#dce4df] px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
            <Sparkles className="h-4 w-4 text-violet-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-[#1f2c25]">AI Testimonial Builder</h2>
            <p className="text-[11px] text-[#9aafa5]">Powered by Gemini · Writes a quote + full patient story</p>
          </div>
          <button onClick={onClose} className="text-[#9aafa5] hover:text-[#1f2c25]"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: inputs */}
          <div className="w-72 shrink-0 overflow-y-auto border-r border-[#dce4df] px-5 py-5 space-y-4">
            <Field label="Patient name *">
              <input value={nameVal} onChange={(e) => setNameVal(e.target.value)} placeholder='e.g. "Sarah M."' className={inputCls} />
            </Field>
            <Field label="Procedure *">
              <input value={procedureVal} onChange={(e) => setProcedureVal(e.target.value)} placeholder="Gastric Sleeve" className={inputCls} />
            </Field>
            <Field label="Weight lost (lbs)">
              <input value={weightLostVal} onChange={(e) => setWeightLostVal(e.target.value)} type="number" min="0" placeholder="85" className={inputCls} />
            </Field>
            <Field label="Key details">
              <textarea value={keyDetails} onChange={(e) => setKeyDetails(e.target.value)} rows={6}
                placeholder="Anything specific the patient mentioned — health improvements, what changed day-to-day, dates, struggles before surgery…"
                className={textareaCls} />
            </Field>

            <button
              onClick={generate}
              disabled={!nameVal.trim() || !procedureVal.trim() || status === "streaming"}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {status === "streaming"
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Writing…</>
                : <><Sparkles className="h-4 w-4" /> Generate Story</>}
            </button>
          </div>

          {/* Right: output */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {status === "idle" && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-8">
                <div className="rounded-full bg-violet-50 p-4">
                  <Sparkles className="h-8 w-8 text-violet-400" />
                </div>
                <p className="font-semibold text-[#1f2c25]">Ready to generate</p>
                <p className="text-sm text-[#9aafa5] max-w-xs">Fill in the patient&apos;s details on the left, then click Generate. The AI will write a homepage quote and a full patient story.</p>
              </div>
            )}

            {(status === "streaming" || status === "done" || status === "error") && (
              <div className="flex flex-1 flex-col overflow-hidden">
                {status === "done" && result && (
                  <div className="flex items-center gap-2 border-b border-[#dce4df] bg-zinc-50 px-5 py-3">
                    <span className="text-xs font-semibold text-[#5f6f66]">{result.shortQuote.length}/120 chars</span>
                    <div className="ml-auto flex gap-2">
                      <button onClick={generate} className="rounded-lg border border-[#dce4df] px-3 py-1.5 text-xs font-semibold text-[#5f6f66] hover:bg-white">
                        Regenerate
                      </button>
                      <button onClick={() => onInsert(result)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#0D3D24] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#145c42]">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Use this content
                      </button>
                    </div>
                  </div>
                )}

                {status === "error" && (
                  <div className="mx-5 mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-xs font-semibold text-red-700">{errorMsg || "Generation failed. Check your GEMINI_API_KEY in .env.local."}</p>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {status === "streaming" && (
                    <div className="mb-3 flex items-center gap-2 text-xs text-violet-600 font-semibold">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Writing story…
                    </div>
                  )}
                  <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-[#5f6f66]">
                    {streamText || (status === "streaming" ? "▌" : "")}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

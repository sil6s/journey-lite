"use client";

import { useState, useTransition } from "react";
import {
  BookOpen, Check, ChevronRight, ExternalLink,
  GraduationCap, Loader2, RotateCcw, Save, Search,
  TrendingUp, UserRound, X,
} from "lucide-react";
import { assignCoursesAction, resetProgressAction, type LmsCourse } from "./actions";

type Enrollment = {
  id: string;
  courseSlug: string;
  courseTitle: string;
  status: string;
  enrolledAt: string;
  completedAt: string | null;
  lessonsCompleted: number;
  lessonsTotal: number;
  progressPct: number;
};

type Patient = {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  enrollments: Enrollment[];
  overallPct: number;
};

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ProgressBar({ pct, className = "" }: { pct: number; className?: string }) {
  const color = pct >= 100 ? "bg-blue-500" : pct > 0 ? "bg-emerald-500" : "bg-zinc-200";
  return (
    <div className={`h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

const STATUS_MAP: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  expired: "bg-amber-50 text-amber-700 border-amber-200",
  revoked: "bg-red-50 text-red-700 border-red-200",
};

export function PatientsClient({
  patients: initialPatients,
  courses,
  lmsUrl,
}: {
  patients: Patient[];
  courses: LmsCourse[];
  lmsUrl: string;
}) {
  const [patients, setPatients] = useState(initialPatients);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [assignedSlugs, setAssignedSlugs] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [resetting, setResetting] = useState(false);
  const [, startT] = useTransition();

  const filtered = query.trim()
    ? patients.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.email.toLowerCase().includes(query.toLowerCase()))
    : patients;

  const selected = patients.find((p) => p.id === selectedId) ?? null;

  function openPatient(p: Patient) {
    setSelectedId(p.id);
    setAssignedSlugs(new Set(p.enrollments.map((e) => e.courseSlug)));
    setSaveStatus("idle");
  }

  function toggleCourse(slug: string) {
    setAssignedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    setSaveStatus("idle");
  }

  function handleSaveAssignments() {
    if (!selectedId) return;
    setSaveStatus("saving");
    startT(async () => {
      try {
        const slugs = Array.from(assignedSlugs);
        await assignCoursesAction(selectedId, slugs);
        setPatients((prev) => prev.map((p) => {
          if (p.id !== selectedId) return p;
          const newEnrollments = slugs.map((slug) => {
            const existing = p.enrollments.find((e) => e.courseSlug === slug);
            const course = courses.find((c) => c.slug === slug);
            return existing ?? {
              id: `new_${slug}`,
              courseSlug: slug,
              courseTitle: course?.title ?? slug,
              status: "active",
              enrolledAt: new Date().toISOString(),
              completedAt: null,
              lessonsCompleted: 0,
              lessonsTotal: 0,
              progressPct: 0,
            };
          });
          const overallPct = newEnrollments.length > 0
            ? Math.round(newEnrollments.reduce((s, e) => s + e.progressPct, 0) / newEnrollments.length)
            : 0;
          return { ...p, enrollments: newEnrollments, overallPct };
        }));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch { setSaveStatus("error"); }
    });
  }

  function handleResetProgress() {
    if (!selectedId || !selected) return;
    if (!window.confirm(`Reset ALL lesson progress for ${selected.name}? This cannot be undone.`)) return;
    setResetting(true);
    startT(async () => {
      try {
        await resetProgressAction(selectedId);
        setPatients((prev) => prev.map((p) => {
          if (p.id !== selectedId) return p;
          return { ...p, overallPct: 0, enrollments: p.enrollments.map((e) => ({ ...e, lessonsCompleted: 0, progressPct: 0 })) };
        }));
      } finally { setResetting(false); }
    });
  }

  const total = patients.length;
  const active = patients.filter((p) => p.enrollments.some((e) => e.status === "active")).length;
  const completed = patients.filter((p) => p.enrollments.some((e) => e.status === "completed")).length;
  const noEnrollment = patients.filter((p) => p.enrollments.length === 0).length;

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden -mx-4 -mb-8 lg:-mx-8">
      {/* ── Sidebar ── */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-[#dce4df] bg-zinc-50">
        <div className="grid grid-cols-4 border-b border-[#dce4df]">
          {[
            { label: "Total", value: total, color: "text-[#0D3D24]" },
            { label: "Active", value: active, color: "text-emerald-600" },
            { label: "Done", value: completed, color: "text-blue-600" },
            { label: "None", value: noEnrollment, color: "text-[#9aafa5]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="py-2 text-center">
              <p className={`text-base font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-[#9aafa5]">{label}</p>
            </div>
          ))}
        </div>
        <div className="border-b border-[#dce4df] px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#9aafa5]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patients…"
              className="w-full rounded-lg border border-[#dce4df] bg-white pl-8 pr-3 py-1.5 text-xs outline-none focus:border-[#145c42]" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-[#9aafa5]">No patients found.</div>
          ) : filtered.map((p) => (
            <button key={p.id} onClick={() => openPatient(p)}
              className={`w-full border-b border-[#dce4df] px-4 py-3 text-left transition-colors hover:bg-white ${selectedId === p.id ? "bg-white border-l-2 border-l-[#0D3D24]" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`truncate text-xs font-semibold ${selectedId === p.id ? "text-[#0D3D24]" : "text-[#1f2c25]"}`}>{p.name}</span>
                {p.enrollments.length > 0 && <span className="shrink-0 text-[10px] font-bold text-[#9aafa5]">{p.overallPct}%</span>}
              </div>
              <p className="mt-0.5 truncate text-[11px] text-[#9aafa5]">{p.email}</p>
              {p.enrollments.length > 0 && <ProgressBar pct={p.overallPct} className="mt-1.5" />}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Detail pane ── */}
      <main className="flex flex-1 flex-col overflow-hidden bg-white">
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <UserRound className="h-12 w-12 text-[#dce4df]" />
            <div>
              <p className="font-semibold text-[#1f2c25]">Select a patient to view progress</p>
              <p className="mt-1 text-sm text-[#9aafa5]">And manage their course assignments</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center gap-3 border-b border-[#dce4df] px-5 py-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0D3D24]/10 text-[11px] font-bold text-[#0D3D24]">
                {selected.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-[#1f2c25]">{selected.name}</p>
                <p className="truncate text-[11px] text-[#9aafa5]">{selected.email}</p>
              </div>
              <a href={`${lmsUrl}/admin/patients?userId=${selected.id}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg border border-[#dce4df] px-2.5 py-1.5 text-xs font-semibold text-[#5f6f66] hover:bg-zinc-50">
                <ExternalLink className="h-3.5 w-3.5" /> LMS
              </a>
              <button onClick={() => setSelectedId(null)} className="text-[#9aafa5] hover:text-[#1f2c25]"><X className="h-4 w-4" /></button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Progress panel */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9aafa5]">LMS Progress</p>

                {selected.enrollments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#dce4df] bg-zinc-50 py-10 text-center">
                    <GraduationCap className="mx-auto mb-2 h-10 w-10 text-[#dce4df]" />
                    <p className="text-sm font-semibold text-[#5f6f66]">No courses assigned</p>
                    <p className="mt-1 text-xs text-[#9aafa5]">Use the Course Assignment panel →</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selected.enrollments.map((e) => (
                      <div key={e.id} className="rounded-xl border border-[#dce4df] bg-white p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-3.5 w-3.5 shrink-0 text-[#145c42]" />
                              <p className="truncate text-sm font-semibold text-[#1f2c25]">{e.courseTitle}</p>
                            </div>
                            <div className="mt-2 flex items-center gap-3">
                              <ProgressBar pct={e.progressPct} className="flex-1" />
                              <span className="shrink-0 text-xs font-bold text-[#5f6f66]">{e.progressPct}%</span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#9aafa5]">
                              <span>{e.lessonsCompleted}/{e.lessonsTotal} lessons</span>
                              <span>Enrolled {fmtDate(e.enrolledAt)}</span>
                              {e.completedAt && <span className="font-semibold text-blue-600">Completed {fmtDate(e.completedAt)}</span>}
                            </div>
                          </div>
                          <span className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${STATUS_MAP[e.status] ?? "bg-zinc-50 text-zinc-600 border-zinc-200"}`}>
                            {e.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selected.enrollments.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { label: "Overall", value: `${selected.overallPct}%`, icon: TrendingUp },
                      { label: "Courses", value: String(selected.enrollments.length), icon: BookOpen },
                      { label: "Joined", value: fmtDate(selected.joinedAt), icon: ChevronRight },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="rounded-xl border border-[#dce4df] bg-zinc-50 p-3 text-center">
                        <Icon className="mx-auto mb-1 h-4 w-4 text-[#9aafa5]" />
                        <p className="text-sm font-bold text-[#0D3D24]">{value}</p>
                        <p className="text-[11px] text-[#9aafa5]">{label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selected.enrollments.some((e) => e.lessonsCompleted > 0) && (
                  <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4">
                    <p className="mb-1 text-xs font-bold text-red-800">Danger zone</p>
                    <p className="mb-3 text-[11px] text-red-700">Erase all lesson completion records. Enrollments are kept.</p>
                    <button onClick={handleResetProgress} disabled={resetting}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                      {resetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                      Reset all progress
                    </button>
                  </div>
                )}
              </div>

              {/* Course assignment sidebar */}
              <aside className="flex w-64 shrink-0 flex-col border-l border-[#dce4df] bg-zinc-50 overflow-hidden">
                <div className="border-b border-[#dce4df] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9aafa5]">Course Assignment</p>
                  <p className="mt-0.5 text-[11px] text-[#9aafa5]">Toggle courses to enroll / remove</p>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
                  {courses.length === 0 ? (
                    <p className="px-1 py-4 text-center text-xs text-[#9aafa5]">No LMS courses found</p>
                  ) : courses.map((course) => {
                    const checked = assignedSlugs.has(course.slug);
                    const existing = selected.enrollments.find((e) => e.courseSlug === course.slug);
                    return (
                      <label key={course.slug}
                        className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 transition-colors ${checked ? "border-[#0D3D24] bg-[#edf7f2]" : "border-[#dce4df] bg-white hover:border-[#9aafa5]"}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleCourse(course.slug)} className="mt-0.5 accent-[#0D3D24]" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#1f2c25] leading-snug">{course.title}</p>
                          {existing && (
                            <div className="mt-1">
                              <ProgressBar pct={existing.progressPct} />
                              <p className="mt-0.5 text-[10px] text-[#9aafa5]">{existing.progressPct}% complete</p>
                            </div>
                          )}
                        </div>
                        {checked && <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0D3D24]" />}
                      </label>
                    );
                  })}
                </div>
                <div className="shrink-0 border-t border-[#dce4df] p-3 space-y-2">
                  {saveStatus === "saved" && <p className="text-center text-xs font-semibold text-emerald-600">Saved ✓</p>}
                  {saveStatus === "error" && <p className="text-center text-xs font-semibold text-red-600">Save failed</p>}
                  <button onClick={handleSaveAssignments} disabled={saveStatus === "saving"}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0D3D24] py-2.5 text-xs font-bold text-white hover:bg-[#145c42] disabled:opacity-50">
                    {saveStatus === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save Assignments
                  </button>
                  <p className="text-center text-[10px] text-[#9aafa5]">{assignedSlugs.size} course{assignedSlugs.size !== 1 ? "s" : ""} selected</p>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

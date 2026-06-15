"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Plus, Save, Search, Trash2, Users, X,
} from "lucide-react";
import {
  createStaffAction, updateStaffAction, deleteStaffAction,
  type StaffDoc,
} from "@/app/admin/people/actions";

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
const inputCls = "w-full rounded-lg border border-[#dce4df] bg-white px-3 py-1.5 text-sm text-[#1f2c25] outline-none focus:border-[#145c42]";
const textareaCls = "w-full rounded-lg border border-[#dce4df] bg-white px-3 py-2 text-sm text-[#1f2c25] outline-none focus:border-[#145c42] resize-y";

const STATUS_COLORS: Record<string, string> = {
  published: "bg-emerald-400",
  draft: "bg-amber-400",
  archived: "bg-zinc-300",
};

export function StaffClient({ initialStaff }: { initialStaff: StaffDoc[] }) {
  const router = useRouter();
  const [staff, setStaff] = useState(initialStaff);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [deleting, setDeleting] = useState(false);
  const [, startT] = useTransition();

  const isNew = selectedId === "__new__";
  const selected = isNew ? null : staff.find((s) => s._id === selectedId) ?? null;

  // Editor state
  const [name, setName]           = useState("");
  const [displayName, setDisplay] = useState("");
  const [title, setTitle]         = useState("");
  const [email, setEmail]         = useState("");
  const [bio, setBio]             = useState("");
  const [credentials, setCreds]   = useState("");
  const [education, setEdu]       = useState("");
  const [focus, setFocus]         = useState("");
  const [imageAlt, setImageAlt]   = useState("");
  const [status, setStatus]       = useState("published");
  const [seoTitle, setSeoTitle]   = useState("");
  const [seoDesc, setSeoDesc]     = useState("");

  const filtered = query.trim()
    ? staff.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : staff;

  function openNew() {
    setSelectedId("__new__");
    setName(""); setDisplay(""); setTitle(""); setEmail(""); setBio("");
    setCreds(""); setEdu(""); setFocus(""); setImageAlt("");
    setStatus("published"); setSeoTitle(""); setSeoDesc("");
    setSaveStatus("idle");
  }

  function openExisting(s: StaffDoc) {
    setSelectedId(s._id);
    setName(s.name); setDisplay(s.displayName || ""); setTitle(s.primaryTitle || "");
    setEmail(s.email || ""); setBio(s.bio || "");
    setCreds((s.credentials || []).join("\n")); setEdu((s.education || []).join("\n"));
    setFocus((s.clinicalFocus || []).join("\n")); setImageAlt(s.imageAlt || "");
    setStatus(s.status || "published"); setSeoTitle(s.seoTitle || ""); setSeoDesc(s.seoDescription || "");
    setSaveStatus("idle");
  }

  function splitLines(v: string) { return v.split("\n").map((l) => l.trim()).filter(Boolean); }

  function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    startT(async () => {
      try {
        const data = {
          name: name.trim(), displayName: displayName.trim(), primaryTitle: title.trim(),
          email: email.trim(), bio: bio.trim(),
          credentials: splitLines(credentials), education: splitLines(education),
          clinicalFocus: splitLines(focus), imageAlt: imageAlt.trim(),
          status, seoTitle: seoTitle.trim(), seoDescription: seoDesc.trim(),
        };
        if (isNew) {
          const id = await createStaffAction(data);
          const newDoc: StaffDoc = { _id: id, ...data };
          setStaff((prev) => [newDoc, ...prev]);
          setSelectedId(id);
        } else if (selectedId) {
          await updateStaffAction(selectedId, data);
          setStaff((prev) => prev.map((s) => s._id === selectedId ? { ...s, ...data } : s));
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
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(true);
    startT(async () => {
      try {
        await deleteStaffAction(selectedId);
        setStaff((prev) => prev.filter((s) => s._id !== selectedId));
        setSelectedId(null);
        router.refresh();
      } finally { setDeleting(false); }
    });
  }

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden -mx-4 -mb-8 lg:-mx-8">
      {/* ── Sidebar ── */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-[#dce4df] bg-zinc-50">
        <div className="border-b border-[#dce4df] px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-sm font-bold text-[#1f2c25]">Staff / Providers</h1>
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
            <div className="px-4 py-8 text-center text-xs text-[#9aafa5]">No staff found.</div>
          ) : filtered.map((s) => (
            <button key={s._id} onClick={() => openExisting(s)}
              className={`w-full border-b border-[#dce4df] px-4 py-3 text-left transition-colors hover:bg-white ${selectedId === s._id ? "bg-white border-l-2 border-l-[#0D3D24]" : ""}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_COLORS[s.status ?? "published"] ?? "bg-zinc-300"}`} />
                <span className={`truncate text-xs font-semibold ${selectedId === s._id ? "text-[#0D3D24]" : "text-[#1f2c25]"}`}>{s.name}</span>
              </div>
              <p className="mt-0.5 truncate text-[11px] text-[#9aafa5]">{s.primaryTitle || "—"}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Editor ── */}
      <main className="flex flex-1 flex-col overflow-hidden bg-white">
        {!selectedId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <Users className="h-12 w-12 text-[#dce4df]" />
            <div>
              <p className="font-semibold text-[#1f2c25]">Select a provider to edit</p>
              <p className="mt-1 text-sm text-[#9aafa5]">Or add a new one</p>
            </div>
            <button onClick={openNew}
              className="flex items-center gap-1.5 rounded-lg bg-[#0D3D24] px-4 py-2 text-sm font-semibold text-white hover:bg-[#145c42]">
              <Plus className="h-4 w-4" /> Add Provider
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center gap-3 border-b border-[#dce4df] px-5 py-2.5">
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                {isNew ? "New Provider" : "Provider"}
              </span>
              <span className="flex-1 font-bold text-[#1f2c25] truncate">{name || "Untitled"}</span>
              <div className="flex items-center gap-2">
                {saveStatus === "saved" && <span className="text-xs font-semibold text-emerald-600">Saved ✓</span>}
                {saveStatus === "error" && <span className="text-xs font-semibold text-red-600">Save failed</span>}
                {!isNew && (
                  <button onClick={handleDelete} disabled={deleting} title="Delete"
                    className="flex items-center gap-1 rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-40">
                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                )}
                <button onClick={() => setSelectedId(null)} className="text-[#9aafa5] hover:text-[#1f2c25]"><X className="h-4 w-4" /></button>
                <button onClick={handleSave} disabled={saving || !name.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-[#0D3D24] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#145c42] disabled:opacity-50">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {isNew ? "Create" : "Save"}
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Main fields */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name *">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Smith" className={inputCls} />
                  </Field>
                  <Field label="Display name">
                    <input value={displayName} onChange={(e) => setDisplay(e.target.value)} placeholder="Dr. Smith" className={inputCls} />
                  </Field>
                  <Field label="Role / title">
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bariatric Surgeon" className={inputCls} />
                  </Field>
                  <Field label="Email">
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="jsmith@journeylite.com" className={inputCls} />
                  </Field>
                </div>
                <Field label="Bio">
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5}
                    placeholder="Provider biography and background…" className={textareaCls} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Credentials (one per line)">
                    <textarea value={credentials} onChange={(e) => setCreds(e.target.value)} rows={4}
                      placeholder="MD&#10;FACS&#10;Board Certified in Surgery" className={textareaCls} />
                  </Field>
                  <Field label="Education (one per line)">
                    <textarea value={education} onChange={(e) => setEdu(e.target.value)} rows={4}
                      placeholder="University of Cincinnati College of Medicine&#10;Residency: General Surgery" className={textareaCls} />
                  </Field>
                </div>
                <Field label="Clinical focus (one per line)">
                  <textarea value={focus} onChange={(e) => setFocus(e.target.value)} rows={3}
                    placeholder="Bariatric Surgery&#10;Metabolic Disease&#10;Minimally Invasive Surgery" className={textareaCls} />
                </Field>
                <Field label="Image alt text">
                  <input value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Photo of Dr. Smith" className={inputCls} />
                </Field>
              </div>

              {/* Settings sidebar */}
              <aside className="w-56 shrink-0 overflow-y-auto border-l border-[#dce4df] bg-zinc-50 px-4 py-5 space-y-5">
                <Section title="Status">
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                  {!isNew && selected?._updatedAt && (
                    <p className="mt-1.5 text-[11px] text-[#9aafa5]">Updated {fmtDate(selected._updatedAt)}</p>
                  )}
                </Section>
                <Section title="SEO">
                  <Field label="SEO title">
                    <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Defaults to name" className={inputCls} />
                    <p className="mt-0.5 text-[11px] text-[#9aafa5]">{seoTitle.length}/70</p>
                  </Field>
                  <Field label="Meta description">
                    <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={4}
                      placeholder="Brief description for search engines" className={textareaCls} />
                    <p className="mt-0.5 text-[11px] text-[#9aafa5]">{seoDesc.length}/160</p>
                  </Field>
                </Section>
              </aside>
            </div>
          </div>
        )}
      </main>
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

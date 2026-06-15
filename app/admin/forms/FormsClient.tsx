"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, ChevronRight, ClipboardList, Eye, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { FormSubmissionsManager, type FormSubmissionListItem } from "@/components/admin/form-submissions-manager";
import { createFormAction, updateFormAction, deleteFormAction, type FormDefinition, type FormField } from "@/app/admin/content/actions";
import { useRouter } from "next/navigation";

const FIELD_TYPES = [
  { value: "text",     label: "Text" },
  { value: "email",    label: "Email" },
  { value: "phone",    label: "Phone" },
  { value: "textarea", label: "Textarea" },
  { value: "select",   label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "consent",  label: "Consent" },
] as const;

function newKey() { return Math.random().toString(36).slice(2, 10); }

export function FormsClient({ forms, submissions }: {
  forms: FormDefinition[];
  submissions: FormSubmissionListItem[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"builder" | "submissions">("builder");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const refresh = () => router.refresh();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2c25]">Forms</h1>
          <p className="mt-1 text-sm text-[#5f6f66]">Build and manage forms that appear on your website. Submissions are captured below.</p>
        </div>
        <button onClick={() => { setShowNew(true); setEditingId(null); }}
          className="flex items-center gap-1.5 rounded-lg bg-[#0D3D24] px-4 py-2 text-sm font-semibold text-white hover:bg-[#145c42]">
          <Plus className="h-4 w-4" /> New Form
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-[#dce4df] bg-zinc-50 p-1 w-fit text-sm font-semibold">
        {(["builder", "submissions"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 transition-colors capitalize ${tab === t ? "bg-white text-[#0D3D24] shadow-sm" : "text-[#5f6f66] hover:text-[#1f2c25]"}`}>
            {t === "builder" ? `Form Builder (${forms.length})` : `Submissions (${submissions.length})`}
          </button>
        ))}
      </div>

      {tab === "builder" ? (
        <div className="space-y-4">
          {/* New form panel */}
          {showNew && (
            <FormBuilderPanel
              onSaved={() => { setShowNew(false); refresh(); }}
              onCancel={() => setShowNew(false)}
            />
          )}

          {/* Existing forms */}
          {forms.length === 0 && !showNew ? (
            <div className="rounded-xl border border-dashed border-[#dce4df] bg-zinc-50 py-12 text-center">
              <ClipboardList className="mx-auto mb-3 h-10 w-10 text-[#dce4df]" />
              <p className="font-semibold text-[#5f6f66]">No forms yet</p>
              <p className="mt-1 text-sm text-[#9aafa5]">Click "New Form" to create your first form.</p>
            </div>
          ) : forms.map((form) => (
            editingId === form._id
              ? <FormBuilderPanel key={form._id} existing={form}
                  onSaved={() => { setEditingId(null); refresh(); }}
                  onCancel={() => setEditingId(null)} />
              : <FormCard key={form._id} form={form}
                  onEdit={() => setEditingId(form._id)}
                  onDelete={() => { deleteFormAction(form._id).then(refresh); }}
                  submissionCount={submissions.filter((s) => s.form_key === form.slug).length} />
          ))}
        </div>
      ) : (
        <FormSubmissionsManager submissions={submissions} />
      )}
    </div>
  );
}

/* ── Form card (collapsed view) ───────────────────────────────────────────── */
function FormCard({ form, onEdit, onDelete, submissionCount }: {
  form: FormDefinition; onEdit: () => void; onDelete: () => void; submissionCount: number;
}) {
  return (
    <div className="rounded-xl border border-[#dce4df] bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-[#1f2c25]">{form.name}</p>
          <p className="mt-0.5 text-xs text-[#9aafa5]">
            {form.fields.length} fields · {submissionCount} submission{submissionCount !== 1 ? "s" : ""}
            {form.submitEmailTo ? ` · Sends to ${form.submitEmailTo}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {form.fields.map((f) => (
              <span key={f._key} className="rounded-full border border-[#dce4df] bg-zinc-50 px-2 py-0.5 text-[11px] text-[#5f6f66]">
                {f.label} ({f.type})
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onEdit} className="rounded-lg border border-[#dce4df] px-3 py-1.5 text-xs font-semibold text-[#1f2c25] hover:bg-zinc-50">Edit</button>
          <button onClick={() => { if (window.confirm(`Delete "${form.name}"?`)) onDelete(); }}
            className="rounded-lg border border-red-100 px-2 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Form builder panel ───────────────────────────────────────────────────── */
function FormBuilderPanel({ existing, onSaved, onCancel }: {
  existing?: FormDefinition;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName]           = useState(existing?.name || "");
  const [email, setEmail]         = useState(existing?.submitEmailTo || "");
  const [success, setSuccess]     = useState(existing?.successMessage || "Thank you! We'll be in touch soon.");
  const [fields, setFields]       = useState<FormField[]>(existing?.fields ?? []);
  const [saving, setSaving]       = useState(false);
  const [isPending, startT]       = useTransition();
  const [previewOpen, setPreviewOpen] = useState(false);

  function addField() {
    setFields((prev) => [...prev, { _key: newKey(), label: "New field", key: "field_" + newKey().slice(0, 4), type: "text", required: false }]);
  }
  function removeField(key: string) { setFields((prev) => prev.filter((f) => f._key !== key)); }
  function updateField(key: string, patch: Partial<FormField>) {
    setFields((prev) => prev.map((f) => f._key === key ? { ...f, ...patch } : f));
  }
  function moveField(key: string, dir: -1 | 1) {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f._key === key);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }

  function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    startT(async () => {
      const data = { name: name.trim(), submitEmailTo: email.trim(), successMessage: success.trim(), fields };
      if (existing) await updateFormAction(existing._id, data);
      else await createFormAction(data);
      setSaving(false);
      onSaved();
    });
  }

  return (
    <div className="rounded-xl border border-[#0D3D24]/30 bg-[#f0faf4] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-[#0D3D24]">{existing ? `Edit: ${existing.name}` : "New Form"}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreviewOpen(true)} disabled={fields.length === 0}
            className="flex items-center gap-1 rounded-lg border border-[#dce4df] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#5f6f66] hover:bg-zinc-50 disabled:opacity-40">
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
          <button onClick={onCancel} className="text-[#9aafa5] hover:text-[#1f2c25]"><X className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Form preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#dce4df] bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#dce4df] px-5 py-3">
              <div>
                <h3 className="text-sm font-bold text-[#1f2c25]">{name || "Form"} — Preview</h3>
                <p className="text-[11px] text-[#9aafa5]">This is how the form will appear to visitors</p>
              </div>
              <button onClick={() => setPreviewOpen(false)} className="text-[#9aafa5] hover:text-[#1f2c25]"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {fields.map((f) => (
                  <div key={f._key}>
                    <label className="mb-1 block text-sm font-semibold text-[#1f2c25]">
                      {f.label}{f.required && <span className="ml-1 text-red-500">*</span>}
                    </label>
                    {f.type === "textarea" ? (
                      <textarea disabled placeholder={f.placeholder} rows={3}
                        className="w-full resize-none rounded-lg border border-[#dce4df] bg-zinc-50 px-3 py-2 text-sm text-[#9aafa5]" />
                    ) : f.type === "select" ? (
                      <select disabled className="w-full rounded-lg border border-[#dce4df] bg-zinc-50 px-3 py-2 text-sm text-[#9aafa5]">
                        <option>Select an option…</option>
                      </select>
                    ) : f.type === "checkbox" || f.type === "consent" ? (
                      <label className="flex items-center gap-2.5 text-sm text-[#5f6f66]">
                        <input type="checkbox" disabled className="accent-[#0D3D24]" /> {f.label}
                      </label>
                    ) : (
                      <input disabled type={f.type === "email" ? "email" : f.type === "phone" ? "tel" : "text"}
                        placeholder={f.placeholder}
                        className="w-full rounded-lg border border-[#dce4df] bg-zinc-50 px-3 py-2 text-sm text-[#9aafa5]" />
                    )}
                  </div>
                ))}
              </div>
              <button disabled className="mt-5 w-full rounded-xl bg-[#0D3D24] py-2.5 text-sm font-semibold text-white opacity-70">
                Submit
              </button>
              {success && (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <Check className="mr-1.5 inline h-3.5 w-3.5" /><em>After submit:</em> "{success}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Form name *">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contact Form" className={inputCls} />
        </Field>
        <Field label="Send submissions to (email)">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@journeylite.com" type="email" className={inputCls} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Success message shown after submit">
            <input value={success} onChange={(e) => setSuccess(e.target.value)} className={inputCls} />
          </Field>
        </div>
      </div>

      {/* Fields builder */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-[#5f6f66]">Form Fields</p>
          <button onClick={addField} className="flex items-center gap-1 rounded-lg border border-[#dce4df] bg-white px-2.5 py-1 text-xs font-semibold text-[#1f2c25] hover:bg-zinc-50">
            <Plus className="h-3.5 w-3.5" /> Add field
          </button>
        </div>

        {fields.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#dce4df] py-6 text-center text-xs text-[#9aafa5]">No fields yet. Click "Add field".</p>
        ) : (
          <div className="space-y-2">
            {fields.map((field, idx) => (
              <div key={field._key} className="flex items-start gap-2 rounded-lg border border-[#dce4df] bg-white p-3">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveField(field._key, -1)} disabled={idx === 0} className="rounded p-0.5 text-[#9aafa5] hover:text-[#1f2c25] disabled:opacity-30">▲</button>
                  <button onClick={() => moveField(field._key, 1)} disabled={idx === fields.length - 1} className="rounded p-0.5 text-[#9aafa5] hover:text-[#1f2c25] disabled:opacity-30">▼</button>
                </div>
                <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <label className="mb-0.5 block text-[10px] font-semibold text-[#9aafa5]">Label</label>
                    <input value={field.label} onChange={(e) => updateField(field._key, { label: e.target.value, key: field.key || e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] font-semibold text-[#9aafa5]">Type</label>
                    <select value={field.type} onChange={(e) => updateField(field._key, { type: e.target.value as FormField["type"] })} className={inputCls}>
                      {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#5f6f66] cursor-pointer">
                      <input type="checkbox" checked={field.required ?? false} onChange={(e) => updateField(field._key, { required: e.target.checked })} className="accent-[#0D3D24]" />
                      Required
                    </label>
                  </div>
                  {field.type !== "checkbox" && field.type !== "consent" && (
                    <div className="sm:col-span-4">
                      <label className="mb-0.5 block text-[10px] font-semibold text-[#9aafa5]">Placeholder</label>
                      <input value={field.placeholder || ""} onChange={(e) => updateField(field._key, { placeholder: e.target.value })}
                        placeholder="Optional hint text…" className={inputCls} />
                    </div>
                  )}
                </div>
                <button onClick={() => removeField(field._key)} className="mt-0.5 shrink-0 text-[#9aafa5] hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-lg border border-[#dce4df] px-4 py-2 text-sm font-semibold text-[#5f6f66] hover:bg-white">Cancel</button>
        <button onClick={handleSave} disabled={saving || isPending || !name.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-[#0D3D24] px-4 py-2 text-sm font-semibold text-white hover:bg-[#145c42] disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {existing ? "Save Changes" : "Create Form"}
        </button>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-[#dce4df] bg-white px-3 py-1.5 text-sm text-[#1f2c25] outline-none focus:border-[#145c42]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#5f6f66]">{label}</label>
      {children}
    </div>
  );
}

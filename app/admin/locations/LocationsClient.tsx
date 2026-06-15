"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Plus, Save, Search, Trash2, X } from "lucide-react";
import {
  createLocationAction, updateLocationAction, deleteLocationAction,
  type LocationDoc,
} from "@/app/admin/people/actions";

const inputCls = "w-full rounded-lg border border-[#dce4df] bg-white px-3 py-1.5 text-sm text-[#1f2c25] outline-none focus:border-[#145c42]";
const textareaCls = "w-full rounded-lg border border-[#dce4df] bg-white px-3 py-2 text-sm text-[#1f2c25] outline-none focus:border-[#145c42] resize-y";

const STATUS_COLORS: Record<string, string> = {
  published: "bg-emerald-400",
  draft: "bg-amber-400",
  archived: "bg-zinc-300",
};

export function LocationsClient({ initialLocations }: { initialLocations: LocationDoc[] }) {
  const router = useRouter();
  const [locations, setLocations] = useState(initialLocations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [deleting, setDeleting] = useState(false);
  const [, startT] = useTransition();

  const isNew = selectedId === "__new__";

  // Editor state
  const [name, setName]           = useState("");
  const [city, setCity]           = useState("");
  const [state, setState]         = useState("");
  const [address1, setAddress1]   = useState("");
  const [address2, setAddress2]   = useState("");
  const [phone, setPhone]         = useState("");
  const [hours, setHours]         = useState("");
  const [mapLink, setMapLink]     = useState("");
  const [apptLink, setApptLink]   = useState("/contact");
  const [serviceArea, setArea]    = useState("");
  const [status, setStatus]       = useState("published");
  const [seoTitle, setSeoTitle]   = useState("");
  const [seoDesc, setSeoDesc]     = useState("");

  const filtered = query.trim()
    ? locations.filter((l) => l.name.toLowerCase().includes(query.toLowerCase()) || l.city?.toLowerCase().includes(query.toLowerCase()))
    : locations;

  function openNew() {
    setSelectedId("__new__");
    setName(""); setCity(""); setState(""); setAddress1(""); setAddress2("");
    setPhone(""); setHours(""); setMapLink(""); setApptLink("/contact");
    setArea(""); setStatus("published"); setSeoTitle(""); setSeoDesc("");
    setSaveStatus("idle");
  }

  function openExisting(l: LocationDoc) {
    setSelectedId(l._id);
    setName(l.name); setCity(l.city || ""); setState(l.state || "");
    setAddress1(l.address1 || ""); setAddress2(l.address2 || "");
    setPhone(l.phone || ""); setHours(l.hours || "");
    setMapLink(l.mapLink || ""); setApptLink(l.appointmentLink || "/contact");
    setArea(l.serviceArea || ""); setStatus(l.status || "published");
    setSeoTitle(l.seoTitle || ""); setSeoDesc(l.seoDescription || "");
    setSaveStatus("idle");
  }

  function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    startT(async () => {
      try {
        const data = {
          name: name.trim(), city: city.trim(), state: state.trim(),
          address1: address1.trim(), address2: address2.trim(),
          phone: phone.trim(), hours: hours.trim(),
          mapLink: mapLink.trim(), appointmentLink: apptLink.trim(),
          serviceArea: serviceArea.trim(), status,
          seoTitle: seoTitle.trim(), seoDescription: seoDesc.trim(),
        };
        if (isNew) {
          const id = await createLocationAction(data);
          setLocations((prev) => [{ _id: id, ...data }, ...prev]);
          setSelectedId(id);
        } else if (selectedId) {
          await updateLocationAction(selectedId, data);
          setLocations((prev) => prev.map((l) => l._id === selectedId ? { ...l, ...data } : l));
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
        await deleteLocationAction(selectedId);
        setLocations((prev) => prev.filter((l) => l._id !== selectedId));
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
            <h1 className="text-sm font-bold text-[#1f2c25]">Locations</h1>
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
            <div className="px-4 py-8 text-center text-xs text-[#9aafa5]">No locations found.</div>
          ) : filtered.map((l) => (
            <button key={l._id} onClick={() => openExisting(l)}
              className={`w-full border-b border-[#dce4df] px-4 py-3 text-left transition-colors hover:bg-white ${selectedId === l._id ? "bg-white border-l-2 border-l-[#0D3D24]" : ""}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_COLORS[l.status ?? "published"] ?? "bg-zinc-300"}`} />
                <span className={`truncate text-xs font-semibold ${selectedId === l._id ? "text-[#0D3D24]" : "text-[#1f2c25]"}`}>{l.name}</span>
              </div>
              <p className="mt-0.5 truncate text-[11px] text-[#9aafa5]">{[l.city, l.state].filter(Boolean).join(", ") || l.phone || "—"}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* Editor */}
      <main className="flex flex-1 flex-col overflow-hidden bg-white">
        {!selectedId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <MapPin className="h-12 w-12 text-[#dce4df]" />
            <div>
              <p className="font-semibold text-[#1f2c25]">Select a location to edit</p>
              <p className="mt-1 text-sm text-[#9aafa5]">Or add a new one</p>
            </div>
            <button onClick={openNew}
              className="flex items-center gap-1.5 rounded-lg bg-[#0D3D24] px-4 py-2 text-sm font-semibold text-white hover:bg-[#145c42]">
              <Plus className="h-4 w-4" /> Add Location
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center gap-3 border-b border-[#dce4df] px-5 py-2.5">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                {isNew ? "New Location" : "Location"}
              </span>
              <span className="flex-1 font-bold text-[#1f2c25] truncate">{name || "Untitled"}</span>
              <div className="flex items-center gap-2">
                {saveStatus === "saved" && <span className="text-xs font-semibold text-emerald-600">Saved ✓</span>}
                {saveStatus === "error" && <span className="text-xs font-semibold text-red-600">Save failed</span>}
                {!isNew && (
                  <button onClick={handleDelete} disabled={deleting}
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
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <Field label="Location name *">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Cincinnati – Kenwood" className={inputCls} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="City">
                    <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cincinnati" className={inputCls} />
                  </Field>
                  <Field label="State">
                    <input value={state} onChange={(e) => setState(e.target.value)} placeholder="OH" className={inputCls} />
                  </Field>
                  <Field label="Address line 1">
                    <input value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="4759 Gallia Street" className={inputCls} />
                  </Field>
                  <Field label="Address line 2">
                    <input value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder="Suite 200" className={inputCls} />
                  </Field>
                  <Field label="Phone">
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(513) 555-0100" className={inputCls} />
                  </Field>
                  <Field label="Appointment link">
                    <input value={apptLink} onChange={(e) => setApptLink(e.target.value)} placeholder="/contact" className={inputCls} />
                  </Field>
                </div>
                <Field label="Hours">
                  <textarea value={hours} onChange={(e) => setHours(e.target.value)} rows={4}
                    placeholder={"Mon–Fri: 8am – 5pm\nSat: Closed\nSun: Closed"} className={textareaCls} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Google Maps link">
                    <input value={mapLink} onChange={(e) => setMapLink(e.target.value)} placeholder="https://maps.google.com/…" className={inputCls} />
                  </Field>
                  <Field label="Service area">
                    <input value={serviceArea} onChange={(e) => setArea(e.target.value)} placeholder="Greater Cincinnati" className={inputCls} />
                  </Field>
                </div>
              </div>

              <aside className="w-56 shrink-0 overflow-y-auto border-l border-[#dce4df] bg-zinc-50 px-4 py-5 space-y-5">
                <Section title="Status">
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </Section>
                <Section title="SEO">
                  <Field label="SEO title">
                    <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Defaults to name" className={inputCls} />
                    <p className="mt-0.5 text-[11px] text-[#9aafa5]">{seoTitle.length}/70</p>
                  </Field>
                  <Field label="Meta description">
                    <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={4}
                      className={textareaCls} />
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

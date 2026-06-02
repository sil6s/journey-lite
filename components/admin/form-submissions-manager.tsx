"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type FormSubmissionListItem = {
  id: string;
  form_key: string;
  form_name: string | null;
  page_slug: string | null;
  status: "new" | "reviewed" | "contacted" | "closed" | "spam";
  submitted_at: string;
  data: unknown;
  admin_notes: string | null;
};

const statuses: FormSubmissionListItem["status"][] = ["new", "reviewed", "contacted", "closed", "spam"];

export function FormSubmissionsManager({ submissions }: { submissions: FormSubmissionListItem[] }) {
  const [items, setItems] = useState(submissions);
  const [saving, setSaving] = useState<string | null>(null);

  async function updateSubmission(id: string, patch: Pick<FormSubmissionListItem, "status" | "admin_notes">) {
    setSaving(id);
    const response = await fetch(`/api/admin/form-submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (response.ok) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    }
    setSaving(null);
  }

  if (!items.length) {
    return <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-sm text-muted-foreground">No form submissions yet.</div>;
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <article className="rounded-xl border bg-white p-5 shadow-sm" key={item.id}>
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-[#153f2b]">{item.form_name || item.form_key}</h3>
                <span className="rounded-full bg-[#edf4ef] px-2.5 py-1 text-xs font-semibold text-[#145c42]">{item.status}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(item.submitted_at).toLocaleString()} {item.page_slug ? `- /${item.page_slug}` : ""}
              </p>
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                {Object.entries(asRecord(item.data)).map(([key, value]) => (
                  <div className="rounded-lg bg-[#f7faf7] p-3" key={key}>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{key}</dt>
                    <dd className="mt-1 break-words text-[#193f2c]">{formatValue(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="grid gap-3">
              <label className="grid gap-1 text-sm font-medium">
                Status
                <select
                  className="h-10 rounded-md border bg-white px-3 text-sm"
                  value={item.status}
                  onChange={(event) => updateSubmission(item.id, { status: event.target.value as FormSubmissionListItem["status"], admin_notes: item.admin_notes })}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Admin notes
                <Textarea
                  defaultValue={item.admin_notes || ""}
                  placeholder="Add follow-up notes"
                  onBlur={(event) => updateSubmission(item.id, { status: item.status, admin_notes: event.target.value })}
                />
              </label>
              <Button disabled={saving === item.id} size="sm" variant="outline">
                {saving === item.id ? "Saving..." : "Saved on change"}
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function formatValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value ?? "");
}

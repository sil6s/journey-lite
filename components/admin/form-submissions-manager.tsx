"use client";

import type { ReactNode } from "react";
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
      {items.map((item) => {
        const data = asRecord(item.data);
        return (
          <article className="rounded-xl border bg-white p-5 shadow-sm" key={item.id}>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <SubmissionHeader item={item} />
                {isFmlaSubmission(item) ? (
                  <FmlaSubmissionDetails data={data} submissionId={item.id} />
                ) : (
                  <GenericSubmissionDetails data={data} submissionId={item.id} />
                )}
              </div>
              <SubmissionControls item={item} saving={saving} updateSubmission={updateSubmission} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function SubmissionHeader({ item }: { item: FormSubmissionListItem }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold text-[#153f2b]">{item.form_name || item.form_key}</h3>
        <span className="rounded-full bg-[#edf4ef] px-2.5 py-1 text-xs font-semibold capitalize text-[#145c42]">{item.status}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {new Date(item.submitted_at).toLocaleString()} {item.page_slug ? `- /${item.page_slug}` : ""}
      </p>
    </>
  );
}

function SubmissionControls({
  item,
  saving,
  updateSubmission,
}: {
  item: FormSubmissionListItem;
  saving: string | null;
  updateSubmission: (id: string, patch: Pick<FormSubmissionListItem, "status" | "admin_notes">) => Promise<void>;
}) {
  return (
    <div className="grid content-start gap-3 rounded-xl bg-[#f7faf7] p-4">
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
  );
}

function GenericSubmissionDetails({ data, submissionId }: { data: Record<string, unknown>; submissionId: string }) {
  return (
    <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
      {Object.entries(data).map(([key, value]) => (
        <div className="rounded-lg bg-[#f7faf7] p-3" key={key}>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{key}</dt>
          <dd className="mt-1 break-words text-[#193f2c]">{formatValue(key, value, submissionId)}</dd>
        </div>
      ))}
    </dl>
  );
}

function FmlaSubmissionDetails({ data, submissionId }: { data: Record<string, unknown>; submissionId: string }) {
  const knownKeys = new Set([
    "firstName",
    "lastName",
    "email",
    "dob",
    "phone",
    "jobType",
    "employer",
    "sendCompletedTo",
    "disclaimerAcknowledged",
    "upload",
    "additionalInformation",
  ]);
  const fullName = [stringValue(data.firstName), stringValue(data.lastName)].filter(Boolean).join(" ");
  const upload = data.upload ? formatValue("upload", data.upload, submissionId) : "No PDF uploaded";
  const extraFields = Object.entries(data).filter(([key]) => !knownKeys.has(key));

  const patientRows: TableRow[] = [
    ["Patient name", fullName],
    ["Date of birth", stringValue(data.dob)],
    ["Email", contactLink("email", stringValue(data.email))],
    ["Phone", contactLink("phone", stringValue(data.phone))],
    ["Employer", stringValue(data.employer)],
    ["Job type", stringValue(data.jobType)],
    ["Send completed form to", stringValue(data.sendCompletedTo)],
  ];

  const requestRows: TableRow[] = [
    ["Authorization", data.disclaimerAcknowledged ? "Acknowledged" : "Not acknowledged"],
    ["Uploaded FMLA form", upload],
    [
      "Additional information",
      <span key="additional-information" className="whitespace-pre-wrap">
        {stringValue(data.additionalInformation) || "None provided"}
      </span>,
    ],
  ];

  return (
    <div className="mt-4 grid gap-4">
      <div className="rounded-xl border border-[#dce6df] bg-[#fbfdfb] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c7468]">FMLA / Disability Intake</p>
            <h4 className="mt-1 text-xl font-semibold text-[#153f2b]">{fullName || "Unnamed patient"}</h4>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">Payment required before processing</span>
        </div>
      </div>

      <DataTable caption="Patient and routing details" rows={patientRows} />
      <DataTable caption="Request details" rows={requestRows} />

      {extraFields.length > 0 ? (
        <DataTable
          caption="Other submitted fields"
          rows={extraFields.map(([key, value]) => [humanizeKey(key), formatValue(key, value, submissionId)])}
        />
      ) : null}
    </div>
  );
}

type TableRow = [label: string, value: ReactNode];

function DataTable({ caption, rows }: { caption: string; rows: TableRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#dce6df]">
      <table className="w-full border-collapse text-sm">
        <caption className="bg-[#f7faf7] px-4 py-3 text-left text-sm font-semibold text-[#153f2b]">{caption}</caption>
        <tbody className="divide-y divide-[#e6eee8]">
          {rows.map(([label, value]) => (
            <tr className="align-top" key={label}>
              <th className="w-56 bg-[#fbfdfb] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#5c7468]">
                {label}
              </th>
              <td className="break-words px-4 py-3 text-[#193f2c]">
                {isEmptyValue(value) ? <span className="text-muted-foreground">Not provided</span> : value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function formatValue(key: string, value: unknown, submissionId: string) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (isUploadMetadata(value)) {
    return (
      <a className="font-semibold text-[#145c42] underline-offset-4 hover:underline" href={`/api/admin/form-submissions/${submissionId}/attachment?field=${encodeURIComponent(key)}`}>
        {value.originalName || "Download uploaded PDF"}
      </a>
    );
  }
  return String(value ?? "");
}

function isUploadMetadata(value: unknown): value is { originalName?: string } {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && "path" in value);
}

function isFmlaSubmission(item: FormSubmissionListItem) {
  return item.form_key === "fmla-short-term-disability-paperwork" || /fmla|short-term disability/i.test(item.form_name || "");
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function contactLink(type: "email" | "phone", value: string) {
  if (!value) return "";
  const href = type === "email" ? `mailto:${value}` : phoneHref(value);
  return (
    <a className="font-semibold text-[#145c42] underline-offset-4 hover:underline" href={href}>
      {value}
    </a>
  );
}

function phoneHref(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 ? `tel:+1${digits.slice(-10)}` : `tel:${digits}`;
}

function humanizeKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isEmptyValue(value: ReactNode) {
  return value === "" || value === null || value === undefined;
}
